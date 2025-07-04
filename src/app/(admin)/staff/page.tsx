'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Mail, 
  Eye, 
  EyeOff,
  UserCheck,
  Shield
} from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { createStaffAction, updateStaffAction, deleteStaffAction, getStaffUsers } from '@/app/actions';
import type { User } from '@/types';

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{success: boolean, message?: string} | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    password: '',
    avatarUrl: '',
  });

  const [editStaff, setEditStaff] = useState({
    name: '',
    email: '',
    password: '',
    avatarUrl: '',
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const data = await getStaffUsers();
      setStaff(data);
    } catch (error) {
      console.error('Failed to load staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await createStaffAction(newStaff);
      
      if (response.success) {
        setResult({ success: true, message: 'Staff account created successfully!' });
        setNewStaff({
          name: '',
          email: '',
          password: '',
          avatarUrl: '',
        });
        setIsCreateDialogOpen(false);
        loadStaff();
      } else {
        setResult({ success: false, message: response.message || 'Failed to create staff account' });
      }
    } catch (error) {
      console.error('Create staff error:', error);
      setResult({ success: false, message: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const updateData = {
        name: editStaff.name,
        email: editStaff.email,
        avatarUrl: editStaff.avatarUrl,
        ...(editStaff.password && { password: editStaff.password }),
      };

      const response = await updateStaffAction(editingStaff.id, updateData);
      
      if (response.success) {
        setResult({ success: true, message: 'Staff account updated successfully!' });
        setEditingStaff(null);
        loadStaff();
      } else {
        setResult({ success: false, message: response.message || 'Failed to update staff account' });
      }
    } catch (error) {
      console.error('Update staff error:', error);
      setResult({ success: false, message: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (staffId: string, staffName: string) => {
    try {
      const response = await deleteStaffAction(staffId);
      
      if (response.success) {
        setResult({ success: true, message: `${staffName} has been deleted successfully!` });
        loadStaff();
      } else {
        setResult({ success: false, message: response.message || 'Failed to delete staff account' });
      }
    } catch (error) {
      console.error('Delete staff error:', error);
      setResult({ success: false, message: 'An error occurred. Please try again.' });
    }
  };

  const openEditDialog = (staffMember: User) => {
    setEditingStaff(staffMember);
    setEditStaff({
      name: staffMember.name,
      email: staffMember.email,
      password: '',
      avatarUrl: staffMember.avatarUrl,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="hidden sm:inline">Admin: Staff Management</span>
            <span className="sm:hidden">Staff Management</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Create and manage staff accounts
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Staff</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Staff Account</DialogTitle>
              <DialogDescription className="text-sm">
                Create a new staff account with admin privileges.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {result && (
                <Alert variant={result.success ? 'default' : 'destructive'}>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff(prev => ({...prev, name: e.target.value}))}
                  placeholder="Enter full name..."
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff(prev => ({...prev, email: e.target.value}))}
                  placeholder="Enter email address..."
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={newStaff.password}
                    onChange={(e) => setNewStaff(prev => ({...prev, password: e.target.value}))}
                    placeholder="Enter password..."
                    required
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Avatar Image</Label>
                <ImageUpload
                  value={newStaff.avatarUrl}
                  onChange={(url) => setNewStaff(prev => ({...prev, avatarUrl: url}))}
                  disabled={isSubmitting}
                  placeholder="Upload staff avatar"
                />
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
                  {isSubmitting ? 'Creating...' : 'Create Staff Account'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{staff.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">Active staff accounts</span>
              <span className="sm:hidden">Active accounts</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Verified</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {staff.filter(s => s.isEmailVerified).length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">Email verified</span>
              <span className="sm:hidden">Verified</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">This Month</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {staff.filter(s => {
                const created = new Date(s.createdAt);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">New staff this month</span>
              <span className="sm:hidden">New this month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Staff Members</CardTitle>
          <CardDescription className="text-sm">
            Manage all staff accounts and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading staff...</p>
            </div>
          ) : staff.length > 0 ? (
            <div className="space-y-4">
              {staff.map((member) => (
                <div key={member.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <img 
                        src={member.avatarUrl} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="font-medium truncate">{member.name}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="secondary" className="text-xs">Staff</Badge>
                          {member.isEmailVerified && (
                            <Badge variant="default" className="text-xs">
                              <span className="hidden sm:inline">Verified</span>
                              <span className="sm:hidden">✓</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 min-w-0">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        <span className="hidden sm:inline">Joined {new Date(member.createdAt).toLocaleDateString()}</span>
                        <span className="sm:hidden">{new Date(member.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(member)}
                      className="text-xs"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="text-xs">
                          <Trash2 className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Staff Account</AlertDialogTitle>
                          <AlertDialogDescription className="text-sm">
                            Are you sure you want to delete {member.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(member.id, member.name)}
                            className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No staff members found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingStaff} onOpenChange={(open) => !open && setEditingStaff(null)}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Account</DialogTitle>
            <DialogDescription className="text-sm">
              Update staff account information.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {result && (
              <Alert variant={result.success ? 'default' : 'destructive'}>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={editStaff.name}
                onChange={(e) => setEditStaff(prev => ({...prev, name: e.target.value}))}
                placeholder="Enter full name..."
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editStaff.email}
                onChange={(e) => setEditStaff(prev => ({...prev, email: e.target.value}))}
                placeholder="Enter email address..."
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (leave empty to keep current)</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  value={editStaff.password}
                  onChange={(e) => setEditStaff(prev => ({...prev, password: e.target.value}))}
                  placeholder="Enter new password..."
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Avatar Image</Label>
              <ImageUpload
                value={editStaff.avatarUrl}
                onChange={(url) => setEditStaff(prev => ({...prev, avatarUrl: url}))}
                disabled={isSubmitting}
                placeholder="Upload staff avatar"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingStaff(null)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? 'Updating...' : 'Update Staff'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Result Alert */}
      {result && (
        <Alert variant={result.success ? 'default' : 'destructive'} className="mt-4">
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 