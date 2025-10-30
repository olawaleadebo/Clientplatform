// Database Manager Component - Redesigned with Beautiful Gradients
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Progress } from "./ui/progress";
import { 
  Database, 
  RefreshCw, 
  Upload,
  Download,
  Trash2,
  AlertCircle,
  FileText,
  Users,
  UserCheck,
  Sparkles,
  TrendingUp,
  Package
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { backendService } from "../utils/backendService";

interface DatabaseStats {
  totalClients: number;
  totalCustomers: number;
  assignedClients: number;
  assignedCustomers: number;
  availableClients: number;
  availableCustomers: number;
}

export function DatabaseManager() {
  const [stats, setStats] = useState<DatabaseStats>({
    totalClients: 0,
    totalCustomers: 0,
    assignedClients: 0,
    assignedCustomers: 0,
    availableClients: 0,
    availableCustomers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isImportClientsOpen, setIsImportClientsOpen] = useState(false);
  const [isImportCustomersOpen, setIsImportCustomersOpen] = useState(false);
  const clientFileInputRef = useRef<HTMLInputElement>(null);
  const customerFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDatabaseStats();
    
    const interval = setInterval(loadDatabaseStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDatabaseStats = async () => {
    try {
      const [clientsData, customersData, assignmentsData] = await Promise.all([
        backendService.getClients(),
        backendService.getCustomers(),
        backendService.getAssignments()
      ]);

      const totalClients = clientsData.success ? (clientsData.records?.length || clientsData.clients?.length || 0) : 0;
      const totalCustomers = customersData.success ? (customersData.records?.length || customersData.customers?.length || 0) : 0;
      
      const assignments = assignmentsData.success ? (assignmentsData.assignments || []) : [];
      const assignedClients = assignments.filter((a: any) => a.type === 'client').length;
      const assignedCustomers = assignments.filter((a: any) => a.type === 'customer').length;

      setStats({
        totalClients,
        totalCustomers,
        assignedClients,
        assignedCustomers,
        availableClients: totalClients - assignedClients,
        availableCustomers: totalCustomers - assignedCustomers
      });
    } catch (error: any) {
      if (error.message?.includes('503') && 
          (error.message?.includes('not_initialized') || error.message?.includes('Database not ready'))) {
        console.log('Database is initializing, will retry automatically...');
        toast.info('Database is warming up... This may take a moment.', { duration: 3000 });
      } else {
        console.error("Failed to load database stats:", error);
        toast.error("Failed to load database statistics");
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDatabaseStats();
  };

  const handleImportClients = () => {
    setIsImportClientsOpen(true);
  };

  const handleImportCustomers = () => {
    setIsImportCustomersOpen(true);
  };

  const handleClientFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
      
      const dataRows = rows.slice(1).filter(row => row.length >= 3 && row[0]);
      
      let successCount = 0;
      let errorCount = 0;

      const clients = [];
      
      for (const row of dataRows) {
        try {
          const [name, phone, company, status, lastContact, notes, email] = row;
          
          clients.push({
            name,
            phone,
            email: email || "",
            company,
            notes: notes || "",
            status: status || 'pending',
            lastContact
          });
        } catch (error) {
          errorCount++;
        }
      }

      try {
        const data = await backendService.importClients(clients);
        if (data.success) {
          successCount = clients.length;
        } else {
          errorCount = clients.length;
        }
      } catch (error) {
        errorCount = clients.length;
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} client${successCount > 1 ? 's' : ''}!`);
        await loadDatabaseStats();
      }
      if (errorCount > 0) {
        toast.warning(`${errorCount} client${errorCount > 1 ? 's' : ''} could not be imported.`);
      }
      
      setIsImportClientsOpen(false);
      if (clientFileInputRef.current) {
        clientFileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  const handleCustomerFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
      
      const dataRows = rows.slice(1).filter(row => row.length >= 3 && row[0]);
      
      let successCount = 0;
      let errorCount = 0;

      const customers = [];
      
      for (const row of dataRows) {
        try {
          const [name, email, phone, business, status, lastContact, totalPurchases, totalRevenue, notes] = row;
          
          const validBusinessTypes = ["Online Sales", "Corporate", "Channel", "Retails", "Protocol", "Others"];
          const customerBusiness = validBusinessTypes.includes(business) ? business : "Others";
          
          const validStatuses = ["active", "inactive", "vip", "corporate"];
          const customerStatus = validStatuses.includes(status) ? status : "active";
          
          customers.push({
            name,
            email,
            phone,
            business: customerBusiness,
            status: customerStatus,
            notes: notes || "",
            lastContact,
            totalPurchases: parseInt(totalPurchases) || 0
          });
        } catch (error) {
          errorCount++;
        }
      }

      try {
        const data = await backendService.importCustomers(customers);
        if (data.success) {
          successCount = customers.length;
        } else {
          errorCount = customers.length;
        }
      } catch (error) {
        errorCount = customers.length;
        console.error('[IMPORT] Error importing customers:', error);
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} customer${successCount > 1 ? 's' : ''}!`);
        await loadDatabaseStats();
      }
      if (errorCount > 0) {
        toast.warning(`${errorCount} customer${errorCount > 1 ? 's' : ''} could not be imported.`);
      }
      
      setIsImportCustomersOpen(false);
      if (customerFileInputRef.current) {
        customerFileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  const handleDownloadClientTemplate = () => {
    const template = [
      ['Name', 'Phone', 'Company', 'Status', 'Last Contact', 'Notes', 'Email'],
      ['John Doe', '+234 803 123 4567', 'Acme Corp', 'pending', 'Oct 16, 2025', 'Follow up next week', 'john@acme.com'],
      ['Jane Smith', '+234 805 234 5678', 'Tech Solutions', 'completed', 'Oct 15, 2025', 'Deal closed', 'jane@techsolutions.com']
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'btm-clients-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Template downloaded successfully!");
  };

  const handleDownloadCustomerTemplate = () => {
    const template = [
      ['Name', 'Email', 'Phone', 'Business', 'Status', 'Last Contact', 'Total Purchases', 'Total Revenue', 'Notes'],
      ['Adewale Ogunleye', 'adewale@email.com', '+234 803 111 2222', 'Corporate', 'vip', 'Oct 15, 2025', '10', '5000', 'VIP customer'],
      ['Chidinma Nwosu', 'chidinma@email.com', '+234 805 222 3333', 'Online Sales', 'active', 'Oct 14, 2025', '5', '2500', 'Regular customer']
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'btm-customers-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Template downloaded successfully!");
  };

  const handleExportClients = async () => {
    try {
      const data = await backendService.getClients();

      if (data.success) {
        const clients = data.records || data.clients || [];
        
        const csvContent = [
          ['Name', 'Phone', 'Company', 'Status', 'Last Contact', 'Notes', 'Email'],
          ...clients.map((c: any) => [
            c.name,
            c.phone,
            c.company,
            c.status,
            c.lastContact || '',
            c.notes || '',
            c.email || ''
          ])
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `btm-clients-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success("Client list exported successfully!");
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Failed to export clients:', error);
      toast.error('Failed to export clients. Please check your connection.');
    }
  };

  const handleMigrateCustomers = async () => {
    try {
      toast.loading("Migrating customer records...");
      const data = await backendService.migrateCustomers();
      
      if (data.success) {
        toast.success(data.message || "Customer records migrated successfully!");
        await loadDatabaseStats();
      } else {
        throw new Error('Migration failed');
      }
    } catch (error) {
      console.error('Failed to migrate customers:', error);
      toast.error('Failed to migrate customer records. Please try again.');
    }
  };

  const handleExportCustomers = async () => {
    try {
      const data = await backendService.getCustomers();

      if (data.success) {
        const customers = data.customers || data.records || [];
        
        const csvContent = [
          ['Name', 'Email', 'Phone', 'Business', 'Status', 'Last Contact', 'Total Purchases', 'Total Revenue', 'Notes'],
          ...customers.map((c: any) => [
            c.name,
            c.email,
            c.phone,
            c.business,
            c.status,
            c.lastContact || '',
            c.totalPurchases || '0',
            c.totalRevenue || '0',
            c.notes || ''
          ])
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `btm-customers-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success("Customer list exported successfully!");
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Failed to export customers:', error);
      toast.error('Failed to export customers. Please check your connection.');
    }
  };

  const handleFixDatabase = async () => {
    try {
      toast.info('Running database migration...', { duration: 2000 });
      
      // Fix clients/numbers
      const clientsResponse = await fetch('http://localhost:8000/database/clients/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const clientsData = await clientsResponse.json();
      
      // Fix customers
      const customersResponse = await fetch('http://localhost:8000/database/customers/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const customersData = await customersResponse.json();
      
      if (clientsData.success && customersData.success) {
        toast.success(`Fixed ${clientsData.modifiedCount} client records and ${customersData.modifiedCount} customer records!`);
        await loadDatabaseStats();
      } else {
        throw new Error('Migration failed');
      }
    } catch (error) {
      console.error('Failed to fix database:', error);
      toast.error('Failed to fix database. Please check your connection.');
    }
  };

  const utilizationRate = stats.totalClients + stats.totalCustomers > 0 
    ? Math.round(((stats.assignedClients + stats.assignedCustomers) / (stats.totalClients + stats.totalCustomers)) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
            <div className="absolute inset-0 h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-xl"></div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-2xl shadow-purple-500/30">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
              <Database className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-white mb-1">Database Management</h1>
              <p className="text-white/90 text-sm">
                Centralized client and customer database
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

      {/* Fix Database Alert (shows if assignment error might occur) */}
      <Alert className="border-0 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 shadow-lg">
        <Sparkles className="w-4 h-4 text-amber-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="text-amber-900 mb-1">Getting "No available numbers match criteria" error?</p>
            <p className="text-sm text-amber-700">
              Click "Fix Database" to resolve assignment issues caused by missing status fields.
            </p>
          </div>
          <Button 
            onClick={handleFixDatabase}
            size="sm"
            className="ml-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Fix Database
          </Button>
        </AlertDescription>
      </Alert>

      {/* Summary Stats Cards with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-12 -mt-12"></div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Database className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-blue-700">Total Records</span>
                </div>
                <div className="text-2xl text-blue-900 mb-1">{stats.totalClients + stats.totalCustomers}</div>
                <p className="text-xs text-blue-600/70">
                  Combined database
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
                    <Sparkles className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-green-700">Available</span>
                </div>
                <div className="text-2xl text-green-900 mb-1">{stats.availableClients + stats.availableCustomers}</div>
                <p className="text-xs text-green-600/70">
                  Ready to assign
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
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm text-orange-700">Assigned</span>
                </div>
                <div className="text-2xl text-orange-900 mb-1">{stats.assignedClients + stats.assignedCustomers}</div>
                <p className="text-xs text-orange-600/70">
                  To agents
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
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-purple-700">Utilization</span>
                </div>
                <div className="text-2xl text-purple-900 mb-1">{utilizationRate}%</div>
                <p className="text-xs text-purple-600/70">
                  Assignment rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Database Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clients Database Card */}
        <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-xl group hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-500"></div>
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              Prospective Clients Database
            </CardTitle>
            <CardDescription>Client records and availability</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 relative">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-100/50">
                <p className="text-2xl text-blue-600">{stats.totalClients}</p>
                <p className="text-sm text-blue-600/70 mt-1">Total</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm border border-green-100/50">
                <p className="text-2xl text-green-600">{stats.availableClients}</p>
                <p className="text-sm text-green-600/70 mt-1">Available</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50/80 to-amber-50/80 backdrop-blur-sm border border-orange-100/50">
                <p className="text-2xl text-orange-600">{stats.assignedClients}</p>
                <p className="text-sm text-orange-600/70 mt-1">Assigned</p>
              </div>
            </div>

            {/* Progress Bar */}
            {stats.totalClients > 0 && (
              <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-blue-100/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-sm text-blue-700">
                    <Package className="h-4 w-4" />
                    Assignment Progress
                  </span>
                  <span className="text-blue-700">{Math.round((stats.assignedClients / stats.totalClients) * 100)}%</span>
                </div>
                <Progress 
                  value={(stats.assignedClients / stats.totalClients) * 100} 
                  className="h-2 bg-blue-100"
                />
              </div>
            )}

            {/* Alerts */}
            {stats.availableClients === 0 && stats.totalClients > 0 && (
              <Alert className="border-0 bg-gradient-to-r from-orange-50 to-amber-50 shadow-md">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <AlertDescription className="text-orange-700">
                  All clients assigned. Import more to continue operations.
                </AlertDescription>
              </Alert>
            )}

            {stats.totalClients === 0 && (
              <Alert className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  No clients in database. Upload CSV file to import clients.
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={handleImportClients} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Clients
              </Button>
              <Button 
                onClick={handleExportClients} 
                variant="outline" 
                disabled={stats.totalClients === 0}
                className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customers Database Card */}
        <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-xl group hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/5 to-transparent rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-500"></div>
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              Existing Customers Database
            </CardTitle>
            <CardDescription>Customer records and availability</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 relative">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm border border-green-100/50">
                <p className="text-2xl text-green-600">{stats.totalCustomers}</p>
                <p className="text-sm text-green-600/70 mt-1">Total</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-100/50">
                <p className="text-2xl text-blue-600">{stats.availableCustomers}</p>
                <p className="text-sm text-blue-600/70 mt-1">Available</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm border border-purple-100/50">
                <p className="text-2xl text-purple-600">{stats.assignedCustomers}</p>
                <p className="text-sm text-purple-600/70 mt-1">Assigned</p>
              </div>
            </div>

            {/* Progress Bar */}
            {stats.totalCustomers > 0 && (
              <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-green-100/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-sm text-green-700">
                    <Package className="h-4 w-4" />
                    Assignment Progress
                  </span>
                  <span className="text-green-700">{Math.round((stats.assignedCustomers / stats.totalCustomers) * 100)}%</span>
                </div>
                <Progress 
                  value={(stats.assignedCustomers / stats.totalCustomers) * 100} 
                  className="h-2 bg-green-100"
                />
              </div>
            )}

            {/* Alerts */}
            {stats.availableCustomers === 0 && stats.totalCustomers > 0 && (
              <Alert className="border-0 bg-gradient-to-r from-orange-50 to-amber-50 shadow-md">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <AlertDescription className="text-orange-700">
                  All customers assigned. Import more to continue operations.
                </AlertDescription>
              </Alert>
            )}

            {stats.totalCustomers === 0 && (
              <Alert className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md">
                <AlertCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  No customers in database. Upload CSV file to import customers.
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={handleImportCustomers} 
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Customers
              </Button>
              <Button 
                onClick={handleExportCustomers} 
                variant="outline" 
                disabled={stats.totalCustomers === 0}
                className="border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Migration Button */}
            {stats.totalCustomers > 0 && stats.availableCustomers === 0 && (
              <Button 
                onClick={handleMigrateCustomers} 
                variant="outline" 
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Fix Customer Records (Migration)
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Clients Dialog */}
      <Dialog open={isImportClientsOpen} onOpenChange={setIsImportClientsOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              Import Clients from CSV
            </DialogTitle>
            <DialogDescription>
              Upload a CSV file to import prospective client records into the database
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <strong>CSV Format:</strong> Name, Phone, Company, Status, Last Contact, Notes, Email
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button 
                onClick={handleDownloadClientTemplate}
                variant="outline" 
                className="w-full border-blue-200 hover:bg-blue-50 hover:border-blue-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template CSV
              </Button>

              <input
                ref={clientFileInputRef}
                type="file"
                accept=".csv"
                onChange={handleClientFileImport}
                className="hidden"
              />
              
              <Button 
                onClick={() => clientFileInputRef.current?.click()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-300"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select CSV File to Import
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportClientsOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Customers Dialog */}
      <Dialog open={isImportCustomersOpen} onOpenChange={setIsImportCustomersOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                <Upload className="w-5 h-5 text-green-600" />
              </div>
              Import Customers from CSV
            </DialogTitle>
            <DialogDescription>
              Upload a CSV file to import existing customer records into the database
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md">
              <AlertCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <strong>CSV Format:</strong> Name, Email, Phone, Business, Status, Last Contact, Total Purchases, Total Revenue, Notes
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button 
                onClick={handleDownloadCustomerTemplate}
                variant="outline" 
                className="w-full border-green-200 hover:bg-green-50 hover:border-green-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template CSV
              </Button>

              <input
                ref={customerFileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCustomerFileImport}
                className="hidden"
              />
              
              <Button 
                onClick={() => customerFileInputRef.current?.click()}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg transition-all duration-300"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select CSV File to Import
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportCustomersOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
