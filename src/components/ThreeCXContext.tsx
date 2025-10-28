import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner@2.0.3";
import { Button } from "./ui/button";
import { Copy, Phone, ExternalLink } from "lucide-react";

export type CallStatus = "idle" | "ringing" | "connected" | "on-hold" | "ended";

export interface Call {
  id: string;
  phoneNumber: string;
  contactName?: string;
  status: CallStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export interface ThreeCXConfig {
  enabled: boolean;
  integrationMode: "click-to-call" | "webrtc" | "advanced";
  webClientUrl?: string; // e.g., https://your-company.3cx.com
  extension?: string;
  apiKey?: string;
  autoLogCalls: boolean;
}

interface ThreeCXContextType {
  config: ThreeCXConfig;
  updateConfig: (config: ThreeCXConfig) => void;
  activeCall: Call | null;
  callHistory: Call[];
  makeCall: (phoneNumber: string, contactName?: string) => void;
  endCall: () => void;
  holdCall: () => void;
  resumeCall: () => void;
  muteCall: () => void;
  unmuteCall: () => void;
  deleteCallRecord: (callId: string) => void;
  isConnected: boolean;
  isMuted: boolean;
  isOnHold: boolean;
}

const ThreeCXContext = createContext<ThreeCXContextType | undefined>(undefined);

export function ThreeCXProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ThreeCXConfig>(() => {
    const saved = localStorage.getItem("threecx_config");
    return saved ? JSON.parse(saved) : {
      enabled: false,
      integrationMode: "click-to-call",
      autoLogCalls: true
    };
  });

  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [callHistory, setCallHistory] = useState<Call[]>(() => {
    const saved = localStorage.getItem("call_history");
    return saved ? JSON.parse(saved).map((call: any) => ({
      ...call,
      startTime: new Date(call.startTime),
      endTime: call.endTime ? new Date(call.endTime) : undefined
    })) : [];
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);

  // Save config to localStorage
  useEffect(() => {
    localStorage.setItem("threecx_config", JSON.stringify(config));
  }, [config]);

  // Save call history to localStorage
  useEffect(() => {
    localStorage.setItem("call_history", JSON.stringify(callHistory));
  }, [callHistory]);

  const updateConfig = (newConfig: ThreeCXConfig) => {
    setConfig(newConfig);
    if (newConfig.enabled) {
      toast.success("3CX integration enabled");
    }
  };

  const makeCall = async (phoneNumber: string, contactName?: string) => {
    const call: Call = {
      id: `call_${Date.now()}`,
      phoneNumber,
      contactName,
      status: "ringing",
      startTime: new Date()
    };

    setActiveCall(call);

    // If 3CX is not enabled, work in simulation mode
    if (!config.enabled) {
      toast.success(`Calling ${contactName || phoneNumber}...`, {
        description: "3CX integration not enabled - simulation only"
      });
      
      // Simulate call connection
      setTimeout(() => {
        setActiveCall(prev => prev ? { ...prev, status: "connected" } : null);
        setIsConnected(true);
      }, 2000);
      return;
    }

    if (config.integrationMode === "click-to-call") {
      if (!config.webClientUrl) {
        toast.error("Please configure 3CX Web Client URL in Admin Settings → 3CX Phone");
        setActiveCall(null);
        return;
      }
      
      // Clean phone number
      const cleanNumber = phoneNumber.replace(/\s+/g, '');
      
      // Function to copy to clipboard with fallback
      const copyToClipboard = async (text: string) => {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch (err) {
          // Fallback for older browsers
          try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
          } catch (e) {
            return false;
          }
        }
      };
      
      // Try to copy to clipboard
      const copied = await copyToClipboard(cleanNumber);
      
      // Show a prominent toast with copy button
      toast.success(
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            <span className="font-semibold">Ready to Call</span>
          </div>
          <div className="bg-slate-100 p-3 rounded-lg border-2 border-green-500">
            <div className="text-xs text-slate-600 mb-1">Phone Number:</div>
            <div className="text-lg font-mono font-bold text-slate-900 select-all">
              {cleanNumber}
            </div>
          </div>
          <Button
            onClick={async (e) => {
              e.stopPropagation();
              const success = await copyToClipboard(cleanNumber);
              if (success) {
                toast.success("Copied!", { duration: 2000 });
              }
            }}
            className="w-full bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Number
          </Button>
          <div className="text-xs text-slate-600 space-y-1">
            <div>1. Switch to 3CX tab</div>
            <div>2. Click phone icon (📞)</div>
            <div>3. Paste this number</div>
            <div>4. Click Call</div>
          </div>
        </div>,
        {
          duration: 30000, // 30 seconds
          closeButton: true,
        }
      );
      
      // Create a temporary link element to open 3CX in new tab
      // This avoids popup blockers since it's a direct user action
      const link = document.createElement('a');
      link.href = config.webClientUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show additional instruction toast
      if (copied) {
        toast.info("✅ Number auto-copied to clipboard!", {
          description: "Switch to 3CX tab and paste (Ctrl+V)",
          duration: 8000
        });
      } else {
        toast.warning("⚠️ Click 'Copy Number' button above", {
          description: "Then paste in 3CX dialpad",
          duration: 8000
        });
      }
      
      // Simulate call connection for UI
      setTimeout(() => {
        setActiveCall(prev => prev ? { ...prev, status: "connected" } : null);
        setIsConnected(true);
      }, 2000);
    } else if (config.integrationMode === "webrtc") {
      // For WebRTC mode - this is a demo placeholder
      // In production, you would initialize the 3CX WebRTC client library here
      toast.success(`Initiating WebRTC call to ${contactName || phoneNumber}...`, {
        description: "Note: Full WebRTC integration requires 3CX WebRTC SDK configuration"
      });
      
      // Simulate call for demo purposes
      setTimeout(() => {
        setActiveCall(prev => prev ? { ...prev, status: "connected" } : null);
        setIsConnected(true);
      }, 2000);
    } else if (config.integrationMode === "advanced") {
      // For advanced mode with API integration
      if (!config.apiKey) {
        toast.error("Please configure 3CX API credentials in Admin Settings → 3CX Phone");
        setActiveCall(null);
        return;
      }
      
      toast.success(`Calling ${contactName || phoneNumber} via API...`, {
        description: "Advanced API integration active"
      });
      
      // Simulate call for demo purposes
      setTimeout(() => {
        setActiveCall(prev => prev ? { ...prev, status: "connected" } : null);
        setIsConnected(true);
      }, 2000);
    }
  };

  const endCall = () => {
    if (!activeCall) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeCall.startTime.getTime()) / 1000);

    const completedCall: Call = {
      ...activeCall,
      status: "ended",
      endTime,
      duration
    };

    setActiveCall(null);
    setIsConnected(false);
    setIsMuted(false);
    setIsOnHold(false);

    if (config.autoLogCalls) {
      setCallHistory(prev => [completedCall, ...prev].slice(0, 100)); // Keep last 100 calls
      toast.success(`Call logged - Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
      
      // Increment daily call count (will be handled by UserContext)
      // This is tracked automatically via the call history
    }
  };

  const holdCall = () => {
    if (!activeCall || !isConnected) return;
    
    setIsOnHold(true);
    setActiveCall(prev => prev ? { ...prev, status: "on-hold" } : null);
    toast.info("Call on hold");
  };

  const resumeCall = () => {
    if (!activeCall || !isOnHold) return;
    
    setIsOnHold(false);
    setActiveCall(prev => prev ? { ...prev, status: "connected" } : null);
    toast.info("Call resumed");
  };

  const muteCall = () => {
    if (!activeCall || !isConnected) return;
    setIsMuted(true);
    toast.info("Microphone muted");
  };

  const unmuteCall = () => {
    if (!activeCall || !isConnected) return;
    setIsMuted(false);
    toast.info("Microphone unmuted");
  };

  const deleteCallRecord = (callId: string) => {
    setCallHistory(prev => prev.filter(call => call.id !== callId));
    toast.success("Call record deleted successfully");
  };

  return (
    <ThreeCXContext.Provider
      value={{
        config,
        updateConfig,
        activeCall,
        callHistory,
        makeCall,
        endCall,
        holdCall,
        resumeCall,
        muteCall,
        unmuteCall,
        deleteCallRecord,
        isConnected,
        isMuted,
        isOnHold
      }}
    >
      {children}
    </ThreeCXContext.Provider>
  );
}

export function useThreeCX() {
  const context = useContext(ThreeCXContext);
  if (!context) {
    throw new Error("useThreeCX must be used within ThreeCXProvider");
  }
  return context;
}
