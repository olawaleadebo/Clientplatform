import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Switch } from "./ui/switch";
import { Mail, Save, TestTube, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { backendService } from '../utils/backendService';

export function SMTPSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [smtpConfig, setSmtpConfig] = useState({
    host: "",
    port: "587",
    secure: false,
    username: "",
    password: "",
    fromEmail: "",
    fromName: "BTM Travel CRM"
  });

  useEffect(() => {
    loadSMTPSettings();
  }, []);

  const loadSMTPSettings = async () => {
    try {
      setIsLoading(true);
      const data = await backendService.getSMTPSettings();
      
      if (data.success && data.settings) {
        // Ensure all fields have default values to prevent controlled/uncontrolled input warning
        setSmtpConfig({
          host: data.settings.host || "",
          port: data.settings.port || "587",
          secure: data.settings.secure || false,
          username: data.settings.username || "",
          password: data.settings.password || "",
          fromEmail: data.settings.fromEmail || "",
          fromName: data.settings.fromName || "BTM Travel CRM"
        });
      }
    } catch (error) {
      console.error('Error loading SMTP settings:', error);
      toast.error('Failed to load SMTP settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSMTPSettings = async () => {
    try {
      // Validate required fields
      if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.username || !smtpConfig.password || !smtpConfig.fromEmail) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(smtpConfig.fromEmail)) {
        toast.error('Please enter a valid email address');
        return;
      }

      // Validate port number
      const portNum = parseInt(smtpConfig.port);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        toast.error('Please enter a valid port number (1-65535)');
        return;
      }

      // Warn about IMAP ports
      const imapPorts = [143, 993];
      if (imapPorts.includes(portNum)) {
        toast.error(`Port ${portNum} is an IMAP port! Use SMTP ports: 25, 465, or 587`);
        return;
      }

      // Warn about POP3 ports
      const pop3Ports = [110, 995];
      if (pop3Ports.includes(portNum)) {
        toast.error(`Port ${portNum} is a POP3 port! Use SMTP ports: 25, 465, or 587`);
        return;
      }

      setIsSaving(true);
      const data = await backendService.updateSMTPSettings(smtpConfig);
      
      if (data.success) {
        toast.success('SMTP settings saved successfully!');
        setTestResult(null); // Clear any previous test results
      } else {
        toast.error(data.error || 'Failed to save SMTP settings');
      }
    } catch (error) {
      console.error('Error saving SMTP settings:', error);
      toast.error(`Failed to save SMTP settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const testSMTPConnection = async () => {
    try {
      // Validate required fields
      if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.username || !smtpConfig.password || !smtpConfig.fromEmail) {
        toast.error('Please fill in all required fields before testing');
        return;
      }

      // Warn about IMAP ports
      const portNum = parseInt(smtpConfig.port);
      const imapPorts = [143, 993];
      if (imapPorts.includes(portNum)) {
        setTestResult({ 
          success: false, 
          message: `Port ${portNum} is an IMAP port (for receiving mail), not SMTP! Change to SMTP port: 25, 465, or 587` 
        });
        toast.error(`Port ${portNum} is an IMAP port! Use SMTP ports: 25, 465, or 587`);
        return;
      }

      // Warn about POP3 ports
      const pop3Ports = [110, 995];
      if (pop3Ports.includes(portNum)) {
        setTestResult({ 
          success: false, 
          message: `Port ${portNum} is a POP3 port (for receiving mail), not SMTP! Change to SMTP port: 25, 465, or 587` 
        });
        toast.error(`Port ${portNum} is a POP3 port! Use SMTP ports: 25, 465, or 587`);
        return;
      }

      setIsTesting(true);
      setTestResult(null);
      
      const data = await backendService.testSMTP(smtpConfig);
      
      if (data.success) {
        setTestResult({ success: true, message: data.message || 'Connection successful!' });
        toast.success('SMTP connection test successful!');
      } else {
        setTestResult({ success: false, message: data.error || 'Connection test failed' });
        toast.error('SMTP connection test failed');
      }
    } catch (error) {
      console.error('Error testing SMTP connection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
      setTestResult({ success: false, message: errorMessage });
      toast.error('Failed to test SMTP connection');
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SMTP Required Notice */}
      <Alert className="bg-blue-50 border-blue-300">
        <Mail className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong className="text-blue-900">📧 SMTP Configuration Required</strong>
          <p className="mt-2 text-sm">
            Email sending now requires SMTP configuration. Configure your email provider settings below to send emails to clients.
            This eliminates the need for domain verification and provides unrestricted email sending.
          </p>
        </AlertDescription>
      </Alert>

      <Card className="border-purple-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>SMTP Email Configuration</CardTitle>
              <CardDescription>
                Configure your SMTP server settings to send emails from your own mail server
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Warning about SMTP vs IMAP */}
          <Alert className="bg-amber-50 border-amber-300">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900">
              <strong className="text-amber-900">⚠️ Important: Use SMTP settings, NOT IMAP!</strong>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[100px]">✅ SMTP (Sending):</span>
                  <span>Ports 25, 465, or 587 - Used to SEND emails</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[100px]">❌ IMAP:</span>
                  <span>Ports 143, 993 - Used to RECEIVE emails (wrong!)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[100px]">❌ POP3:</span>
                  <span>Ports 110, 995 - Used to RECEIVE emails (wrong!)</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Note:</strong> Your SMTP credentials will be stored securely. Common SMTP ports: 25 (non-secure), 587 (TLS), 465 (SSL)
            </AlertDescription>
          </Alert>

          {/* Test Result Alert */}
          {testResult && (
            <Alert className={testResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
                <strong>{testResult.success ? 'Success:' : 'Error:'}</strong> {testResult.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SMTP Server Host */}
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Server Host *</Label>
              <Input
                id="smtp-host"
                placeholder="smtp.gmail.com"
                value={smtpConfig.host}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Example: smtp.gmail.com, smtp.office365.com, mail.yourdomain.com
              </p>
            </div>

            {/* SMTP Port */}
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port *</Label>
              <Input
                id="smtp-port"
                type="number"
                placeholder="587"
                value={smtpConfig.port}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Common: 587 (TLS), 465 (SSL), 25 (unsecure)
              </p>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="smtp-username">Username / Email *</Label>
              <Input
                id="smtp-username"
                placeholder="your-email@domain.com"
                value={smtpConfig.username}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Your SMTP account username (usually your email address)
              </p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="smtp-password">Password / App Password *</Label>
              <div className="relative">
                <Input
                  id="smtp-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={smtpConfig.password}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Use an app-specific password for Gmail/Outlook
              </p>
            </div>

            {/* From Email */}
            <div className="space-y-2">
              <Label htmlFor="smtp-from-email">From Email Address *</Label>
              <Input
                id="smtp-from-email"
                type="email"
                placeholder="crm@btmlimited.net"
                value={smtpConfig.fromEmail}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                The email address that will appear as sender
              </p>
            </div>

            {/* From Name */}
            <div className="space-y-2">
              <Label htmlFor="smtp-from-name">From Name</Label>
              <Input
                id="smtp-from-name"
                placeholder="BTM Travel CRM"
                value={smtpConfig.fromName}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                The name that will appear as sender
              </p>
            </div>
          </div>

          {/* Secure Connection Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="smtp-secure" className="text-base">
                Use Secure Connection (SSL/TLS)
              </Label>
              <p className="text-sm text-gray-500">
                Enable for port 465 (SSL). Disable for port 587 (STARTTLS)
              </p>
            </div>
            <Switch
              id="smtp-secure"
              checked={smtpConfig.secure}
              onCheckedChange={(checked) => setSmtpConfig({ ...smtpConfig, secure: checked })}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={testSMTPConnection}
              disabled={isTesting || isSaving}
              variant="outline"
              className="flex-1"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
            <Button
              onClick={saveSMTPSettings}
              disabled={isSaving || isTesting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>

          {/* Help Section */}
          <Alert className="bg-purple-50 border-purple-200">
            <Mail className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              <strong>Common SMTP Settings (for SENDING emails):</strong>
              <ul className="mt-2 space-y-2 text-sm">
                <li>
                  <strong>Gmail:</strong>
                  <br />
                  <span className="ml-4">Host: smtp.gmail.com</span>
                  <br />
                  <span className="ml-4">Port: 587 (TLS) or 465 (SSL)</span>
                  <br />
                  <span className="ml-4 text-amber-700">⚠️ NOT imap.gmail.com (port 993 is IMAP for receiving!)</span>
                </li>
                <li>
                  <strong>Outlook/Office365:</strong>
                  <br />
                  <span className="ml-4">Host: smtp.office365.com</span>
                  <br />
                  <span className="ml-4">Port: 587</span>
                  <br />
                  <span className="ml-4 text-amber-700">⚠️ NOT outlook.office365.com (port 993 is IMAP!)</span>
                </li>
                <li>
                  <strong>Yahoo:</strong>
                  <br />
                  <span className="ml-4">Host: smtp.mail.yahoo.com</span>
                  <br />
                  <span className="ml-4">Port: 587 or 465</span>
                </li>
                <li>
                  <strong>Custom Domain:</strong> Check your hosting provider's SMTP settings (NOT IMAP/POP3!)
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
