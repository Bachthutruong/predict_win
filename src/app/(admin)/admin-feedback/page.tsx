'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Coins, 
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';
import { getFeedbackItems, approveFeedbackAction, rejectFeedbackAction } from '@/app/actions';
import type { Feedback } from '@/types';

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [awardPoints, setAwardPoints] = useState(50);
  const { toast } = useToast();

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      const data = await getFeedbackItems();
      setFeedback(data);
    } catch (error) {
      console.error('Failed to load feedback:', error);
      toast({
        title: "Error",
        description: "Failed to load feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (feedbackId: string, points: number) => {
    setProcessingId(feedbackId);
    try {
      const result = await approveFeedbackAction(feedbackId, points);
      if (result.success) {
        toast({
          title: "Feedback Approved",
          description: `Successfully awarded ${points} points to the user.`,
        });
        setApproveDialogOpen(false);
        setSelectedFeedback(null);
        loadFeedback();
        
        // Refresh user points in navigation
        if ((window as any).refreshUserData) {
          (window as any).refreshUserData();
        }
      } else {
        toast({
          title: "Error", 
          description: result.message || "Failed to approve feedback",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to approve feedback:', error);
      toast({
        title: "Error",
        description: "An error occurred while approving feedback",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (feedbackId: string) => {
    setProcessingId(feedbackId);
    try {
      const result = await rejectFeedbackAction(feedbackId);
      if (result.success) {
        toast({
          title: "Feedback Rejected",
          description: "Feedback has been rejected.",
          variant: "destructive",
        });
        loadFeedback();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to reject feedback",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to reject feedback:', error);
      toast({
        title: "Error",
        description: "An error occurred while rejecting feedback",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const pendingFeedback = feedback.filter(f => f.status === 'pending');
  const approvedFeedback = feedback.filter(f => f.status === 'approved');
  const rejectedFeedback = feedback.filter(f => f.status === 'rejected');
  const totalPointsAwarded = approvedFeedback.reduce((sum, f) => sum + (f.awardedPoints || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="h-8 w-8 text-primary" />
            Admin: Review Feedback
          </h1>
          <p className="text-muted-foreground mt-2">
            Review user feedback submissions and award points for valuable suggestions
          </p>
        </div>
        <Button onClick={loadFeedback} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedback.length}</div>
            <p className="text-xs text-muted-foreground">
              All submissions received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingFeedback.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting admin action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedFeedback.length}</div>
            <p className="text-xs text-muted-foreground">
              Valuable suggestions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Awarded</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalPointsAwarded}</div>
            <p className="text-xs text-muted-foreground">
              Total points given
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Lists */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({feedback.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Pending Feedback
              </CardTitle>
              <CardDescription>
                Review these submissions and decide whether to approve or reject them
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackList 
                feedbackList={pendingFeedback}
                onApprove={(feedback) => {
                  setSelectedFeedback(feedback);
                  setApproveDialogOpen(true);
                }}
                onReject={handleReject}
                processingId={processingId}
                showActions={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Approved Feedback
              </CardTitle>
              <CardDescription>
                Feedback that has been approved and points awarded
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackList 
                feedbackList={approvedFeedback}
                processingId={processingId}
                showActions={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Rejected Feedback
              </CardTitle>
              <CardDescription>
                Feedback that was not suitable for approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackList 
                feedbackList={rejectedFeedback}
                processingId={processingId}
                showActions={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Feedback</CardTitle>
              <CardDescription>
                Complete history of all feedback submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackList 
                feedbackList={feedback}
                processingId={processingId}
                showActions={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Feedback</DialogTitle>
            <DialogDescription>
              Award points to the user for their valuable feedback
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedFeedback.user.avatarUrl} alt={selectedFeedback.user.name} />
                    <AvatarFallback>{getInitials(selectedFeedback.user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedFeedback.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedFeedback.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm">{selectedFeedback.feedbackText}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">Points to Award</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  max="500"
                  value={awardPoints}
                  onChange={(e) => setAwardPoints(parseInt(e.target.value) || 50)}
                />
                <p className="text-xs text-muted-foreground">
                  Typically 25-100 points based on feedback quality
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setApproveDialogOpen(false)}
                  disabled={processingId === selectedFeedback.id}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleApprove(selectedFeedback.id, awardPoints)}
                  disabled={processingId === selectedFeedback.id}
                >
                  {processingId === selectedFeedback.id ? 'Approving...' : `Approve & Award ${awardPoints} Points`}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FeedbackList({ 
  feedbackList, 
  onApprove, 
  onReject, 
  processingId, 
  showActions 
}: {
  feedbackList: Feedback[];
  onApprove?: (feedback: Feedback) => void;
  onReject?: (id: string) => void;
  processingId: string | null;
  showActions: boolean;
}) {
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  if (feedbackList.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No feedback to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbackList.map((feedback) => (
        <div key={feedback.id} className="p-4 border rounded-lg space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={feedback.user.avatarUrl} alt={feedback.user.name} />
                <AvatarFallback>{getInitials(feedback.user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{feedback.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(feedback.createdAt).toLocaleDateString()} at{' '}
                  {new Date(feedback.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={
                  feedback.status === 'pending' ? 'secondary' :
                  feedback.status === 'approved' ? 'default' : 'destructive'
                }
              >
                {feedback.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                {feedback.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                {feedback.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                {feedback.status}
              </Badge>
              {feedback.awardedPoints && (
                <Badge variant="outline">
                  <Coins className="h-3 w-3 mr-1" />
                  +{feedback.awardedPoints}
                </Badge>
              )}
            </div>
          </div>

          <div className="pl-13">
            <p className="text-sm leading-relaxed">{feedback.feedbackText}</p>
          </div>

          {showActions && feedback.status === 'pending' && (
            <div className="flex items-center gap-2 pl-13">
              <Button
                size="sm"
                onClick={() => onApprove?.(feedback)}
                disabled={processingId === feedback.id}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {processingId === feedback.id ? 'Processing...' : 'Approve'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject?.(feedback.id)}
                disabled={processingId === feedback.id}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                {processingId === feedback.id ? 'Processing...' : 'Reject'}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
