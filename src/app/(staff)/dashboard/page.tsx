'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DashboardLoadingSkeleton } from '@/components/ui/loading-skeleton';
import { 
  Users, 
  Trophy,
  HelpCircle,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Shield,
  RefreshCw
} from 'lucide-react';
import { getAllUsers, getAllPredictions, getQuestions } from '@/app/actions';
import type { User, Prediction, Question } from '@/types';

export default function StaffDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  const activePredictions = predictions.filter(p => p.status === 'active');
  const finishedPredictions = predictions.filter(p => p.status === 'finished');
  const verifiedUsers = users.filter(user => user.isEmailVerified);
  const thisMonthUsers = users.filter(user => {
    const created = new Date(user.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  });

  const totalUserPoints = users.reduce((sum, user) => sum + user.points, 0);
  const averageUserPoints = users.length > 0 ? Math.round(totalUserPoints / users.length) : 0;

  const activeQuestions = questions.filter(q => q.status === 'active');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Staff Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor user activity, predictions, and system health
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {verifiedUsers.length} verified • {users.length - verifiedUsers.length} unverified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePredictions.length}</div>
            <p className="text-xs text-muted-foreground">
              {finishedPredictions.length} finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Questions</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeQuestions.length}</div>
            <p className="text-xs text-muted-foreground">
              {questions.length - activeQuestions.length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              New user registrations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Verified Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{verifiedUsers.length}</span>
                  <Badge variant="outline" className="text-green-600">
                    {users.length > 0 ? Math.round((verifiedUsers.length / users.length) * 100) : 0}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Pending Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{users.length - verifiedUsers.length}</span>
                  <Badge variant="secondary">
                    {users.length > 0 ? Math.round(((users.length - verifiedUsers.length) / users.length) * 100) : 0}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Points Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Points in System</span>
                <span className="font-medium">{totalUserPoints.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average per User</span>
                <span className="font-medium">{averageUserPoints}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Top User Points</span>
                <span className="font-medium">
                  {users.length > 0 ? Math.max(...users.map(u => u.points)) : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="font-medium">Growth Trend</span>
                </div>
                <p className="text-muted-foreground">
                  {thisMonthUsers.length} new users this month
                </p>
              </div>
              
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-3 w-3 text-blue-500" />
                  <span className="font-medium">Predictions</span>
                </div>
                <p className="text-muted-foreground">
                  {activePredictions.length} active, {finishedPredictions.length} completed
                </p>
              </div>
              
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <HelpCircle className="h-3 w-3 text-purple-500" />
                  <span className="font-medium">Questions</span>
                </div>
                <p className="text-muted-foreground">
                  {activeQuestions.length} active questions available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users by Points */}
      <Card>
        <CardHeader>
          <CardTitle>Top Users by Points</CardTitle>
          <CardDescription>Users with the highest point totals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users
              .filter(user => user.isEmailVerified)
              .sort((a, b) => b.points - a.points)
              .slice(0, 10)
              .map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{user.points} points</p>
                    <p className="text-xs text-muted-foreground">
                      {user.consecutiveCheckIns || 0} day streak
                    </p>
                  </div>
                </div>
              ))
            }
            {users.filter(user => user.isEmailVerified).length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No verified users found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 