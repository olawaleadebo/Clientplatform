import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { ClientCRM } from "./components/ClientCRM";
import { PromoSales } from "./components/PromoSales";
import { CustomerService } from "./components/CustomerService";
import { SpecialNumbers } from "./components/SpecialNumbers";
import { AdminSettings } from "./components/AdminSettings";
import { ManagerPortal } from "./components/ManagerPortal";
import { Help } from "./components/Help";
import { Toaster } from "./components/ui/sonner";
import { Phone, Tag, HeadphonesIcon, Settings, LogOut, User, BookOpen, Star } from "lucide-react";
import { BTMTravelLogo } from "./components/BTMTravelLogo";
import { UserProvider, useUser } from "./components/UserContext";
import { ThreeCXProvider, useThreeCX } from "./components/ThreeCXContext";
import { ActiveCallPanel } from "./components/ActiveCallPanel";
import { Login } from "./components/Login";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { useEffect } from "react";
import { BACKEND_URL } from "./utils/config";
import { OfflineModeIndicator } from "./components/OfflineModeIndicator";
import { BackendRequiredModal } from "./components/BackendRequiredModal";

function AppContent() {
  const { currentUser, logout, isAdmin } = useUser();
  const { config } = useThreeCX();
  const [showHelp, setShowHelp] = useState(false);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);

  const isManager = currentUser?.role === 'manager';

  // Check server status on mount and periodically
  useEffect(() => {
    let retryCount = 0;
    const MAX_RETRIES = 3;
    
    const checkServer = async (isRetry = false) => {
      // Don't increment retry count on periodic checks
      if (!isRetry) {
        retryCount = 0;
      }
      
      try {
        console.log(`[App.tsx] Checking backend at: ${BACKEND_URL}/health (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        
        // Simplified fetch - no timeout, let browser handle it
        const response = await fetch(`${BACKEND_URL}/health`, {
          method: 'GET',
          cache: 'no-cache',
        });
        
        console.log(`[App.tsx] ✅ Backend responded with status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[App.tsx] Backend data:', data);
          
          // Accept any of these as "connected"
          if (data.status === 'ok' || 
              data.mongodb === 'connected' || 
              data.status === 'initializing' ||
              data.status === 'degraded') {
            console.log('%c✅ Backend Connected ', 'background: #22c55e; color: white; font-size: 14px; padding: 5px 10px; border-radius: 4px;');
            console.log('[App.tsx] MongoDB status:', data.mongodb);
            setBackendConnected(true);
            retryCount = 0; // Reset retry count on success
            return;
          }
        }
        
        // Response not OK or unexpected format - silently retry
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(() => checkServer(true), 2000);
        } else {
          setBackendConnected(false);
        }
      } catch (error: any) {
        // Silently retry connection errors
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(() => checkServer(true), 2000);
        } else {
          // All retries failed - set disconnected state
          setBackendConnected(false);
        }
      }
    };
    
    // GRACE PERIOD: Wait 5 seconds before first check to give backend time to start
    // This prevents premature "Offline Mode" indicators when the backend is starting
    const initialCheckTimeout = setTimeout(() => {
      checkServer();
    }, 5000);
    
    // Re-check every 15 seconds (give more time between checks)
    const interval = setInterval(() => checkServer(false), 15000);
    
    return () => {
      clearTimeout(initialCheckTimeout);
      clearInterval(interval);
    };
  }, []);

  // Show login page if not logged in
  if (!currentUser) {
    return (
      <>
        <BackendRequiredModal />
        <Login />
      </>
    );
  }

  // Show Help page if requested
  if (showHelp) {
    return <Help onBack={() => setShowHelp(false)} />;
  }

  // Admins see the Admin Settings panel directly
  if (isAdmin) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" style={{
          backgroundImage: 'linear-gradient(to bottom right, #f8fafc, #dbeafe, #e9d5ff)',
          WebkitBackgroundClip: 'padding-box',
          backgroundClip: 'padding-box'
        }}>
        {/* Header with gradient */}
        <div className="relative overflow-hidden border-b-2 border-white/30 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600" style={{
          backgroundImage: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #3b82f6 100%)',
          WebkitBackgroundClip: 'padding-box',
          backgroundClip: 'padding-box'
        }}>
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 opacity-30 animate-pulse" style={{
            backgroundImage: 'linear-gradient(to right, rgba(124, 58, 237, 0.3), rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.3))'
          }} />
          
          {/* Decorative circles */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2" style={{
            filter: 'blur(80px)',
            WebkitFilter: 'blur(80px)'
          }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-300/20 rounded-full translate-y-1/2" style={{
            filter: 'blur(80px)',
            WebkitFilter: 'blur(80px)'
          }} />
          
          <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-12 relative">
            <div className="space-y-4">
              {/* Top Row - Logo and User Info */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-white rounded-2xl sm:rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
                    <div className="relative bg-white p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform">
                      <BTMTravelLogo className="w-20 h-20 sm:w-32 sm:h-32" />
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <h1 className="text-white drop-shadow-lg text-xl sm:text-4xl font-extrabold" style={{ letterSpacing: '-0.02em' }}>
                      BTMTravel CRM
                    </h1>
                    <p className="text-white/90 flex items-center gap-2 text-sm sm:text-lg" style={{ fontWeight: '500' }}>
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Admin Portal - System Management</span>
                      <span className="sm:hidden">Admin Portal</span>
                    </p>
                  </div>
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Offline Mode Indicator */}
                  {backendConnected === false && (
                    <div className="bg-amber-500/90 backdrop-blur-xl rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-2 border border-amber-300/30 animate-pulse">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <span className="text-white text-xs sm:text-sm font-medium">Offline Mode</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-white/10 backdrop-blur-xl rounded-lg sm:rounded-xl px-2 sm:px-4 py-2 sm:py-3 border border-white/20">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <div className="text-right">
                        <div className="text-white font-semibold text-xs sm:text-base">{currentUser.name}</div>
                        <div className="text-white/70 text-xs flex items-center gap-1 sm:gap-2">
                          <Badge variant="secondary" className="text-xs px-1 sm:px-2">
                            ADMIN
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={logout}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 hover:text-white text-xs sm:text-sm"
                  >
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              </div>

              {/* Bottom Row - Help Button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowHelp(true)}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 hover:text-white text-sm"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span>Help & Documentation</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-10">
          {/* Admin Settings - No Tabs, Just Direct Access */}
          <AdminSettings />
        </div>

        <Toaster />
      </div>
      </>
    );
  }

  // Managers see the Team Performance Dashboard directly
  if (isManager) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" style={{
          backgroundImage: 'linear-gradient(to bottom right, #f8fafc, #dbeafe, #e9d5ff)',
          WebkitBackgroundClip: 'padding-box',
          backgroundClip: 'padding-box'
        }}>
        {/* Header with gradient */}
        <div className="relative overflow-hidden border-b-2 border-white/30 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600" style={{
          backgroundImage: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #3b82f6 100%)',
          WebkitBackgroundClip: 'padding-box',
          backgroundClip: 'padding-box'
        }}>
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 opacity-30 animate-pulse" style={{
            backgroundImage: 'linear-gradient(to right, rgba(124, 58, 237, 0.3), rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.3))'
          }} />
          
          {/* Decorative circles */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2" style={{
            filter: 'blur(80px)',
            WebkitFilter: 'blur(80px)'
          }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-300/20 rounded-full translate-y-1/2" style={{
            filter: 'blur(80px)',
            WebkitFilter: 'blur(80px)'
          }} />
          
          <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-12 relative">
            <div className="space-y-4">
              {/* Top Row - Logo and User Info */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-white rounded-2xl sm:rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
                    <div className="relative bg-white p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform">
                      <BTMTravelLogo className="w-20 h-20 sm:w-32 sm:h-32" />
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <h1 className="text-white drop-shadow-lg text-xl sm:text-4xl font-extrabold" style={{ letterSpacing: '-0.02em' }}>
                      BTMTravel CRM
                    </h1>
                    <p className="text-white/90 flex items-center gap-2 text-sm sm:text-lg" style={{ fontWeight: '500' }}>
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Manager Portal - Team Management</span>
                      <span className="sm:hidden">Manager Portal</span>
                    </p>
                  </div>
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* 3CX Status Indicator */}
                  {config.enabled && (
                    <div className="bg-white/10 backdrop-blur-xl rounded-lg px-2 sm:px-3 py-2 border border-white/20 hidden md:flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <Phone className="w-4 h-4 text-white" />
                      <span className="text-white text-xs font-medium">3CX Active</span>
                    </div>
                  )}
                  
                  <div className="bg-white/10 backdrop-blur-xl rounded-lg sm:rounded-xl px-2 sm:px-4 py-2 sm:py-3 border border-white/20">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <div className="text-right">
                        <div className="text-white font-semibold text-xs sm:text-base">{currentUser.name}</div>
                        <div className="text-white/70 text-xs flex items-center gap-1 sm:gap-2">
                          <Badge variant="secondary" className="text-xs px-1 sm:px-2">
                            {currentUser.role.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={logout}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 hover:text-white text-xs sm:text-sm"
                  >
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              </div>

              {/* Bottom Row - Help Button */}
              <div className="flex justify-end items-center">
                <Button
                  onClick={() => setShowHelp(true)}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 hover:text-white text-sm"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span>Help & Documentation</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-10">
          {/* Manager Portal - Team Management */}
          <ManagerPortal />
        </div>

        <ActiveCallPanel />
        <Toaster />
      </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" style={{
        backgroundImage: 'linear-gradient(to bottom right, #f8fafc, #dbeafe, #e9d5ff)',
        WebkitBackgroundClip: 'padding-box',
        backgroundClip: 'padding-box'
      }}>
        {/* Header with gradient */}
      <div className="relative overflow-hidden border-b-2 border-white/30 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600" style={{
        backgroundImage: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #3b82f6 100%)',
        WebkitBackgroundClip: 'padding-box',
        backgroundClip: 'padding-box'
      }}>
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-30 animate-pulse" style={{
          backgroundImage: 'linear-gradient(to right, rgba(124, 58, 237, 0.3), rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.3))'
        }} />
        
        {/* Decorative circles */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2" style={{
          filter: 'blur(80px)',
          WebkitFilter: 'blur(80px)'
        }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-300/20 rounded-full translate-y-1/2" style={{
          filter: 'blur(80px)',
          WebkitFilter: 'blur(80px)'
        }} />
        
        <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-12 relative">
          <div className="space-y-4">
            {/* Top Row - Logo and User Info */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3 sm:gap-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-white rounded-2xl sm:rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative bg-white p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform">
                    <BTMTravelLogo className="w-20 h-20 sm:w-32 sm:h-32" />
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <h1 className="text-white drop-shadow-lg text-xl sm:text-4xl font-extrabold" style={{ letterSpacing: '-0.02em' }}>
                    BTMTravel CRM
                  </h1>
                  <p className="text-white/90 flex items-center gap-2 text-sm sm:text-lg" style={{ fontWeight: '500' }}>
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Client Management & Sales Operations</span>
                    <span className="sm:hidden">CRM Platform</span>
                  </p>
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-2 sm:gap-4">
                {/* 3CX Status Indicator */}
                {config.enabled && (
                  <div className="bg-white/10 backdrop-blur-xl rounded-lg px-2 sm:px-3 py-2 border border-white/20 hidden md:flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <Phone className="w-4 h-4 text-white" />
                    <span className="text-white text-xs font-medium">3CX Active</span>
                  </div>
                )}
                
                <div className="bg-white/10 backdrop-blur-xl rounded-lg sm:rounded-xl px-2 sm:px-4 py-2 sm:py-3 border border-white/20">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <div className="text-right">
                      <div className="text-white font-semibold text-xs sm:text-base">{currentUser.name}</div>
                      <div className="text-white/70 text-xs flex items-center gap-1 sm:gap-2">
                        <Badge variant="secondary" className="text-xs px-1 sm:px-2">
                          {currentUser.role.toUpperCase()}
                        </Badge>
                        {currentUser.dailyTarget && (
                          <span className="hidden sm:inline text-xs">Target: {currentUser.dailyTarget}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 hover:text-white text-xs sm:text-sm"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>

            {/* Bottom Row - Help Button */}
            <div className="flex justify-end items-center">
              <Button
                onClick={() => setShowHelp(true)}
                variant="outline"
                size="sm"
                className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 hover:text-white text-sm"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                <span>Help & Documentation</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Mode Indicator */}
      <OfflineModeIndicator />

      <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-10">
        {/* Agent Classic View - Original Tabs Interface */}
        <Tabs defaultValue="client" className="space-y-6 sm:space-y-8">
            <TabsList className="grid w-full grid-cols-4 sm:w-[800px] h-12 sm:h-14 p-1 sm:p-1.5 bg-white border-2 border-gray-200 shadow-xl rounded-lg sm:rounded-xl">
              <TabsTrigger 
                value="client" 
                className="gap-1 sm:gap-2 rounded-md sm:rounded-lg font-semibold text-xs sm:text-base text-gray-700 hover:text-gray-900 hover:bg-gray-100 data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 transition-all duration-200 px-2 sm:px-4"
                style={{
                  WebkitBackfaceVisibility: 'hidden',
                  backfaceVisibility: 'hidden'
                }}
              >
                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Prospective Client</span>
                <span className="sm:hidden">Prospect</span>
              </TabsTrigger>
              <TabsTrigger 
                value="special" 
                className="gap-1 sm:gap-2 rounded-md sm:rounded-lg font-semibold text-xs sm:text-base text-gray-700 hover:text-gray-900 hover:bg-gray-100 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 transition-all duration-200 px-2 sm:px-4"
                style={{
                  WebkitBackfaceVisibility: 'hidden',
                  backfaceVisibility: 'hidden'
                }}
              >
                <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Special Numbers</span>
                <span className="sm:hidden">Special</span>
              </TabsTrigger>
              <TabsTrigger 
                value="promo" 
                className="gap-1 sm:gap-2 rounded-md sm:rounded-lg font-semibold text-xs sm:text-base text-gray-700 hover:text-gray-900 hover:bg-gray-100 data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 transition-all duration-200 px-2 sm:px-4"
                style={{
                  WebkitBackfaceVisibility: 'hidden',
                  backfaceVisibility: 'hidden'
                }}
              >
                <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Promo Sales</span>
                <span className="sm:hidden">Promo</span>
              </TabsTrigger>
              <TabsTrigger 
                value="customer" 
                className="gap-1 sm:gap-2 rounded-md sm:rounded-lg font-semibold text-xs sm:text-base text-gray-700 hover:text-gray-900 hover:bg-gray-100 data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 transition-all duration-200 px-2 sm:px-4"
                style={{
                  WebkitBackfaceVisibility: 'hidden',
                  backfaceVisibility: 'hidden'
                }}
              >
                <HeadphonesIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Customer Service</span>
                <span className="sm:hidden">Service</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="client" className="space-y-6">
              <ClientCRM />
            </TabsContent>

            <TabsContent value="special" className="space-y-6">
              <SpecialNumbers />
            </TabsContent>

            <TabsContent value="promo" className="space-y-6">
              <PromoSales />
            </TabsContent>

            <TabsContent value="customer" className="space-y-6">
              <CustomerService />
            </TabsContent>
          </Tabs>
      </div>

      <ActiveCallPanel />
      <Toaster />
    </div>
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <ThreeCXProvider>
        <AppContent />
      </ThreeCXProvider>
    </UserProvider>
  );
}
