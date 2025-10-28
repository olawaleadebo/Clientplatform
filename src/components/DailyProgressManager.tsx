import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { RefreshCw, Clock, CheckCircle2, AlertCircle, RotateCcw, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { backendService } from '../utils/backendService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

interface UserProgress {
  callsToday: number;
  lastCallTime: string;
  updatedAt: string;
}

interface DailyProgressData {
  userProgress: Record<string, UserProgress>;
  lastReset: string;
}

export function DailyProgressManager() {
  const [progressData, setProgressData] = useState<DailyProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [autoResetEnabled, setAutoResetEnabled] = useState(true);
  const [nextResetTime, setNextResetTime] = useState<string>("");

  useEffect(() => {
    loadProgressData();
    checkAutoReset();
    
    // Calculate next reset time (midnight)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    setNextResetTime(tomorrow.toLocaleString());

    // Check for auto-reset every minute
    const interval = setInterval(() => {
      checkAutoReset();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const loadProgressData = async () => {
    setIsLoading(true);
    try {
      const data = await backendService.getDailyProgress();
      setProgressData({
        userProgress: data.progress?.userProgress || {},
        lastReset: data.progress?.lastReset
      });
    } catch (error: any) {
      console.error('[DAILY PROGRESS] Error loading progress data:', error);
      toast.error(error.message || "Failed to load daily progress data");
    } finally {
      setIsLoading(false);
    }
  };

  const checkAutoReset = async () => {
    if (!autoResetEnabled) return;

    try {
      const data = await backendService.checkDailyReset();
      if (data.wasReset) {
        console.log('[DAILY PROGRESS] Auto-reset completed');
        await loadProgressData();
        toast.success("Daily progress automatically reset at midnight!");
      }
    } catch (error: any) {
      console.error('[DAILY PROGRESS] Error checking auto-reset:', error);
    }
  };

  const handleManualReset = async () => {
    setIsResetting(true);
    try {
      const data = await backendService.resetDailyProgress();
      
      if (data.success) {
        if (data.alreadyReset) {
          toast.info("Progress was already reset today");
        } else {
          toast.success("Daily progress reset successfully!");
        }
        
        await loadProgressData();
      } else {
        throw new Error('Reset failed');
      }
    } catch (error) {
      console.error('[DAILY PROGRESS] Error resetting progress:', error);
      toast.error("Failed to reset daily progress");
    } finally {
      setIsResetting(false);
      setResetDialogOpen(false);
    }
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const totalCalls = progressData 
    ? Object.values(progressData.userProgress).reduce((sum, user) => sum + user.callsToday, 0)
    : 0;

  const activeUsers = progressData 
    ? Object.keys(progressData.userProgress).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 border-2 border-violet-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <Clock className="w-6 h-6 text-violet-600" />
                Daily Progress Manager
              </CardTitle>
              <CardDescription>Automatic midnight reset for all agent metrics</CardDescription>
            </div>
            <Button
              onClick={() => setResetDialogOpen(true)}
              disabled={isResetting}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Manual Reset
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Alert */}
          <Alert className={
            progressData && isToday(progressData.lastReset)
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
              : "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300"
          }>
            {progressData && isToday(progressData.lastReset) ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            <AlertDescription className="flex items-center justify-between">
              <div>
                <strong>Last Reset:</strong> {progressData ? formatDate(progressData.lastReset) : 'Never'}
                {progressData && isToday(progressData.lastReset) && (
                  <Badge className="ml-2 bg-green-600 text-white">Today</Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Next auto-reset: {nextResetTime}
              </div>
            </AlertDescription>
          </Alert>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-violet-200 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Calls Today</div>
                  <div className="text-2xl font-bold text-violet-600">{totalCalls}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-blue-200 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Active Agents</div>
                  <div className="text-2xl font-bold text-blue-600">{activeUsers}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-purple-200 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Auto-Reset</div>
                  <div className="text-lg font-bold text-purple-600">
                    {autoResetEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Table */}
      <Card className="bg-white/80 backdrop-blur-xl border-2 border-violet-200 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-violet-100 to-purple-100 border-b-2 border-violet-200">
          <CardTitle>Agent Progress (Today)</CardTitle>
          <CardDescription>Real-time call metrics for all agents</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
          ) : activeUsers === 0 ? (
            <div className="text-center py-20">
              <CheckCircle2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg text-muted-foreground">No activity recorded today</p>
              <p className="text-sm text-muted-foreground mt-2">Progress will appear when agents start making calls</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-violet-50 to-purple-50 border-b-2 border-violet-100">
                  <TableHead className="text-violet-900 font-bold">Agent ID</TableHead>
                  <TableHead className="text-violet-900 font-bold">Calls Today</TableHead>
                  <TableHead className="text-violet-900 font-bold">Last Call</TableHead>
                  <TableHead className="text-violet-900 font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(progressData?.userProgress || {}).map(([userId, progress], index) => (
                  <TableRow 
                    key={userId} 
                    className={`border-b border-violet-100 transition-all ${
                      index % 2 === 0 
                        ? 'hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50' 
                        : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
                    }`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold">
                          {userId.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-mono text-sm">{userId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          progress.callsToday >= 30 
                            ? 'bg-green-50 border-green-200 text-green-700 text-lg px-3 py-1'
                            : progress.callsToday >= 15
                            ? 'bg-blue-50 border-blue-200 text-blue-700 text-lg px-3 py-1'
                            : 'bg-orange-50 border-orange-200 text-orange-700 text-lg px-3 py-1'
                        }
                      >
                        {progress.callsToday} calls
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatTime(progress.lastCallTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {progress.callsToday >= 30 ? (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          On Target
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-orange-300 text-orange-700">
                          In Progress
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Automatic Reset:</strong> All agent progress is automatically reset every day at 00:00 (midnight). 
          This includes call counts and daily metrics. Use the manual reset button only if you need to reset progress before midnight.
        </AlertDescription>
      </Alert>

      {/* Manual Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-orange-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
              <RotateCcw className="w-5 h-5" />
              Manual Reset Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>Are you sure you want to manually reset all agent progress? This will:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Reset all call counts to zero</li>
                  <li>Clear today's progress for all agents</li>
                  <li>Update the last reset date to today</li>
                </ul>
                <p className="mt-3 font-semibold">This action cannot be undone!</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/60 hover:bg-white/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleManualReset}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              Reset Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
