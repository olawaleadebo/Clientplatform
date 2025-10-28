import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { 
  Users, 
  Target, 
  TrendingUp, 
  Phone, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  BarChart3,
  Send,
  Eye,
  RefreshCw,
  Download,
  FileText,
  Calendar,
  Activity,
  Database,
  Filter,
  Search,
  UserPlus,
  Sparkles,
  Package,
  PhoneCall,
  Mail,
  Zap,
  TrendingDown,
  Award
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { backendService } from "../utils/backendService";
import { useUser } from "./UserContext";
import { motion } from "motion/react";

// Types
interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role: string;
  dailyTarget: number;
  callsToday: number;
  callsWeek: number;
  callsMonth: number;
  lastCallTime?: string;
  status: 'active' | 'idle' | 'offline';
  clientCalls: number;
  promoSales: number;
  customerService: number;
  emailsSent: number;
  dealsCreated: number;
  ticketsResolved: number;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  overall: {
    total: number;
    completed: number;
    pending: number;
    completionPercentage: number;
  };
}

interface NumberRecord {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  company?: string;
  source?: string;
  type: string;
}

interface Assignment {
  id: string;
  agentId: string;
  type: 'client' | 'customer';
  recordId: string;
  status: 'pending' | 'claimed' | 'called' | 'completed';
  createdAt: string;
}

export function ManagerPortal() {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Team Performance State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [mongoReady, setMongoReady] = useState(false);

  // Assignment Management State
  const [agents, setAgents] = useState<Agent[]>([]);
  const [clientBank, setClientBank] = useState<NumberRecord[]>([]);
  const [customerBank, setCustomerBank] = useState<NumberRecord[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assignType, setAssignType] = useState<"client" | "customer">("client");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [assignCount, setAssignCount] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPerformance, setFilterPerformance] = useState("all");

  useEffect(() => {
    loadAllData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadAllData(false);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async (showToast = false) => {
    try {
      await Promise.all([
        fetchTeamPerformance(showToast),
        fetchAgents(),
        fetchNumberBank(),
        fetchAssignments()
      ]);
      setMongoReady(true);
    } catch (error) {
      console.error("[MANAGER PORTAL] Error loading data:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTeamPerformance = async (showToast = false) => {
    try {
      const response = await backendService.getTeamPerformance();
      if (response.success) {
        const teamData = response.teamData || [];
        setTeamMembers(teamData);
        if (showToast && teamData.length > 0) {
          toast.success(`Team data refreshed - ${teamData.length} agents`);
        }
      } else {
        console.log("[MANAGER PORTAL] Team performance not ready:", response.message);
        setTeamMembers([]);
      }
    } catch (error) {
      console.error("[MANAGER PORTAL] Team performance error:", error);
      setTeamMembers([]);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await backendService.getAgentMonitoringOverview();
      if (response.success) {
        setAgents(response.agents || []);
      }
    } catch (error) {
      console.error("[MANAGER PORTAL] Agents error:", error);
    }
  };

  const fetchNumberBank = async () => {
    try {
      const [clientsData, customersData] = await Promise.all([
        backendService.getClients(),
        backendService.getCustomers()
      ]);

      if (clientsData.success) {
        setClientBank(clientsData.records || clientsData.clients || []);
      }
      if (customersData.success) {
        setCustomerBank(customersData.records || customersData.customers || []);
      }
    } catch (error) {
      console.error("[MANAGER PORTAL] Number bank error:", error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await backendService.getAssignments();
      if (response.success) {
        setAssignments(response.assignments || []);
      }
    } catch (error) {
      console.error("[MANAGER PORTAL] Assignments error:", error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAllData(true);
  };

  const handleAssignNumbers = async () => {
    if (!selectedAgent || !assignCount) {
      toast.error("Please select an agent and enter the number of assignments");
      return;
    }

    const count = parseInt(assignCount);
    if (isNaN(count) || count <= 0) {
      toast.error("Please enter a valid number");
      return;
    }

    const bank = assignType === "client" ? clientBank : customerBank;
    if (count > bank.length) {
      toast.error(`Only ${bank.length} numbers available in ${assignType} bank`);
      return;
    }

    try {
      const recordsToAssign = bank.slice(0, count);
      const recordIds = recordsToAssign.map(record => record.id);
      
      const response = await backendService.assignClients({
        clientIds: recordIds,
        agentId: selectedAgent
      });
      
      if (response.success) {
        toast.success(`Successfully assigned ${count} numbers to agent`);
        setShowAssignDialog(false);
        setSelectedAgent("");
        setAssignCount("");
        loadAllData();
      } else {
        toast.error(response.error || "Failed to assign numbers");
      }
    } catch (error) {
      console.error("[MANAGER PORTAL] Assignment error:", error);
      toast.error("Failed to assign numbers");
    }
  };

  const handleGenerateReport = () => {
    const today = new Date().toLocaleDateString();
    const reportContent = `
BTM Travel - Manager Performance Report
Generated: ${today}
Manager: ${currentUser?.name || 'Manager'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TEAM SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Team Members: ${teamMembers.length}
Active Agents: ${teamMembers.filter(m => m.status === 'active').length}
Total Calls Today: ${totalCallsToday}
Team Target: ${totalTarget}
On Target: ${onTargetCount}/${teamMembers.length}

NUMBER BANK STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Client CRM Bank: ${clientBank.length} numbers
Customer Service Bank: ${customerBank.length} numbers
Total Available: ${clientBank.length + customerBank.length}

ASSIGNMENT STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Assignments: ${assignments.length}
Pending: ${assignments.filter(a => a.status === 'pending').length}
Called: ${assignments.filter(a => a.status === 'called').length}
Completed: ${assignments.filter(a => a.status === 'completed').length}

INDIVIDUAL AGENT PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${teamMembers.map((agent, index) => `
${index + 1}. ${agent.name}
   Status: ${agent.status.toUpperCase()}
   Target: ${agent.dailyTarget} | Completed: ${agent.callsToday} (${Math.round((agent.callsToday / agent.dailyTarget) * 100)}%)
   Week: ${agent.callsWeek} | Month: ${agent.callsMonth}
   Last Activity: ${agent.lastCallTime || 'No recent activity'}
`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Report generated by BTM Travel CRM System
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `manager-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Report downloaded successfully!");
  };

  // Calculate statistics
  const totalTarget = teamMembers.reduce((sum, m) => sum + m.dailyTarget, 0);
  const totalCallsToday = teamMembers.reduce((sum, m) => sum + m.callsToday, 0);
  const totalCallsWeek = teamMembers.reduce((sum, m) => sum + m.callsWeek, 0);
  const totalCallsMonth = teamMembers.reduce((sum, m) => sum + m.callsMonth, 0);
  const teamProgress = totalTarget > 0 ? Math.round((totalCallsToday / totalTarget) * 100) : 0;
  const activeAgents = teamMembers.filter(m => m.status === 'active').length;
  const onTargetCount = teamMembers.filter(m => m.callsToday >= m.dailyTarget).length;

  // Filter agents
  const filteredAgents = teamMembers.filter(agent => {
    const matchesSearch = !searchQuery || 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.email && agent.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === "all" || agent.status === filterStatus;
    
    const percentage = agent.dailyTarget > 0 ? Math.round((agent.callsToday / agent.dailyTarget) * 100) : 0;
    const matchesPerformance = filterPerformance === "all" ||
      (filterPerformance === "excellent" && percentage >= 80) ||
      (filterPerformance === "good" && percentage >= 50 && percentage < 80) ||
      (filterPerformance === "needs-attention" && percentage < 50);
    
    return matchesSearch && matchesStatus && matchesPerformance;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto"></div>
            <div className="absolute inset-0 h-16 w-16 rounded-full bg-gradient-to-tr from-purple-500/20 to-blue-500/20 blur-xl mx-auto"></div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading Manager Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="relative overflow-hidden border-b-2 border-white/30 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600">
        <div className="absolute inset-0 opacity-30 animate-pulse" style={{
          backgroundImage: 'linear-gradient(to right, rgba(124, 58, 237, 0.3), rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.3))'
        }} />
        
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 blur-[80px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-300/20 rounded-full translate-y-1/2 blur-[80px]" />
        
        <div className="container mx-auto px-6 py-12 relative">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-white mb-1">Manager Portal</h1>
                <p className="text-white/90 text-sm">
                  Team oversight, assignment management & performance analytics
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shadow-lg"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={handleGenerateReport}
                className="bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* MongoDB Status Alert */}
        {!mongoReady && teamMembers.length === 0 && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Database className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              Connecting to database... Team data will appear shortly.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 bg-gradient-to-br from-violet-50 to-purple-50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-violet-700 mb-2">Team Members</p>
                    <p className="text-3xl text-violet-900">{teamMembers.length}</p>
                    <p className="text-xs text-violet-600 mt-1">{activeAgents} active</p>
                  </div>
                  <div className="p-3 rounded-xl bg-violet-500/10">
                    <Users className="h-6 w-6 text-violet-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-blue-700 mb-2">Calls Today</p>
                    <p className="text-3xl text-blue-900">{totalCallsToday}</p>
                    <p className="text-xs text-blue-600 mt-1">{teamProgress}% of target</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-green-700 mb-2">On Target</p>
                    <p className="text-3xl text-green-900">{onTargetCount}/{teamMembers.length}</p>
                    <p className="text-xs text-green-600 mt-1">meeting goals</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500/10">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="border-0 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-orange-700 mb-2">Number Bank</p>
                    <p className="text-3xl text-orange-900">{clientBank.length + customerBank.length}</p>
                    <p className="text-xs text-orange-600 mt-1">available</p>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-500/10">
                    <Database className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="border-0 bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-pink-700 mb-2">Assignments</p>
                    <p className="text-3xl text-pink-900">{assignments.length}</p>
                    <p className="text-xs text-pink-600 mt-1">{assignments.filter(a => a.status === 'pending').length} pending</p>
                  </div>
                  <div className="p-3 rounded-xl bg-pink-500/10">
                    <Package className="h-6 w-6 text-pink-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-xl border border-white/20 p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Team Overview
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Assignment Manager
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Agent Monitoring
            </TabsTrigger>
          </TabsList>

          {/* Team Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Team Progress Card */}
            <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-xl">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Team Performance
                  </span>
                  <Badge variant="secondary" className="bg-white/80">
                    {teamProgress}% Complete
                  </Badge>
                </CardTitle>
                <CardDescription>Real-time progress tracking for all team members</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Overall Progress Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Overall Team Progress</span>
                    <span className="text-purple-700">{totalCallsToday} / {totalTarget} calls</span>
                  </div>
                  <div className="relative h-4 bg-purple-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${teamProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Weekly and Monthly Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-900">This Week</span>
                    </div>
                    <p className="text-3xl text-blue-900">{totalCallsWeek}</p>
                    <p className="text-sm text-blue-600 mt-1">
                      Avg: {teamMembers.length > 0 ? Math.round(totalCallsWeek / teamMembers.length) : 0} per agent
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="text-purple-900">This Month</span>
                    </div>
                    <p className="text-3xl text-purple-900">{totalCallsMonth}</p>
                    <p className="text-sm text-purple-600 mt-1">
                      Avg: {teamMembers.length > 0 ? Math.round(totalCallsMonth / teamMembers.length) : 0} per agent
                    </p>
                  </div>
                </div>

                {/* Performance Insights */}
                {teamMembers.length > 0 && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-green-600" />
                      <span className="text-green-900">Performance Insights</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                        <span className="text-green-800">
                          {onTargetCount} agents ({Math.round((onTargetCount / teamMembers.length) * 100)}%) have met their daily targets
                        </span>
                      </div>
                      {activeAgents > 0 && (
                        <div className="flex items-start gap-2">
                          <Phone className="w-4 h-4 text-blue-600 mt-0.5" />
                          <span className="text-green-800">
                            {activeAgents} agents currently making calls
                          </span>
                        </div>
                      )}
                      {teamMembers.filter(m => m.callsToday < m.dailyTarget * 0.5).length > 0 && (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                          <span className="text-green-800">
                            {teamMembers.filter(m => m.callsToday < m.dailyTarget * 0.5).length} agents below 50% - may need support
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="idle">Idle</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Performance</Label>
                    <Select value={filterPerformance} onValueChange={setFilterPerformance}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Performance</SelectItem>
                        <SelectItem value="excellent">Excellent (80%+)</SelectItem>
                        <SelectItem value="good">Good (50-79%)</SelectItem>
                        <SelectItem value="needs-attention">Needs Attention (Below 50%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members Table */}
            <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Members
                  </span>
                  <Badge variant="outline">{filteredAgents.length} agents</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredAgents.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No agents found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {teamMembers.length === 0 ? "Team data is loading from database..." : "Try adjusting your filters"}
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Agent</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Today</TableHead>
                          <TableHead>Week</TableHead>
                          <TableHead>Month</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Last Activity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAgents.map((agent) => {
                          const percentage = agent.dailyTarget > 0 ? Math.round((agent.callsToday / agent.dailyTarget) * 100) : 0;
                          const statusColor = agent.status === 'active' ? 'green' : agent.status === 'idle' ? 'yellow' : 'gray';
                          const performanceColor = percentage >= 80 ? 'green' : percentage >= 50 ? 'blue' : 'orange';
                          
                          return (
                            <TableRow key={agent.id}>
                              <TableCell>
                                <div>
                                  <div className="flex items-center gap-2">
                                    {agent.name}
                                    {percentage >= 100 && <Award className="h-4 w-4 text-yellow-500" />}
                                  </div>
                                  <div className="text-xs text-muted-foreground">{agent.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={`
                                    ${statusColor === 'green' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                    ${statusColor === 'yellow' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                                    ${statusColor === 'gray' ? 'bg-gray-50 text-gray-700 border-gray-200' : ''}
                                  `}
                                >
                                  {agent.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span>{agent.callsToday}/{agent.dailyTarget}</span>
                                </div>
                              </TableCell>
                              <TableCell>{agent.callsWeek}</TableCell>
                              <TableCell>{agent.callsMonth}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className={`
                                      ${performanceColor === 'green' ? 'text-green-700' : ''}
                                      ${performanceColor === 'blue' ? 'text-blue-700' : ''}
                                      ${performanceColor === 'orange' ? 'text-orange-700' : ''}
                                    `}>
                                      {percentage}%
                                    </span>
                                  </div>
                                  <Progress 
                                    value={percentage} 
                                    className={`h-2 
                                      ${performanceColor === 'green' ? '[&>div]:bg-green-500' : ''}
                                      ${performanceColor === 'blue' ? '[&>div]:bg-blue-500' : ''}
                                      ${performanceColor === 'orange' ? '[&>div]:bg-orange-500' : ''}
                                    `}
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {agent.lastCallTime ? (
                                    <>
                                      <div>{new Date(agent.lastCallTime).toLocaleDateString()}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {new Date(agent.lastCallTime).toLocaleTimeString()}
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-muted-foreground">No activity</span>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignment Manager Tab */}
          <TabsContent value="assignments" className="space-y-6">
            {/* Number Bank Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PhoneCall className="w-5 h-5 text-blue-600" />
                    Client CRM Bank
                  </CardTitle>
                  <CardDescription>Prospective clients for cold calling</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl mb-2 text-blue-900">{clientBank.length}</div>
                  <p className="text-sm text-blue-700">Numbers available</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Customer Service Bank
                  </CardTitle>
                  <CardDescription>Existing customers for service calls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl mb-2 text-purple-900">{customerBank.length}</div>
                  <p className="text-sm text-purple-700">Numbers available</p>
                </CardContent>
              </Card>
            </div>

            {/* Assign Numbers Card */}
            <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Assign Numbers to Agents
                </CardTitle>
                <CardDescription>
                  Push numbers from the central database to specific agents for daily calling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Numbers
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Numbers to Agent</DialogTitle>
                      <DialogDescription>
                        Select an agent and specify how many numbers to assign
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={assignType} onValueChange={(value: "client" | "customer") => setAssignType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="client">Client CRM ({clientBank.length} available)</SelectItem>
                            <SelectItem value="customer">Customer Service ({customerBank.length} available)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Agent</Label>
                        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an agent" />
                          </SelectTrigger>
                          <SelectContent>
                            {agents.map((agent) => (
                              <SelectItem key={agent.id} value={agent.id}>
                                {agent.name} ({agent.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Number of Assignments</Label>
                        <Input
                          type="number"
                          min="1"
                          max={assignType === "client" ? clientBank.length : customerBank.length}
                          value={assignCount}
                          onChange={(e) => setAssignCount(e.target.value)}
                          placeholder="Enter count..."
                        />
                      </div>
                      <Button 
                        onClick={handleAssignNumbers}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      >
                        Assign Now
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Current Assignments Summary */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="mb-4">Recent Assignments</h4>
                  <div className="space-y-2">
                    {assignments.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No assignments yet
                      </p>
                    ) : (
                      <ScrollArea className="h-[200px]">
                        {assignments.slice(0, 10).map((assignment) => {
                          const agent = agents.find(a => a.id === assignment.agentId);
                          return (
                            <div key={assignment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span>{agent?.name || 'Unknown Agent'}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {assignment.type}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {new Date(assignment.createdAt).toLocaleString()}
                                </div>
                              </div>
                              <Badge 
                                variant={assignment.status === 'completed' ? 'default' : 'secondary'}
                                className={
                                  assignment.status === 'completed' ? 'bg-green-500' :
                                  assignment.status === 'called' ? 'bg-blue-500' :
                                  assignment.status === 'claimed' ? 'bg-yellow-500' :
                                  'bg-gray-500'
                                }
                              >
                                {assignment.status}
                              </Badge>
                            </div>
                          );
                        })}
                      </ScrollArea>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agent Monitoring Tab */}
          <TabsContent value="agents" className="space-y-6">
            <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Agent Performance Details
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of each agent's performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {agents.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Loading agent data...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agents.map((agent) => (
                      <Card key={agent.id} className="border border-border/50">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{agent.name}</CardTitle>
                              <CardDescription>{agent.email}</CardDescription>
                            </div>
                            <Badge variant="outline" className="text-lg px-4 py-2">
                              {agent.overall.completionPercentage}%
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                              <div className="text-sm text-blue-700 mb-1">Total Assigned</div>
                              <div className="text-2xl text-blue-900">{agent.overall.total}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                              <div className="text-sm text-green-700 mb-1">Completed</div>
                              <div className="text-2xl text-green-900">{agent.overall.completed}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
                              <div className="text-sm text-orange-700 mb-1">Pending</div>
                              <div className="text-2xl text-orange-900">{agent.overall.pending}</div>
                            </div>
                          </div>
                          <Progress 
                            value={agent.overall.completionPercentage} 
                            className="h-3"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
