import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Wifi, WifiOff, Database, Server, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { backendService } from '../utils/backendService';
import { BACKEND_URL } from '../utils/config';

export function ConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [backendInfo, setBackendInfo] = useState<any>(null);
  const [mongoStatus, setMongoStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    setStatus('checking');
    
    try {
      const response = await backendService.health();
      
      if (response.status === 'ok') {
        setStatus('connected');
        setBackendInfo(response);
        setMongoStatus('connected');
      } else {
        setStatus('disconnected');
        setMongoStatus('failed');
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setStatus('disconnected');
      setBackendInfo(null);
      setMongoStatus('unknown');
    } finally {
      setLastCheck(new Date());
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-red-500';
      case 'checking': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'disconnected': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking': return <AlertCircle className="w-5 h-5 text-yellow-500 animate-pulse" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">Backend Connection</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
            <Badge variant={status === 'connected' ? 'default' : 'destructive'}>
              {status.toUpperCase()}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Backend: {BACKEND_URL}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Server className="w-4 h-4" />
              <span>Backend Server</span>
            </div>
            <div className="flex items-center gap-2">
              {status === 'connected' ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">Online</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm">Offline</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Database className="w-4 h-4" />
              <span>MongoDB Atlas</span>
            </div>
            <div className="flex items-center gap-2">
              {mongoStatus === 'connected' ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">Connected</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-sm">Unknown</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Backend Info */}
        {backendInfo && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="space-y-1">
              <div className="text-sm">
                <span className="text-gray-600">Version:</span>{' '}
                <span className="font-mono">{backendInfo.version}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Message:</span>{' '}
                <span>{backendInfo.message}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Last check:</span>{' '}
                <span>{lastCheck.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'disconnected' && (
          <Alert variant="destructive">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Cannot connect to backend server</strong></p>
                <p className="text-sm">Make sure the backend is running:</p>
                <pre className="bg-black/10 p-2 rounded text-xs overflow-x-auto">
                  cd backend{'\n'}
                  deno run --allow-net --allow-env server.tsx
                </pre>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={checkConnection}
            disabled={isChecking}
            size="sm"
            variant="outline"
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Refresh Status'}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 Auto-checks every 30 seconds</p>
          <p>
            {status === 'connected' ? (
              <span className="text-green-600">✅ All systems operational</span>
            ) : (
              <span className="text-red-600">
                ⚠️ See{' '}
                <a
                  href="#"
                  className="underline hover:text-red-800"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('/🆘_TROUBLESHOOTING.md', '_blank');
                  }}
                >
                  troubleshooting guide
                </a>
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Mini version for header/navbar
export function ConnectionIndicator() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  const checkConnection = async () => {
    try {
      const response = await backendService.health();
      setStatus(response.status === 'ok' ? 'connected' : 'disconnected');
    } catch (error) {
      setStatus('disconnected');
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = () => {
    switch (status) {
      case 'connected': return <Wifi className="w-4 h-4 text-green-500" />;
      case 'disconnected': return <WifiOff className="w-4 h-4 text-red-500" />;
      case 'checking': return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
    }
  };

  const getTooltip = () => {
    switch (status) {
      case 'connected': return 'Backend connected';
      case 'disconnected': return 'Backend offline - Check if server is running';
      case 'checking': return 'Checking connection...';
    }
  };

  return (
    <div className="flex items-center gap-2" title={getTooltip()}>
      {getIcon()}
      <span className="text-sm">
        {status === 'connected' ? 'Online' : status === 'disconnected' ? 'Offline' : 'Checking...'}
      </span>
    </div>
  );
}
