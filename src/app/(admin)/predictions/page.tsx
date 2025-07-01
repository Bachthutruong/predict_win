import { getPredictions } from "@/app/actions";
import { PredictionsTable } from "@/components/admin/predictions-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPredictionsPage() {
    const predictions = await getPredictions();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Predictions</h1>
                    <p className="text-muted-foreground">Create, edit, and view all predictions on the platform.</p>
                </div>
                <Button>Create Prediction</Button>
            </div>
            
            <Card>
                 <CardHeader>
                    <CardTitle>All Predictions</CardTitle>
                    <CardDescription>A list of all active and finished predictions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PredictionsTable predictions={predictions} />
                </CardContent>
            </Card>
        </div>
    )
}
