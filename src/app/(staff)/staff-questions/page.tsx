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
  Image as ImageIcon,
  Shield
} from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { createQuestionAction, updateQuestionAction, getQuestions } from '@/app/actions';
import type { Question } from '@/types';

export default function StaffQuestionsPage() {
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
        setResult({ success: false, message: 'Failed to create question' });
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
      // Staff cannot modify points, so we exclude it from the update
      const updateData = {
        questionText: editQuestion.questionText,
        imageUrl: editQuestion.imageUrl,
        answer: editQuestion.answer,
        isPriority: editQuestion.isPriority,
      };

      const response = await updateQuestionAction(editingQuestion.id, updateData);
      
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

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question);
    setEditQuestion({
      questionText: question.questionText,
      imageUrl: question.imageUrl || '',
      answer: question.answer,
      isPriority: question.isPriority,
      points: question.points, // Will be disabled
    });
  };

  const activeQuestions = questions.filter(q => q.status === 'active');
  const inactiveQuestions = questions.filter(q => q.status === 'inactive');
  const priorityQuestions = questions.filter(q => q.isPriority);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Staff: Manage Questions
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage questions for daily check-ins
            <br />
            <span className="text-orange-600 font-medium">Note: Staff cannot modify point rewards (admin-only)</span>
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Question</DialogTitle>
              <DialogDescription>
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
                    disabled={true} // Staff cannot modify points
                    className="bg-muted"
                  />
                  <p className="text-xs text-orange-600">
                    Staff cannot modify check-in points.
                  </p>
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

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Question'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
            <p className="text-xs text-muted-foreground">
              All questions created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeQuestions.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priority</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{priorityQuestions.length}</div>
            <p className="text-xs text-muted-foreground">
              High priority questions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveQuestions.length}</div>
            <p className="text-xs text-muted-foreground">
              Disabled questions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active ({activeQuestions.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveQuestions.length})</TabsTrigger>
          <TabsTrigger value="priority">Priority ({priorityQuestions.length})</TabsTrigger>
          <TabsTrigger value="all">All ({questions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <StaffQuestionsList 
            questions={activeQuestions} 
            onStatusToggle={handleStatusToggle}
            onPriorityToggle={handlePriorityToggle}
            onEdit={openEditDialog}
            emptyMessage="No active questions"
            emptyIcon={CheckCircle}
          />
        </TabsContent>

        <TabsContent value="inactive">
          <StaffQuestionsList 
            questions={inactiveQuestions} 
            onStatusToggle={handleStatusToggle}
            onPriorityToggle={handlePriorityToggle}
            onEdit={openEditDialog}
            emptyMessage="No inactive questions"
            emptyIcon={XCircle}
          />
        </TabsContent>

        <TabsContent value="priority">
          <StaffQuestionsList 
            questions={priorityQuestions} 
            onStatusToggle={handleStatusToggle}
            onPriorityToggle={handlePriorityToggle}
            onEdit={openEditDialog}
            emptyMessage="No priority questions"
            emptyIcon={Star}
          />
        </TabsContent>

        <TabsContent value="all">
          <StaffQuestionsList 
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Update the question details. Point rewards cannot be modified by staff.
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
                  value={editQuestion.points}
                  disabled={true} // Staff cannot modify points
                  className="bg-muted"
                />
                <p className="text-xs text-orange-600">
                  Staff cannot modify check-in points.
                </p>
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

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingQuestion(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Question'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StaffQuestionsList({ 
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
              <StaffQuestionCard 
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

function StaffQuestionCard({ 
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
    <div className="flex items-start gap-4 p-4 border rounded-lg">
      {/* Image */}
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

      {/* Content */}
      <div className="flex-1 space-y-3">
        <div className="space-y-1">
          <div className="flex items-start justify-between">
            <h3 className="font-medium line-clamp-2">{question.questionText}</h3>
            <div className="flex items-center gap-2 ml-4">
              {question.isPriority && (
                <Badge variant="default">
                  <Star className="h-3 w-3 mr-1" />
                  Priority
                </Badge>
              )}
              <Badge variant={question.status === 'active' ? 'default' : 'secondary'}>
                {question.status === 'active' ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {question.status}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Answer: <span className="font-mono font-medium">"{question.answer}"</span>
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
          <div className="flex items-center gap-1">
            <span>
              {question.displayCount > 0 
                ? `${Math.round((question.correctAnswerCount / question.displayCount) * 100)}% accuracy`
                : 'No data yet'
              }
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={question.status === 'active'}
              onCheckedChange={() => onStatusToggle(question.id, question.status)}
            />
            <Label className="text-sm">Active</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={question.isPriority}
              onCheckedChange={() => onPriorityToggle(question.id, question.isPriority)}
            />
            <Label className="text-sm">Priority</Label>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(question)}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>

          <div className="text-xs text-muted-foreground">
            Created {new Date(question.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
} 