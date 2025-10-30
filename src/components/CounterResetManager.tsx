// Counter Reset Manager - Reset all counters across the system
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2,
  RefreshCw,
  Database,
  Clock,
  Phone,
  Activity,
  Info
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { backendService } from "../utils/backendService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export function CounterResetManager() {
  const [isResetting, setIsResetting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [lastReset, setLastReset] = useState<string | null>(null);
  
  // Reset options
  const [resetOptions, setResetOptions] = useState({
    resetDailyProgress: true,
    resetCallLogs: false,
    resetNumberClaims: true,
    resetAssignmentCounters: true,
  });

  const handleResetCounters = async () => {
    setIsResetting(true);
    setConfirmDialogOpen(false);

    try {
      const response = await backendService.resetAllCounters(resetOptions);

      if (response.success) {
        const timestamp = new Date().toLocaleString();
        setLastReset(timestamp);
        
        toast.success(
          `✅ Successfully reset ${response.countersReset || 0} counter systems!`,
          {
            description: "All selected counters have been reset to zero.",
            duration: 5000,
          }
        );

        // Show detailed reset info
        if (response.resetDetails) {
          console.log("[COUNTER RESET] Details:", response.resetDetails);
        }
      } else {
        toast.error(response.error || "Failed to reset counters");
      }
    } catch (error: any) {
      console.error("[COUNTER RESET] Error:", error);
      toast.error("Failed to reset counters", {
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const toggleOption = (key: keyof typeof resetOptions) => {
    setResetOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectedCount = Object.values(resetOptions).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-2 border-orange-200 shadow-xl shadow-orange-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                <RotateCcw className="w-6 h-6 text-orange-600" />
                Counter Reset Manager
              </CardTitle>
              <CardDescription>
                Reset all counters and tracking data across the system
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-orange-300 text-orange-700">
              Admin Only
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Last Reset Info */}
          {lastReset && (
            <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-300">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Last Reset:</strong> {lastReset}
              </AlertDescription>
            </Alert>
          )}

          {/* Warning Alert */}
          <Alert className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Warning:</strong> This action will reset counters across the entire system. 
              This cannot be undone. Make sure you understand what will be reset before proceeding.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Reset Options */}
      <Card className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100 border-b-2 border-orange-200">
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-orange-600" />
            Select What to Reset
          </CardTitle>
          <CardDescription>
            Choose which counter systems you want to reset ({selectedCount} selected)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Daily Progress */}
          <div className="flex items-start space-x-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
            <Checkbox
              id="dailyProgress"
              checked={resetOptions.resetDailyProgress}
              onCheckedChange={() => toggleOption('resetDailyProgress')}
              className="mt-1"
            />
            <div className="flex-1">
              <Label 
                htmlFor="dailyProgress" 
                className="flex items-center gap-2 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-900">Daily Progress Counters</span>
                <Badge className="bg-blue-600 text-white">Recommended</Badge>
              </Label>
              <p className="text-sm text-blue-700 mt-1">
                Reset all agent daily call counts, progress tracking, and daily metrics to zero
              </p>
            </div>
          </div>

          {/* Assignment Counters */}
          <div className="flex items-start space-x-3 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
            <Checkbox
              id="assignmentCounters"
              checked={resetOptions.resetAssignmentCounters}
              onCheckedChange={() => toggleOption('resetAssignmentCounters')}
              className="mt-1"
            />
            <div className="flex-1">
              <Label 
                htmlFor="assignmentCounters" 
                className="flex items-center gap-2 cursor-pointer"
              >
                <Activity className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-purple-900">Assignment Counters</span>
                <Badge className="bg-purple-600 text-white">Recommended</Badge>
              </Label>
              <p className="text-sm text-purple-700 mt-1">
                Reset callsMade, successfulCalls, and missedCalls counters in all assignments
              </p>
            </div>
          </div>

          {/* Number Claims */}
          <div className="flex items-start space-x-3 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
            <Checkbox
              id="numberClaims"
              checked={resetOptions.resetNumberClaims}
              onCheckedChange={() => toggleOption('resetNumberClaims')}
              className="mt-1"
            />
            <div className="flex-1">
              <Label 
                htmlFor="numberClaims" 
                className="flex items-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-900">Number Claims</span>
                <Badge className="bg-green-600 text-white">Recommended</Badge>
              </Label>
              <p className="text-sm text-green-700 mt-1">
                Clear all active number claims and release claimed numbers back to the pool
              </p>
            </div>
          </div>

          {/* Call Logs */}
          <div className="flex items-start space-x-3 p-4 rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200">
            <Checkbox
              id="callLogs"
              checked={resetOptions.resetCallLogs}
              onCheckedChange={() => toggleOption('resetCallLogs')}
              className="mt-1"
            />
            <div className="flex-1">
              <Label 
                htmlFor="callLogs" 
                className="flex items-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-orange-600" />
                <span className="font-semibold text-orange-900">Call Logs History</span>
                <Badge variant="outline" className="border-orange-300 text-orange-700">
                  Optional
                </Badge>
              </Label>
              <p className="text-sm text-orange-700 mt-1">
                Delete all call history logs (use with caution - this removes historical data)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>What happens after reset:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>All selected counters will be set to zero</li>
            <li>Agents can start fresh with their daily call tracking</li>
            <li>Number assignments remain intact (only counters are reset)</li>
            <li>The actual contact data (clients & customers) is NOT deleted</li>
            <li>Call completion tracking will restart from zero</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setConfirmDialogOpen(true)}
          disabled={isResetting || selectedCount === 0}
          size="lg"
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/30"
        >
          {isResetting ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Resetting Counters...
            </>
          ) : (
            <>
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset {selectedCount} Counter System{selectedCount !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-orange-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Counter Reset
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Are you sure you want to reset the following counter systems?</p>
                
                <ul className="list-disc list-inside space-y-1 text-sm bg-orange-50 p-3 rounded border border-orange-200">
                  {resetOptions.resetDailyProgress && (
                    <li><strong>Daily Progress:</strong> All agent call counts reset to zero</li>
                  )}
                  {resetOptions.resetAssignmentCounters && (
                    <li><strong>Assignment Counters:</strong> All call tracking in assignments reset</li>
                  )}
                  {resetOptions.resetNumberClaims && (
                    <li><strong>Number Claims:</strong> All active claims will be cleared</li>
                  )}
                  {resetOptions.resetCallLogs && (
                    <li><strong>Call Logs:</strong> All historical call logs will be deleted</li>
                  )}
                </ul>

                <p className="font-semibold text-red-600">
                  ⚠️ This action cannot be undone!
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/60 hover:bg-white/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetCounters}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              Yes, Reset Counters
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
