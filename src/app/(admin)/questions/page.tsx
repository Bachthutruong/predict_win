import { QuestionsTable } from "@/components/admin/questions-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockQuestions } from "@/lib/data";

export default function AdminQuestionsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Questions</h1>
                    <p className="text-muted-foreground">Create and manage questions for the daily check-in feature.</p>
                </div>
                <Button>Create Question</Button>
            </div>
            
            <Card>
                 <CardHeader>
                    <CardTitle>All Questions</CardTitle>
                    <CardDescription>A list of all questions for the daily check-in.</CardDescription>
                </CardHeader>
                <CardContent>
                    <QuestionsTable questions={mockQuestions} />
                </CardContent>
            </Card>
        </div>
    )
}
