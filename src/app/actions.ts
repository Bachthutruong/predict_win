'use server';

import { suggestBonusPoints, type SuggestBonusPointsInput, type SuggestBonusPointsOutput } from '@/ai/flows/suggest-bonus-points';
import { mockFeedback } from '@/lib/data';

export async function getBonusSuggestion(
  input: SuggestBonusPointsInput
): Promise<SuggestBonusPointsOutput> {
  // In a real app, you might have more complex logic here.
  // For now, we directly call the Genkit flow.
  try {
    const result = await suggestBonusPoints(input);
    return result;
  } catch (error) {
    console.error("Error calling GenAI flow:", error);
    // Return a default or error state
    return {
      suggestedPointsRange: "Error",
      reasoning: "Could not get suggestion from AI."
    }
  }
}

export async function approveFeedbackAction(feedbackId: string, points: number): Promise<{success: boolean}> {
  console.log(`Approving feedback ${feedbackId} with ${points} points.`);
  const feedback = mockFeedback.find(f => f.id === feedbackId);
  if (feedback) {
    feedback.status = 'approved';
    feedback.awardedPoints = points;
  }
  // In a real app, you would update the database here.
  return { success: true };
}

export async function rejectFeedbackAction(feedbackId: string): Promise<{success: boolean}> {
    console.log(`Rejecting feedback ${feedbackId}.`);
    const feedback = mockFeedback.find(f => f.id === feedbackId);
    if (feedback) {
      feedback.status = 'rejected';
    }
    // In a real app, you would update the database here.
    return { success: true };
}
