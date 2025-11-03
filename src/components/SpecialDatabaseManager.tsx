import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { 
  Database, 
  Plus, 
  Upload, 
  Download, 
  Trash2, 
  Archive, 
  RefreshCw, 
  Users, 
  Phone, 
  CheckCircle2, 
  Search, 
  Filter,
  Star,
  FileText,
  Sparkles,
  RotateCcw,
  UserPlus,
  PhoneCall,
  AlertCircle,
  ArrowRightLeft,
  FileSpreadsheet
} from 'lucide-react';
import { dataService } from '../utils/dataService';
import { toast } from 'sonner@2.0.3';

interface SpecialNumber {
  id: string;
  phoneNumber: string;
  purpose: string;
  notes?: string;
  uploadedAt: string;
  status: 'available' | 'assigned' | 'archived';
  assignedTo?: string;
  assignedAt?: string;
}

interface ArchivedSpecialNumber {
  id: string;
  phoneNumber: string;
  purpose: string;
  notes?: string;
  agentId: string;
  agentName: string;
  completedAt: string;
  callNotes?: string;
}

interface Agent {
  id: string;
  username: string;
  name: string;
  email: string;
}

export function SpecialDatabaseManager() {
  const [numbers, setNumbers] = useState<SpecialNumber[]>([]);
  const [archivedNumbers, setArchivedNumbers] = useState<ArchivedSpecialNumber[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Upload states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadNumbers, setUploadNumbers] = useState('');
  const [uploadPurpose, setUploadPurpose] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvImportMode, setCsvImportMode] = useState<'manual' | 'csv'>('manual');
  
  // Assignment states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [numbersToAssign, setNumbersToAssign] = useState<SpecialNumber[]>([]);
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [numberToDelete, setNumberToDelete] = useState<SpecialNumber | null>(null);
  
  // Recycle states
  const [recycleDialogOpen, setRecycleDialogOpen] = useState(false);
  const [numbersToRecycle, setNumbersToRecycle] = useState<ArchivedSpecialNumber[]>([]);
  
  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('database');

  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      const [numbersData, archiveData, agentsData] = await Promise.all([
        dataService.getSpecialDatabase(),
        dataService.getSpecialDatabaseArchive(),
        dataService.getAgents()
      ]);

      if (numbersData.success) {
        console.log('[SPECIAL DB] Fetched numbers:', numbersData.numbers?.length || 0);
        setNumbers(numbersData.numbers || []);
      } else {
        console.error('[SPECIAL DB] Failed to fetch numbers:', numbersData.error);
      }
      
      if (archiveData.success) {
        console.log('[SPECIAL DB] Fetched archived:', archiveData.archived?.length || 0);
        setArchivedNumbers(archiveData.archived || []);
      } else {
        console.error('[SPECIAL DB] Failed to fetch archive:', archiveData.error);
      }

      if (agentsData.success) {
        setAgents(agentsData.agents || []);
      }
    } catch (error: any) {
      console.error('Error fetching special database:', error);
      toast.error('Failed to load special database');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCsvFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setCsvFile(file);
    
    // Parse CSV and extract phone numbers
    try {
      const text = await file.text();
      const lines = text.split('\n');
      
      // Skip header row if it exists (check if first line contains common headers)
      const hasHeader = lines[0]?.toLowerCase().includes('phone') || 
                        lines[0]?.toLowerCase().includes('number') ||
                        lines[0]?.toLowerCase().includes('mobile');
      
      const dataLines = hasHeader ? lines.slice(1) : lines;
      
      // Extract phone numbers (first column by default)
      const numbers = dataLines
        .map(line => {
          const columns = line.split(',').map(col => col.trim().replace(/^["']|["']$/g, ''));
          return columns[0]; // First column
        })
        .filter(num => num && num.length > 0);
      
      if (numbers.length === 0) {
        toast.error('No phone numbers found in CSV file');
        return;
      }
      
      // Update the textarea with parsed numbers
      setUploadNumbers(numbers.join('\n'));
      toast.success(`Imported ${numbers.length} phone numbers from CSV`);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast.error('Failed to parse CSV file');
    }
  };

  const downloadCsvTemplate = () => {
    const template = `Phone Number,Purpose,Notes
+234 801 234 5678,VIP Clients,Important customer
+234 802 345 6789,Event Invites,Conference attendees
+234 803 456 7890,Special Campaign,Promotional offer`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'special-database-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV template downloaded');
  };

  const handleUpload = async () => {
    if (!uploadNumbers.trim() || !uploadPurpose.trim()) {
      toast.error('Please provide phone numbers and purpose');
      return;
    }

    try {
      const phoneNumbers = uploadNumbers
        .split('\n')
        .map(num => num.trim())
        .filter(num => num.length > 0);

      if (phoneNumbers.length === 0) {
        toast.error('No valid phone numbers found');
        return;
      }

      const result = await dataService.uploadToSpecialDatabase({
        phoneNumbers,
        purpose: uploadPurpose,
        notes: uploadNotes
      });

      if (result.success) {
        toast.success(`Successfully uploaded ${result.count || phoneNumbers.length} number(s)`);
        setUploadDialogOpen(false);
        setUploadNumbers('');
        setUploadPurpose('');
        setUploadNotes('');
        setCsvFile(null);
        setCsvImportMode('manual');
        fetchData();
      } else {
        toast.error(result.error || 'Failed to upload numbers');
      }
    } catch (error: any) {
      console.error('Error uploading numbers:', error);
      toast.error('Failed to upload numbers');
    }
  };

  const handleAssign = async () => {
    if (!selectedAgent || numbersToAssign.length === 0) {
      toast.error('Please select an agent and numbers to assign');
      return;
    }

    try {
      const result = await dataService.assignSpecialNumbers({
        agentId: selectedAgent,
        numberIds: numbersToAssign.map(n => n.id)
      });

      if (result.success) {
        toast.success(`Assigned ${numbersToAssign.length} number(s) to agent`);
        setAssignDialogOpen(false);
        setNumbersToAssign([]);
        setSelectedAgent('');
        fetchData();
      } else {
        toast.error(result.error || 'Failed to assign numbers');
      }
    } catch (error: any) {
      console.error('Error assigning numbers:', error);
      toast.error('Failed to assign numbers');
    }
  };

  const handleDelete = async () => {
    if (!numberToDelete) return;

    try {
      const result = await dataService.deleteSpecialNumber(numberToDelete.id);

      if (result.success) {
        toast.success('Number deleted successfully');
        setDeleteDialogOpen(false);
        setNumberToDelete(null);
        fetchData();
      } else {
        toast.error(result.error || 'Failed to delete number');
      }
    } catch (error: any) {
      console.error('Error deleting number:', error);
      toast.error('Failed to delete number');
    }
  };

  const handleRecycle = async () => {
    if (numbersToRecycle.length === 0) {
      toast.error('Please select numbers to recycle');
      return;
    }

    try {
      console.log('[SPECIAL DB] Recycling numbers:', numbersToRecycle.map(n => n.id));
      
      const result = await dataService.recycleSpecialNumbers({
        numberIds: numbersToRecycle.map(n => n.id)
      });

      console.log('[SPECIAL DB] Recycle result:', result);

      if (result.success) {
        toast.success(`Recycled ${numbersToRecycle.length} number(s) back to database`);
        setRecycleDialogOpen(false);
        setNumbersToRecycle([]);
        
        // Refresh data to show updated statistics
        console.log('[SPECIAL DB] Refreshing data after recycle...');
        await fetchData();
        console.log('[SPECIAL DB] Data refreshed');
      } else {
        toast.error(result.error || 'Failed to recycle numbers');
      }
    } catch (error: any) {
      console.error('Error recycling numbers:', error);
      toast.error('Failed to recycle numbers');
    }
  };

  const exportToCSV = () => {
    const dataToExport = activeTab === 'database' ? numbers : archivedNumbers;
    
    if (dataToExport.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = activeTab === 'database' 
      ? ['Phone Number', 'Purpose', 'Notes', 'Status', 'Assigned To', 'Uploaded At']
      : ['Phone Number', 'Purpose', 'Agent', 'Completed At', 'Call Notes'];

    const rows = dataToExport.map((item: any) => {
      if (activeTab === 'database') {
        return [
          item.phoneNumber,
          item.purpose,
          item.notes || '',
          item.status,
          item.assignedTo || '',
          new Date(item.uploadedAt).toLocaleString()
        ];
      } else {
        return [
          item.phoneNumber,
          item.purpose,
          item.agentName,
          new Date(item.completedAt).toLocaleString(),
          item.callNotes || ''
        ];
      }
    });

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `special-database-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredNumbers = React.useMemo(() => {
    let filtered = [...numbers];

    if (searchQuery) {
      filtered = filtered.filter(num =>
        num.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        num.purpose.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(num => num.status === statusFilter);
    }

    return filtered;
  }, [numbers, searchQuery, statusFilter]);

  const filteredArchived = React.useMemo(() => {
    if (!searchQuery) return archivedNumbers;
    
    return archivedNumbers.filter(num =>
      num.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      num.agentName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [archivedNumbers, searchQuery]);

  const stats = React.useMemo(() => ({
    total: numbers.length,
    available: numbers.filter(n => n.status === 'available').length,
    assigned: numbers.filter(n => n.status === 'assigned').length,
    archived: archivedNumbers.length
  }), [numbers, archivedNumbers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
            <div className="absolute inset-0 h-16 w-16 rounded-full bg-gradient-to-tr from-purple-500/20 to-blue-500/20 blur-xl"></div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading special database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 shadow-2xl shadow-orange-500/30">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-white mb-1">Special Database</h1>
              <p className="text-white/90 text-sm">
                Purpose-specific number management with dedicated archiving
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setRefreshing(true) || fetchData()} 
              disabled={refreshing}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => setUploadDialogOpen(true)}
              className="bg-white text-orange-600 hover:bg-white/90 shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Numbers
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -mr-12 -mt-12"></div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-amber-500/10">
                    <Database className="h-4 w-4 text-amber-600" />
                  </div>
                  <span className="text-sm text-amber-700">Total Numbers</span>
                </div>
                <div className="text-2xl text-amber-900 mb-1">{stats.total}</div>
                <p className="text-xs text-amber-600/70">In special database</p>
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
                  <span className="text-sm text-green-700">Available</span>
                </div>
                <div className="text-2xl text-green-900 mb-1">{stats.available}</div>
                <p className="text-xs text-green-600/70">Ready to assign</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-12 -mt-12"></div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-blue-700">Assigned</span>
                </div>
                <div className="text-2xl text-blue-900 mb-1">{stats.assigned}</div>
                <p className="text-xs text-blue-600/70">To agents</p>
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
                    <Archive className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-purple-700">Archived</span>
                </div>
                <div className="text-2xl text-purple-900 mb-1">{stats.archived}</div>
                <p className="text-xs text-purple-600/70">Completed calls</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-xl">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-orange-600" />
                Special Database Management
              </CardTitle>
              <CardDescription>Manage purpose-specific numbers with dedicated tracking</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="border-orange-200 hover:bg-orange-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Active Numbers ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="archive" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Archive ({stats.archived})
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-gradient-to-r from-orange-50/50 to-amber-50/50 border border-orange-100/50">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search numbers or purpose..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white/80"
                  />
                </div>
              </div>

              {activeTab === 'database' && (
                <div className="space-y-2">
                  <Label>Status Filter</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-white/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">✓ Available</SelectItem>
                      <SelectItem value="assigned">👤 Assigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-end gap-2">
                {activeTab === 'database' && filteredNumbers.length > 0 && (
                  <Button
                    onClick={() => {
                      const available = filteredNumbers.filter(n => n.status === 'available');
                      if (available.length === 0) {
                        toast.error('No available numbers to assign');
                        return;
                      }
                      setNumbersToAssign(available);
                      setAssignDialogOpen(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign to Agent
                  </Button>
                )}

                {activeTab === 'archive' && filteredArchived.length > 0 && (
                  <Button
                    onClick={() => {
                      setNumbersToRecycle(filteredArchived);
                      setRecycleDialogOpen(true);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Recycle to Database
                  </Button>
                )}
              </div>
            </div>

            {/* Database Tab */}
            <TabsContent value="database" className="mt-0">
              {filteredNumbers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 mb-4">
                    <Database className="h-10 w-10 text-orange-500 opacity-50" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'No numbers match your filters' 
                      : 'No numbers in special database'}
                  </p>
                  <Button
                    onClick={() => setUploadDialogOpen(true)}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Numbers
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[500px] rounded-lg border border-border/50 bg-white/50 backdrop-blur-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNumbers.map((number) => (
                        <TableRow key={number.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-orange-600" />
                              <span className="font-mono">{number.phoneNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              {number.purpose}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {number.notes || '-'}
                          </TableCell>
                          <TableCell>
                            {number.status === 'available' ? (
                              <Badge className="bg-green-500">Available</Badge>
                            ) : (
                              <Badge className="bg-blue-500">Assigned</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {number.assignedTo || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(number.uploadedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {number.status === 'available' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setNumbersToAssign([number]);
                                    setAssignDialogOpen(true);
                                  }}
                                  className="border-blue-200 hover:bg-blue-50"
                                >
                                  <UserPlus className="h-3 w-3 mr-1" />
                                  Assign
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setNumberToDelete(number);
                                  setDeleteDialogOpen(true);
                                }}
                                className="border-red-200 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </TabsContent>

            {/* Archive Tab */}
            <TabsContent value="archive" className="mt-0">
              {filteredArchived.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-4">
                    <Archive className="h-10 w-10 text-purple-500 opacity-50" />
                  </div>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No archived numbers match your search' : 'No archived numbers yet'}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] rounded-lg border border-border/50 bg-white/50 backdrop-blur-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Call Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredArchived.map((number) => (
                        <TableRow key={number.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <PhoneCall className="h-4 w-4 text-purple-600" />
                              <span className="font-mono">{number.phoneNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              {number.purpose}
                            </Badge>
                          </TableCell>
                          <TableCell>{number.agentName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(number.completedAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {number.callNotes || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setNumbersToRecycle([number]);
                                setRecycleDialogOpen(true);
                              }}
                              className="border-purple-200 hover:bg-purple-50"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Recycle
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-0 p-0">
          <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-orange-600" />
                Upload Numbers to Special Database
              </DialogTitle>
              <DialogDescription>
                Add numbers for a specific purpose. Enter manually or import from CSV.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            <div className="space-y-4">
            {/* Import Mode Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setCsvImportMode('manual')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  csvImportMode === 'manual'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Manual Entry
              </button>
              <button
                onClick={() => setCsvImportMode('csv')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  csvImportMode === 'csv'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4 inline mr-2" />
                Import CSV
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">
                Purpose <span className="text-red-500">*</span>
              </Label>
              <Input
                id="purpose"
                placeholder="e.g., VIP Clients, Event Invites, Special Campaign"
                value={uploadPurpose}
                onChange={(e) => setUploadPurpose(e.target.value)}
              />
            </div>

            {csvImportMode === 'manual' ? (
              <div className="space-y-2">
                <Label htmlFor="numbers">
                  Phone Numbers <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="numbers"
                  placeholder="+234 801 234 5678&#10;+234 802 345 6789&#10;+234 803 456 7890"
                  value={uploadNumbers}
                  onChange={(e) => setUploadNumbers(e.target.value)}
                  rows={8}
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Enter one phone number per line
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* CSV Upload */}
                <div className="space-y-2">
                  <Label htmlFor="csv-file">
                    CSV File <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleCsvFileChange}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={downloadCsvTemplate}
                      className="shrink-0"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Template
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload a CSV file with phone numbers in the first column
                  </p>
                </div>

                {/* Preview Area */}
                {uploadNumbers && (
                  <div className="space-y-2">
                    <Label>Imported Numbers Preview ({uploadNumbers.split('\n').filter(n => n).length} numbers)</Label>
                    <div className="border rounded-md bg-white">
                      <ScrollArea className="h-[150px]">
                        <Textarea
                          value={uploadNumbers}
                          onChange={(e) => setUploadNumbers(e.target.value)}
                          className="font-mono text-sm border-0 resize-none min-h-[150px]"
                        />
                      </ScrollArea>
                    </div>
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Numbers imported successfully. You can edit them before uploading.
                    </p>
                  </div>
                )}

                {/* CSV Format Info */}
                {!uploadNumbers && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      CSV Format
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>First column should contain phone numbers</li>
                      <li>Optional: Include headers (will be auto-detected and skipped)</li>
                      <li>Example format: +234 XXX XXX XXXX</li>
                      <li>Download the template to see an example</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about these numbers..."
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          </div>

          <div className="sticky bottom-0 bg-white z-10 px-6 py-4 border-t">
            <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={() => {
              setUploadDialogOpen(false);
              setCsvFile(null);
              setCsvImportMode('manual');
              setUploadNumbers('');
              setUploadPurpose('');
              setUploadNotes('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!uploadNumbers.trim() || !uploadPurpose.trim()}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload {uploadNumbers.split('\n').filter(n => n.trim()).length || 0} Numbers
            </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Assign Special Numbers to Agent
            </DialogTitle>
            <DialogDescription>
              Select an agent to assign {numbersToAssign.length} number(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agent">Select Agent</Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger id="agent">
                  <SelectValue placeholder="Choose an agent..." />
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

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-900 mb-2">Numbers to assign:</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {numbersToAssign.map((num) => (
                  <div key={num.id} className="text-sm text-blue-700 flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <span className="font-mono">{num.phoneNumber}</span>
                    <span className="text-blue-600">({num.purpose})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Numbers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recycle Dialog */}
      <Dialog open={recycleDialogOpen} onOpenChange={setRecycleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-purple-600" />
              Recycle Numbers to Special Database
            </DialogTitle>
            <DialogDescription>
              Move {numbersToRecycle.length} archived number(s) back to the special database for reuse
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <p className="text-sm text-purple-900 mb-2">Numbers to recycle:</p>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {numbersToRecycle.map((num) => (
                <div key={num.id} className="text-sm text-purple-700 flex items-center gap-2">
                  <ArrowRightLeft className="h-3 w-3" />
                  <span className="font-mono">{num.phoneNumber}</span>
                  <span className="text-purple-600">({num.purpose})</span>
                  <span className="text-purple-500">- by {num.agentName}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-800">
              These numbers will be marked as available and can be reassigned to agents
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRecycleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRecycle}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Recycle Numbers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Number?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {numberToDelete?.phoneNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
