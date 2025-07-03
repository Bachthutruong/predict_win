'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  History,
  Users,
  Gift,
  Copy,
  Share,
  Check,
  TrendingUp,
  Coins
} from 'lucide-react';
import type { User, PointTransaction, Referral } from '@/types';

interface ProfileClientProps {
  user: User;
  transactions: PointTransaction[];
  referrals: Referral[];
}

export function ProfileClient({ user, transactions, referrals }: ProfileClientProps) {
  const [copiedReferralCode, setCopiedReferralCode] = useState(false);

  const copyReferralCode = async () => {
    if (user?.referralCode) {
      const referralUrl = `${window.location.origin}/register?ref=${user.referralCode}`;
      await navigator.clipboard.writeText(referralUrl);
      setCopiedReferralCode(true);
      setTimeout(() => setCopiedReferralCode(false), 2000);
    }
  };

  const copyReferralLink = async () => {
    if (user?.referralCode) {
      const referralUrl = `${window.location.origin}/register?ref=${user.referralCode}`;
      await navigator.clipboard.writeText(referralUrl);
    }
  };

  const shareReferralLink = async () => {
    if (user?.referralCode && navigator.share) {
      const referralUrl = `${window.location.origin}/register?ref=${user.referralCode}`;
      try {
        await navigator.share({
          title: 'Join PredictWin!',
          text: 'I found this awesome prediction game. Join me and let\'s win together!',
          url: referralUrl,
        });
      } catch (error) {
        // Fallback to copy if sharing fails
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const completedReferrals = referrals.filter(r => r.status === 'completed').length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
  const nextMilestone = Math.ceil(completedReferrals / 10) * 10;
  const pointsToNextMilestone = nextMilestone - completedReferrals;

  return (
    <Tabs defaultValue="transactions" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="transactions">Point History</TabsTrigger>
        <TabsTrigger value="referrals">Referrals</TabsTrigger>
      </TabsList>

      <TabsContent value="transactions">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              <CardTitle>Transaction History</CardTitle>
            </div>
            <CardDescription>
              Your recent point transactions and earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${transaction.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {transaction.amount > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <Coins className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{transaction.reason}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                        {transaction.notes && (
                          <p className="text-xs text-muted-foreground">
                            {transaction.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground">Start by checking in daily or making predictions!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="referrals">
        <div className="space-y-6">
          {/* Referral Code Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                <CardTitle>Your Referral Code</CardTitle>
              </div>
              <CardDescription>
                Share your code and earn bonus points when friends join!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Referral Code</label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={user.referralCode || ''} 
                    readOnly 
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyReferralCode}
                    className="shrink-0"
                  >
                    {copiedReferralCode ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Referral Link</label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${user.referralCode}`}
                    readOnly 
                    className="text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyReferralLink}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={shareReferralLink}
                    className="shrink-0"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">How it works:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Share your referral code with friends</li>
                  <li>• They sign up and check in for 3 consecutive days</li>
                  <li>• You both earn bonus points!</li>
                  <li>• Get milestone bonuses every 10 successful referrals</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Referrals List */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Your Referrals ({referrals.length})</CardTitle>
              </div>
              <CardDescription>
                Track your invited friends and their progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referrals.length > 0 ? (
                <div className="space-y-4">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={(referral.referredUser as any)?.avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(referral.referredUser?.name || 'Unknown')}`} 
                            alt={referral.referredUser?.name} 
                          />
                          <AvatarFallback>
                            {getInitials(referral.referredUser?.name || 'Unknown')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{referral.referredUser?.name || 'User'}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined {new Date(referral.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                          {referral.status}
                        </Badge>
                        {referral.status === 'pending' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {(referral.referredUser?.consecutiveCheckIns || 0)}/3 check-ins
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No referrals yet</p>
                  <p className="text-sm text-muted-foreground">Share your code to start earning bonus points!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
} 