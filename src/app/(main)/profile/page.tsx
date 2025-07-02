'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Coins, 
  User, 
  Calendar, 
  Trophy, 
  Gift, 
  TrendingUp, 
  TrendingDown, 
  Copy,
  CheckCircle,
  Clock,
  Flame
} from 'lucide-react';
import { getUserProfileData, getReferralsData } from '@/app/actions';
import type { User as UserType, PointTransaction, Referral } from '@/types';

// Profile Skeleton Component
function ProfileSkeleton() {
  return (
    <div className="mx-auto space-y-8">
      {/* Profile Header Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-64" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-1" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <div className="grid w-full grid-cols-2 gap-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedReferralCode, setCopiedReferralCode] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Optimistic data loading with Promise.all for parallel requests
        const [profileData, referralData] = await Promise.all([
          getUserProfileData(),
          getReferralsData()
        ]);
        
        setUser(profileData.user as UserType);
        setTransactions(profileData.transactions as PointTransaction[]);
        setReferrals(referralData.referrals);
      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const copyReferralCode = async () => {
    if (user?.referralCode) {
      const referralUrl = `${window.location.origin}/register?ref=${user.referralCode}`;
      await navigator.clipboard.writeText(referralUrl);
      setCopiedReferralCode(true);
      setTimeout(() => setCopiedReferralCode(false), 2000);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTransactionIcon = (reason: string) => {
    switch (reason) {
      case 'check-in':
        return <Calendar className="h-4 w-4" />;
      case 'referral':
        return <Gift className="h-4 w-4" />;
      case 'feedback':
        return <TrendingUp className="h-4 w-4" />;
      case 'prediction-win':
        return <Trophy className="h-4 w-4" />;
      case 'admin-grant':
        return <Coins className="h-4 w-4" />;
      case 'streak-bonus':
        return <Flame className="h-4 w-4" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  // Show skeleton while loading
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="mx-auto">
        <Card>
          <CardContent className="text-center py-10">
            <p>Unable to load profile data. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                  {user.role.toUpperCase()}
                </Badge>
                {user.isEmailVerified && (
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-3">{user.email}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="font-medium">{user.points} points</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">{user.consecutiveCheckIns} day streak</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1">
                  <Gift className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">{user.totalSuccessfulReferrals} referrals</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{user.points}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{user.consecutiveCheckIns}</div>
            <p className="text-xs text-muted-foreground">
              Consecutive days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Referrals</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{user.totalSuccessfulReferrals}</div>
            <p className="text-xs text-muted-foreground">
              Friends referred
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}
            </div>
            <p className="text-xs text-muted-foreground">
              Join date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Point History</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        {/* Point Transactions */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Point Transaction History
              </CardTitle>
              <CardDescription>
                Detailed history of all your point earnings and spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                          {getTransactionIcon(transaction.reason)}
                        </div>
                        <div>
                          <p className="font-medium capitalize">
                            {transaction.reason.replace('-', ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.notes || 'No additional details'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getTransactionColor(transaction.amount)}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount} points
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No transactions yet. Start earning points!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals */}
        <TabsContent value="referrals" className="space-y-6">
          {/* Referral Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Your Referral Code
              </CardTitle>
              <CardDescription>
                Share this link with friends to earn referral bonuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={user.referralCode || 'Generating...'}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    onClick={copyReferralCode}
                    size="sm"
                    variant="outline"
                    disabled={!user.referralCode}
                  >
                    {copiedReferralCode ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <Alert>
                  <Gift className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Earn 100 points</strong> for each friend who joins and checks in for 3 consecutive days.
                    <br />
                    <strong>Bonus:</strong> Get 500 extra points for every 10 successful referrals!
                  </AlertDescription>
                </Alert>

                <div className="text-sm text-muted-foreground">
                  <p>Full referral link:</p>
                  <code className="text-xs bg-muted p-1 rounded">
                    {typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${user.referralCode}` : ''}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Referrals</CardTitle>
              <CardDescription>
                Friends you've referred and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referrals.length > 0 ? (
                <div className="space-y-4">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{getInitials(referral.referredUser.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{referral.referredUser.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined {new Date(referral.referredUser.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                          {referral.status === 'completed' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                        {referral.status === 'completed' ? (
                          <p className="text-xs text-green-600 flex items-center">
                            <Coins className="h-3 w-3 mr-1" />
                            +100 points earned
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Flame className="h-3 w-3 mr-1" />
                            Check-in: {referral.referredUser.consecutiveCheckIns || 0}/3 days
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-2">No referrals yet</p>
                  <p className="text-sm text-muted-foreground">
                    Share your referral code with friends to start earning bonus points!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
