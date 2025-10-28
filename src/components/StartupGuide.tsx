import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  Rocket, 
  Terminal, 
  Database, 
  Server,
  X,
  ExternalLink,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { BACKEND_URL } from '../utils/config';

interface StartupGuideProps {
  backendConnected: boolean;
}

export function StartupGuide({ backendConnected }: StartupGuideProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  
  // Only show guide when backend is explicitly disconnected (false)
  // Don't show when checking (null) or connected (true) or dismissed
  if (backendConnected !== false || dismissed) return null;

  // Add helpful console message
  console.log('%c⚠️ BACKEND CONNECTION FAILED ', 'background: #ef4444; color: white; font-size: 14px; padding: 5px 10px; border-radius: 4px;');
  console.log('Backend server is not responding at', BACKEND_URL);
  console.log('Please make sure the backend is running:');
  console.log('  cd backend');
  console.log('  deno run --allow-net --allow-env server.tsx');
  
  const handleRetryConnection = async () => {
    setIsRetrying(true);
    console.log('[StartupGuide] 🔄 Manual retry triggered...');
    
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      const data = await response.json();
      
      console.log('[StartupGuide] Response:', data);
      
      if (response.ok && (data.status === 'ok' || data.mongodb === 'connected')) {
        console.log('[StartupGuide] ✅ Connection successful! Reloading...');
        window.location.reload();
      } else {
        console.error('[StartupGuide] ❌ Backend responded but status not OK:', data);
        alert('Backend responded but is not ready yet. Status: ' + (data.status || 'unknown'));
      }
    } catch (error) {
      console.error('[StartupGuide] ❌ Retry failed:', error);
      alert('Still cannot connect to backend. Please check if it is running on port 8000.');
    } finally {
      setIsRetrying(false);
    }
  };
  
  const handleDismiss = () => {
    console.log('[StartupGuide] ⚠️ User dismissed the warning');
    setDismissed(true);
  };

  return (
    <Dialog open={!backendConnected} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Rocket className="w-6 h-6 text-purple-600" />
            Backend Connection Failed
          </DialogTitle>
          <DialogDescription>
            Cannot connect to backend server at {BACKEND_URL}
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-red-50 border-red-200 border-2">
          <Terminal className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-900">
            <div className="space-y-3">
              <p className="text-lg font-bold">🚨 BACKEND SERVER NOT RUNNING!</p>
              <p className="text-base">
                The backend server at <code className="bg-red-100 px-2 py-1 rounded">/backend/server.tsx</code> is not responding.
              </p>
              <div className="bg-white p-3 rounded border border-red-300 text-sm">
                <p className="mb-2">✅ <strong>Required Server:</strong></p>
                <code className="text-xs text-green-700">/backend/server.tsx (v6.0.0)</code>
                <p className="mt-3 text-gray-700">Make sure it's running on port 8000</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-6 mt-4">
          {/* Step 1 */}
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm">
                  1
                </div>
                Open Terminal in Backend Directory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-700">
                Navigate to your project's backend directory:
              </p>
              <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-sm">
                cd backend
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">
                  2
                </div>
                Start the Backend Server
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-700">
                Run the server using Deno:
              </p>
              <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-sm">
                deno run --allow-all server.tsx
              </div>
              <Alert className="mt-3">
                <Terminal className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  The server will automatically connect to MongoDB and start on port 8000
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm">
                  3
                </div>
                Wait for Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-700">
                You should see:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>✅ MongoDB Connected</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>🚀 Server running on port 8000</span>
                </div>
              </div>
              <Alert className="mt-3">
                <Database className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  This page will automatically close once the backend connects
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-gray-600" />
                Troubleshooting Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="default"
                size="lg"
                className="w-full justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xl py-10 shadow-xl animate-pulse"
                onClick={() => window.open('/OPEN-ME-TO-FIX.html', '_blank')}
              >
                <BookOpen className="w-8 h-8 mr-3" />
                📖 OPEN VISUAL FIX GUIDE (Easiest!)
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">OR</span>
                </div>
              </div>
              
              <Button
                variant="default"
                size="lg"
                className="w-full justify-center bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-lg py-8 shadow-lg"
                onClick={() => window.open('/FIX_NOW_COPY_PASTE.md', '_blank')}
              >
                <Terminal className="w-6 h-6 mr-3" />
                🚨 COPY/PASTE COMMANDS
              </Button>
              
              <div className="pt-2 pb-2 text-center bg-purple-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700">💡 Or just double-click:</p>
                <code className="text-base font-bold text-purple-700 bg-white px-3 py-2 rounded inline-block mt-2 border-2 border-purple-300">
                  AUTO-FIX.bat (Windows) / AUTO-FIX.sh (Mac/Linux)
                </code>
                <p className="text-xs text-gray-600 mt-2">Located in your project root folder</p>
              </div>

              <div className="border-t pt-3 space-y-2">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full justify-start bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  onClick={() => window.open('/test-backend.html', '_blank')}
                >
                  <Terminal className="w-4 h-4 mr-2" />
                  🧪 TEST BACKEND (Check Version)
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  onClick={() => window.open('/README_FIX_404.md', '_blank')}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  📖 FIX 404 ERROR GUIDE
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
                onClick={() => window.open('/BROWSER_TEST.md', '_blank')}
              >
                <Terminal className="w-4 h-4 mr-2 text-yellow-700" />
                🧪 Run Browser Console Test
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => window.open('/BACKEND_CONNECTION_FIX.md', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Backend Connection Fix Guide
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => window.open('/README.md', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Full Documentation
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleRetryConnection}
              disabled={isRetrying}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Testing Connection...' : 'Retry Connection'}
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="px-6"
            >
              Dismiss
            </Button>
          </div>

          {/* Status */}
          <Alert className={backendConnected ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
            {backendConnected ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 font-medium">
                  Backend server connected! You can close this dialog.
                </AlertDescription>
              </>
            ) : (
              <>
                <Server className="h-4 w-4 text-yellow-600 animate-pulse" />
                <AlertDescription className="text-yellow-800 font-medium">
                  Waiting for backend server connection...
                </AlertDescription>
              </>
            )}
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
