import { getActiveQuestion } from "@/app/actions";
import { CheckinCard } from "@/components/checkin-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CheckinPage() {
    const question = await getActiveQuestion();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Daily Check-in</h1>
                <p className="text-muted-foreground">
                    Answer a question daily to earn points and keep your streak alive!
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2">
                    <CheckinCard question={question} />
                </div>
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Stats</CardTitle>
                            <CardDescription>Keep up the great work!</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                                <span className="font-medium text-muted-foreground">Current Streak</span>
                                <span className="font-bold text-primary text-lg">5 Days</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                                <span className="font-medium text-muted-foreground">Next Bonus</span>
                                <span className="font-bold text-primary text-lg">In 2 Days</span>
                            </div>
                             <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                                <span className="font-medium text-muted-foreground">Total Check-ins</span>
                                <span className="font-bold text-primary text-lg">128</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
