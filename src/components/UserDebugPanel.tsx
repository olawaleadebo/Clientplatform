import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner@2.0.3';
import { backendService } from '../utils/backendService';
import { Bug, RefreshCw, Key, User, CheckCircle2, XCircle, Database } from 'lucide-react';

export function UserDebugPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testUsername, setTestUsername] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/debug/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users || []);
        toast.success(`✅ Found ${data.count} users in MongoDB database`);
      } else {
        toast.error('Failed to fetch users: ' + data.error);
        setUsers([]);
      }
    } catch (error: any) {
      toast.error('❌ MongoDB Error: ' + error.message + ' - Please ensure backend server is running');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    if (!testUsername || !testPassword) {
      toast.error('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const response = await backendService.login(testUsername, testPassword);
      setTestResult(response);
      
      if (response.success) {
        toast.success('✅ Login successful!');
      } else {
        toast.error('❌ Login failed: ' + response.error);
      }
    } catch (error: any) {
      toast.error('Error testing login: ' + error.message);
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Bug className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <CardTitle>User Database Panel</CardTitle>
              <CardDescription>
                View all users in MongoDB database and test login functionality
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fetch Users Button */}
          <div>
            <Button 
              onClick={fetchUsers} 
              disabled={loading}
              className="w-full"
            >
              <Database className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Fetch All Users from MongoDB Database'}
            </Button>
          </div>

          <Alert>
            <AlertDescription>
              <strong>💡 Single Source of Truth:</strong> All users are stored in MongoDB database only. 
              No localStorage fallback - this ensures consistency and eliminates confusion.
            </AlertDescription>
          </Alert>

          {/* Users Table */}
          {users.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold">MongoDB Database Users</h3>
                <Badge variant="default">{users.length} users</Badge>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Password</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{user.username}</TableCell>
                        <TableCell className="font-mono text-xs">{user.password}</TableCell>
                        <TableCell className="text-sm">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : user.role === 'manager' ? 'secondary' : 'outline'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {users.length === 0 && !loading && (
            <Alert>
              <AlertDescription>
                No users loaded yet. Click the button above to fetch users from MongoDB, or ensure your backend server is running.
              </AlertDescription>
            </Alert>
          )}

          {/* Test Login */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="w-5 h-5" />
                Test Login
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testUsername">Username</Label>
                  <Input
                    id="testUsername"
                    value={testUsername}
                    onChange={(e) => setTestUsername(e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testPassword">Password</Label>
                  <Input
                    id="testPassword"
                    type="text"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
              </div>
              
              <Button 
                onClick={testLogin} 
                disabled={loading}
                className="w-full"
                variant="secondary"
              >
                <User className="w-4 h-4 mr-2" />
                Test Login
              </Button>

              {testResult && (
                <Alert className={testResult.success ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}>
                  <AlertDescription className="space-y-2">
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="font-semibold text-green-700">Login Successful!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-red-500" />
                          <span className="font-semibold text-red-700">Login Failed</span>
                        </>
                      )}
                    </div>
                    
                    <div className="ml-7 space-y-1">
                      {testResult.success && testResult.user && (
                        <>
                          <p className="text-sm">User: {testResult.user.name}</p>
                          <p className="text-sm">Role: {testResult.user.role}</p>
                          <p className="text-sm">Email: {testResult.user.email}</p>
                        </>
                      )}
                      {!testResult.success && (
                        <p className="text-sm text-red-600">Error: {testResult.error || 'Unknown error'}</p>
                      )}
                    </div>

                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">View Full Response</summary>
                      <pre className="mt-2 p-2 bg-black/20 rounded text-xs overflow-auto">
                        {JSON.stringify(testResult, null, 2)}
                      </pre>
                    </details>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Alert>
            <AlertDescription>
              <strong>⚠️ Backend Required:</strong> User management and login require MongoDB backend connection. 
              Check your backend terminal for detailed debug output.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
