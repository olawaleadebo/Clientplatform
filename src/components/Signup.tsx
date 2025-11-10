import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";
import { backendService } from "../utils/backendService";

interface SignupProps {
  onBack: () => void;
  onSignupSuccess: () => void;
}

export function Signup({ onBack, onSignupSuccess }: SignupProps) {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);

    try {
      const response = await backendService.registerAgent({
        username: formData.username.trim(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: "agent"
      });

      if (response.success) {
        toast.success(
          "Registration successful! Please check your email to verify your account.",
          { duration: 6000 }
        );
        onSignupSuccess();
      } else {
        toast.error(response.message || "Registration failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.message?.includes("Backend server not responding")) {
        toast.error(
          "Backend server is not running. Please contact your administrator.",
          { duration: 8000 }
        );
      } else if (error.message?.includes("already exists")) {
        toast.error("Username or email already exists. Please use a different one.");
      } else {
        toast.error("Failed to register. Please try again or contact support.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-violet-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        
        {/* Glitter Effect */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Glassmorphism Card */}
          <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            {/* Glowing Border Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-violet-500/50 blur-xl opacity-60 -z-10" />
            
            {/* Back Button */}
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="mb-4 text-white/70 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black text-white mb-2 bg-gradient-to-r from-blue-200 via-purple-200 to-violet-200 bg-clip-text text-transparent">
                Agent Registration
              </h1>
              <p className="text-white/70">
                Create your account to get started
              </p>
            </div>

            {/* Info Alert */}
            <Alert className="mb-6 bg-blue-500/20 border-blue-400/30">
              <CheckCircle2 className="h-4 w-4 text-blue-300" />
              <AlertDescription className="text-white/90 text-sm">
                You'll receive a verification email after registration. Please verify your email before logging in.
              </AlertDescription>
            </Alert>

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-5">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/90 font-semibold">
                  Username <span className="text-red-400">*</span>
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-hover:text-white/70 transition-colors" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className={`h-12 pl-12 pr-4 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/40 transition-all backdrop-blur-xl rounded-xl ${
                      errors.username ? "border-red-400" : ""
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.username && (
                  <p className="text-red-300 text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/90 font-semibold">
                  Full Name <span className="text-red-400">*</span>
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-hover:text-white/70 transition-colors" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`h-12 pl-12 pr-4 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/40 transition-all backdrop-blur-xl rounded-xl ${
                      errors.name ? "border-red-400" : ""
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-300 text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90 font-semibold">
                  Email <span className="text-red-400">*</span>
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-hover:text-white/70 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`h-12 pl-12 pr-4 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/40 transition-all backdrop-blur-xl rounded-xl ${
                      errors.email ? "border-red-400" : ""
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-300 text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90 font-semibold">
                  Password <span className="text-red-400">*</span>
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-hover:text-white/70 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`h-12 pl-12 pr-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/40 transition-all backdrop-blur-xl rounded-xl ${
                      errors.password ? "border-red-400" : ""
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/90 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-300 text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/90 font-semibold">
                  Confirm Password <span className="text-red-400">*</span>
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-hover:text-white/70 transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`h-12 pl-12 pr-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/40 transition-all backdrop-blur-xl rounded-xl ${
                      errors.confirmPassword ? "border-red-400" : ""
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/90 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-300 text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 hover:from-blue-500 hover:via-purple-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group mt-6"
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? "Creating Account..." : "Create Account"}
                  {!isLoading && <Sparkles className="w-5 h-5" />}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </Button>
            </form>

            {/* Footer Note */}
            <p className="text-center text-white/60 text-sm mt-6">
              Already have an account?{" "}
              <button
                onClick={onBack}
                className="text-blue-300 hover:text-blue-200 font-semibold transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
