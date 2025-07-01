'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Gift, 
  Copy, 
  CheckCircle, 
  Clock, 
  Share2, 
  Users, 
  Trophy, 
  Coins,
  Target,
  Flame
} from 'lucide-react';
import { getReferralsData } from '@/app/actions';
import type { Referral, User } from '@/types';

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const loadReferralsData = async () => {
      try {
        const data = await getReferralsData();
        setReferrals(data.referrals);
        setCurrentUser(data.currentUser as User);
      } catch (error) {
        console.error('Failed to load referrals data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReferralsData();
  }, []);

  const copyReferralCode = async () => {
    if (currentUser?.referralCode) {
      await navigator.clipboard.writeText(currentUser.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const copyReferralLink = async () => {
    if (currentUser?.referralCode) {
      const link = `${window.location.origin}/register?ref=${currentUser.referralCode}`;
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const shareReferralLink = async () => {
    if (currentUser?.referralCode && navigator.share) {
      const link = `${window.location.origin}/register?ref=${currentUser.referralCode}`;
      try {
        await navigator.share({
          title: 'Join PredictWin!',
          text: 'Join me on PredictWin and start earning points by making predictions!',
          url: link,
        });
      } catch (error) {
        // Fallback to copy
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your referrals...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-10">
            <p>Unable to load referral data. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Gift className="h-8 w-8 text-primary" />
          Referral Program
        </h1>
        <p className="text-muted-foreground mt-2">
          Invite friends to PredictWin and earn bonus points together!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals.length}</div>
            <p className="text-xs text-muted-foreground">
              Friends invited
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedReferrals}</div>
            <p className="text-xs text-muted-foreground">
              Completed referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingReferrals}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Milestone</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{pointsToNextMilestone}</div>
            <p className="text-xs text-muted-foreground">
              referrals to {nextMilestone}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share your unique code or link with friends to start earning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Referral Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Referral Code</label>
            <div className="flex items-center gap-2">
              <Input
                value={currentUser.referralCode || 'Generating...'}
                readOnly
                className="font-mono"
              />
              <Button
                onClick={copyReferralCode}
                size="sm"
                variant="outline"
                disabled={!currentUser.referralCode}
              >
                {copiedCode ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Referral Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Referral Link</label>
            <div className="flex items-center gap-2">
              <Input
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${currentUser.referralCode}`}
                readOnly
                className="text-sm"
              />
              <Button
                onClick={copyReferralLink}
                size="sm"
                variant="outline"
                disabled={!currentUser.referralCode}
              >
                {copiedLink ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={shareReferralLink}
                size="sm"
                disabled={!currentUser.referralCode}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Rewards Info */}
          <Alert>
            <Gift className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p><strong>Earn 100 points</strong> for each friend who joins and checks in for 3 consecutive days.</p>
                <p><strong>Milestone Bonus:</strong> Get 500 extra points for every 10 successful referrals!</p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Milestone Progress */}
      {completedReferrals > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Milestone Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress to {nextMilestone} referrals</span>
                <span className="text-sm text-muted-foreground">{completedReferrals}/{nextMilestone}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedReferrals % 10) * 10}%` }}
                />
              </div>
              <div className="text-center">
                {pointsToNextMilestone > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {pointsToNextMilestone} more successful referral{pointsToNextMilestone > 1 ? 's' : ''} to earn <strong>500 bonus points!</strong>
                  </p>
                ) : (
                  <p className="text-sm text-green-600">
                    🎉 Milestone reached! You've earned bonus points!
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Referrals
          </CardTitle>
          <CardDescription>
            Track the status of friends you've invited
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length > 0 ? (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
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
                      <p className="text-xs text-muted-foreground">
                        Needs 3 day check-in streak
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-medium mb-2">No referrals yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start inviting friends to earn bonus points!
              </p>
              <Button onClick={shareReferralLink} disabled={!currentUser.referralCode}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Your Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Referrals Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-medium">For You (Referrer)</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Share your code</p>
                    <p className="text-sm text-muted-foreground">Send your referral link to friends</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">They join & stay active</p>
                    <p className="text-sm text-muted-foreground">Friend registers and checks in for 3 days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Earn rewards</p>
                    <p className="text-sm text-muted-foreground">Get 100 points + milestone bonuses</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">For Your Friends</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Easy registration</p>
                    <p className="text-sm text-muted-foreground">Quick sign-up with your referral code</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Start earning immediately</p>
                    <p className="text-sm text-muted-foreground">Daily check-ins and predictions available</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Join the community</p>
                    <p className="text-sm text-muted-foreground">Connect with other predictors and compete</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
