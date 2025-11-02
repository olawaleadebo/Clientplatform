import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { UserPlus, Database, RefreshCw, CheckCircle, XCircle, AlertCircle, Users, Shield, Trash2 } from 'lucide-react';
import { backendService } from '../utils/backendService';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export function SystemInitializer() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  
  // New user form
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'agent' as 'admin' | 'manager' | 'agent'
  });

  useEffect(() => {
    loadUsers();
    // Run special assignments migration silently in background
    migrateSpecialAssignments();
  }, []);

  const migrateSpecialAssignments = async () => {
    try {
      const result = await backendService.migrateSpecialAssignments();
      if (result.success && result.migrated && result.migrated > 0) {
        console.log(`[MIGRATION] Migrated ${result.migrated} special assignments`);
      }
    } catch (error) {
      // Silently fail - migration is optional
      console.log('[MIGRATION] Special assignments migration skipped (backend not ready)');
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch('http://localhost:8000/debug/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      // Silently fail - just show empty users list
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const initializeDefaultAdmin = async () => {
    try {
      setLoading(true);
      toast.info('Initializing default admin user...');
      
      const response = await fetch('http://localhost:8000/setup/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('✅ ' + data.message);
        if (data.credentials) {
          toast.info(`Username: ${data.credentials.username}, Password: ${data.credentials.password}`, {
            duration: 10000
          });
        }
        await loadUsers();
      } else {
        toast.error(data.error || 'Failed to initialize');
      }
    } catch (error) {
      toast.error('Failed to initialize admin user. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.name || !newUser.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const data = await backendService.addUser({
        username: newUser.username.toLowerCase().trim(),
        password: newUser.password,
        name: newUser.name.trim(),
        email: newUser.email.toLowerCase().trim(),
        role: newUser.role,
        permissions: []
      });
      
      if (data.success) {
        toast.success(`✅ User "${newUser.username}" created successfully!`);
        setNewUser({
          username: '',
          password: '',
          name: '',
          email: '',
          role: 'agent'
        });
        setIsCreateUserDialogOpen(false);
        await loadUsers();
      } else {
        toast.error(data.error || 'Failed to create user');
      }
    } catch (error) {
      toast.error('Failed to create user. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const data = await backendService.deleteUser(userId);
      
      if (data.success) {
        toast.success(`User "${username}" deleted successfully`);
        await loadUsers();
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Failed to delete user. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-500 text-white';
      case 'manager':
        return 'bg-blue-500 text-white';
      case 'agent':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const hasManager = users.some(u => u.role.toLowerCase() === 'manager');
  const hasAdmin = users.some(u => u.role.toLowerCase() === 'admin');

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={hasAdmin ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Admin User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {users.filter(u => u.role.toLowerCase() === 'admin').length}
              </span>
              {hasAdmin ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {hasAdmin ? 'System administrator configured' : 'No admin user found'}
            </p>
          </CardContent>
        </Card>

        <Card className={hasManager ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Manager Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {users.filter(u => u.role.toLowerCase() === 'manager').length}
              </span>
              {hasManager ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {hasManager ? 'Team managers available' : 'No manager users found'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{users.length}</span>
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              All users in the system
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {!hasAdmin && (
        <Alert className="border-red-300 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>No admin user found!</strong> Click "Initialize Default Admin" to create one.
          </AlertDescription>
        </Alert>
      )}

      {!hasManager && (
        <Alert className="border-yellow-300 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>No manager user found!</strong> Create a manager user to access team management features.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Initialize system users and manage database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={initializeDefaultAdmin}
              disabled={loading || hasAdmin}
              variant="outline"
              className="border-blue-300 hover:bg-blue-50"
            >
              <Database className="w-4 h-4 mr-2" />
              Initialize Default Admin
            </Button>

            <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-green-300 hover:bg-green-50"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create New User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user to the system with specified role and permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      placeholder="e.g., manager, john.doe"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Strong password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., John Doe"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@btmtravel.net"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select 
                      value={newUser.role} 
                      onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateUserDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createUser}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              onClick={loadUsers}
              disabled={loading}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Users
            </Button>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <strong>Default Admin Credentials:</strong> username: <code className="bg-blue-100 px-2 py-0.5 rounded">admin</code>, 
              password: <code className="bg-blue-100 px-2 py-0.5 rounded">admin123</code>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            System Users ({users.length})
          </CardTitle>
          <CardDescription>
            All users currently in the MongoDB database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No users found in the database</p>
              <p className="text-sm">Click "Initialize Default Admin" to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono">{user.username}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteUser(user.id, user.username)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
