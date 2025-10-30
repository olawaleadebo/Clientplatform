import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Eye, RefreshCw, Users, Phone, CheckCircle2, Clock, TrendingUp, Search, Filter, ArrowUpDown, Target, Activity, Zap } from 'lucide-react';
import { backendService } from '../utils/backendService';
import { toast } from 'sonner@2.0.3';

interface AgentStats {
  id: string;
  name: string;
  email: string;
  crm: {
    total: number;
    completed: number;
    pending: number;
  };
  customerService: {
    total: number;
    completed: number;
    pending: number;
  };
  overall: {
    total: number;
    completed: number;
    pending: number;
    completionPercentage: number;
  };
}

interface AgentData {
  agent: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  data: {
    crmRecords: any[];
    customerRecords: any[];
  };
}

export function AgentMonitoring() {
  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [activityFilter, setActivityFilter] = useState<string>('all');

  const fetchAgents = async () => {
    try {
      const data = await backendService.getAgentMonitoringOverview();
      if (data.success) {
        setAgents(data.agents);
      }
    } catch (error: any) {
      // Check if it's a database initialization error
      if (error.message?.includes('503') && 
          (error.message?.includes('not_initialized') || error.message?.includes('Database not ready'))) {
        console.log('Database is initializing, will retry automatically...');
        toast.info('Database is warming up... This may take a moment.', { duration: 3000 });
      } else if (!(error instanceof TypeError && error.message.includes('fetch'))) {
        // Silently fail if server is offline
        console.error('Error fetching agents:', error);
        toast.error('Failed to load agent data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const viewAgentPortal = async (agentId: string) => {
    try {
      const data = await backendService.getAgentMonitoringDetails(agentId);
      
      if (data.success) {
        setSelectedAgent(data);
        setViewDialogOpen(true);
      }
    } catch (error) {
      // Silently fail if server is offline
      if (!(error instanceof TypeError && error.message.includes('fetch'))) {
        console.error('Error fetching agent details:', error);
        toast.error('Failed to load agent portal data');
      }
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAgents();
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 80) return { variant: 'default' as const, text: 'Excellent', className: 'bg-gradient-to-r from-green-500 to-emerald-500 border-0', icon: Zap };
    if (percentage >= 50) return { variant: 'default' as const, text: 'Good', className: 'bg-gradient-to-r from-yellow-500 to-orange-500 border-0', icon: Target };
    if (percentage > 0) return { variant: 'default' as const, text: 'In Progress', className: 'bg-gradient-to-r from-orange-500 to-red-500 border-0', icon: Activity };
    return { variant: 'secondary' as const, text: 'Not Started', className: 'bg-muted/50 border border-border', icon: Clock };
  };

  // Filter and sort agents
  const filteredAndSortedAgents = React.useMemo(() => {
    let filtered = [...agents];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Performance filter
    if (performanceFilter !== 'all') {
      filtered = filtered.filter(agent => {
        const percentage = agent.overall?.completionPercentage || 0;
        switch (performanceFilter) {
          case 'excellent':
            return percentage >= 80;
          case 'good':
            return percentage >= 50 && percentage < 80;
          case 'inprogress':
            return percentage > 0 && percentage < 50;
          case 'notstarted':
            return percentage === 0;
          default:
            return true;
        }
      });
    }

    // Activity filter
    if (activityFilter !== 'all') {
      filtered = filtered.filter(agent => {
        const hasActivity = (agent.overall?.total || 0) > 0;
        switch (activityFilter) {
          case 'active':
            return hasActivity;
          case 'inactive':
            return !hasActivity;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'completion-high':
          return (b.overall?.completionPercentage || 0) - (a.overall?.completionPercentage || 0);
        case 'completion-low':
          return (a.overall?.completionPercentage || 0) - (b.overall?.completionPercentage || 0);
        case 'total-high':
          return (b.overall?.total || 0) - (a.overall?.total || 0);
        case 'total-low':
          return (a.overall?.total || 0) - (b.overall?.total || 0);
        case 'completed-high':
          return (b.overall?.completed || 0) - (a.overall?.completed || 0);
        case 'completed-low':
          return (a.overall?.completed || 0) - (b.overall?.completed || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [agents, searchQuery, performanceFilter, sortBy, activityFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
            <div className="absolute inset-0 h-16 w-16 rounded-full bg-gradient-to-tr from-purple-500/20 to-blue-500/20 blur-xl"></div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading agent data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-8 shadow-2xl shadow-purple-500/30">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-white mb-1">Agent Monitoring</h1>
              <p className="text-white/90 text-sm">
                Real-time performance tracking and analytics
              </p>
            </div>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing} 
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-12 -mt-12"></div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-blue-700">Total Agents</span>
                </div>
                <div className="text-2xl text-blue-900 mb-1">{agents.length}</div>
                <p className="text-xs text-blue-600/70">
                  Showing {filteredAndSortedAgents.length}
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
                    <Phone className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-purple-700">Assignments</span>
                </div>
                <div className="text-2xl text-purple-900 mb-1">
                  {agents.reduce((sum, agent) => sum + (agent.overall?.total || 0), 0)}
                </div>
                <p className="text-xs text-purple-600/70">
                  All agents combined
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
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-green-700">Completed</span>
                </div>
                <div className="text-2xl text-green-900 mb-1">
                  {agents.reduce((sum, agent) => sum + (agent.overall?.completed || 0), 0)}
                </div>
                <p className="text-xs text-green-600/70">
                  {agents.length > 0 && agents.reduce((sum, agent) => sum + (agent.overall?.total || 0), 0) > 0
                    ? Math.round((agents.reduce((sum, agent) => sum + (agent.overall?.completed || 0), 0) / agents.reduce((sum, agent) => sum + (agent.overall?.total || 0), 0)) * 100) 
                    : 0}% completion
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-amber-50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -mr-12 -mt-12"></div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-orange-500/10">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm text-orange-700">Avg Performance</span>
                </div>
                <div className="text-2xl text-orange-900 mb-1">
                  {agents.length > 0 
                    ? Math.round(agents.reduce((sum, agent) => sum + (agent.overall?.completionPercentage || 0), 0) / agents.length)
                    : 0}%
                </div>
                <p className="text-xs text-orange-600/70">
                  Across all agents
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters with Glassmorphism */}
      <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-xl">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Filter className="h-4 w-4 text-purple-600" />
            </div>
            Filter & Search Agents
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white/80 border-purple-200/50 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                />
              </div>
            </div>

            {/* Performance Filter */}
            <div className="space-y-2">
              <label className="text-sm">Performance</label>
              <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                <SelectTrigger className="bg-white/80 border-purple-200/50 focus:border-purple-500 focus:ring-purple-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="excellent">⚡ Excellent (≥80%)</SelectItem>
                  <SelectItem value="good">🎯 Good (50-79%)</SelectItem>
                  <SelectItem value="inprogress">📊 In Progress (1-49%)</SelectItem>
                  <SelectItem value="notstarted">⏱️ Not Started (0%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activity Filter */}
            <div className="space-y-2">
              <label className="text-sm">Activity Status</label>
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="bg-white/80 border-purple-200/50 focus:border-purple-500 focus:ring-purple-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  <SelectItem value="active">✓ Active (Has assignments)</SelectItem>
                  <SelectItem value="inactive">○ Inactive (No assignments)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-white/80 border-purple-200/50 focus:border-purple-500 focus:ring-purple-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="completion-high">Completion % (High-Low)</SelectItem>
                  <SelectItem value="completion-low">Completion % (Low-High)</SelectItem>
                  <SelectItem value="total-high">Total Assignments (High-Low)</SelectItem>
                  <SelectItem value="total-low">Total Assignments (Low-High)</SelectItem>
                  <SelectItem value="completed-high">Completed (High-Low)</SelectItem>
                  <SelectItem value="completed-low">Completed (Low-High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || performanceFilter !== 'all' || activityFilter !== 'all' || sortBy !== 'name') && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/50">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                  Search: "{searchQuery}"
                </Badge>
              )}
              {performanceFilter !== 'all' && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                  Performance: {performanceFilter}
                </Badge>
              )}
              {activityFilter !== 'all' && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  Activity: {activityFilter}
                </Badge>
              )}
              {sortBy !== 'name' && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                  Sort: {sortBy.replace('-', ' ')}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setPerformanceFilter('all');
                  setActivityFilter('all');
                  setSortBy('name');
                }}
                className="h-6 text-xs hover:bg-red-100 hover:text-red-700"
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agents List */}
      <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-xl">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50">
          <CardTitle className="flex items-center justify-between">
            <span>Agent Performance</span>
            <Badge variant="secondary" className="bg-white/80">
              {filteredAndSortedAgents.length} {filteredAndSortedAgents.length === 1 ? 'agent' : 'agents'}
            </Badge>
          </CardTitle>
          <CardDescription>Monitor each agent's progress on CRM and Customer Service tasks</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredAndSortedAgents.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-4">
                <Users className="h-10 w-10 text-purple-500 opacity-50" />
              </div>
              <p className="text-muted-foreground mb-4">No agents match your filters</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setPerformanceFilter('all');
                  setActivityFilter('all');
                  setSortBy('name');
                }}
                className="border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedAgents.map((agent, index) => {
                const status = getStatusBadge(agent.overall?.completionPercentage || 0);
                const StatusIcon = status.icon;
                return (
                  <div
                    key={agent.id}
                    className="group animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Card className="border-0 bg-gradient-to-br from-white/80 to-purple-50/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-500"></div>
                      <CardContent className="p-6 relative">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg">
                                {agent.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="leading-none mb-1">{agent.name}</h3>
                                <p className="text-muted-foreground text-sm">{agent.email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={status.variant} className={`${status.className} shadow-md flex items-center gap-1`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.text}
                            </Badge>
                            <Button
                              onClick={() => viewAgentPortal(agent.id)}
                              size="sm"
                              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg transition-all duration-300 hover:scale-105"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Portal
                            </Button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-purple-100/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="flex items-center gap-2 text-sm">
                              <TrendingUp className="h-4 w-4 text-purple-600" />
                              Overall Progress
                            </span>
                            <span className="text-purple-700">{agent.overall?.completionPercentage || 0}%</span>
                          </div>
                          <div className="relative h-3 bg-purple-100 rounded-full overflow-hidden">
                            <div 
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 rounded-full transition-all duration-1000 shadow-lg"
                              style={{ width: `${agent.overall?.completionPercentage || 0}%` }}
                            >
                              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                            </div>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* CRM Stats */}
                          <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-100/50 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-sm"></div>
                              <span className="text-blue-700">Client CRM</span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-blue-600/70">Total:</span>
                                <span className="text-blue-900 px-2 py-0.5 rounded-md bg-blue-100/50">{agent.crm?.total || 0}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-blue-600/70">Completed:</span>
                                <span className="text-green-700 px-2 py-0.5 rounded-md bg-green-100/50">{agent.crm?.completed || 0}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-blue-600/70">Pending:</span>
                                <span className="text-orange-700 px-2 py-0.5 rounded-md bg-orange-100/50">{agent.crm?.pending || 0}</span>
                              </div>
                            </div>
                          </div>

                          {/* Customer Service Stats */}
                          <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm border border-purple-100/50 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm"></div>
                              <span className="text-purple-700">Customer Service</span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-purple-600/70">Total:</span>
                                <span className="text-purple-900 px-2 py-0.5 rounded-md bg-purple-100/50">{agent.customerService?.total || 0}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-purple-600/70">Completed:</span>
                                <span className="text-green-700 px-2 py-0.5 rounded-md bg-green-100/50">{agent.customerService?.completed || 0}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-purple-600/70">Pending:</span>
                                <span className="text-orange-700 px-2 py-0.5 rounded-md bg-orange-100/50">{agent.customerService?.pending || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent Portal View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[90vh] border-0 bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg flex-shrink-0">
                {selectedAgent?.agent.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div>{selectedAgent?.agent.name}'s Portal View</div>
                <p className="text-sm text-muted-foreground mt-1">View exactly what this agent sees</p>
              </div>
            </DialogTitle>
            <DialogDescription>
              View all CRM clients and customer service records assigned to this agent
            </DialogDescription>
          </DialogHeader>

          {selectedAgent && (
            <Tabs defaultValue="crm" className="w-full flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-2 bg-purple-100/50 p-1 flex-shrink-0">
                <TabsTrigger 
                  value="crm"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-300"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Client CRM ({selectedAgent.data?.crmRecords?.length || 0})
                </TabsTrigger>
                <TabsTrigger 
                  value="customer"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Customer Service ({selectedAgent.data?.customerRecords?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="crm" className="flex-1 mt-4 min-h-0 overflow-hidden">
                <div className="h-full rounded-xl border border-purple-100/50 bg-white/60 backdrop-blur-sm overflow-hidden flex flex-col">
                  {(selectedAgent.data?.crmRecords?.length || 0) === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-4">
                        <Clock className="h-8 w-8 text-blue-500" />
                      </div>
                      <p>No CRM clients assigned</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto overflow-y-auto flex-1 max-h-[500px]">
                      <div className="min-w-[900px]">
                        <Table>
                          <TableHeader className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
                            <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
                              <TableHead className="min-w-[150px]">Name</TableHead>
                              <TableHead className="min-w-[200px]">Email</TableHead>
                              <TableHead className="min-w-[150px]">Phone</TableHead>
                              <TableHead className="min-w-[120px]">Status</TableHead>
                              <TableHead className="min-w-[120px]">Last Contact</TableHead>
                            </TableRow>
                          </TableHeader>
                        <TableBody>
                          {(selectedAgent.data?.crmRecords || []).map((record, index) => (
                            <TableRow key={record.id || index} className="hover:bg-blue-50/50 transition-colors duration-200">
                              <TableCell className="min-w-[150px]">{record.name || 'N/A'}</TableCell>
                              <TableCell className="min-w-[200px] break-all">{record.email || 'N/A'}</TableCell>
                              <TableCell className="min-w-[150px]">{record.phone || record.number || 'N/A'}</TableCell>
                              <TableCell className="min-w-[120px]">
                                {record.status === 'completed' || record.callCompleted || record.lastContact ? (
                                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 border-0 whitespace-nowrap">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Completed
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="border border-orange-200 whitespace-nowrap">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="min-w-[120px]">
                                {record.lastContact 
                                  ? new Date(record.lastContact).toLocaleDateString() 
                                  : <span className="text-muted-foreground">Never</span>}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="customer" className="flex-1 mt-4 min-h-0 overflow-hidden">
                <div className="h-full rounded-xl border border-purple-100/50 bg-white/60 backdrop-blur-sm overflow-hidden flex flex-col">
                  {(selectedAgent.data?.customerRecords?.length || 0) === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-4">
                        <Clock className="h-8 w-8 text-purple-500" />
                      </div>
                      <p>No customers assigned</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto overflow-y-auto flex-1 max-h-[500px]">
                      <div className="min-w-[1100px]">
                        <Table>
                          <TableHeader className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
                            <TableRow className="bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100">
                              <TableHead className="min-w-[150px]">Name</TableHead>
                              <TableHead className="min-w-[200px]">Email</TableHead>
                              <TableHead className="min-w-[150px]">Phone</TableHead>
                              <TableHead className="min-w-[150px]">Booking</TableHead>
                              <TableHead className="min-w-[120px]">Status</TableHead>
                              <TableHead className="min-w-[120px]">Last Contact</TableHead>
                            </TableRow>
                          </TableHeader>
                        <TableBody>
                          {(selectedAgent.data?.customerRecords || []).map((record, index) => (
                            <TableRow key={record.id || index} className="hover:bg-purple-50/50 transition-colors duration-200">
                              <TableCell className="min-w-[150px]">{record.name || 'N/A'}</TableCell>
                              <TableCell className="min-w-[200px] break-all">{record.email || 'N/A'}</TableCell>
                              <TableCell className="min-w-[150px]">{record.phone || record.number || 'N/A'}</TableCell>
                              <TableCell className="min-w-[150px]">{record.bookingReference || 'N/A'}</TableCell>
                              <TableCell className="min-w-[120px]">
                                {record.status === 'completed' || record.callCompleted || record.lastContact ? (
                                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 border-0 whitespace-nowrap">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Completed
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="border border-orange-200 whitespace-nowrap">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="min-w-[120px]">
                                {record.lastContact 
                                  ? new Date(record.lastContact).toLocaleDateString() 
                                  : <span className="text-muted-foreground">Never</span>}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
