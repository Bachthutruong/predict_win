import { FeedbackTable } from "@/components/admin/feedback-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockFeedback } from "@/lib/data";

export default function AdminFeedbackPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Review Feedback</h1>
                <p className="text-muted-foreground">Approve, reject, and reward user suggestions.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Submissions</CardTitle>
                    <CardDescription>All feedback submitted by users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FeedbackTable feedbackItems={mockFeedback} />
                </CardContent>
            </Card>
        </div>
    );
}
