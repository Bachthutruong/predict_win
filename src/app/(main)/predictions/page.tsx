import { PredictionCard } from "@/components/prediction-card";
import { mockPredictions } from "@/lib/data";

export default function PredictionsPage() {
    const activePredictions = mockPredictions.filter(p => p.status === 'active');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">All Predictions</h1>
                <p className="text-muted-foreground">Browse all active predictions and make your choice. Good luck!</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {activePredictions.map(prediction => (
                    <PredictionCard key={prediction.id} prediction={prediction} />
                ))}
                 {mockPredictions.filter(p => p.status === 'finished').map(prediction => (
                    <div key={prediction.id} className="opacity-50">
                        <PredictionCard prediction={prediction} />
                    </div>
                ))}
            </div>
        </div>
    );
}
