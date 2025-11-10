import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { backendService } from "../utils/backendService";
import { BTMTravelLogo } from "./BTMTravelLogo";

interface EmailVerificationProps {
  token?: string;
  onBack?: () => void;
}

export function EmailVerification({ token, onBack }: EmailVerificationProps) {
  const [status, setStatus] = useState<"verifying" | "success" | "error" | "expired">("verifying");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setStatus("error");
      setMessage("No verification token provided");
    }
  }, [token]);

  const verifyToken = async (verificationToken: string) => {
    try {
      setStatus("verifying");
      const response = await backendService.verifyEmail(verificationToken);

      if (response.success) {
        setStatus("success");
        setMessage(response.message || "Email verified successfully! You can now log in.");
      } else {
        if (response.expired) {
          setStatus("expired");
          setMessage(response.message || "Verification link has expired");
        } else {
          setStatus("error");
          setMessage(response.message || "Verification failed");
        }
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      setStatus("error");
      setMessage("Failed to verify email. Please try again or contact support.");
    }
  };

  const handleResendVerification = async () => {
    // This would require the user's email - in a real app, you'd need to track this
    setIsResending(true);
    try {
      // You'd need to implement a way to get the user's email here
      // For now, we'll just show an error
      setMessage("Please contact support to resend verification email");
    } catch (error) {
      setMessage("Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <BTMTravelLogo className="w-32 h-auto" />
            </div>
            <CardTitle className="text-2xl">Email Verification</CardTitle>
            <CardDescription>Confirming your email address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === "verifying" && (
              <div className="text-center py-8 space-y-4">
                <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
                <p className="text-gray-600">Verifying your email address...</p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {message}
                  </AlertDescription>
                </Alert>
                <div className="text-center space-y-4 py-4">
                  <CheckCircle2 className="h-24 w-24 text-green-600 mx-auto" />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      Email Verified Successfully!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Your account has been activated. You can now log in to BTMTravel CRM.
                    </p>
                    {onBack && (
                      <Button
                        onClick={onBack}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go to Login
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <Alert className="bg-red-50 border-red-200">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {message}
                  </AlertDescription>
                </Alert>
                <div className="text-center space-y-4 py-4">
                  <XCircle className="h-24 w-24 text-red-600 mx-auto" />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      Verification Failed
                    </h3>
                    <p className="text-gray-600 mb-6">
                      We couldn't verify your email address. The link may be invalid or expired.
                    </p>
                    {onBack && (
                      <Button
                        onClick={onBack}
                        variant="outline"
                        className="w-full"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {status === "expired" && (
              <div className="space-y-4">
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Mail className="h-5 w-5 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    {message}
                  </AlertDescription>
                </Alert>
                <div className="text-center space-y-4 py-4">
                  <Mail className="h-24 w-24 text-yellow-600 mx-auto" />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      Link Expired
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Your verification link has expired. Please request a new verification email.
                    </p>
                    <div className="space-y-3">
                      <Button
                        onClick={handleResendVerification}
                        disabled={isResending}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Resend Verification Email
                          </>
                        )}
                      </Button>
                      {onBack && (
                        <Button
                          onClick={onBack}
                          variant="outline"
                          className="w-full"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Login
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
