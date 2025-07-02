'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Coins, Trophy, Clock, Users, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { getPredictionDetails, submitPredictionAction } from '@/app/actions';
import type { Prediction, UserPrediction } from '@/types';

export default function PredictionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
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
  const [result, setResult] = useState<{success: boolean, message?: string, isCorrect?: boolean} | null>(null);

  useEffect(() => {
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
      } finally {
        setIsLoading(false);
      }
    };

    loadPredictionData();
  }, [predictionId, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await submitPredictionAction(predictionId, guess.trim());
      setResult(response);
      
      if (response.success) {
        // Clear form and refresh data
        setGuess('');
        const data = await getPredictionDetails(predictionId, page);
        setPrediction(data.prediction);
        setUserPredictions(data.userPredictions);
        setCurrentUserPrediction(data.currentUserPrediction || null);
        setCurrentUserId(data.currentUserId || null);
        
        // Refresh user points in navigation
        if ((window as any).refreshUserData) {
          (window as any).refreshUserData();
        }

        // Clear result message after 5 seconds
        setTimeout(() => setResult(null), 5000);
      }
    } catch (error) {
      console.error('Submit prediction error:', error);
      setResult({ success: false, message: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderPredictionText = (userPred: UserPrediction) => {
    // Show actual guess only for current user, otherwise show ***
    if (currentUserId && userPred.user.id === currentUserId) {
      return userPred.guess;
    }
    return "***";
  };

  const getPredictionCardClassName = (userPred: UserPrediction) => {
    let baseClass = "flex items-center justify-between p-4 border rounded-lg";
    
    // Highlight correct predictions with green background
    if (isFinished && userPred.isCorrect) {
      baseClass += " bg-green-50 border-green-200";
    }
    
    return baseClass;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading prediction details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-10">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Prediction Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The prediction you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/predictions">Back to Predictions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isFinished = prediction.status === 'finished';
  const hasUserPredicted = !!currentUserPrediction;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/predictions">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Predictions
        </Link>
      </Button>

      {/* Prediction Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={isFinished ? 'secondary' : 'default'}>
                  <Clock className="h-3 w-3 mr-1" />
                  {prediction.status}
                </Badge>
                <Badge variant="outline">
                  <Coins className="h-3 w-3 mr-1" />
                  {prediction.pointsCost} points
                </Badge>
              </div>
              <CardTitle className="text-2xl">{prediction.title}</CardTitle>
              <CardDescription className="text-base">
                {prediction.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Image */}
          {prediction.imageUrl && (
            <div className="mb-6">
              <img 
                src={prediction.imageUrl} 
                alt={prediction.title}
                className="rounded-lg max-w-full h-auto max-h-96 mx-auto"
              />
            </div>
          )}

          {/* Prediction Status */}
          {isFinished && prediction.winnerId && (
            <Alert className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Prediction Completed!</strong> A winner has been determined and this prediction is now closed.
              </AlertDescription>
            </Alert>
          )}

          {/* Submission Form or Result */}
          {!isFinished ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Make Your Prediction
                </CardTitle>
                <CardDescription>
                  Submit your answer to participate. You can predict multiple times if you have enough points!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {result?.message && (
                    <Alert variant={result.success ? "default" : "destructive"}>
                      <AlertDescription>
                        {result.success && result.isCorrect && <CheckCircle className="h-4 w-4 inline mr-2" />}
                        {result.success && !result.isCorrect && <XCircle className="h-4 w-4 inline mr-2" />}
                        {result.message}
                        {result.success && result.isCorrect && (
                          <span className="block mt-1 font-medium">You won {Math.round(prediction.pointsCost * 1.5)} points!</span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="guess">Your Prediction</Label>
                    <Input
                      id="guess"
                      type="text"
                      placeholder="Enter your prediction..."
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Cost: <span className="font-medium">{prediction.pointsCost} points</span>
                      <br />
                      Win: <span className="font-medium text-green-600">
                        {Math.round(prediction.pointsCost * 1.5)} points
                      </span> (150% if correct)
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !guess.trim()}
                      className="min-w-[140px]"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Prediction'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
                <h3 className="font-medium text-lg mb-2">Prediction Completed!</h3>
                <p className="text-muted-foreground">
                  This prediction has been solved and is now closed.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* User Predictions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Community Predictions
              </CardTitle>
              <CardDescription>
                See what others are predicting (correct predictions highlighted)
              </CardDescription>
            </div>
            <Badge variant="outline">
              {userPredictions.length} predictions on this page
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          {userPredictions.length > 0 ? (
            <div className="space-y-4">
              {userPredictions.map((userPred) => (
                <div key={userPred.id} className={getPredictionCardClassName(userPred)}>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userPred.user.avatarUrl} alt={userPred.user.name} />
                      <AvatarFallback>{getInitials(userPred.user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{userPred.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        "{renderPredictionText(userPred)}"
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(userPred.createdAt).toLocaleDateString()}
                    </p>
                    {isFinished && (
                      <div className="flex items-center gap-1 mt-1">
                        {userPred.isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-xs font-medium">
                          {userPred.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    asChild
                  >
                    <Link href={`/predictions/${predictionId}?page=${page - 1}`}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Link>
                  </Button>
                  
                  <span className="text-sm text-muted-foreground px-3">
                    Page {page} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    asChild
                  >
                    <Link href={`/predictions/${predictionId}?page=${page + 1}`}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No predictions yet. Be the first to predict!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 