'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Trophy,
  HelpCircle,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';
import { getAllUsers, getAllPredictions, getQuestions } from '@/app/actions';
import type { User, Prediction, Question } from '@/types';

export default function StaffDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [usersData, predictionsData, questionsData] = await Promise.all([
        getAllUsers(),
        getAllPredictions(),
        getQuestions(),
      ]);
      
      setUsers(usersData.filter((user: User) => user.role === 'user'));
      setPredictions(predictionsData);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activePredictions = predictions.filter(p => p.status === 'active');
  const finishedPredictions = predictions.filter(p => p.status === 'finished');
  const verifiedUsers = users.filter(user => user.isEmailVerified);
  const thisMonthUsers = users.filter(user => {
    const created = new Date(user.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Staff Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome to your staff control panel. Monitor and manage platform activities.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Staff Access
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {verifiedUsers.length} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activePredictions.length}</div>
            <p className="text-xs text-muted-foreground">
              {finishedPredictions.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
            <p className="text-xs text-muted-foreground">
              Check-in questions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{thisMonthUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              New users joined
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Predictions Overview
            </CardTitle>
            <CardDescription>
              Monitor all predictions (read-only)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active</span>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="font-medium">{activePredictions.length}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Completed</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">{finishedPredictions.length}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Staff cannot create new predictions or view answers
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              View and monitor user accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Users</span>
              <span className="font-medium">{users.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Verified</span>
              <span className="font-medium text-green-600">{verifiedUsers.length}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Read-only access to user profiles and statistics
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Questions Management
            </CardTitle>
            <CardDescription>
              Manage daily check-in questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Questions</span>
              <span className="font-medium">{questions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">This Month</span>
              <span className="font-medium text-blue-600">
                {questions.filter(q => {
                  const created = new Date(q.createdAt);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length}
              </span>
            </div>
            <div className="text-xs text-orange-600 mt-2">
              Staff cannot modify check-in point rewards
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Access Limitations</CardTitle>
          <CardDescription>
            Important information about your staff permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
              <div>
                <p className="font-medium text-sm">Cannot Grant Points</p>
                <p className="text-xs text-muted-foreground">Only admins can manually grant points to users</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
              <div>
                <p className="font-medium text-sm">Cannot Review Feedback</p>
                <p className="text-xs text-muted-foreground">Feedback review and responses are admin-only</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
              <div>
                <p className="font-medium text-sm">Limited Prediction Access</p>
                <p className="text-xs text-muted-foreground">Can view predictions but cannot create new ones or see answers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
              <div>
                <p className="font-medium text-sm">Fixed Check-in Rewards</p>
                <p className="text-xs text-muted-foreground">Cannot modify point rewards for check-in questions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div>
                <p className="font-medium text-sm">Can Manage Questions</p>
                <p className="text-xs text-muted-foreground">Full access to create, edit, and delete check-in questions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div>
                <p className="font-medium text-sm">Can View User Data</p>
                <p className="text-xs text-muted-foreground">Read-only access to all user profiles and statistics</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 