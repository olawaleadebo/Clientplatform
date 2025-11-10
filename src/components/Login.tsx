import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { useUser } from "./UserContext";
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff,
  Phone,
  BarChart3,
  Users,
  Shield,
  Sparkles,
  CheckCircle2,
  UserPlus,
  Headphones
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";
import { BTMTravelLogo } from "./BTMTravelLogo";
import { backendService } from "../utils/backendService";
import { Signup } from "./Signup";

interface LoginProps {
  onBack?: () => void;
}

export function Login({ onBack }: LoginProps = {}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const { login } = useUser();

  // Show signup page if requested
  if (showSignup) {
    return (
      <Signup 
        onBack={() => setShowSignup(false)} 
        onSignupSuccess={() => {
          setShowSignup(false);
          toast.success("Please check your email to verify your account before logging in.", {
            duration: 8000
          });
        }}
      />
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    
    const success = await login(username, password);
    
    setIsLoading(false);

    if (success) {
      toast.success("Login successful! Welcome to BTMTravel CRM");
    } else {
      // Check if this is the first time setup (trying admin/admin123)
      if (username === 'admin' && password === 'admin123') {
        toast.info("First time login detected! Initializing database...", {
          duration: 3000,
        });
        
        // Automatically initialize the database
        setTimeout(() => handleInitialize(), 500);
      } else {
        toast.error("Invalid username or password");
      }
    }
  };

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      toast.info("🔄 Initializing database and creating admin user...");
      const result = await backendService.setupInit();
      
      if (result.success) {
        toast.success("✅ Database initialized! Logging you in...", {
          duration: 3000,
        });
        
        // Auto-fill and auto-login
        setUsername("admin");
        setPassword("admin123");
        
        // Auto-login after a short delay
        setTimeout(async () => {
          const loginSuccess = await login("admin", "admin123");
          if (loginSuccess) {
            toast.success("Welcome to BTM Travel CRM! 🎉");
          }
        }, 1000);
      } else {
        // Check if already initialized
        if (result.message && result.message.includes('already initialized')) {
          toast.info("Database is already set up. Please login with your credentials.", {
            duration: 5000,
          });
        } else {
          toast.error(result.message || "Failed to initialize database");
        }
      }
    } catch (error: any) {
      // Silently handle initialization errors
      toast.error("Failed to initialize database. Make sure the backend server is running.");
    } finally {
      setIsInitializing(false);
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
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-6xl space-y-8">
          
          {/* Header - Spans Both Columns */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 bg-gradient-to-r from-blue-200 via-purple-200 to-violet-200 bg-clip-text text-transparent uppercase">
              BTMTRAVEL CRM PLATFORM
            </h2>
            <p className="text-white/70">
              Everything you need to manage your client relationships
            </p>
          </motion.div>

          {/* Two Column Grid */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
          
            {/* Left Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Glassmorphism Card */}
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 lg:p-10 border border-white/20 shadow-2xl">
              {/* Glowing Border Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-violet-500/50 blur-xl opacity-60 -z-10" />
              
              {/* Logo */}
              <div className="flex flex-col items-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <BTMTravelLogo className="w-64 h-auto drop-shadow-2xl" />
                </motion.div>
              </div>

              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-white mb-2 bg-gradient-to-r from-blue-200 via-purple-200 to-violet-200 bg-clip-text text-transparent">
                  Welcome Back
                </h1>
                <p className="text-white/70">
                  Sign in to access your dashboard
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white/90 font-semibold">
                    Username
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-hover:text-white/70 transition-colors" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-14 pl-12 pr-4 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/40 transition-all backdrop-blur-xl rounded-xl"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/90 font-semibold">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-hover:text-white/70 transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 pl-12 pr-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/40 transition-all backdrop-blur-xl rounded-xl"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/90 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 hover:from-blue-500 hover:via-purple-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group"
                  disabled={isLoading || isInitializing}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? "Signing in..." : "Sign In"}
                    {!isLoading && <Sparkles className="w-5 h-5" />}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </Button>

                {/* Signup Link */}
                <div className="mt-6 text-center">
                  <p className="text-white/60 text-sm mb-3">Don't have an account?</p>
                  <Button
                    type="button"
                    onClick={() => setShowSignup(true)}
                    variant="outline"
                    className="w-full h-12 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl transition-all"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Register as Agent
                  </Button>
                  <p className="text-white/50 text-xs mt-3">
                    Managers and Admins are added by administrators
                  </p>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Right Side - Features */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block"
          >
            <div className="space-y-4">
                {/* Feature 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative group"
                >
                  <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-start gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-white">
                            3CX Phone Integration
                          </h3>
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed">
                          Click-to-call, automatic logging, and comprehensive call analytics
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Feature 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="relative group"
                >
                  <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-start gap-4">
                      <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-3 rounded-xl shadow-lg">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-white">
                            Real-Time Analytics
                          </h3>
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed">
                          Track performance metrics, team dashboards, and data-driven insights
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Feature 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="relative group"
                >
                  <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-start gap-4">
                      <div className="bg-gradient-to-br from-violet-500 to-blue-600 p-3 rounded-xl shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-white">
                            Contact Management
                          </h3>
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed">
                          Comprehensive database with email automation and smart follow-ups
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Feature 4 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="relative group"
                >
                  <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-start gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-violet-600 p-3 rounded-xl shadow-lg">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-white">
                            Enterprise Security
                          </h3>
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed">
                          Role-based permissions with complete audit trail and logging
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Feature 5 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="relative group"
                >
                  <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-start gap-4">
                      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
                        <Headphones className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-white">
                            Customer Service Hub
                          </h3>
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed">
                          Unified platform for support tickets, inquiries, and customer success
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="relative group"
              >
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-4xl font-black text-white mb-1">
                        30+
                      </div>
                      <div className="text-sm text-white/70 uppercase tracking-wider font-semibold">
                        Daily Calls
                      </div>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-white mb-1">
                        24/7
                      </div>
                      <div className="text-sm text-white/70 uppercase tracking-wider font-semibold">
                        Support
                      </div>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-white mb-1">
                        100%
                      </div>
                      <div className="text-sm text-white/70 uppercase tracking-wider font-semibold">
                        Secure
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          </div>

          {/* Footer - Centered Below Both Columns */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mt-8"
          >
            <p className="text-white/60 text-sm">
              BTMTravel © 2025 • Client Management Platform
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
