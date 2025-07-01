import { FeedbackForm } from "@/components/feedback-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { mockFeedback } from "@/lib/data";
import { CheckCircle, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function FeedbackPage() {
  const approvedFeedback = mockFeedback.filter(f => f.status === 'approved');

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <div className="sticky top-24">
          <h1 className="text-3xl font-bold tracking-tight">System Feedback</h1>
          <p className="mt-2 text-muted-foreground">
            Have an idea to make PredictWin better? We want to hear it! If we implement your suggestion, you'll earn bonus points as a thank you.
          </p>
          <div className="mt-6">
            <FeedbackForm />
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        <h2 className="text-2xl font-semibold tracking-tight">Approved Ideas</h2>
        <p className="mt-1 text-sm text-muted-foreground">Ideas from the community that we've implemented.</p>
        <div className="mt-6 space-y-4">
          {approvedFeedback.map(feedback => (
            <Card key={feedback.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={feedback.user.avatarUrl} />
                      <AvatarFallback>{feedback.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{feedback.user.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <Award className="h-5 w-5" />
                    <span className="font-bold">{feedback.awardedPoints} Points</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground">{feedback.feedbackText}</p>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Approved on {new Date(feedback.createdAt).toLocaleDateString()}</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
