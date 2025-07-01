'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, 
  Plus, 
  Gift, 
  TrendingUp, 
  TrendingDown, 
  User, 
  Calendar,
  Edit2,
  Trash2
} from 'lucide-react';
import { grantPointsAction, getUsers, getPointTransactions } from '@/app/actions';
import type { User as UserType, PointTransaction } from '@/types';

export default function GrantPointsPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{success: boolean, message?: string} | null>(null);
  
  const [grantData, setGrantData] = useState({
    userId: '',
    amount: 10,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, transactionsData] = await Promise.all([
        getUsers(),
        getPointTransactions()
      ]);
      setUsers(usersData.filter(u => u.role !== 'admin')); // Don't show admin users
      setTransactions(transactionsData.filter(t => t.reason === 'admin-grant'));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      await grantPointsAction(grantData);
      setResult({ success: true, message: 'Points granted successfully!' });
      setGrantData({
        userId: '',
        amount: 10,
        notes: '',
      });
      setIsDialogOpen(false);
      loadData(); // Refresh the data
    } catch (error) {
      console.error('Grant points error:', error);
      setResult({ success: false, message: 'Failed to grant points. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedUser = users.find(u => u.id === grantData.userId);

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const totalPointsGranted = transactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);
  const totalPointsDeducted = transactions.reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Coins className="h-8 w-8 text-primary" />
            Admin: Grant Points
          </h1>
          <p className="text-muted-foreground mt-2">
            Manually grant or deduct points for users with detailed tracking
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Grant Points
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Grant Points to User</DialogTitle>
              <DialogDescription>
                Award or deduct points for a specific user with optional notes.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {result && (
                <Alert variant={result.success ? 'default' : 'destructive'}>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="user">Select User *</Label>
                <Select 
                  value={grantData.userId} 
                  onValueChange={(value) => setGrantData(prev => ({...prev, userId: value}))}
                  required
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {user.points} pts
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedUser && (
                  <div className="text-sm text-muted-foreground">
                    Current balance: <span className="font-medium">{selectedUser.points} points</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="-10000"
                  max="10000"
                  value={grantData.amount}
                  onChange={(e) => setGrantData(prev => ({...prev, amount: parseInt(e.target.value) || 0}))}
                  required
                  disabled={isSubmitting}
                  placeholder="Enter points amount (negative to deduct)"
                />
                <div className="text-xs text-muted-foreground">
                  Enter a positive number to add points, negative to deduct points
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={grantData.notes}
                  onChange={(e) => setGrantData(prev => ({...prev, notes: e.target.value}))}
                  placeholder="Optional reason for granting/deducting points..."
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              {selectedUser && grantData.amount !== 0 && (
                <Alert>
                  <Gift className="h-4 w-4" />
                  <AlertDescription>
                    {grantData.amount > 0 ? (
                      <>
                        <strong>{selectedUser.name}</strong> will receive <strong>+{grantData.amount} points</strong>
                        <br />
                        New balance: <strong>{selectedUser.points + grantData.amount} points</strong>
                      </>
                    ) : (
                      <>
                        <strong>{selectedUser.name}</strong> will lose <strong>{Math.abs(grantData.amount)} points</strong>
                        <br />
                        New balance: <strong>{selectedUser.points + grantData.amount} points</strong>
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !grantData.userId || grantData.amount === 0}
                >
                  {isSubmitting ? 'Processing...' : grantData.amount > 0 ? 'Grant Points' : 'Deduct Points'}
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
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Manual point operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Granted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{totalPointsGranted}</div>
            <p className="text-xs text-muted-foreground">
              Total points added
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Deducted</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{totalPointsDeducted}</div>
            <p className="text-xs text-muted-foreground">
              Total points removed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Impact</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPointsGranted - totalPointsDeducted >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPointsGranted - totalPointsDeducted >= 0 ? '+' : ''}{totalPointsGranted - totalPointsDeducted}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall point change
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users & Transactions */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions ({transactions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Select users to grant or deduct points
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users.length > 0 ? (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-lg">{user.points}</p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setGrantData(prev => ({ ...prev, userId: user.id }));
                            setIsDialogOpen(true);
                          }}
                        >
                          <Coins className="h-4 w-4 mr-1" />
                          Grant
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Point Transactions</CardTitle>
              <CardDescription>
                History of manually granted/deducted points
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                          {transaction.amount > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {transaction.amount > 0 ? 'Points Granted' : 'Points Deducted'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            To: <span className="font-medium">{transaction.user.name}</span>
                          </p>
                          {transaction.notes && (
                            <p className="text-xs text-muted-foreground">
                              "{transaction.notes}"
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">points</p>
                        {transaction.admin && (
                          <p className="text-xs text-muted-foreground">
                            by {transaction.admin.name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common point granting scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-auto flex-col p-4"
              onClick={() => {
                setGrantData(prev => ({ ...prev, amount: 50, notes: 'Bonus for excellent participation' }));
                setIsDialogOpen(true);
              }}
            >
              <Gift className="h-6 w-6 mb-2" />
              <span className="font-medium">Participation Bonus</span>
              <span className="text-xs opacity-80">+50 points</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex-col p-4"
              onClick={() => {
                setGrantData(prev => ({ ...prev, amount: 100, notes: 'Special event reward' }));
                setIsDialogOpen(true);
              }}
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="font-medium">Event Reward</span>
              <span className="text-xs opacity-80">+100 points</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex-col p-4"
              onClick={() => {
                setGrantData(prev => ({ ...prev, amount: -25, notes: 'Penalty for inappropriate behavior' }));
                setIsDialogOpen(true);
              }}
            >
              <TrendingDown className="h-6 w-6 mb-2" />
              <span className="font-medium">Minor Penalty</span>
              <span className="text-xs opacity-80">-25 points</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex-col p-4"
              onClick={() => {
                setGrantData(prev => ({ ...prev, amount: 0, notes: '' }));
                setIsDialogOpen(true);
              }}
            >
              <Coins className="h-6 w-6 mb-2" />
              <span className="font-medium">Custom Amount</span>
              <span className="text-xs opacity-80">Set your own</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
