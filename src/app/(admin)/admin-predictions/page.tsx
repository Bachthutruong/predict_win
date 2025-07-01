'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Plus, Edit, Clock, CheckCircle, Coins, Image as ImageIcon } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { createPredictionAction, getAllPredictions } from '@/app/actions';
import type { Prediction } from '@/types';

export default function AdminPredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{success: boolean, message?: string} | null>(null);
  
  const [newPrediction, setNewPrediction] = useState({
    title: '',
    description: '',
    imageUrl: '',
    answer: '',
    pointsCost: 10,
  });

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setIsLoading(true);
    try {
      const data = await getAllPredictions();
      setPredictions(data);
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await createPredictionAction(newPrediction);
      
      if (response.success) {
        setResult({ success: true, message: 'Prediction created successfully!' });
        setNewPrediction({
          title: '',
          description: '',
          imageUrl: '',
          answer: '',
          pointsCost: 10,
        });
        setIsDialogOpen(false);
        loadPredictions(); // Refresh the list
      } else {
        setResult({ success: false, message: response.message || 'Failed to create prediction' });
      }
    } catch (error) {
      console.error('Create prediction error:', error);
      setResult({ success: false, message: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activePredictions = predictions.filter(p => p.status === 'active');
  const finishedPredictions = predictions.filter(p => p.status === 'finished');

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            Admin: Manage Predictions
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage predictions for users to participate in
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Prediction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Prediction</DialogTitle>
              <DialogDescription>
                Create a new prediction for users to participate in and earn points.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {result && (
                <Alert variant={result.success ? 'default' : 'destructive'}>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newPrediction.title}
                  onChange={(e) => setNewPrediction(prev => ({...prev, title: e.target.value}))}
                  placeholder="Enter prediction title..."
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newPrediction.description}
                  onChange={(e) => setNewPrediction(prev => ({...prev, description: e.target.value}))}
                  placeholder="Describe the prediction question..."
                  required
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Prediction Image</Label>
                <ImageUpload
                  value={newPrediction.imageUrl}
                  onChange={(url) => setNewPrediction(prev => ({...prev, imageUrl: url}))}
                  disabled={isSubmitting}
                  placeholder="Upload prediction image"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Add an image to make the prediction more engaging
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">Correct Answer *</Label>
                <Input
                  id="answer"
                  value={newPrediction.answer}
                  onChange={(e) => setNewPrediction(prev => ({...prev, answer: e.target.value}))}
                  placeholder="Enter the correct answer..."
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  This will be used to determine winning predictions (case-insensitive)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pointsCost">Entry Cost (Points) *</Label>
                <Input
                  id="pointsCost"
                  type="number"
                  min="1"
                  max="1000"
                  value={newPrediction.pointsCost}
                  onChange={(e) => setNewPrediction(prev => ({...prev, pointsCost: parseInt(e.target.value) || 10}))}
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Users will spend this amount to participate. Winners get 150% back.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Prediction'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <p className="text-xs text-muted-foreground">
              All time created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activePredictions.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{finishedPredictions.length}</div>
            <p className="text-xs text-muted-foreground">
              Finished predictions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Predictions List */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active ({activePredictions.length})</TabsTrigger>
          <TabsTrigger value="finished">Finished ({finishedPredictions.length})</TabsTrigger>
          <TabsTrigger value="all">All ({predictions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Predictions</CardTitle>
              <CardDescription>
                Predictions that users can currently participate in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activePredictions.length > 0 ? (
                <div className="space-y-4">
                  {activePredictions.map((prediction) => (
                    <PredictionCard key={prediction.id} prediction={prediction} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No active predictions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finished">
          <Card>
            <CardHeader>
              <CardTitle>Finished Predictions</CardTitle>
              <CardDescription>
                Predictions that have been completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {finishedPredictions.length > 0 ? (
                <div className="space-y-4">
                  {finishedPredictions.map((prediction) => (
                    <PredictionCard key={prediction.id} prediction={prediction} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No finished predictions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Predictions</CardTitle>
              <CardDescription>
                Complete list of all predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {predictions.length > 0 ? (
                <div className="space-y-4">
                  {predictions.map((prediction) => (
                    <PredictionCard key={prediction.id} prediction={prediction} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No predictions created yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PredictionCard({ prediction }: { prediction: Prediction }) {
  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg">
      {/* Image */}
      {prediction.imageUrl ? (
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={prediction.imageUrl} 
            alt={prediction.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium line-clamp-1">{prediction.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{prediction.description}</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Badge variant={prediction.status === 'active' ? 'default' : 'secondary'}>
              {prediction.status === 'active' ? (
                <Clock className="h-3 w-3 mr-1" />
              ) : (
                <CheckCircle className="h-3 w-3 mr-1" />
              )}
              {prediction.status}
            </Badge>
            <Badge variant="outline">
              <Coins className="h-3 w-3 mr-1" />
              {prediction.pointsCost}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Created {new Date(prediction.createdAt).toLocaleDateString()}</span>
          <div className="flex items-center gap-4">
            <span>Answer: <span className="font-mono font-medium">"{prediction.answer}"</span></span>
            {prediction.winnerId && (
              <span className="text-green-600">Winner found!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
