'use server';

/**
 * @fileOverview Suggests a suitable range of bonus points to award a user for system improvement feedback.
 *
 * - suggestBonusPoints - A function that suggests a bonus point range based on feedback.
 * - SuggestBonusPointsInput - The input type for the suggestBonusPoints function.
 * - SuggestBonusPointsOutput - The return type for the suggestBonusPoints function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBonusPointsInputSchema = z.object({
  feedback: z
    .string()
    .describe('The user feedback for system improvements.'),
});

export type SuggestBonusPointsInput = z.infer<typeof SuggestBonusPointsInputSchema>;

const SuggestBonusPointsOutputSchema = z.object({
  suggestedPointsRange: z
    .string()
    .describe('The suggested range of bonus points to award the user.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the suggested bonus points range.'),
});

export type SuggestBonusPointsOutput = z.infer<typeof SuggestBonusPointsOutputSchema>;

export async function suggestBonusPoints(
  input: SuggestBonusPointsInput
): Promise<SuggestBonusPointsOutput> {
  return suggestBonusPointsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBonusPointsPrompt',
  input: {schema: SuggestBonusPointsInputSchema},
  output: {schema: SuggestBonusPointsOutputSchema},
  prompt: `You are an expert system for determining bonus points for user feedback.

  Given the following user feedback, suggest a suitable range of bonus points to award the user.
  Also provide a brief reasoning for the suggested range.

  Feedback: {{{feedback}}}

  Respond in the following format:
  {
    "suggestedPointsRange": "<range>",
    "reasoning": "<reasoning>"
  }`,
});

const suggestBonusPointsFlow = ai.defineFlow(
  {
    name: 'suggestBonusPointsFlow',
    inputSchema: SuggestBonusPointsInputSchema,
    outputSchema: SuggestBonusPointsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
