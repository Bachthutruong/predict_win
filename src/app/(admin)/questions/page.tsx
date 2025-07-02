'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, 
  Plus, 
  Edit2, 
  Star, 
  BarChart3, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Coins,
  Image as ImageIcon
} from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { createQuestionAction, updateQuestionAction, getQuestions } from '@/app/actions';
import type { Question } from '@/types';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{success: boolean, message?: string} | null>(null);
  
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    imageUrl: '',
    answer: '',
    isPriority: false,
    points: 10,
  });

  const [editQuestion, setEditQuestion] = useState({
    questionText: '',
    imageUrl: '',
    answer: '',
    isPriority: false,
    points: 10,
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await getQuestions();
      setQuestions(data);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await createQuestionAction(newQuestion);
      
      if (response.success) {
        setResult({ success: true, message: 'Question created successfully!' });
        setNewQuestion({
          questionText: '',
          imageUrl: '',
          answer: '',
          isPriority: false,
          points: 10,
        });
        setIsCreateDialogOpen(false);
        loadQuestions();
      } else {
        setResult({ success: false, message: response.message || 'Failed to create question' });
      }
    } catch (error) {
      console.error('Create question error:', error);
      setResult({ success: false, message: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await updateQuestionAction(editingQuestion.id, editQuestion);
      
      if (response.success) {
        setResult({ success: true, message: 'Question updated successfully!' });
        setEditingQuestion(null);
        loadQuestions();
      } else {
        setResult({ success: false, message: 'Failed to update question' });
      }
    } catch (error) {
      console.error('Update question error:', error);
      setResult({ success: false, message: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question);
    setEditQuestion({
      questionText: question.questionText,
      imageUrl: question.imageUrl || '',
      answer: question.answer,
      isPriority: question.isPriority,
      points: question.points,
    });
  };

  const handleStatusToggle = async (questionId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateQuestionAction(questionId, { status: newStatus });
      loadQuestions();
    } catch (error) {
      console.error('Failed to update question status:', error);
    }
  };

  const handlePriorityToggle = async (questionId: string, currentPriority: boolean) => {
    try {
      await updateQuestionAction(questionId, { isPriority: !currentPriority });
      loadQuestions();
    } catch (error) {
      console.error('Failed to update question priority:', error);
    }
  };

  const activeQuestions = questions.filter(q => q.status === 'active');
  const inactiveQuestions = questions.filter(q => q.status === 'inactive');
  const priorityQuestions = questions.filter(q => q.isPriority);

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="hidden sm:inline">Admin: Manage Questions</span>
            <span className="sm:hidden">Manage Questions</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Create and manage questions for daily check-ins
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create Question</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Question</DialogTitle>
              <DialogDescription className="text-sm">
                Create a new question for daily check-ins. Users will answer to earn points.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {result && (
                <Alert variant={result.success ? 'default' : 'destructive'}>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="questionText">Question *</Label>
                <Textarea
                  id="questionText"
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion(prev => ({...prev, questionText: e.target.value}))}
                  placeholder="Enter your question..."
                  required
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Question Image</Label>
                <ImageUpload
                  value={newQuestion.imageUrl}
                  onChange={(url) => setNewQuestion(prev => ({...prev, imageUrl: url}))}
                  disabled={isSubmitting}
                  placeholder="Upload question image"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Add an image to accompany the question
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">Correct Answer *</Label>
                <Input
                  id="answer"
                  value={newQuestion.answer}
                  onChange={(e) => setNewQuestion(prev => ({...prev, answer: e.target.value}))}
                  placeholder="Enter the correct answer..."
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Answer comparison is case-insensitive
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="points">Points Reward *</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    max="100"
                    value={newQuestion.points}
                    onChange={(e) => setNewQuestion(prev => ({...prev, points: parseInt(e.target.value) || 10}))}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Question</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      id="priority"
                      checked={newQuestion.isPriority}
                      onCheckedChange={(checked) => setNewQuestion(prev => ({...prev, isPriority: checked}))}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor="priority" className="text-sm">
                      Show this question more frequently
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? 'Creating...' : 'Create Question'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Questions</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{questions.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">All questions created</span>
              <span className="sm:hidden">Total</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{activeQuestions.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">Currently available</span>
              <span className="sm:hidden">Available</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Priority</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{priorityQuestions.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">High priority questions</span>
              <span className="sm:hidden">Priority</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Inactive</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">{inactiveQuestions.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">Disabled questions</span>
              <span className="sm:hidden">Disabled</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger value="active" className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-2 py-1.5 sm:py-2 h-auto whitespace-nowrap">
            <span className="hidden sm:inline">Active ({activeQuestions.length})</span>
            <span className="sm:hidden">Act ({activeQuestions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="inactive" className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-2 py-1.5 sm:py-2 h-auto whitespace-nowrap">
            <span className="hidden sm:inline">Inactive ({inactiveQuestions.length})</span>
            <span className="sm:hidden">Ina ({inactiveQuestions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="priority" className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-2 py-1.5 sm:py-2 h-auto whitespace-nowrap">
            <span className="hidden sm:inline">Priority ({priorityQuestions.length})</span>
            <span className="sm:hidden">Pri ({priorityQuestions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-2 py-1.5 sm:py-2 h-auto whitespace-nowrap">
            <span className="hidden sm:inline">All ({questions.length})</span>
            <span className="sm:hidden">All ({questions.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <QuestionsList 
            questions={activeQuestions} 
            onStatusToggle={handleStatusToggle}
            onPriorityToggle={handlePriorityToggle}
            onEdit={openEditDialog}
            emptyMessage="No active questions"
            emptyIcon={CheckCircle}
          />
        </TabsContent>

        <TabsContent value="inactive">
          <QuestionsList 
            questions={inactiveQuestions} 
            onStatusToggle={handleStatusToggle}
            onPriorityToggle={handlePriorityToggle}
            onEdit={openEditDialog}
            emptyMessage="No inactive questions"
            emptyIcon={XCircle}
          />
        </TabsContent>

        <TabsContent value="priority">
          <QuestionsList 
            questions={priorityQuestions} 
            onStatusToggle={handleStatusToggle}
            onPriorityToggle={handlePriorityToggle}
            onEdit={openEditDialog}
            emptyMessage="No priority questions"
            emptyIcon={Star}
          />
        </TabsContent>

        <TabsContent value="all">
          <QuestionsList 
            questions={questions} 
            onStatusToggle={handleStatusToggle}
            onPriorityToggle={handlePriorityToggle}
            onEdit={openEditDialog}
            emptyMessage="No questions created yet"
            emptyIcon={HelpCircle}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={(open) => !open && setEditingQuestion(null)}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription className="text-sm">
              Update the question details.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {result && (
              <Alert variant={result.success ? 'default' : 'destructive'}>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-questionText">Question *</Label>
              <Textarea
                id="edit-questionText"
                value={editQuestion.questionText}
                onChange={(e) => setEditQuestion(prev => ({...prev, questionText: e.target.value}))}
                placeholder="Enter your question..."
                required
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Question Image</Label>
              <ImageUpload
                value={editQuestion.imageUrl}
                onChange={(url) => setEditQuestion(prev => ({...prev, imageUrl: url}))}
                disabled={isSubmitting}
                placeholder="Upload question image"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-answer">Correct Answer *</Label>
              <Input
                id="edit-answer"
                value={editQuestion.answer}
                onChange={(e) => setEditQuestion(prev => ({...prev, answer: e.target.value}))}
                placeholder="Enter the correct answer..."
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-points">Points Reward *</Label>
                <Input
                  id="edit-points"
                  type="number"
                  min="1"
                  max="100"
                  value={editQuestion.points}
                  onChange={(e) => setEditQuestion(prev => ({...prev, points: parseInt(e.target.value) || 10}))}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority Question</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    id="edit-priority"
                    checked={editQuestion.isPriority}
                    onCheckedChange={(checked) => setEditQuestion(prev => ({...prev, isPriority: checked}))}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="edit-priority" className="text-sm">
                    Show this question more frequently
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingQuestion(null)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? 'Updating...' : 'Update Question'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuestionsList({ 
  questions, 
  onStatusToggle, 
  onPriorityToggle, 
  onEdit,
  emptyMessage, 
  emptyIcon: EmptyIcon 
}: {
  questions: Question[];
  onStatusToggle: (id: string, status: string) => void;
  onPriorityToggle: (id: string, priority: boolean) => void;
  onEdit: (question: Question) => void;
  emptyMessage: string;
  emptyIcon: any;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard 
                key={question.id} 
                question={question}
                onStatusToggle={onStatusToggle}
                onPriorityToggle={onPriorityToggle}
                onEdit={onEdit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <EmptyIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuestionCard({ 
  question, 
  onStatusToggle, 
  onPriorityToggle,
  onEdit
}: { 
  question: Question;
  onStatusToggle: (id: string, status: string) => void;
  onPriorityToggle: (id: string, priority: boolean) => void;
  onEdit: (question: Question) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 border rounded-lg">
      {/* Image */}
      <div className="flex sm:block">
        {question.imageUrl ? (
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src={question.imageUrl} 
              alt="Question"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3 min-w-0">
        <div className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <h3 className="font-medium line-clamp-2 min-w-0 pr-2">{question.questionText}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {question.isPriority && (
                <Badge variant="default" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Priority</span>
                  <span className="sm:hidden">⭐</span>
                </Badge>
              )}
              <Badge variant={question.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                {question.status === 'active' ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                <span className="capitalize">{question.status}</span>
              </Badge>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Answer: <span className="font-mono font-medium">"{question.answer}"</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Coins className="h-4 w-4" />
            <span>{question.points} points</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{question.displayCount} displays</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            <span>{question.correctAnswerCount} correct</span>
          </div>
          <div className="flex items-center gap-1 col-span-2 sm:col-span-1">
            <span>
              {question.displayCount > 0 
                ? `${Math.round((question.correctAnswerCount / question.displayCount) * 100)}% accuracy`
                : 'No data yet'
              }
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={question.status === 'active'}
                onCheckedChange={() => onStatusToggle(question.id, question.status)}
              />
              <Label className="text-xs sm:text-sm">Active</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={question.isPriority}
                onCheckedChange={() => onPriorityToggle(question.id, question.isPriority)}
              />
              <Label className="text-xs sm:text-sm">Priority</Label>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(question)}
              className="text-xs"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Edit</span>
              <span className="sm:hidden">Edit</span>
            </Button>

            <div className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">Created {new Date(question.createdAt).toLocaleDateString()}</span>
              <span className="sm:hidden">{new Date(question.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
