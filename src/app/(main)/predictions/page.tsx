import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Coins, Trophy, Clock, Target, Crown } from 'lucide-react';
import Link from 'next/link';
import { getPredictions } from '@/app/actions';
import type { Prediction } from '@/types';

export default async function PredictionsPage() {
  const allPredictions = await getPredictions();
  
  const predictionsWithoutWinners = allPredictions.filter(p => p.status === 'active' && !p.winnerId);
  const predictionsWithWinners = allPredictions.filter(p => p.winnerId || p.status === 'finished');
  const totalPredictions = allPredictions.length;

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderPredictionCard = (prediction: Prediction, showWinner = false) => (
    <Card key={prediction.id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex gap-2">
            <Badge variant="outline" className="mb-2">
              <Clock className="h-3 w-3 mr-1" />
              {prediction.status}
            </Badge>
            {showWinner && prediction.winnerId && (
              <Badge variant="default" className="mb-2 bg-yellow-500">
                <Crown className="h-3 w-3 mr-1" />
                Won
              </Badge>
            )}
          </div>
          <Badge variant="secondary">
            <Coins className="h-3 w-3 mr-1" />
            {prediction.pointsCost}
          </Badge>
        </div>
        <CardTitle className="text-lg line-clamp-2">
          {prediction.title}
        </CardTitle>
        {showWinner && prediction.winnerId && (
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={(prediction as any).winnerId?.avatarUrl} />
              <AvatarFallback className="text-xs">
                {getInitials((prediction as any).winnerId?.name || 'Unknown')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              Won by {(prediction as any).winnerId?.name || 'Unknown'}
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Image */}
          {prediction.imageUrl && (
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <img 
                src={prediction.imageUrl} 
                alt={prediction.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {/* Description */}
          <CardDescription className="line-clamp-3">
            {prediction.description}
          </CardDescription>

          {/* Info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Created {new Date(prediction.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Action */}
          <Button asChild className="w-full">
            <Link href={`/predictions/${prediction.id}`}>
              <Trophy className="h-4 w-4 mr-2" />
              {showWinner ? 'View Details' : 'Make Prediction'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          Active Predictions
        </h1>
        <p className="text-muted-foreground mt-2">
          Make your predictions and win points! You can predict multiple times if you have enough points.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Predictions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPredictions}</div>
            <p className="text-xs text-muted-foreground">
              Active predictions to choose from
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Range</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allPredictions.length > 0 
                ? `${Math.min(...allPredictions.map(p => p.pointsCost))}-${Math.max(...allPredictions.map(p => p.pointsCost))}`
                : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Points required to participate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">How It Works</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="font-medium">1. Pay entry cost</p>
              <p className="text-muted-foreground">2. Make prediction</p>
              <p className="text-muted-foreground">3. Win 150% if correct!</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictions Tabs */}
      <Tabs defaultValue="open" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="open" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Open Predictions ({predictionsWithoutWinners.length})
          </TabsTrigger>
          <TabsTrigger value="won" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Solved / Finished ({predictionsWithWinners.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="mt-6">
          {predictionsWithoutWinners.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {predictionsWithoutWinners.map((prediction) => renderPredictionCard(prediction, false))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-16">
                <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Open Predictions</h3>
                <p className="text-muted-foreground mb-6">
                  All current predictions have been solved! Check back later for new challenges.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="won" className="mt-6">
          {predictionsWithWinners.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {predictionsWithWinners.map((prediction) => renderPredictionCard(prediction, true))}
            </div>
          ) : (
                         <Card>
               <CardContent className="text-center py-16">
                 <Crown className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                 <h3 className="text-xl font-medium mb-2">No Solved Predictions Yet</h3>
                 <p className="text-muted-foreground mb-6">
                   No predictions have been solved or finished yet. Be the first to solve one!
                 </p>
               </CardContent>
             </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Predictions Work</CardTitle>
          <CardDescription>
            Understanding the prediction system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Choose a Prediction</h4>
                  <p className="text-sm text-muted-foreground">
                    Browse available predictions and select one that interests you
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Pay Entry Cost</h4>
                  <p className="text-sm text-muted-foreground">
                    Each prediction requires a certain number of points to participate
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Make Your Prediction</h4>
                  <p className="text-sm text-muted-foreground">
                    Submit your answer - you can predict multiple times if you have enough points
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <h4 className="font-medium">Win Rewards</h4>
                  <p className="text-sm text-muted-foreground">
                    Correct predictions earn 150% of the entry cost in points! Others can still participate even after someone wins.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
