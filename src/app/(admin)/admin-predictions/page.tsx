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
import { Trophy, Plus, Edit, Edit2, Clock, CheckCircle, Coins, Image as ImageIcon } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { createPredictionAction, updatePredictionAction, getAllPredictions } from '@/app/actions';
import type { Prediction } from '@/types';

export default function AdminPredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrediction, setEditingPrediction] = useState<Prediction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{success: boolean, message?: string} | null>(null);
  
  const [newPrediction, setNewPrediction] = useState({
    title: '',
    description: '',
    imageUrl: '',
    answer: '',
    pointsCost: 10,
  });

  const [editPrediction, setEditPrediction] = useState({
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrediction) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await updatePredictionAction(editingPrediction.id, editPrediction);
      
      if (response.success) {
        setResult({ success: true, message: 'Prediction updated successfully!' });
        setEditingPrediction(null);
        loadPredictions();
      } else {
        setResult({ success: false, message: response.message || 'Failed to update prediction' });
      }
    } catch (error) {
      console.error('Update prediction error:', error);
      setResult({ success: false, message: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (prediction: Prediction) => {
    setEditingPrediction(prediction);
    setEditPrediction({
      title: prediction.title,
      description: prediction.description,
      imageUrl: prediction.imageUrl || '',
      answer: prediction.answer,
      pointsCost: prediction.pointsCost,
    });
  };

  const activePredictions = predictions.filter(p => p.status === 'active');
  const finishedPredictions = predictions.filter(p => p.status === 'finished');

  return (
    <div className="w-full space-y-4 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 lg:h-8 lg:w-8 text-primary flex-shrink-0" />
            <span className="truncate">Admin: Manage Predictions</span>
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1 lg:mt-2">
            Create and manage predictions for users to participate in
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create Prediction</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
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

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? 'Creating...' : 'Create Prediction'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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

        <Card className="sm:col-span-2 lg:col-span-1">
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
      <Tabs defaultValue="active" className="space-y-4 lg:space-y-6">
        <TabsList className="w-full lg:w-auto">
          <TabsTrigger value="active" className="flex-1 lg:flex-none">
            <span className="sm:hidden">Active ({activePredictions.length})</span>
            <span className="hidden sm:inline">Active ({activePredictions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="finished" className="flex-1 lg:flex-none">
            <span className="sm:hidden">Done ({finishedPredictions.length})</span>
            <span className="hidden sm:inline">Finished ({finishedPredictions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1 lg:flex-none">
            All ({predictions.length})
          </TabsTrigger>
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
                    <PredictionCard 
                      key={prediction.id} 
                      prediction={prediction} 
                      onEdit={openEditDialog}
                    />
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
                    <PredictionCard 
                      key={prediction.id} 
                      prediction={prediction} 
                      onEdit={openEditDialog}
                    />
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
                    <PredictionCard 
                      key={prediction.id} 
                      prediction={prediction} 
                      onEdit={openEditDialog}
                    />
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

      {/* Edit Dialog */}
      <Dialog open={!!editingPrediction} onOpenChange={(open) => !open && setEditingPrediction(null)}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Prediction</DialogTitle>
            <DialogDescription>
              Update the prediction details.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {result && (
              <Alert variant={result.success ? 'default' : 'destructive'}>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={editPrediction.title}
                onChange={(e) => setEditPrediction(prev => ({...prev, title: e.target.value}))}
                placeholder="Enter prediction title..."
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={editPrediction.description}
                onChange={(e) => setEditPrediction(prev => ({...prev, description: e.target.value}))}
                placeholder="Describe the prediction question..."
                required
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Prediction Image</Label>
              <ImageUpload
                value={editPrediction.imageUrl}
                onChange={(url) => setEditPrediction(prev => ({...prev, imageUrl: url}))}
                disabled={isSubmitting}
                placeholder="Upload prediction image"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-answer">Correct Answer *</Label>
              <Input
                id="edit-answer"
                value={editPrediction.answer}
                onChange={(e) => setEditPrediction(prev => ({...prev, answer: e.target.value}))}
                placeholder="Enter the correct answer..."
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-pointsCost">Entry Cost (Points) *</Label>
              <Input
                id="edit-pointsCost"
                type="number"
                min="1"
                max="1000"
                value={editPrediction.pointsCost}
                onChange={(e) => setEditPrediction(prev => ({...prev, pointsCost: parseInt(e.target.value) || 10}))}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingPrediction(null)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? 'Updating...' : 'Update Prediction'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PredictionCard({ 
  prediction, 
  onEdit 
}: { 
  prediction: Prediction;
  onEdit: (prediction: Prediction) => void;
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-4 p-4 border rounded-lg">
      {/* Image */}
      {prediction.imageUrl ? (
        <div className="w-full lg:w-20 h-48 lg:h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={prediction.imageUrl} 
            alt={prediction.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full lg:w-20 h-48 lg:h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-lg leading-tight break-words">{prediction.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 break-words">
              {prediction.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            <Badge variant={prediction.status === 'active' ? 'default' : 'secondary'}>
              {prediction.status}
            </Badge>
            <Badge variant="outline">
              <Coins className="h-3 w-3 mr-1" />
              {prediction.pointsCost}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Answer:</span> {prediction.answer}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(prediction)}
            className="w-full sm:w-auto"
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}
