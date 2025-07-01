'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lightbulb, CheckCircle, Coins, MessageSquare, TrendingUp } from 'lucide-react';
import { submitFeedbackAction, getFeedbackItems } from '@/app/actions';
import type { Feedback } from '@/types';

export default function FeedbackPage() {
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{success: boolean, message?: string} | null>(null);
  const [approvedFeedback, setApprovedFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApprovedFeedback = async () => {
      try {
        const feedback = await getFeedbackItems();
        setApprovedFeedback(feedback.filter(f => f.status === 'approved'));
      } catch (error) {
        console.error('Failed to load feedback:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApprovedFeedback();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await submitFeedbackAction(feedbackText.trim());
      setResult(response);
      
      if (response.success) {
        setFeedbackText('');
      }
    } catch (error) {
      console.error('Submit feedback error:', error);
      setResult({ success: false, message: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Lightbulb className="h-8 w-8 text-primary" />
          System Feedback
        </h1>
        <p className="text-muted-foreground mt-2">
          Help us improve PredictWin! Share your suggestions and earn points for approved feedback.
        </p>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            How Feedback Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                1
              </div>
              <h3 className="font-medium">Submit Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Share your ideas for improving the platform
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                2
              </div>
              <h3 className="font-medium">Admin Review</h3>
              <p className="text-sm text-muted-foreground">
                Our team reviews and evaluates your suggestion
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                3
              </div>
              <h3 className="font-medium">Earn Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Get points if your feedback is approved!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Submit Your Feedback
          </CardTitle>
          <CardDescription>
            Share your suggestions, bug reports, or feature requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {result && (
              <Alert variant={result.success ? 'default' : 'destructive'}>
                <AlertDescription>
                  {result.success ? (
                    <>
                      <CheckCircle className="h-4 w-4 inline mr-2" />
                      {result.message || 'Feedback submitted successfully! Our team will review it soon.'}
                    </>
                  ) : (
                    result.message
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="feedback">Your Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Share your thoughts, suggestions, or report any issues you've encountered..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                required
                disabled={isSubmitting}
                rows={6}
                maxLength={1000}
              />
              <div className="text-xs text-muted-foreground text-right">
                {feedbackText.length}/1000 characters
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> Be specific and constructive for better chances of approval
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting || !feedbackText.trim()}
                className="min-w-[120px]"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Approved Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Community Approved Feedback
          </CardTitle>
          <CardDescription>
            See what suggestions from the community have been approved and implemented
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading approved feedback...</p>
            </div>
          ) : approvedFeedback.length > 0 ? (
            <div className="space-y-4">
              {approvedFeedback.map((feedback) => (
                <div key={feedback.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={feedback.user.avatarUrl} alt={feedback.user.name} />
                        <AvatarFallback>{getInitials(feedback.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{feedback.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                      {feedback.awardedPoints && (
                        <Badge variant="secondary">
                          <Coins className="h-3 w-3 mr-1" />
                          +{feedback.awardedPoints}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="pl-11">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      "{feedback.feedbackText}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-2">No approved feedback yet</p>
              <p className="text-sm text-muted-foreground">
                Be the first to submit valuable feedback and get it approved!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">✅ Good Feedback</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Specific suggestions for improvement</li>
                <li>• Clear bug reports with details</li>
                <li>• Feature requests with use cases</li>
                <li>• Constructive criticism</li>
                <li>• UI/UX improvement ideas</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-red-600">❌ Avoid</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Vague complaints without details</li>
                <li>• Requests for personal benefits</li>
                <li>• Inappropriate or offensive content</li>
                <li>• Duplicate suggestions</li>
                <li>• Unrelated topics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
