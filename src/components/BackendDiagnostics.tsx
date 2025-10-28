import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Copy } from 'lucide-react';
import { BACKEND_URL } from '../utils/config';
import { toast } from 'sonner@2.0.3';

export function BackendDiagnostics() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setTesting(true);
    const diagnosticResults: any = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test 1: Can we reach the backend URL at all?
    try {
      console.log('🔍 TEST 1: Checking basic connectivity to', BACKEND_URL);
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      diagnosticResults.tests.push({
        name: 'Basic Connectivity',
        status: 'success',
        details: `✅ Successfully connected to ${BACKEND_URL}`,
        httpStatus: response.status,
        responseData: data
      });
      
      console.log('✅ TEST 1 PASSED:', data);
    } catch (error: any) {
      diagnosticResults.tests.push({
        name: 'Basic Connectivity',
        status: 'failed',
        details: `❌ Cannot connect to ${BACKEND_URL}`,
        error: error.message,
        errorType: error.name
      });
      
      console.error('❌ TEST 1 FAILED:', error);
    }

    // Test 2: Check CORS headers
    try {
      console.log('🔍 TEST 2: Checking CORS headers');
      const response = await fetch(`${BACKEND_URL}/health`);
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      
      diagnosticResults.tests.push({
        name: 'CORS Configuration',
        status: corsHeader ? 'success' : 'warning',
        details: corsHeader 
          ? `✅ CORS header present: ${corsHeader}` 
          : '⚠️ CORS header not found (may cause issues)',
        corsHeader: corsHeader || 'Not present'
      });
      
      console.log('✅ TEST 2 COMPLETE. CORS header:', corsHeader);
    } catch (error: any) {
      diagnosticResults.tests.push({
        name: 'CORS Configuration',
        status: 'failed',
        details: '❌ Cannot check CORS headers',
        error: error.message
      });
      
      console.error('❌ TEST 2 FAILED:', error);
    }

    // Test 3: Check response format
    try {
      console.log('🔍 TEST 3: Checking response format');
      const response = await fetch(`${BACKEND_URL}/health`);
      const data = await response.json();
      
      const hasStatus = 'status' in data;
      const statusValue = data.status;
      const hasMessage = 'message' in data;
      
      diagnosticResults.tests.push({
        name: 'Response Format',
        status: hasStatus && statusValue === 'ok' ? 'success' : 'warning',
        details: hasStatus 
          ? `Status field: "${statusValue}"${hasMessage ? `, Message: "${data.message}"` : ''}` 
          : '⚠️ Response missing "status" field',
        fullResponse: data
      });
      
      console.log('✅ TEST 3 COMPLETE. Response:', data);
    } catch (error: any) {
      diagnosticResults.tests.push({
        name: 'Response Format',
        status: 'failed',
        details: '❌ Cannot parse response',
        error: error.message
      });
      
      console.error('❌ TEST 3 FAILED:', error);
    }

    // Test 4: Check MongoDB status
    try {
      console.log('🔍 TEST 4: Checking MongoDB status');
      const response = await fetch(`${BACKEND_URL}/health`);
      const data = await response.json();
      
      const mongoStatus = data.mongodb || 'unknown';
      
      diagnosticResults.tests.push({
        name: 'MongoDB Connection',
        status: mongoStatus === 'connected' ? 'success' : 'warning',
        details: mongoStatus === 'connected' 
          ? '✅ MongoDB is connected' 
          : `⚠️ MongoDB status: ${mongoStatus}`,
        mongoStatus: mongoStatus
      });
      
      console.log('✅ TEST 4 COMPLETE. MongoDB status:', mongoStatus);
    } catch (error: any) {
      diagnosticResults.tests.push({
        name: 'MongoDB Connection',
        status: 'failed',
        details: '❌ Cannot check MongoDB status',
        error: error.message
      });
      
      console.error('❌ TEST 4 FAILED:', error);
    }

    // Test 5: Network timing
    try {
      console.log('🔍 TEST 5: Checking response time');
      const startTime = performance.now();
      await fetch(`${BACKEND_URL}/health`);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      diagnosticResults.tests.push({
        name: 'Response Time',
        status: responseTime < 1000 ? 'success' : 'warning',
        details: `${responseTime}ms${responseTime > 1000 ? ' (slow)' : ' (good)'}`,
        responseTime: responseTime
      });
      
      console.log('✅ TEST 5 COMPLETE. Response time:', responseTime, 'ms');
    } catch (error: any) {
      diagnosticResults.tests.push({
        name: 'Response Time',
        status: 'failed',
        details: '❌ Cannot measure response time',
        error: error.message
      });
      
      console.error('❌ TEST 5 FAILED:', error);
    }

    setResults(diagnosticResults);
    setTesting(false);
    
    console.log('🎯 ALL TESTS COMPLETE:', diagnosticResults);
  };

  const copyResults = () => {
    if (results) {
      navigator.clipboard.writeText(JSON.stringify(results, null, 2));
      toast.success('Diagnostics copied to clipboard!');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">PASS</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">WARN</Badge>;
      case 'failed':
        return <Badge variant="destructive">FAIL</Badge>;
      default:
        return <Badge variant="outline">UNKNOWN</Badge>;
    }
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-purple-600" />
          Backend Connection Diagnostics
        </CardTitle>
        <CardDescription>
          Run comprehensive tests to diagnose backend connection issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Target Backend:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{BACKEND_URL}</code>
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button
            onClick={runDiagnostics}
            disabled={testing}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Running Tests...' : 'Run Diagnostics'}
          </Button>

          {results && (
            <Button
              onClick={copyResults}
              variant="outline"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Results
            </Button>
          )}
        </div>

        {results && (
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="font-semibold">Test Results</span>
              <span className="text-sm text-gray-500">
                {new Date(results.timestamp).toLocaleString()}
              </span>
            </div>

            {results.tests.map((test: any, index: number) => (
              <Card key={index} className={`border-l-4 ${
                test.status === 'success' ? 'border-l-green-500 bg-green-50' :
                test.status === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                'border-l-red-500 bg-red-50'
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      <CardTitle className="text-sm">{test.name}</CardTitle>
                    </div>
                    {getStatusBadge(test.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{test.details}</p>
                  {test.error && (
                    <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono overflow-x-auto">
                      {test.error}
                    </div>
                  )}
                  {test.responseData && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                        View full response
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(test.responseData, null, 2)}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Summary */}
            <Alert className={
              results.tests.every((t: any) => t.status === 'success') 
                ? 'bg-green-50 border-green-200' 
                : results.tests.some((t: any) => t.status === 'failed')
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            }>
              <AlertDescription>
                <strong>Summary:</strong>{' '}
                {results.tests.filter((t: any) => t.status === 'success').length} passed, {' '}
                {results.tests.filter((t: any) => t.status === 'warning').length} warnings, {' '}
                {results.tests.filter((t: any) => t.status === 'failed').length} failed
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Instructions */}
        <Alert>
          <AlertDescription className="space-y-2">
            <p className="font-semibold">If all tests fail:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
              <li>Check if backend is running: <code className="bg-gray-100 px-1 rounded">cd backend && deno run --allow-net --allow-env server.tsx</code></li>
              <li>Verify port 8000 is not blocked by firewall</li>
              <li>Try accessing <a href={BACKEND_URL + '/health'} target="_blank" className="text-blue-600 underline">{BACKEND_URL}/health</a> directly in your browser</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
