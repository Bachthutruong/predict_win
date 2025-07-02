'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Coins, Flame, Trophy } from 'lucide-react';
import { getActiveQuestion, checkInAction, getUserProfileData } from '@/app/actions';
import type { Question, User } from '@/types';

export default function CheckInPage() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{success: boolean, message?: string, pointsEarned?: number} | null>(null);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [questionData, userData] = await Promise.all([
          getActiveQuestion(),
          getUserProfileData()
        ]);

        setQuestion(questionData);
        setUser(userData.user as User);

        // Check if user has checked in today
        const userTyped = userData.user as User;
        if (userTyped?.lastCheckInDate) {
          const today = new Date().toDateString();
          const lastCheckIn = new Date(userTyped.lastCheckInDate).toDateString();
          setHasCheckedInToday(today === lastCheckIn);
        }
      } catch (error) {
        console.error('Failed to load check-in data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !answer.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await checkInAction(question.id, answer.trim());
      setResult(response);
      
      if (response.success) {
        setHasCheckedInToday(true);
        // Refresh user data to get updated points and streak
        const userData = await getUserProfileData();
        setUser(userData.user as User);
        
        // Refresh user points in navigation
        if ((window as any).refreshUserData) {
          (window as any).refreshUserData();
        }
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setResult({ success: false, message: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your daily check-in...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-10">
            <p>Please log in to access daily check-in.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className=" mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Calendar className="h-8 w-8 text-primary" />
          Daily Check-in
        </h1>
        <p className="text-muted-foreground mt-2">
          Answer today's question to earn points and maintain your streak!
        </p>
      </div>

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-xl font-bold">{user.points}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-orange-100 rounded-full">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-xl font-bold">{user.consecutiveCheckIns || 0} days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-green-100 rounded-full">
              <Trophy className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Bonus</p>
              <p className="text-xl font-bold">
                {7 - ((user.consecutiveCheckIns || 0) % 7)} days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Already checked in today */}
      {hasCheckedInToday && (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Check-in Complete!</h2>
            <p className="text-muted-foreground mb-4">
              You've already checked in today. Come back tomorrow to continue your streak!
            </p>
            <Badge variant="outline" className="text-green-600">
              Streak: {user.consecutiveCheckIns || 0} days
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Check-in Form */}
      {!hasCheckedInToday && (
        <>
          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              <AlertDescription>
                {result.success ? (
                  <>
                    <CheckCircle className="h-4 w-4 inline mr-2" />
                    {result.message} 
                    {result.pointsEarned && (
                      <span className="font-bold">You earned {result.pointsEarned} points!</span>
                    )}
                  </>
                ) : (
                  result.message
                )}
              </AlertDescription>
            </Alert>
          )}

          {question ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Question
                </CardTitle>
                <CardDescription>
                  Answer correctly to earn {question.points} points
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-3">
                    {question.imageUrl && (
                      <div className="rounded-lg overflow-hidden">
                        <img 
                          src={question.imageUrl} 
                          alt="Question image"
                          className="w-full max-h-64 object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="text-lg font-medium leading-relaxed">
                      {question.questionText}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="answer">Your Answer</Label>
                    <Input
                      id="answer"
                      type="text"
                      placeholder="Enter your answer..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      💡 <strong>Tip:</strong> Take your time and think carefully!
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !answer.trim()}
                      className="min-w-[120px]"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-10">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold mb-2">No Question Available</h2>
                <p className="text-muted-foreground">
                  There's no question available for today. Please check back later!
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Streak Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Streak Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">7-day streak bonus</span>
              <Badge variant="outline">+50 points</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">14-day streak bonus</span>
              <Badge variant="outline">+100 points</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">30-day streak bonus</span>
              <Badge variant="outline">+250 points</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
