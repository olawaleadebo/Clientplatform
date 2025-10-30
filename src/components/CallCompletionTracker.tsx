// Call Completion Tracker - Tracks daily call progress and handles recycling
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Archive,
  TrendingUp,
  Phone,
  Users,
  AlertTriangle,
  Info
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { backendService } from "../utils/backendService";
import { useUser } from "./UserContext";

interface CallProgress {
  agentUsername: string;
  agentName: string;
  type: 'client' | 'customer';
  totalAssigned: number;
  completed: number;
  uncompleted: number;
  completedNumbers: string[];
  uncompletedNumbers: string[];
  assignedDate: string;
}

export function CallCompletionTracker() {
  const { currentUser, isManager, isAdmin } = useUser();
  const [progressData, setProgressData] = useState<CallProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecycling, setIsRecycling] = useState(false);

  useEffect(() => {
    loadCallProgress();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadCallProgress, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-recycle at midnight
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        handleAutoRecycle();
      }
    };

    const interval = setInterval(checkMidnight, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const loadCallProgress = async () => {
    try {
      const response = await backendService.getCallProgress();
      
      if (response.success) {
        setProgressData(response.progress || []);
      }
    } catch (error) {
      console.error('[CALL TRACKER] Failed to load progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoRecycle = async () => {
    console.log('[CALL TRACKER] Auto-recycling uncompleted numbers at midnight');
    await handleRecycleUncompleted();
  };

  const handleRecycleUncompleted = async () => {
    if (!isManager && !isAdmin) {
      toast.error("Only managers and admins can recycle numbers");
      return;
    }

    setIsRecycling(true);

    try {
      // Get all uncompleted numbers
      const allUncompleted = progressData.reduce((acc, progress) => {
        return acc + progress.uncompleted;
      }, 0);

      if (allUncompleted === 0) {
        toast.info("No uncompleted calls to recycle");
        setIsRecycling(false);
        return;
      }

      // Recycle uncompleted numbers back to database
      const response = await backendService.recycleUncompletedCalls();

      if (response.success) {
        const recycled = response.recycled || 0;
        toast.success(`Successfully recycled ${recycled} uncompleted numbers back to the database!`);
        
        // Archive completed numbers
        await backendService.archiveCompletedCalls();
        
        // Reload progress
        await loadCallProgress();
      } else {
        toast.error(response.error || "Failed to recycle numbers");
      }
    } catch (error) {
      console.error('[CALL TRACKER] Error recycling:', error);
      toast.error("Failed to recycle uncompleted numbers");
    } finally {
      setIsRecycling(false);
    }
  };

  const handleManualRecycle = async (agentUsername: string, type: 'client' | 'customer') => {
    if (!isManager && !isAdmin) {
      toast.error("Only managers and admins can recycle numbers");
      return;
    }

    try {
      const response = await backendService.recycleAgentNumbers(agentUsername, type);
      
      if (response.success) {
        toast.success(`Recycled ${response.recycled || 0} numbers from ${agentUsername}`);
        await loadCallProgress();
      } else {
        toast.error(response.error || "Failed to recycle");
      }
    } catch (error) {
      console.error('[CALL TRACKER] Error:', error);
      toast.error("Failed to recycle agent numbers");
    }
  };

  const getTotalStats = () => {
    return progressData.reduce((acc, progress) => ({
      totalAssigned: acc.totalAssigned + progress.totalAssigned,
      completed: acc.completed + progress.completed,
      uncompleted: acc.uncompleted + progress.uncompleted
    }), { totalAssigned: 0, completed: 0, uncompleted: 0 });
  };

  const stats = getTotalStats();
  const completionRate = stats.totalAssigned > 0 
    ? Math.round((stats.completed / stats.totalAssigned) * 100) 
    : 0;

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="mt-2 text-muted-foreground">Loading call progress...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-purple-200 shadow-xl shadow-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Daily Call Progress Tracker
              </CardTitle>
              <CardDescription>
                Track completion status and recycle uncompleted calls
              </CardDescription>
            </div>
            <Button
              onClick={loadCallProgress}
              variant="outline"
              size="sm"
              className="border-purple-300 hover:bg-purple-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Assigned</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalAssigned}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Uncompleted</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.uncompleted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{completionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Completion Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{stats.completed} / {stats.totalAssigned}</span>
            </div>
            <Progress value={completionRate} className="h-3" />
          </div>

          {/* Recycling Alert */}
          {stats.uncompleted > 0 && (isManager || isAdmin) && (
            <Alert className="mt-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm text-orange-800">
                  <strong>{stats.uncompleted} uncompleted calls</strong> will be automatically recycled at midnight or you can recycle them now.
                </span>
                <Button
                  onClick={handleRecycleUncompleted}
                  disabled={isRecycling}
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 ml-4"
                >
                  {isRecycling ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Recycling...
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4 mr-2" />
                      Recycle Now
                    </>
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Info Alert */}
          <Alert className="mt-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-800">
              <strong>How it works:</strong> Uncompleted calls are automatically recycled back to the database at midnight. Completed calls are archived for record-keeping. Managers can manually recycle calls anytime.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Agent Progress Details */}
      {progressData.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-xl border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Agent Progress Details
            </CardTitle>
            <CardDescription>Individual agent call completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressData.map((progress, index) => {
                const agentCompletionRate = progress.totalAssigned > 0
                  ? Math.round((progress.completed / progress.totalAssigned) * 100)
                  : 0;

                return (
                  <Card key={index} className="bg-gradient-to-r from-gray-50 to-white border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{progress.agentName}</h4>
                            <Badge variant="outline" className="text-xs">
                              {progress.type === 'client' ? 'CRM' : 'Customer Service'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Assigned on {new Date(progress.assignedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{agentCompletionRate}%</div>
                          <p className="text-xs text-muted-foreground">Completion</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Assigned</p>
                          <p className="font-bold text-blue-600">{progress.totalAssigned}</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Completed</p>
                          <p className="font-bold text-green-600">{progress.completed}</p>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Uncompleted</p>
                          <p className="font-bold text-orange-600">{progress.uncompleted}</p>
                        </div>
                      </div>

                      <Progress value={agentCompletionRate} className="h-2 mb-3" />

                      {progress.uncompleted > 0 && (isManager || isAdmin) && (
                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleManualRecycle(progress.agentUsername, progress.type)}
                            size="sm"
                            variant="outline"
                            className="border-orange-300 hover:bg-orange-50 text-orange-700"
                          >
                            <RefreshCw className="w-3 h-3 mr-2" />
                            Recycle {progress.uncompleted} Numbers
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
