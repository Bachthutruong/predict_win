import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import { getDashboardStats, getPredictions } from "@/app/actions";
import { PredictionCard } from "@/components/prediction-card";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const allPredictions = await getPredictions();
  const activePredictions = allPredictions.filter(p => p.status === 'active');

  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to PredictWin!</h1>
        <p className="text-muted-foreground">Here's a quick overview of the platform.</p>
       </div>
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Points Awarded
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPointsAwarded.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time points awarded
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Currently on the platform
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePredictions}</div>
            <p className="text-xs text-muted-foreground">
              Ready for your guess
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.pendingFeedback}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting admin review
            </p>
          </CardContent>
        </Card>
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Active Predictions</h2>
        <p className="text-muted-foreground">Make your guess and win big!</p>
        <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activePredictions.map(prediction => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
        </div>
      </div>
    </div>
  )
}
