import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, XCircle, Loader2, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
import { backendService } from '../utils/backendService';

interface EndpointStatus {
  name: string;
  path: string;
  status: 'checking' | 'ok' | 'missing' | 'error';
  message?: string;
}

export function EndpointHealthCheck() {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    { name: 'Email Recipients', path: '/email-recipients', status: 'checking' },
    { name: 'Customers Database', path: '/database/customers', status: 'checking' },
    { name: 'Team Performance', path: '/team-performance', status: 'checking' },
    { name: 'Setup Init', path: '/test-setup', status: 'checking' },
  ]);
  const [isChecking, setIsChecking] = useState(false);
  const [serverVersion, setServerVersion] = useState<string>('');
  const [showRestartGuide, setShowRestartGuide] = useState(false);

  const checkEndpoints = async () => {
    setIsChecking(true);
    const newEndpoints: EndpointStatus[] = [];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:8000${endpoint.path}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 404) {
          newEndpoints.push({
            ...endpoint,
            status: 'missing',
            message: 'Endpoint not found - Server needs restart'
          });
        } else if (response.ok) {
          const data = await response.json();
          
          // Extract server version if available
          if (endpoint.path === '/test-setup' && data.version) {
            setServerVersion(data.version);
          }
          
          newEndpoints.push({
            ...endpoint,
            status: 'ok',
            message: response.status === 503 ? 'Database initializing' : 'OK'
          });
        } else {
          newEndpoints.push({
            ...endpoint,
            status: 'error',
            message: `HTTP ${response.status}`
          });
        }
      } catch (error: any) {
        newEndpoints.push({
          ...endpoint,
          status: 'error',
          message: error.message?.includes('fetch failed') ? 'Server not running' : error.message
        });
      }
    }

    setEndpoints(newEndpoints);
    setIsChecking(false);

    // Show restart guide if any endpoints are missing
    const hasMissingEndpoints = newEndpoints.some(e => e.status === 'missing');
    setShowRestartGuide(hasMissingEndpoints);
  };

  useEffect(() => {
    checkEndpoints();
    // Check every 30 seconds
    const interval = setInterval(checkEndpoints, 30000);
    return () => clearInterval(interval);
  }, []);

  const missingCount = endpoints.filter(e => e.status === 'missing').length;
  const okCount = endpoints.filter(e => e.status === 'ok').length;
  const errorCount = endpoints.filter(e => e.status === 'error').length;

  return (
    <Card className="bg-white/90 backdrop-blur border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Endpoint Health Check
              {isChecking && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
            </CardTitle>
            <CardDescription>
              Verify backend server is running the latest code
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkEndpoints}
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Server Version */}
        {serverVersion && (
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
            <span className="text-sm">Server Version:</span>
            <Badge variant="outline" className="bg-white font-mono">
              {serverVersion}
            </Badge>
          </div>
        )}

        {/* Summary */}
        <div className="flex gap-2">
          {okCount > 0 && (
            <Badge variant="outline" className="bg-green-50 border-green-300 text-green-700">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {okCount} OK
            </Badge>
          )}
          {missingCount > 0 && (
            <Badge variant="outline" className="bg-red-50 border-red-300 text-red-700">
              <XCircle className="w-3 h-3 mr-1" />
              {missingCount} Missing
            </Badge>
          )}
          {errorCount > 0 && (
            <Badge variant="outline" className="bg-yellow-50 border-yellow-300 text-yellow-700">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {errorCount} Error
            </Badge>
          )}
        </div>

        {/* Endpoint List */}
        <div className="space-y-2">
          {endpoints.map((endpoint) => (
            <div
              key={endpoint.path}
              className={`flex items-center justify-between p-3 rounded border ${
                endpoint.status === 'ok'
                  ? 'bg-green-50 border-green-200'
                  : endpoint.status === 'missing'
                  ? 'bg-red-50 border-red-200'
                  : endpoint.status === 'error'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {endpoint.status === 'checking' && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                )}
                {endpoint.status === 'ok' && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                {endpoint.status === 'missing' && (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                {endpoint.status === 'error' && (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <div>
                  <div className="font-medium text-sm">{endpoint.name}</div>
                  <div className="text-xs text-gray-600 font-mono">{endpoint.path}</div>
                </div>
              </div>
              {endpoint.message && (
                <span className="text-xs text-gray-600">{endpoint.message}</span>
              )}
            </div>
          ))}
        </div>

        {/* Restart Guide */}
        {showRestartGuide && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="text-red-800">
                  <strong>Backend server needs restart!</strong>
                </p>
                <p className="text-sm text-red-700">
                  The server is running old code. Follow these steps:
                </p>
                <ol className="text-sm text-red-700 list-decimal list-inside space-y-1 ml-2">
                  <li>Press <kbd className="px-1 py-0.5 bg-white border rounded text-xs">Ctrl+C</kbd> in the terminal running the backend</li>
                  <li>Run: <code className="px-1 py-0.5 bg-white border rounded text-xs">cd backend && ./start.sh</code></li>
                  <li>Wait for "✅ Email endpoints: /email-recipients ready"</li>
                  <li>Click the Refresh button above to verify</li>
                </ol>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-white hover:bg-red-100"
                  onClick={() => window.open('/BACKEND_RESTART_REQUIRED.md', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  View Full Restart Guide
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {missingCount === 0 && errorCount === 0 && okCount === endpoints.length && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <span className="text-green-800">
                ✅ All endpoints are loaded! Server is running the latest code.
              </span>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
