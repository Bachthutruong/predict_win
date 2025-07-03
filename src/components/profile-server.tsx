import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User as UserIcon, 
  Crown, 
  Coins, 
  Calendar,
  TrendingUp,
  History,
  Users,
  Gift,
  Copy,
  Share
} from 'lucide-react';
import { getUserProfileData, getReferralsData } from '@/app/actions';
import type { User, PointTransaction, Referral } from '@/types';
import { ProfileClient } from '@/components/profile-client';

// Profile Header Component  
async function ProfileHeader() {
  const { user } = await getUserProfileData();
  
  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-10">
          <p>Unable to load profile data. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  const userTyped = user as User;
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={userTyped.avatarUrl} alt={userTyped.name} />
            <AvatarFallback className="text-xl font-bold">
              {getInitials(userTyped.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{userTyped.name}</h1>
              <Badge variant={userTyped.role === 'admin' ? 'destructive' : userTyped.role === 'staff' ? 'secondary' : 'default'}>
                <Crown className="h-3 w-3 mr-1" />
                {userTyped.role}
              </Badge>
              {userTyped.isEmailVerified && (
                <Badge variant="outline" className="text-green-600">
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mb-3">{userTyped.email}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{userTyped.points} points</span>
              <span>•</span>
              <span>{userTyped.consecutiveCheckIns} day streak</span>
              <span>•</span>
              <span>Member since {new Date(userTyped.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Profile Stats Component
async function ProfileStats() {
  const [{ user, transactions }, { referrals }] = await Promise.all([
    getUserProfileData(),
    getReferralsData()
  ]);

  if (!user) return null;

  const userTyped = user as User;
  const transactionsTyped = transactions as PointTransaction[];
  const referralsTyped = referrals as Referral[];

  const completedReferrals = referralsTyped.filter(r => r.status === 'completed').length;
  const totalEarned = transactionsTyped
    .filter((t: PointTransaction) => t.amount > 0)
    .reduce((sum: number, t: PointTransaction) => sum + t.amount, 0);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Points</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userTyped.points}</div>
          <p className="text-xs text-muted-foreground">Available to use</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEarned}</div>
          <p className="text-xs text-muted-foreground">All time earnings</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Check-in Streak</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userTyped.consecutiveCheckIns}</div>
          <p className="text-xs text-muted-foreground">Days in a row</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Referrals</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedReferrals}</div>
          <p className="text-xs text-muted-foreground">Successful invites</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Profile Data Component
async function ProfileData() {
  const [{ user, transactions }, { referrals }] = await Promise.all([
    getUserProfileData(),
    getReferralsData()
  ]);

  if (!user) return null;

  const userTyped = user as User;
  const transactionsTyped = transactions as PointTransaction[];
  const referralsTyped = referrals as Referral[];

  return <ProfileClient user={userTyped} transactions={transactionsTyped} referrals={referralsTyped} />;
}

// Loading Skeletons
function ProfileHeaderSkeleton() {
  return (
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
  );
}

function ProfileStatsSkeleton() {
  return (
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
  );
}

function ProfileDataSkeleton() {
  return (
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
  );
}

// Main Profile Server Component
export default function ProfileServer() {
  return (
    <div className="mx-auto space-y-8">
      {/* Profile Header with Suspense */}
      <Suspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeader />
      </Suspense>

      {/* Stats Cards with Suspense */}
      <Suspense fallback={<ProfileStatsSkeleton />}>
        <ProfileStats />
      </Suspense>

      {/* Profile Data with Suspense */}
      <Suspense fallback={<ProfileDataSkeleton />}>
        <ProfileData />
      </Suspense>
    </div>
  );
} 