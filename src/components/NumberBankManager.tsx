// Number Bank Manager Component - Redesigned with Beautiful Gradients
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Send, 
  RefreshCw, 
  AlertCircle,
  UserPlus,
  Database,
  Package,
  TrendingUp,
  Users,
  Zap,
  Target
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { backendService } from "../utils/backendService";

interface Agent {
  id: string;
  name: string;
  email: string;
  assigned: number;
}

interface NumberRecord {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  company?: string;
  type: string;
}

export function NumberBankManager() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [clientBank, setClientBank] = useState<NumberRecord[]>([]);
  const [customerBank, setCustomerBank] = useState<NumberRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Assignment Dialog
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assignType, setAssignType] = useState<"client" | "customer">("client");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [assignCount, setAssignCount] = useState("");

  useEffect(() => {
    loadData();
    
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [agentsData, clientsData, customersData] = await Promise.all([
        backendService.getAgentMonitoringOverview(),
        backendService.getClients(),
        backendService.getCustomers()
      ]);

      if (agentsData.success) {
        setAgents(agentsData.agents || []);
      }

      if (clientsData.success) {
        setClientBank(clientsData.records || clientsData.clients || []);
      }

      if (customersData.success) {
        setCustomerBank(customersData.records || customersData.customers || []);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAssignNumbers = async () => {
    if (!selectedAgent || !assignCount) {
      toast.error("Please select an agent and specify the number to assign");
      return;
    }

    const count = parseInt(assignCount);
    if (isNaN(count) || count <= 0) {
      toast.error("Please enter a valid number");
      return;
    }

    const bank = assignType === "client" ? clientBank : customerBank;
    if (count > bank.length) {
      toast.error(`Only ${bank.length} ${assignType}s available in the bank`);
      return;
    }

    try {
      const numbersToAssign = bank.slice(0, count).map(record => record.id);
      
      const response = assignType === "client"
        ? await backendService.assignClients({ agentId: selectedAgent, clientIds: numbersToAssign })
        : await backendService.assignCustomers({ agentId: selectedAgent, customerIds: numbersToAssign });

      if (response.success) {
        toast.success(`Assigned ${count} ${assignType}(s) to agent`);
        setShowAssignDialog(false);
        setSelectedAgent("");
        setAssignCount("");
        loadData();
      } else {
        // Show detailed error message with debug info if available
        const errorMsg = response.error || "Failed to assign numbers";
        const debugInfo = response.debug;
        
        if (debugInfo) {
          toast.error(errorMsg, {
            description: debugInfo.suggestion || `Available: ${debugInfo.available || 0}, Total: ${debugInfo.totalInDatabase || 0}`,
            duration: 5000
          });
        } else {
          toast.error(errorMsg);
        }
        
        // If it's a "no available numbers" error, suggest fixing the database
        if (errorMsg.includes("No available numbers")) {
          setTimeout(() => {
            toast.info("Try clicking 'Fix Database' in the Database tab to resolve assignment issues", {
              duration: 7000
            });
          }, 1500);
        }
      }
    } catch (error: any) {
      console.error("Assignment error:", error);
      const errorMsg = error.message || "Failed to assign numbers";
      toast.error(errorMsg);
      
      // Show helpful hint if it's a 400 error
      if (error.message?.includes("400")) {
        setTimeout(() => {
          toast.info("Visit the Database tab and click 'Fix Database' to resolve this issue", {
            duration: 7000
          });
        }, 1500);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-cyan-200 border-t-cyan-600 animate-spin"></div>
            <div className="absolute inset-0 h-16 w-16 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 blur-xl"></div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading number bank...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 p-8 shadow-2xl shadow-blue-500/30">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
              <Package className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-white mb-1">Number Bank</h1>
              <p className="text-white/90 text-sm">
                Assign numbers from database to agents
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing} 
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
              <DialogTrigger asChild>
                <Button className="bg-white text-cyan-600 hover:bg-white/90 shadow-lg transition-all duration-300 hover:scale-105">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Numbers
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                      <Send className="w-5 h-5 text-cyan-600" />
                    </div>
                    Assign Numbers to Agent
                  </DialogTitle>
                  <DialogDescription>
                    Select an agent and specify how many numbers to assign from the database
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Assignment Type</Label>
                    <Select value={assignType} onValueChange={(value: "client" | "customer") => setAssignType(value)}>
                      <SelectTrigger className="bg-white/80 border-cyan-200/50 focus:border-cyan-500 focus:ring-cyan-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">
                          Prospective Clients ({clientBank.length} available)
                        </SelectItem>
                        <SelectItem value="customer">
                          Existing Customers ({customerBank.length} available)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Agent</Label>
                    <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                      <SelectTrigger className="bg-white/80 border-cyan-200/50 focus:border-cyan-500 focus:ring-cyan-500/20">
                        <SelectValue placeholder="Choose an agent..." />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name} ({agent.assigned} assigned)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Number to Assign</Label>
                    <Input
                      type="number"
                      value={assignCount}
                      onChange={(e) => setAssignCount(e.target.value)}
                      placeholder="Enter number of records to assign"
                      min="1"
                      max={assignType === "client" ? clientBank.length : customerBank.length}
                      className="bg-white/80 border-cyan-200/50 focus:border-cyan-500 focus:ring-cyan-500/20"
                    />
                    <p className="text-sm text-muted-foreground">
                      Available: {assignType === "client" ? clientBank.length : customerBank.length} records
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAssignNumbers}
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Assign Numbers
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-12 -mt-12"></div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Database className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-blue-700">Clients Available</span>
                </div>
                <div className="text-2xl text-blue-900 mb-1">{clientBank.length}</div>
                <p className="text-xs text-blue-600/70">
                  Ready to assign
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-12 -mt-12"></div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-green-500/10">
                    <Database className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-green-700">Customers Available</span>
                </div>
                <div className="text-2xl text-green-900 mb-1">{customerBank.length}</div>
                <p className="text-xs text-green-600/70">
                  Ready to assign
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-12 -mt-12"></div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-purple-500/10">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-purple-700">Active Agents</span>
                </div>
                <div className="text-2xl text-purple-900 mb-1">{agents.length}</div>
                <p className="text-xs text-purple-600/70">
                  Available for assignment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Number Bank Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Number Bank */}
        <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-xl group hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-500"></div>
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              Client Number Bank
            </CardTitle>
            <CardDescription>Prospective clients available for assignment</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 relative">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-4 shadow-lg">
                <p className="text-3xl text-blue-600">{clientBank.length}</p>
              </div>
              <p className="text-muted-foreground">Available Clients</p>
            </div>
            {clientBank.length === 0 && (
              <Alert className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  No clients available. Import clients from Database Manager.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Customer Number Bank */}
        <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-xl group hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/5 to-transparent rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-500"></div>
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Database className="h-5 w-5 text-green-600" />
              </div>
              Customer Number Bank
            </CardTitle>
            <CardDescription>Existing customers available for assignment</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 relative">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-4 shadow-lg">
                <p className="text-3xl text-green-600">{customerBank.length}</p>
              </div>
              <p className="text-muted-foreground">Available Customers</p>
            </div>
            {customerBank.length === 0 && (
              <Alert className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md">
                <AlertCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  No customers available. Import customers from Database Manager.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-xl">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              Available Agents
            </div>
            <Badge variant="secondary" className="bg-white/80">
              {agents.length} {agents.length === 1 ? 'agent' : 'agents'}
            </Badge>
          </CardTitle>
          <CardDescription>Agents ready to receive number assignments</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {agents.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-4">
                <AlertCircle className="h-10 w-10 text-purple-500 opacity-50" />
              </div>
              <p className="text-muted-foreground">No agents available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent, index) => (
                <div
                  key={agent.id}
                  className="group animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Card className="border-0 bg-gradient-to-br from-white/80 to-purple-50/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                    <CardContent className="p-4 relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg">
                            {agent.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="leading-none mb-1">{agent.name}</p>
                            <p className="text-sm text-muted-foreground">{agent.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-purple-100/50 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-purple-600/70">Currently Assigned</span>
                          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 border-0 text-white shadow-md">
                            {agent.assigned}
                          </Badge>
                        </div>
                      </div>

                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg transition-all duration-300 hover:scale-105"
                        onClick={() => {
                          setSelectedAgent(agent.id);
                          setShowAssignDialog(true);
                        }}
                      >
                        <Send className="w-3 h-3 mr-2" />
                        Assign Numbers
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
