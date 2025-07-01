'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { approveFeedbackAction, getBonusSuggestion, rejectFeedbackAction } from '@/app/actions';
import type { Feedback } from '@/types';
import type { SuggestBonusPointsOutput } from '@/ai/flows/suggest-bonus-points';
import { Loader2, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function FeedbackActions({ item }: { item: Feedback }) {
  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestBonusPointsOutput | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !suggestion) {
      setIsLoading(true);
      const result = await getBonusSuggestion({ feedback: item.feedbackText });
      setSuggestion(result);
      if(result.suggestedPointsRange.includes('-')) {
        const firstValue = result.suggestedPointsRange.split('-')[0].trim();
        setPoints(parseInt(firstValue, 10) || 100);
      }
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    await approveFeedbackAction(item.id, points);
    toast({
      title: "Feedback Approved",
      description: `${item.user.name} has been awarded ${points} points.`,
    });
    setIsLoading(false);
    setOpen(false);
    router.refresh();
  };

  const handleReject = async () => {
    setIsRejecting(true);
    await rejectFeedbackAction(item.id);
    toast({
        title: "Feedback Rejected",
        variant: "destructive",
    });
    setIsRejecting(false);
    router.refresh();
  }

  if (item.status !== 'pending') {
    return <span className="text-sm text-muted-foreground capitalize">{item.status}</span>;
  }

  return (
    <div className="flex gap-2 justify-end">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="h-8">
            <ThumbsUp className="mr-2 h-4 w-4" /> Approve
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve & Award Points</DialogTitle>
            <DialogDescription>
              Review the AI-suggestion and award bonus points for this feedback.
            </DialogDescription>
          </DialogHeader>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border bg-accent/50 p-4">
                <h4 className="font-semibold mb-2">AI Suggestion</h4>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Suggested Range:</strong> {suggestion?.suggestedPointsRange}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong className="text-foreground">Reasoning:</strong> {suggestion?.reasoning}
                </p>
              </div>
              <div>
                <Label htmlFor="points">Points to Award</Label>
                <Input
                  id="points"
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleApprove} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve & Award
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button size="sm" variant="destructive" className="h-8" onClick={handleReject} disabled={isRejecting}>
        {isRejecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsDown className="mr-2 h-4 w-4" />}
         Reject
      </Button>
    </div>
  );
}
