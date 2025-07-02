'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { DashboardLoadingSkeleton } from '@/components/ui/loading-skeleton';
import { 
  Trophy, 
  Coins, 
  Users, 
  Clock, 
  Target, 
  CheckCircle,
  XCircle,
  ArrowLeft,
  Send,
  Loader2,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { getPredictionDetails, submitPredictionAction } from '@/app/actions';
import type { Prediction, UserPrediction } from '@/types';

export default function PredictionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const predictionId = params.id as string;
  const page = parseInt(searchParams.get('page') || '1');

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [userPredictions, setUserPredictions] = useState<UserPrediction[]>([]);
  const [currentUserPrediction, setCurrentUserPrediction] = useState<UserPrediction | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guess, setGuess] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    loadPredictionData();
  }, [predictionId, page]);

  const loadPredictionData = async () => {
    setIsLoading(true);
    try {
      const data = await getPredictionDetails(predictionId, page);
      setPrediction(data.prediction);
      setUserPredictions(data.userPredictions);
      setCurrentUserPrediction(data.currentUserPrediction || null);
      setCurrentUserId(data.currentUserId || null);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to load prediction:', error);
      toast({
        title: "Error",
        description: "Failed to load prediction details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guess.trim()) {
      toast({
        title: "Error",
        description: "Please enter your prediction",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitPredictionAction(predictionId, guess.trim());
      
      if (result.success) {
        if (result.isCorrect) {
          toast({
            title: "Correct Prediction! 🎉",
            description: "Congratulations! You earned bonus points for the correct answer.",
          });
        } else {
          toast({
            title: "Prediction Submitted",
            description: "Your prediction has been recorded. Good luck!",
          });
        }
        setGuess('');
        
        // Refresh data with optimistic update
        startTransition(() => {
          loadPredictionData();
        });
        
        // Refresh user points in navigation
        if ((window as any).refreshUserData) {
          (window as any).refreshUserData();
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to submit prediction",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Submit prediction error:', error);
      toast({
        title: "Error",
        description: "An error occurred while submitting your prediction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      router.push(`/predictions/${predictionId}?page=${newPage}`);
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (!prediction) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center">
          <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Prediction Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The prediction you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/predictions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Predictions
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const isActive = prediction.status === 'active';
  const hasWinner = !!prediction.winnerId;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/predictions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{prediction.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isActive ? 'default' : 'secondary'}>
                {prediction.status}
              </Badge>
              {hasWinner && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <Trophy className="h-3 w-3 mr-1" />
                  Solved
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button onClick={loadPredictionData} variant="outline" size="sm" disabled={isPending}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Prediction Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Prediction Details
                </CardTitle>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  {prediction.pointsCost} points
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image */}
              {prediction.imageUrl && (
                <div className="aspect-video relative overflow-hidden rounded-lg">
                  <img 
                    src={prediction.imageUrl} 
                    alt={prediction.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {prediction.description}
                </p>
              </div>

              {/* Metadata */}
              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <div className="font-medium">
                    {new Date(prediction.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Entry Cost:</span>
                  <div className="font-medium">{prediction.pointsCost} points</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Prediction Form */}
          {isActive && currentUserId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Make Your Prediction
                </CardTitle>
                <CardDescription>
                  Submit your answer for a chance to win points! You can predict multiple times.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      placeholder="Enter your prediction..."
                      disabled={isSubmitting}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Cost: {prediction.pointsCost} points • Win: {Math.round(prediction.pointsCost * 1.5)} points
                    </div>
                    <Button type="submit" disabled={isSubmitting || !guess.trim()}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Prediction
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* User's Previous Prediction */}
          {currentUserPrediction && (
            <Alert>
              <div className="flex items-center gap-2">
                {currentUserPrediction.isCorrect ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription>
                  <strong>Your prediction:</strong> "{currentUserPrediction.guess}"
                  {currentUserPrediction.isCorrect ? (
                    <span className="text-green-700 ml-2">✓ Correct! You won points.</span>
                  ) : (
                    <span className="text-muted-foreground ml-2">
                      Keep trying if you have enough points!
                    </span>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Predictions</span>
                <span className="font-medium">{userPredictions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Entry Cost</span>
                <span className="font-medium">{prediction.pointsCost} points</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Reward</span>
                <span className="font-medium text-green-600">
                  {Math.round(prediction.pointsCost * 1.5)} points
                </span>
              </div>
              {hasWinner && (
                <>
                  <Separator />
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Winner</div>
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">
                        {(prediction as any).winnerId?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* How to Win */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Win</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                  1
                </div>
                <p>Pay {prediction.pointsCost} points to make a prediction</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                  2
                </div>
                <p>Submit your answer for this prediction</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                  3
                </div>
                <p>If correct, win {Math.round(prediction.pointsCost * 1.5)} points!</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                  4
                </div>
                <p>You can predict multiple times if you have enough points</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* All Predictions */}
      {userPredictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Predictions ({userPredictions.length})
            </CardTitle>
            <CardDescription>
              See what others have predicted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userPredictions.map((userPrediction) => (
                <div key={userPrediction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userPrediction.user.avatarUrl} />
                      <AvatarFallback className="text-xs">
                        {getInitials(userPrediction.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{userPrediction.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        "{userPrediction.guess}"
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={userPrediction.isCorrect ? 'default' : 'secondary'}>
                      {userPrediction.isCorrect ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Correct
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Waiting
                        </>
                      )}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(userPrediction.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1 || isPending}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages || isPending}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 