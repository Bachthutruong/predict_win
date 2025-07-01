'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function FeedbackForm() {
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim().length < 10) {
      toast({
        title: 'Feedback too short',
        description: 'Please provide a bit more detail in your feedback.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    setFeedback('');
    toast({
      title: 'Feedback Submitted!',
      description: 'Thank you for your suggestion. The admin team will review it shortly.',
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4">
          <Textarea
            placeholder="Describe your idea or suggestion..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            disabled={isLoading}
          />
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Idea
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
