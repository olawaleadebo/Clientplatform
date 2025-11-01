import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Alert, AlertDescription } from "./ui/alert";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { useUser } from "./UserContext";
import { Settings, Users, Target, Plus, Edit, Trash2, ShieldCheck, UserCircle, Crown, Shield, Mail, Save, X, AlertCircle, CheckCircle2, ExternalLink, Upload, Download, Phone, BookUser, ShoppingBag, UserPlus, Briefcase, Key, Menu, FileText, Server, Tag, Database, Archive, Eye } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { backendService } from '../utils/backendService';
import { legacyEndpoints } from '../utils/legacyEndpointWrapper';
import { LoginAudit } from './LoginAudit';
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { ThreeCXSettings } from './ThreeCXSettings';
import { CallHistory } from './CallHistory';
import { CallScriptManager } from './CallScriptManager';
import { SMTPSettings } from './SMTPSettings';
import { DailyProgressManager } from './DailyProgressManager';
import { DatabaseManager } from './DatabaseManager';
import { ArchiveManager } from './ArchiveManager';
import { AgentMonitoring } from './AgentMonitoring';
import { ConnectionStatus } from './ConnectionStatus';
import { UserDebugPanel } from './UserDebugPanel';
import { SystemInitializer } from './SystemInitializer';
import { BackendDiagnostics } from './BackendDiagnostics';
import { CounterResetManager } from './CounterResetManager';

import { Permission } from './UserContext';

interface UserSettings {
  id: string;
  username: string;
  name: string;
  email: string;
  password?: string; // Password for login validation
  role: 'admin' | 'manager' | 'agent';
  permissions?: Permission[];
  dailyTarget?: number;
  createdAt: string;
}

export function AdminSettings() {
  const { currentUser, isAdmin } = useUser();
  const [globalTarget, setGlobalTarget] = useState(30);
  const [users, setUsers] = useState<UserSettings[]>([]);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserSettings | null>(null);
  
  // Email setup states
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);
  const [isSavingEmails, setIsSavingEmails] = useState(false);
  
  // Contact management states
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    notes: ""
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Customer management states
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  const [isImportCustomerDialogOpen, setIsImportCustomerDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    business: "Online Sales" as "Online Sales" | "Corporate" | "Channel" | "Retails" | "Protocol" | "Others",
    status: "active" as "active" | "inactive" | "vip" | "corporate",
    notes: ""
  });
  const customerFileInputRef = useRef<HTMLInputElement>(null);
  
  // Permission management states
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [permissionUser, setPermissionUser] = useState<UserSettings | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  
  // Promotion management states
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isAddPromoDialogOpen, setIsAddPromoDialogOpen] = useState(false);
  const [isEditPromoDialogOpen, setIsEditPromoDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [newPromo, setNewPromo] = useState({
    name: "",
    code: "",
    discount: "",
    website: "adventure.btmtravel.net",
    status: "active" as "active" | "scheduled" | "expired",
    startDate: "",
    endDate: "",
    target: "",
    usage: "0",
    revenue: "0",
    views: "0",
    conversions: "0",
    targetCustomerTypes: [] as string[],
    targetFlights: [] as string[]
  });
  
  // Sidebar navigation states
  const [activeSection, setActiveSection] = useState<'users' | 'permissions' | 'audit' | 'email' | 'smtp' | '3cx' | 'calls' | 'scripts' | 'promotions' | 'daily-progress' | 'database' | 'archive' | 'agent-monitoring' | 'user-debug' | 'system-init' | 'counter-reset'>('system-init');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const [newUser, setNewUser] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "agent" as 'admin' | 'manager' | 'agent',
    dailyTarget: ""
  });

  useEffect(() => {
    loadSettings();
    fetchRecipients();
    fetchPromotions();
  }, []);

  const loadSettings = async () => {
    try {
      // Load from MongoDB backend - SINGLE SOURCE OF TRUTH
      const data = await backendService.getAdminSettings();
      if (data.success && data.settings) {
        setGlobalTarget(data.settings.globalTarget || 30);
        // Filter out any null/undefined users from the database
        const validUsers = (data.settings.users || []).filter((u: any) => u != null && u.id && u.username);
        setUsers(validUsers);
        setBackendAvailable(true);
        console.log('[ADMIN] ✅ Loaded users from MongoDB:', validUsers.length, 'users');
      }
    } catch (error: any) {
      // Backend not available - show error
      setBackendAvailable(false);
      console.error('[ADMIN] ❌ Backend not available - user management requires MongoDB connection');
      toast.error('⚠️ Backend not available! Click the "Start Backend" button below.');
      setUsers([]);
    }
  };

  const handleSaveGlobalTarget = async () => {
    try {
      await backendService.setGlobalTarget(globalTarget);
      toast.success(`Global daily target set to ${globalTarget} calls (note: targets are now per-user)`);
    } catch (error: any) {
      toast.error('Failed to save target. Backend not available.');
      console.error('[ADMIN] ❌ Failed to save target:', error.message);
      localStorage.setItem('btm_global_target', globalTarget.toString());
      toast.success(`Global daily target set to ${globalTarget} calls (saved locally)`);
    }
  };

  // Permission definitions
  const allPermissions: { id: Permission; label: string; description: string; category: string }[] = [
    // Team Management
    { id: 'view_team_performance', label: 'View Team Performance', description: 'View team metrics and performance dashboards', category: 'Team Management' },
    { id: 'view_all_agents', label: 'View All Agents', description: 'See all agents and their activities', category: 'Team Management' },
    { id: 'assign_agents', label: 'Assign Agents', description: 'Assign tasks and contacts to agents', category: 'Team Management' },
    
    // CRM
    { id: 'manage_contacts', label: 'Manage Contacts', description: 'Add, edit, and delete CRM contacts', category: 'CRM' },
    
    // Customer Service
    { id: 'manage_customers', label: 'Manage Customers', description: 'Add, edit, and delete customer records', category: 'Customer Service' },
    { id: 'view_customer_details', label: 'View Customer Details', description: 'Access detailed customer information', category: 'Customer Service' },
    { id: 'edit_customer_notes', label: 'Edit Customer Notes', description: 'Modify customer notes and history', category: 'Customer Service' },
    { id: 'access_customer_service', label: 'Access Customer Service Tab', description: 'Access the Customer Service portal', category: 'Customer Service' },
    
    // Promotions
    { id: 'manage_promotions', label: 'Manage Promotions', description: 'Create and edit promotional content', category: 'Promotions' },
    { id: 'manage_promo_campaigns', label: 'Manage Campaigns', description: 'Full campaign management and analytics', category: 'Promotions' },
    { id: 'access_promo_sales', label: 'Access Promo Sales Tab', description: 'Access the Promo Sales portal', category: 'Promotions' },
    { id: 'view_promo_analytics', label: 'View Promo Analytics', description: 'View promotion performance metrics', category: 'Promotions' },
    
    // Phone & Calling
    { id: 'make_calls', label: 'Make Calls', description: 'Initiate outbound calls via 3CX integration', category: 'Phone & Calling' },
    { id: 'view_own_calls', label: 'View Own Calls', description: 'View personal call history', category: 'Phone & Calling' },
    { id: 'view_call_history', label: 'View All Call History', description: 'Access complete call history for all users', category: 'Phone & Calling' },
    { id: 'export_call_history', label: 'Export Call History', description: 'Export call history data', category: 'Phone & Calling' },
    
    // Call Scripts
    { id: 'view_call_scripts', label: 'View Call Scripts', description: 'Access and view call scripts during calls', category: 'Call Scripts' },
    { id: 'manage_call_scripts', label: 'Manage Call Scripts', description: 'Create, edit, and delete call scripts', category: 'Call Scripts' },
    
    // Security & Audit
    { id: 'view_audit_logs', label: 'View Audit Logs', description: 'Access login and security audit logs', category: 'Security & Audit' },
    
    // Reporting
    { id: 'generate_reports', label: 'Generate Reports', description: 'Create and export system reports', category: 'Reporting' },
    { id: 'export_data', label: 'Export Data', description: 'Export contacts, customers, and reports', category: 'Reporting' },
    
    // System Configuration
    { id: 'configure_3cx', label: 'Configure 3CX Settings', description: 'Manage 3CX phone system integration settings', category: 'System Configuration' },
    { id: 'configure_smtp', label: 'Configure SMTP Settings', description: 'Manage email server and SMTP configuration', category: 'System Configuration' },
    { id: 'manage_email_settings', label: 'Manage Email Settings', description: 'Configure email recipients and notifications', category: 'System Configuration' },
    { id: 'manage_admin_settings', label: 'Manage Admin Settings', description: 'Full access to admin settings panel', category: 'System Configuration' },
  ];

  const openPermissionsDialog = (user: UserSettings) => {
    setPermissionUser(user);
    setSelectedPermissions(user.permissions || []);
    setIsPermissionDialogOpen(true);
  };

  const togglePermission = (permission: Permission) => {
    setSelectedPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSyncFromDatabase = async () => {
    try {
      toast.info('Syncing users from database...');
      const response = await fetch('http://localhost:8000/debug/users');
      const data = await response.json();
      
      if (data.success && data.users) {
        // Save to localStorage
        localStorage.setItem('btm_users', JSON.stringify(data.users));
        setUsers(data.users);
        toast.success(`✅ Synced ${data.users.length} users from MongoDB to localStorage!`);
      } else {
        toast.error('Failed to sync users: ' + (data.error || 'Unknown error'));
      }
    } catch (error: any) {
      toast.error('Error syncing users: ' + error.message);
      console.error('[ADMIN] Sync error:', error);
    }
  };

  const handleSavePermissions = async () => {
    if (!permissionUser) return;

    try {
      const response = await backendService.updateUser(permissionUser.id, { permissions: selectedPermissions });
      
      if (response.success) {
        console.log('[ADMIN] Permissions updated successfully');
        setUsers(users.map(u => 
          u.id === permissionUser.id 
            ? { ...u, permissions: selectedPermissions }
            : u
        ));
        toast.success(`Permissions updated for ${permissionUser.name}`);
        setIsPermissionDialogOpen(false);
      } else {
        console.error('[ADMIN] Server error updating permissions:', response.error);
        toast.error(`Failed to update permissions: ${response.error || 'Server error'}`);
      }
    } catch (error: any) {
      // Fallback to localStorage
      console.log('[ADMIN] Updating permissions in localStorage (offline mode)');
      const updatedUsers = users.map(u => 
        u.id === permissionUser.id 
          ? { ...u, permissions: selectedPermissions }
          : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('btm_users', JSON.stringify(updatedUsers));
      toast.success(`Permissions updated for ${permissionUser.name} (saved locally)`);
      setIsPermissionDialogOpen(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if username already exists
    const existingUser = users.find(u => u.username.toLowerCase() === newUser.username.toLowerCase());
    if (existingUser) {
      toast.error('Username already exists');
      return;
    }

    const user: UserSettings = {
      id: Date.now().toString(),
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      password: newUser.password, // Include password for login validation
      role: newUser.role,
      dailyTarget: newUser.dailyTarget ? parseInt(newUser.dailyTarget) : undefined,
      createdAt: new Date().toISOString()
    };

    console.log('[ADMIN] Creating new user in MongoDB:', user.username);

    try {
      const response = await backendService.addUser(user);
      
      if (response.success) {
        // Reload users from backend to get the latest data
        await loadSettings();
        toast.success(`✅ User ${newUser.username} created successfully in MongoDB`);
      } else {
        toast.error(response.error || 'Failed to create user');
      }
    } catch (error: any) {
      toast.error('Backend not available. Cannot create users without MongoDB connection.');
      console.error('[ADMIN] ❌ Failed to create user:', error.message);
    }

    setNewUser({
      username: "",
      name: "",
      email: "",
      password: "",
      role: "agent",
      dailyTarget: ""
    });
    setIsAddUserOpen(false);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    console.log('[ADMIN] Updating user in MongoDB:', editingUser.username);

    try {
      const response = await backendService.updateUser(editingUser.id, editingUser);
      
      if (response.success) {
        // Reload users from backend to get the latest data
        await loadSettings();
        toast.success(`User ${editingUser.username} updated successfully`);
      } else {
        toast.error(response.error || 'Failed to update user');
      }
    } catch (error: any) {
      // Fallback to localStorage
      console.log('[ADMIN] Updating user in localStorage (offline mode)');
      const updatedUsers = users.map(u => u.id === editingUser.id ? editingUser : u);
      setUsers(updatedUsers);
      localStorage.setItem('btm_users', JSON.stringify(updatedUsers));
      toast.success(`User ${editingUser.username} updated successfully (saved locally)`);
    }

    setEditingUser(null);
    setIsEditUserOpen(false);
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u != null && u.id === userId);
    if (!user) return;

    if (user.role === 'admin' && users.filter(u => u != null && u.role === 'admin').length === 1) {
      toast.error("Cannot delete the last admin user");
      return;
    }

    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      try {
        const response = await backendService.deleteUser(userId);
        
        if (response.success) {
          // Reload users from backend to get the latest data
          await loadSettings();
          toast.success(`User ${user.username} deleted successfully`);
        } else {
          toast.error(response.error || 'Failed to delete user');
        }
      } catch (error: any) {
        toast.error('Backend not available. Cannot delete users without MongoDB connection.');
        console.error('[ADMIN] ❌ Failed to delete user:', error.message);
      }
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />;
      case 'manager': return <ShieldCheck className="w-4 h-4" />;
      default: return <UserCircle className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" => {
    switch (role) {
      case 'admin': return 'default';
      case 'manager': return 'secondary';
      default: return 'outline';
    }
  };

  const fetchRecipients = async () => {
    try {
      const data = await backendService.getEmailRecipients();
      
      if (data.success) {
        setRecipients(data.recipients);
        // No warning needed - endpoint now implemented
      } else {
        // Silently use defaults if endpoint returns error (likely 404 from old server)
        setRecipients([
          "operations@btmlimited.net",
          "quantityassurance@btmlimited.net",
          "clientcare@btmlimited.net"
        ]);
      }
    } catch (error) {
      // Backend not available - use localStorage
      console.log('[ADMIN] Loading email recipients from localStorage (offline mode)');
      const savedRecipients = localStorage.getItem('btm_email_recipients');
      if (savedRecipients) {
        setRecipients(JSON.parse(savedRecipients));
      } else {
        // Use defaults
        const defaultRecipients = [
          "operations@btmlimited.net",
          "quantityassurance@btmlimited.net",
          "clientcare@btmlimited.net"
        ];
        setRecipients(defaultRecipients);
        localStorage.setItem('btm_email_recipients', JSON.stringify(defaultRecipients));
      }
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const saveRecipients = async () => {
    if (recipients.length === 0) {
      toast.error("Please add at least one email recipient");
      return;
    }

    setIsSavingEmails(true);
    try {
      const data = await backendService.saveEmailRecipients(recipients);
      
      if (data.success) {
        toast.success("Email recipients updated successfully!");
      } else {
        toast.error(data.error || "Failed to update recipients");
      }
    } catch (error) {
      // Fallback to localStorage
      console.log('[EMAIL RECIPIENTS] Saving to localStorage (offline mode)');
      localStorage.setItem('btm_email_recipients', JSON.stringify(recipients));
      toast.success("Email recipients saved locally!");
    } finally {
      setIsSavingEmails(false);
    }
  };

  const addEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = newEmail.trim();

    if (!trimmedEmail) {
      toast.error("Please enter an email address");
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (recipients.includes(trimmedEmail)) {
      toast.error("This email is already in the list");
      return;
    }

    setRecipients([...recipients, trimmedEmail]);
    setNewEmail("");
    toast.success("Email added! Don't forget to save changes.");
  };

  const removeEmail = (emailToRemove: string) => {
    setRecipients(recipients.filter(email => email !== emailToRemove));
    toast.success("Email removed! Don't forget to save changes.");
  };

  // Contact management functions
  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone || !newContact.company) {
      toast.error("Please fill in all required fields (Name, Phone, Company)");
      return;
    }

    try {
      const data = await legacyEndpoints.addContact({
        name: newContact.name,
        phone: newContact.phone,
        email: newContact.email,
        company: newContact.company,
        notes: newContact.notes,
        status: 'pending'
      });

      if (data.success) {
        toast.success(`Contact "${newContact.name}" added successfully!`);
        setNewContact({ name: "", phone: "", email: "", company: "", notes: "" });
        setIsAddContactDialogOpen(false);
      } else {
        // Show the error/info message from the wrapper
        setNewContact({ name: "", phone: "", email: "", company: "", notes: "" });
        setIsAddContactDialogOpen(false);
      }
    } catch (error) {
      console.error('[ADMIN] Failed to add contact:', error);
      toast.error("Failed to add contact");
      setNewContact({ name: "", phone: "", email: "", company: "", notes: "" });
      setIsAddContactDialogOpen(false);
    }
  };

  const handleImportList = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
      
      // Skip header row
      const dataRows = rows.slice(1).filter(row => row.length >= 3 && row[0]);
      
      let successCount = 0;
      let errorCount = 0;

      for (const row of dataRows) {
        try {
          const [name, phone, company, status, lastContact, notes, email] = row;
          
          const data = await legacyEndpoints.addContact({
            name,
            phone,
            email: email || "",
            company,
            notes: notes || "",
            status: status || 'pending',
            lastContact
          });

          if (data.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} contact${successCount > 1 ? 's' : ''}!`);
      }
      if (errorCount > 0) {
        toast.warning(`${errorCount} contact${errorCount > 1 ? 's' : ''} could not be imported.`);
      }
      
      setIsImportDialogOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  const handleExportList = async () => {
    try {
      const data = await legacyEndpoints.getContacts();

      if (data.success) {
        const contacts = data.contacts || [];
        
        const csvContent = [
          ['Name', 'Phone', 'Company', 'Status', 'Last Contact', 'Notes', 'Email'],
          ...contacts.map((c: any) => [
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
        a.download = `btm-contacts-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success("Contact list exported successfully!");
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('[ADMIN] Failed to export contacts:', error);
      toast.error('Failed to export contacts. Please check your connection.');
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      ['Name', 'Phone', 'Company', 'Status', 'Last Contact', 'Notes', 'Email'],
      ['John Doe', '+234 803 123 4567', 'Acme Corp', 'pending', 'Oct 16, 2025', 'Follow up next week', 'john@acme.com'],
      ['Jane Smith', '+234 805 234 5678', 'Tech Solutions', 'completed', 'Oct 15, 2025', 'Deal closed', 'jane@techsolutions.com']
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'btm-contacts-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Template downloaded successfully!");
  };

  // Customer management functions
  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      toast.error("Please fill in all required fields (Name, Email, Phone)");
      return;
    }

    try {
      const data = await backendService.addCustomer({
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        business: newCustomer.business,
        status: newCustomer.status,
        notes: newCustomer.notes
      });

      if (data.success) {
        toast.success(`Customer "${newCustomer.name}" added successfully!`);
        setNewCustomer({ name: "", email: "", phone: "", business: "Online Sales", status: "active", notes: "" });
        setIsAddCustomerDialogOpen(false);
      } else {
        toast.error(data.error || "Failed to add customer. Please try again.");
      }
    } catch (error) {
      console.error('[ADMIN] Failed to add customer:', error);
      toast.error(`Failed to add customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImportCustomers = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
      
      // Skip header row
      const dataRows = rows.slice(1).filter(row => row.length >= 3 && row[0]);
      
      let successCount = 0;
      let errorCount = 0;

      // Batch import all customers
      const customers = [];
      
      for (const row of dataRows) {
        try {
          const [name, email, phone, business, status, lastContact, totalPurchases, totalRevenue, notes] = row;
          
          // Validate business type
          const validBusinessTypes = ["Online Sales", "Corporate", "Channel", "Retails", "Protocol", "Others"];
          const customerBusiness = validBusinessTypes.includes(business) ? business : "Others";
          
          // Validate status
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

      // Import all customers in one call
      try {
        const data = await backendService.importCustomers(customers);
        if (data.success) {
          successCount = customers.length;
        } else {
          errorCount = customers.length;
        }
      } catch (error) {
        errorCount = customers.length;
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} customer${successCount > 1 ? 's' : ''}!`);
      }
      if (errorCount > 0) {
        toast.warning(`${errorCount} customer${errorCount > 1 ? 's' : ''} could not be imported.`);
      }
      
      setIsImportCustomerDialogOpen(false);
      if (customerFileInputRef.current) {
        customerFileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
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
      console.error('[ADMIN] Failed to export customers:', error);
      toast.error('Failed to export customers. Please check backend connection.');
      
      // Fallback - create sample CSV showing format
      const csvContent = [
        ['Name', 'Email', 'Phone', 'Business', 'Status', 'Last Contact', 'Total Purchases', 'Total Revenue', 'Notes'],
        ['Adewale Ogunleye', 'adewale@email.com', '+234 803 111 2222', 'Corporate', 'vip', 'Oct 16, 2025', '15', '4500', 'VIP customer']
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `btm-customers-demo-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Demo customer list exported!");
    }
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

  // Promotion management functions
  const fetchPromotions = async () => {
    try {
      const data = await backendService.getPromotions();
      setPromotions(data.promotions || []);
      console.log('[ADMIN] Loaded promotions:', data.promotions?.length || 0);
    } catch (error: any) {
      // Backend not available - use localStorage
      console.log('[ADMIN] Loading promotions from localStorage (offline mode)');
      const savedPromotions = localStorage.getItem('btm_promotions');
      if (savedPromotions) {
        setPromotions(JSON.parse(savedPromotions));
      } else {
        setPromotions([]);
      }
    }
  };

  const handleAddPromo = async () => {
    if (!newPromo.name || !newPromo.code || !newPromo.discount) {
      toast.error("Please fill in all required fields (Name, Code, Discount)");
      return;
    }

    try {
      const promoData = {
        name: newPromo.name,
        code: newPromo.code.toUpperCase(),
        discount: newPromo.discount,
        website: newPromo.website,
        status: newPromo.status,
        startDate: newPromo.startDate,
        endDate: newPromo.endDate,
        target: parseInt(newPromo.target) || 0,
        usage: parseInt(newPromo.usage) || 0,
        revenue: parseInt(newPromo.revenue) || 0,
        views: parseInt(newPromo.views) || 0,
        conversions: parseInt(newPromo.conversions) || 0,
        targetCustomerTypes: newPromo.targetCustomerTypes || [],
        targetFlights: newPromo.targetFlights || []
      };

      const response = await backendService.addPromotion(promoData);

      if (response.success) {
        toast.success("Promotion created successfully!");
        setIsAddPromoDialogOpen(false);
        setNewPromo({
          name: "",
          code: "",
          discount: "",
          website: "adventure.btmtravel.net",
          status: "active",
          startDate: "",
          endDate: "",
          target: "",
          usage: "0",
          revenue: "0",
          views: "0",
          conversions: "0",
          targetCustomerTypes: [],
          targetFlights: []
        });
        fetchPromotions();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to create promotion");
      }
    } catch (error) {
      // Fallback to localStorage
      console.log('[ADMIN] Saving promotion to localStorage (offline mode)');
      const newPromoWithId = { ...promoData, id: Date.now().toString(), createdAt: new Date().toISOString() };
      const updatedPromotions = [...promotions, newPromoWithId];
      setPromotions(updatedPromotions);
      localStorage.setItem('btm_promotions', JSON.stringify(updatedPromotions));
      toast.success("Promotion created successfully (saved locally)!");
      setIsAddPromoDialogOpen(false);
      setNewPromo({
        name: "",
        code: "",
        discount: "",
        website: "adventure.btmtravel.net",
        status: "active",
        startDate: "",
        endDate: "",
        target: "",
        usage: "0",
        revenue: "0",
        views: "0",
        conversions: "0",
        targetCustomerTypes: [],
        targetFlights: []
      });
    }
  };

  const handleEditPromo = async () => {
    if (!editingPromo) return;
    
    if (!editingPromo.name || !editingPromo.code || !editingPromo.discount) {
      toast.error("Please fill in all required fields (Name, Code, Discount)");
      return;
    }

    try {
      const updateData = {
        name: editingPromo.name,
        code: editingPromo.code.toUpperCase(),
        discount: editingPromo.discount,
        website: editingPromo.website,
        status: editingPromo.status,
        startDate: editingPromo.startDate,
        endDate: editingPromo.endDate,
        target: editingPromo.target,
        usage: editingPromo.usage,
        revenue: editingPromo.revenue,
        views: editingPromo.views,
        conversions: editingPromo.conversions,
        targetCustomerTypes: editingPromo.targetCustomerTypes || [],
        targetFlights: editingPromo.targetFlights || []
      };

      const response = await backendService.updatePromotion(
        editingPromo.id.replace('promotion_', ''),
        updateData
      );

      if (response.success) {
        toast.success("Promotion updated successfully!");
        setIsEditPromoDialogOpen(false);
        setEditingPromo(null);
        fetchPromotions();
      } else {
        toast.error(response.error || "Failed to update promotion");
      }
    } catch (error: any) {
      console.error('[ADMIN] Failed to update promotion:', error);
      toast.error(error.message || "Failed to update promotion");
    }
  };

  const handleDeletePromo = async (promoId: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;

    try {
      const response = await backendService.deletePromotion(promoId.replace('promotion_', ''));

      if (response.success) {
        toast.success("Promotion deleted successfully!");
        fetchPromotions();
      } else {
        toast.error(response.error || "Failed to delete promotion");
      }
    } catch (error: any) {
      console.error('[ADMIN] Failed to delete promotion:', error);
      toast.error(error.message || "Failed to delete promotion");
    }
  };

  const openEditPromoDialog = (promo: any) => {
    setEditingPromo(promo);
    setIsEditPromoDialogOpen(true);
  };

  if (!isAdmin) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-900">
          You do not have permission to access admin settings. Only administrators can manage users and targets.
        </AlertDescription>
      </Alert>
    );
  }

  const navigationItems = [
    { id: 'system-init' as const, label: '🚀 System Setup', icon: Database },
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'daily-progress' as const, label: 'Daily Progress', icon: Target },
    { id: 'counter-reset' as const, label: '🔄 Reset Counters', icon: Settings },
    { id: 'database' as const, label: 'Assign Calls/Database', icon: Database },
    { id: 'mongodb-status' as const, label: 'MongoDB Status', icon: Database },
    { id: 'agent-monitoring' as const, label: 'Agent Monitoring', icon: Eye },
    { id: 'calls' as const, label: 'Call History', icon: Phone },
    { id: 'scripts' as const, label: 'Call Scripts', icon: FileText },
    { id: 'permissions' as const, label: 'Permissions', icon: Key },
    { id: 'archive' as const, label: 'Archive', icon: Archive },
    { id: 'promotions' as const, label: 'Promotions', icon: Tag },
    { id: '3cx' as const, label: '3CX Phone', icon: Phone },
    { id: 'audit' as const, label: 'Audit', icon: Shield },
    { id: 'email' as const, label: 'Email', icon: Mail },
    { id: 'smtp' as const, label: 'SMTP', icon: Server },
    { id: 'system' as const, label: 'System & Data', icon: AlertCircle },
  ];

  const SidebarContent = () => (
    <nav className="space-y-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveSection(item.id);
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Admin Settings
          </h2>
          <p className="text-muted-foreground">Manage users, contacts, email notifications, and system security</p>
        </div>
        
        {/* Mobile Menu Button */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-6">
              <SheetTitle className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Admin Menu
              </SheetTitle>
              <SheetDescription className="sr-only">
                Navigate to different admin sections
              </SheetDescription>
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Card className="bg-white/60 backdrop-blur-xl border-white/20 sticky top-6">
            <CardContent className="p-4">
              <SidebarContent />
            </CardContent>
          </Card>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 space-y-6">
          {activeSection === 'users' && (
            <div className="space-y-6">
              {/* Global Target Settings */}
              <Card className="bg-white/60 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Global Daily Call Target for Agents
                  </CardTitle>
                  <CardDescription>
                    Set the default daily call target for all agents (can be overridden per agent)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1 max-w-xs space-y-2">
                      <Label htmlFor="global-target">Default Daily Target</Label>
                      <Input
                        id="global-target"
                        type="number"
                        min="1"
                        value={globalTarget}
                        onChange={(e) => setGlobalTarget(parseInt(e.target.value) || 0)}
                        className="bg-white/60 backdrop-blur-xl border-white/20"
                      />
                    </div>
                    <Button 
                      onClick={handleSaveGlobalTarget}
                      className="bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/20"
                    >
                      Save Target
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current global target: <strong>{globalTarget} calls per day</strong>
                  </p>
                </CardContent>
              </Card>

              {/* Backend Status Alert */}
              {!backendAvailable && (
                <Alert className="border-2 border-red-500/50 bg-gradient-to-br from-red-50 to-orange-50">
                  <Server className="w-5 h-5 text-red-600" />
                  <AlertDescription className="space-y-4">
                    <div>
                      <p className="font-semibold text-red-900 mb-2">⚠️ Backend Server Not Running</p>
                      <p className="text-sm text-red-800">
                        User management requires MongoDB backend connection. Please start the backend server to manage users.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 bg-black/5 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-semibold text-red-900">Windows:</p>
                        <code className="text-xs bg-black/10 px-2 py-1 rounded block">
                          START-BACKEND-SIMPLE.bat
                        </code>
                      </div>
                      <div className="flex-1 bg-black/5 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-semibold text-red-900">Mac/Linux:</p>
                        <code className="text-xs bg-black/10 px-2 py-1 rounded block">
                          ./START-BACKEND-SIMPLE.sh
                        </code>
                      </div>
                    </div>
                    <Button 
                      onClick={loadSettings}
                      variant="outline"
                      className="w-full border-red-300 bg-white hover:bg-red-50"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Retry Connection
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* User Management */}
              <Card className="bg-white/60 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        User Management
                      </CardTitle>
                      <CardDescription>
                        Create and manage users with different roles, permissions, and call targets
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={handleSyncFromDatabase}
                        className="gap-2"
                      >
                        <Database className="w-4 h-4" />
                        Sync from Database
                      </Button>
                      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20">
                            <Plus className="w-4 h-4 mr-2" />
                            Add User
                          </Button>
                        </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account with role, permissions, and call target
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-username">Username *</Label>
                      <Input
                        id="new-username"
                        placeholder="Enter username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        className="bg-white/60 backdrop-blur-xl border-white/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-name">Full Name *</Label>
                      <Input
                        id="new-name"
                        placeholder="Enter full name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        className="bg-white/60 backdrop-blur-xl border-white/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-email">Email *</Label>
                      <Input
                        id="new-email"
                        type="email"
                        placeholder="Enter email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="bg-white/60 backdrop-blur-xl border-white/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Password *</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="bg-white/60 backdrop-blur-xl border-white/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-role">Role *</Label>
                      <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as any })}>
                        <SelectTrigger className="bg-white/60 backdrop-blur-xl border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agent">Agent</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-target">
                        Custom Daily Target (optional)
                        {newUser.role === 'manager' && <span className="text-muted-foreground ml-2">(N/A for managers)</span>}
                      </Label>
                      <Input
                        id="new-target"
                        type="number"
                        min="1"
                        placeholder={newUser.role === 'manager' ? 'Managers supervise only' : `Default: ${globalTarget} calls`}
                        value={newUser.dailyTarget}
                        onChange={(e) => setNewUser({ ...newUser, dailyTarget: e.target.value })}
                        className="bg-white/60 backdrop-blur-xl border-white/20"
                        disabled={newUser.role === 'manager'}
                      />
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-blue-900 text-sm">
                      {newUser.role === 'manager' ? (
                        <>
                          <strong>Managers</strong> don't make calls - they oversee team performance and manage agent assignments.
                        </>
                      ) : (
                        <>
                          Leave custom target empty to use the global default ({globalTarget} calls).
                          You can set a different target for specific agents if needed.
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddUser}
                    className="bg-gradient-to-br from-green-600 to-emerald-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-sm text-blue-900">
              <strong>💡 Tip:</strong> If users from MongoDB (System Users) don't appear here, click <strong>"Sync from Database"</strong> to sync them to localStorage.
            </AlertDescription>
          </Alert>
          
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Daily Target</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter(user => user != null).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="gap-1">
                        {getRoleIcon(user.role)}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === 'manager' ? (
                        <span className="text-muted-foreground italic">N/A (Supervisor)</span>
                      ) : user.dailyTarget ? (
                        <span className="text-purple-600 font-semibold">{user.dailyTarget} calls</span>
                      ) : (
                        <span className="text-muted-foreground">{globalTarget} calls (default)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {user.role === 'manager' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPermissionsDialog(user)}
                            className="gap-1 bg-purple-50 hover:bg-purple-100 border-purple-200"
                          >
                            <Key className="w-4 h-4" />
                            <span className="hidden sm:inline">Permissions</span>
                          </Button>
                        )}
                        
                        <Dialog open={isEditUserOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                          setIsEditUserOpen(open);
                          if (!open) setEditingUser(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingUser({ ...user });
                                setIsEditUserOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                              <DialogDescription>
                                Update user information and settings
                              </DialogDescription>
                            </DialogHeader>
                            
                            {editingUser && (
                              <div className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Username</Label>
                                    <Input
                                      value={editingUser.username}
                                      onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                      className="bg-white/60 backdrop-blur-xl border-white/20"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input
                                      value={editingUser.name}
                                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                      className="bg-white/60 backdrop-blur-xl border-white/20"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Email</Label>
                                  <Input
                                    type="email"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    className="bg-white/60 backdrop-blur-xl border-white/20"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>New Password (leave empty to keep current)</Label>
                                  <Input
                                    type="password"
                                    placeholder="Enter new password or leave empty"
                                    value={editingUser.password || ""}
                                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                    className="bg-white/60 backdrop-blur-xl border-white/20"
                                  />
                                  <p className="text-sm text-muted-foreground">Only fill this if you want to change the password</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Select 
                                      value={editingUser.role} 
                                      onValueChange={(value) => setEditingUser({ ...editingUser, role: value as any })}
                                    >
                                      <SelectTrigger className="bg-white/60 backdrop-blur-xl border-white/20">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="agent">Agent</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>
                                      Custom Daily Target
                                      {editingUser.role === 'manager' && <span className="text-muted-foreground ml-2">(N/A)</span>}
                                    </Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      placeholder={editingUser.role === 'manager' ? 'Managers supervise only' : `Default: ${globalTarget}`}
                                      value={editingUser.dailyTarget || ""}
                                      onChange={(e) => setEditingUser({ 
                                        ...editingUser, 
                                        dailyTarget: e.target.value ? parseInt(e.target.value) : undefined 
                                      })}
                                      className="bg-white/60 backdrop-blur-xl border-white/20"
                                      disabled={editingUser.role === 'manager'}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            <DialogFooter>
                              <Button variant="outline" onClick={() => {
                                setIsEditUserOpen(false);
                                setEditingUser(null);
                              }}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleUpdateUser}
                                className="bg-gradient-to-br from-violet-600 to-purple-600 text-white"
                              >
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No users found. Click "Add User" to create your first user.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions Info */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <Crown className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Admin:</strong> Full access - manage users, set targets, view all data, generate reports, make calls (optional)
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Manager:</strong> Team oversight - view team performance, monitor agents, generate team reports (does NOT make calls)
            </div>
          </div>
          <div className="flex items-start gap-2">
            <UserCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Agent:</strong> Make calls, update CRM, view own performance, meet daily targets
            </div>
          </div>
        </CardContent>
      </Card>
            </div>
          )}

          {activeSection === 'permissions' && (
            <div className="space-y-6">
              {/* Permission Management Dialog */}
              <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      Manage Permissions - {permissionUser?.name}
                    </DialogTitle>
                    <DialogDescription>
                      Grant specific permissions to {permissionUser?.name} ({permissionUser?.role})
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 mt-4">
                    {['Team Management', 'CRM', 'Customer Service', 'Promotions', 'Security', 'Reporting'].map(category => {
                      const categoryPermissions = allPermissions.filter(p => p.category === category);
                      if (categoryPermissions.length === 0) return null;

                      return (
                        <div key={category} className="space-y-3">
                          <h4 className="font-medium text-sm text-purple-900 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                            {category}
                          </h4>
                          <div className="space-y-3 pl-4">
                            {categoryPermissions.map(permission => (
                              <div key={permission.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-white/50 hover:bg-white/80 transition-colors">
                                <Checkbox
                                  id={permission.id}
                                  checked={selectedPermissions.includes(permission.id)}
                                  onCheckedChange={() => togglePermission(permission.id)}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <label
                                    htmlFor={permission.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    {permission.label}
                                  </label>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSavePermissions}
                      className="bg-gradient-to-br from-purple-600 to-violet-600 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Permissions
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Permissions Overview */}
              <Card className="bg-white/60 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Manager Permissions Overview
                  </CardTitle>
                  <CardDescription>
                    View and manage granular permissions for all managers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.filter(u => u != null && u.role === 'manager').length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Key className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No managers found. Create a manager user first to assign permissions.</p>
                      </div>
                    ) : (
                      users.filter(u => u != null && u.role === 'manager').map(manager => (
                        <Card key={manager.id} className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg">{manager.name}</CardTitle>
                                <CardDescription>@{manager.username} • {manager.email}</CardDescription>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openPermissionsDialog(manager)}
                                className="gap-2 bg-white hover:bg-purple-50"
                              >
                                <Key className="w-4 h-4" />
                                Edit Permissions
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-purple-900">Assigned Permissions:</span>
                                <Badge variant="secondary" className="bg-purple-100 text-purple-900">
                                  {manager.permissions?.length || 0} of {allPermissions.length}
                                </Badge>
                              </div>
                              
                              {manager.permissions && manager.permissions.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {manager.permissions.map(permId => {
                                    const perm = allPermissions.find(p => p.id === permId);
                                    return perm ? (
                                      <Badge key={permId} variant="outline" className="bg-white border-purple-200 text-purple-900">
                                        {perm.label}
                                      </Badge>
                                    ) : null;
                                  })}
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground italic bg-white/50 p-3 rounded-lg border border-purple-100">
                                  No permissions assigned. Click "Edit Permissions" to grant access.
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Permission Categories Guide */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">Permission Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-blue-800">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Team Management:</strong> Oversee agents, view performance, assign tasks
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <BookUser className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>CRM:</strong> Add, edit, and manage contact lists and call assignments
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <ShoppingBag className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Customer Service:</strong> Manage customer database and service records
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Target className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Promotions:</strong> Create and manage promotional campaigns
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Security:</strong> Access audit logs and security monitoring
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Download className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Reporting:</strong> Generate reports and export data
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Daily Progress Section */}
          {activeSection === 'daily-progress' && (
            <DailyProgressManager />
          )}

          {/* Counter Reset Section */}
          {activeSection === 'counter-reset' && (
            <CounterResetManager />
          )}

          {/* Agent Monitoring Section */}
          {activeSection === 'agent-monitoring' && (
            <AgentMonitoring />
          )}

          {/* System Initializer Section */}
          {activeSection === 'system-init' && (
            <div className="space-y-6">
              {/* Backend Diagnostics */}
              <BackendDiagnostics />
              
              {/* System Initializer */}
              <Card className="bg-white/60 backdrop-blur-xl border-white/20 border-2 border-blue-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-6 h-6 text-blue-600" />
                    System Setup & User Initialization
                  </CardTitle>
                  <CardDescription>
                    First-time setup, user management, and system diagnostics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SystemInitializer />
                </CardContent>
              </Card>
            </div>
          )}



          {activeSection === 'audit' && (
            <LoginAudit />
          )}

          {activeSection === 'email' && (
            <div className="space-y-6">
              {/* Email Setup Content */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Backend Connected</p>
                    <p className="text-sm text-muted-foreground">
                      Your CRM is connected to MongoDB. Daily reports are generated with a target of {globalTarget} calls per day.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <Mail className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Daily Report Workflow</p>
                    <p className="text-sm text-muted-foreground">
                      Click "Generate Report" in the Client tab to send a comprehensive daily summary email showing completed and pending calls, with progress toward the {globalTarget}-call target.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Email Service Required</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      To send actual emails, you need to configure an email service provider. Reports are currently logged but not emailed.
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Recommended Options:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">Easiest</Badge>
                          <a 
                            href="https://resend.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            Resend.com <ExternalLink className="w-3 h-3" />
                          </a>
                          - Free tier: 100 emails/day
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">Popular</Badge>
                          <a 
                            href="https://sendgrid.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            SendGrid <ExternalLink className="w-3 h-3" />
                          </a>
                          - Free tier: 100 emails/day
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium mb-2">Quick Setup Steps:</p>
                  <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
                    <li>Sign up for an email service (Resend recommended)</li>
                    <li>Get your API key from the provider</li>
                    <li>Add the API key to your backend environment variables</li>
                    <li>Update the server code to integrate with the provider</li>
                  </ol>
                </div>

                <Card className="bg-white/60 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-green-700" />
                      Email Notification Recipients
                    </CardTitle>
                    <CardDescription>
                      All daily reports will be sent to these email addresses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingEmails ? (
                      <div className="text-sm text-muted-foreground">Loading recipients...</div>
                    ) : (
                      <>
                        <div className="space-y-2 mb-4">
                          {recipients.length === 0 ? (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                              No recipients configured. Add at least one email address below.
                            </div>
                          ) : (
                            recipients.map((email, index) => (
                              <div 
                                key={index}
                                className="flex items-center justify-between p-2 bg-white rounded-lg border border-green-200 group hover:border-green-300 transition-colors"
                              >
                                <span className="text-sm text-green-900">{email}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeEmail(email)}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="space-y-3 pt-3 border-t border-gray-200">
                          <Label htmlFor="new-email-admin" className="text-sm font-medium">
                            Add New Recipient
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="new-email-admin"
                              type="email"
                              placeholder="email@example.com"
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addEmail();
                                }
                              }}
                              className="flex-1 bg-white border-green-200 focus:border-green-400"
                            />
                            <Button
                              onClick={addEmail}
                              variant="outline"
                              className="bg-green-600 text-white hover:bg-green-700 border-green-600"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>

                          <Button
                            onClick={saveRecipients}
                            disabled={isSavingEmails}
                            className="w-full bg-gradient-to-br from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {isSavingEmails ? "Saving..." : "Save Recipients"}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Call Scripts Section */}
          {activeSection === 'scripts' && (
            <CallScriptManager />
          )}

          {/* Promotions Section */}
          {activeSection === 'promotions' && (
            <>
              <Card className="bg-white/60 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      <div>
                        <CardTitle>Promotion Management</CardTitle>
                        <CardDescription>
                          Create, edit, and manage promotions for adventure.btmtravel.net
                        </CardDescription>
                      </div>
                    </div>
                    <Dialog open={isAddPromoDialogOpen} onOpenChange={setIsAddPromoDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-br from-orange-600 to-yellow-600 text-white shadow-lg shadow-orange-500/20">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Promotion
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Promotion</DialogTitle>
                        <DialogDescription>
                          Add a new promotional offer for agents to share with customers
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="promo-name">Promotion Name *</Label>
                            <Input
                              id="promo-name"
                              placeholder="e.g., Summer Special 2025"
                              value={newPromo.name}
                              onChange={(e) => setNewPromo({ ...newPromo, name: e.target.value })}
                              className="bg-white/60"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="promo-code">Promo Code *</Label>
                            <Input
                              id="promo-code"
                              placeholder="e.g., SUMMER25"
                              value={newPromo.code}
                              onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                              className="bg-white/60 font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="promo-discount">Discount *</Label>
                            <Input
                              id="promo-discount"
                              placeholder="e.g., 20% OFF"
                              value={newPromo.discount}
                              onChange={(e) => setNewPromo({ ...newPromo, discount: e.target.value })}
                              className="bg-white/60"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="promo-status">Status</Label>
                            <Select
                              value={newPromo.status}
                              onValueChange={(value: any) => setNewPromo({ ...newPromo, status: value })}
                            >
                              <SelectTrigger className="bg-white/60">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="promo-start">Start Date</Label>
                            <Input
                              id="promo-start"
                              type="date"
                              value={newPromo.startDate}
                              onChange={(e) => setNewPromo({ ...newPromo, startDate: e.target.value })}
                              className="bg-white/60"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="promo-end">End Date</Label>
                            <Input
                              id="promo-end"
                              type="date"
                              value={newPromo.endDate}
                              onChange={(e) => setNewPromo({ ...newPromo, endDate: e.target.value })}
                              className="bg-white/60"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="promo-website">Website</Label>
                          <Input
                            id="promo-website"
                            placeholder="adventure.btmtravel.net"
                            value={newPromo.website}
                            onChange={(e) => setNewPromo({ ...newPromo, website: e.target.value })}
                            className="bg-white/60"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="promo-target">Usage Target</Label>
                            <Input
                              id="promo-target"
                              type="number"
                              placeholder="0"
                              value={newPromo.target}
                              onChange={(e) => setNewPromo({ ...newPromo, target: e.target.value })}
                              className="bg-white/60"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="promo-usage">Current Usage</Label>
                            <Input
                              id="promo-usage"
                              type="number"
                              placeholder="0"
                              value={newPromo.usage}
                              onChange={(e) => setNewPromo({ ...newPromo, usage: e.target.value })}
                              className="bg-white/60"
                            />
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddPromoDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddPromo} className="bg-gradient-to-br from-orange-600 to-yellow-600">
                          Create Promotion
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {promotions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">No promotions yet</p>
                    <p className="text-sm">Create your first promotion to get started</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-orange-50 to-yellow-50">
                          <TableHead>Promotion Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Valid Period</TableHead>
                          <TableHead>Usage</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {promotions.map((promo) => (
                          <TableRow key={promo.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{promo.name}</TableCell>
                            <TableCell>
                              <code className="px-2 py-1 bg-orange-100 text-orange-700 rounded font-mono text-sm">
                                {promo.code}
                              </code>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-orange-600">{promo.discount}</span>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  promo.status === 'active' 
                                    ? 'bg-green-100 text-green-700 border-green-200' 
                                    : promo.status === 'scheduled'
                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                }
                              >
                                {promo.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{promo.startDate || 'N/A'}</div>
                                <div className="text-muted-foreground">to {promo.endDate || 'N/A'}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{promo.usage || 0} / {promo.target || 0}</div>
                                <div className="text-xs text-muted-foreground">
                                  {promo.target > 0 ? `${Math.round((promo.usage / promo.target) * 100)}%` : '0%'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditPromoDialog(promo)}
                                  className="hover:bg-blue-50"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePromo(promo.id)}
                                  className="hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit Promotion Dialog */}
            <Dialog open={isEditPromoDialogOpen} onOpenChange={setIsEditPromoDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Promotion</DialogTitle>
                    <DialogDescription>
                      Update promotion details and settings
                    </DialogDescription>
                  </DialogHeader>
              
                  {editingPromo && (
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-promo-name">Promotion Name *</Label>
                          <Input
                            id="edit-promo-name"
                            value={editingPromo.name}
                            onChange={(e) => setEditingPromo({ ...editingPromo, name: e.target.value })}
                            className="bg-white/60"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-promo-code">Promo Code *</Label>
                          <Input
                            id="edit-promo-code"
                            value={editingPromo.code}
                            onChange={(e) => setEditingPromo({ ...editingPromo, code: e.target.value.toUpperCase() })}
                            className="bg-white/60 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-promo-discount">Discount *</Label>
                          <Input
                            id="edit-promo-discount"
                            value={editingPromo.discount}
                            onChange={(e) => setEditingPromo({ ...editingPromo, discount: e.target.value })}
                            className="bg-white/60"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-promo-status">Status</Label>
                          <Select
                            value={editingPromo.status}
                            onValueChange={(value: any) => setEditingPromo({ ...editingPromo, status: value })}
                          >
                            <SelectTrigger className="bg-white/60">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-promo-start">Start Date</Label>
                          <Input
                            id="edit-promo-start"
                            type="date"
                            value={editingPromo.startDate}
                            onChange={(e) => setEditingPromo({ ...editingPromo, startDate: e.target.value })}
                            className="bg-white/60"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-promo-end">End Date</Label>
                          <Input
                            id="edit-promo-end"
                            type="date"
                            value={editingPromo.endDate}
                            onChange={(e) => setEditingPromo({ ...editingPromo, endDate: e.target.value })}
                            className="bg-white/60"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-promo-website">Website</Label>
                        <Input
                          id="edit-promo-website"
                          value={editingPromo.website}
                          onChange={(e) => setEditingPromo({ ...editingPromo, website: e.target.value })}
                          className="bg-white/60"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-promo-target">Usage Target</Label>
                          <Input
                            id="edit-promo-target"
                            type="number"
                            value={editingPromo.target}
                            onChange={(e) => setEditingPromo({ ...editingPromo, target: parseInt(e.target.value) || 0 })}
                            className="bg-white/60"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-promo-usage">Current Usage</Label>
                          <Input
                            id="edit-promo-usage"
                            type="number"
                            value={editingPromo.usage}
                            onChange={(e) => setEditingPromo({ ...editingPromo, usage: parseInt(e.target.value) || 0 })}
                            className="bg-white/60"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditPromoDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleEditPromo} className="bg-gradient-to-br from-orange-600 to-yellow-600">
                      Update Promotion
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}

          {activeSection === '3cx' && (
            <ThreeCXSettings />
          )}

          {/* Call History Section */}
          {activeSection === 'calls' && (
            <CallHistory />
          )}

          {/* Call Scripts Section */}
          {activeSection === 'scripts' && (
            <CallScriptManager />
          )}

          {/* SMTP Configuration Section */}
          {activeSection === 'smtp' && (
            <SMTPSettings />
          )}

          {/* Database Management Section */}
          {activeSection === 'database' && (
            <DatabaseManager />
          )}

          {/* MongoDB Status Section */}
          {activeSection === 'mongodb-status' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-green-600" />
                    MongoDB Atlas Status
                  </CardTitle>
                  <CardDescription>
                    Monitor your MongoDB database connection and collections
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ConnectionStatus />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Card className="border-2 border-green-200 bg-green-50/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Database className="w-4 h-4 text-green-600" />
                          Database Info
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Platform:</span>
                          <span className="font-mono">MongoDB Atlas</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cluster:</span>
                          <span className="font-mono text-xs">cluster0.vlklc6c.mongodb.net</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Database:</span>
                          <span className="font-mono">btm_travel_crm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Collections:</span>
                          <span className="font-semibold">11</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-200 bg-blue-50/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Server className="w-4 h-4 text-blue-600" />
                          Backend Info
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Runtime:</span>
                          <span className="font-mono">Deno</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Server:</span>
                          <span className="font-mono text-xs">Pure TypeScript</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Endpoints:</span>
                          <span className="font-semibold">40+</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge variant="default" className="bg-green-500">Active</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-2 border-purple-200 bg-purple-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Database className="w-4 h-4 text-purple-600" />
                        Collections Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        {[
                          { name: 'users', label: 'Users' },
                          { name: 'numbers_database', label: 'Numbers Database' },
                          { name: 'number_assignments', label: 'Assignments' },
                          { name: 'call_logs', label: 'Call Logs' },
                          { name: 'call_scripts', label: 'Call Scripts' },
                          { name: 'promotions', label: 'Promotions' },
                          { name: 'daily_progress', label: 'Daily Progress' },
                          { name: 'smtp_settings', label: 'SMTP Settings' },
                          { name: 'threecx_settings', label: '3CX Settings' },
                          { name: 'archive', label: 'Archive' },
                          { name: 'login_audit', label: 'Login Audit' },
                        ].map((collection) => (
                          <div 
                            key={collection.name}
                            className="flex items-center gap-2 p-2 rounded bg-white border border-purple-200"
                          >
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="font-mono text-xs">{collection.label}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Alert className="border-green-200 bg-green-50">
                    <Database className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Database Active:</strong> Your MongoDB Atlas database is connected and all collections are indexed for optimal performance. Connection is managed automatically by the backend.
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-blue-200 bg-blue-50">
                    <Server className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Manage Database:</strong> Access your MongoDB dashboard at{' '}
                      <a 
                        href="https://cloud.mongodb.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-900"
                      >
                        cloud.mongodb.com
                      </a>
                      {' '}to view metrics, backups, and advanced settings.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Archive Management Section */}
          {activeSection === 'archive' && (
            <ArchiveManager />
          )}

          {/* System & Data Management Section */}
          {activeSection === 'system' && (
            <SystemDataManagement />
          )}
        </div>
      </div>
    </div>
  );
}


// System & Data Management Component
function SystemDataManagement() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Checkbox states for each data category
  const [deleteCategories, setDeleteCategories] = useState({
    clientCRM: false,
    contacts: false,
    customers: false,
    callHistory: false,
    promotions: false,
    dailyProgress: false,
    archived: false,
    emailSettings: false,
    callScripts: false,
    notifications: false,
  });

  const dataCategories = [
    { id: 'clientCRM', label: 'ClientCRM data (prospective clients)', dbPrefix: 'client_crm_', localKeys: ['clientCRM', 'assigned_clients_', 'client_notes_', 'client_interactions_'] },
    { id: 'contacts', label: 'All contacts and customers', dbPrefix: 'contact_', localKeys: ['contacts', 'assigned_clients_'] },
    { id: 'customers', label: 'All customer records', dbPrefix: 'customer_', localKeys: ['customers', 'assigned_customers_'] },
    { id: 'callHistory', label: 'All call history and logs', dbPrefix: 'call_log_', localKeys: ['callHistory', 'call_logs'] },
    { id: 'promotions', label: 'All promotions and campaigns', dbPrefix: 'promotion_', localKeys: ['promotions', 'assigned_promotions_'] },
    { id: 'dailyProgress', label: 'All daily progress records', dbPrefix: 'daily_progress_', localKeys: ['dailyProgress', 'dailyReports'] },
    { id: 'archived', label: 'All archived data', dbPrefix: 'archived_', localKeys: ['archivedContacts', 'archivedCustomers'] },
    { id: 'emailSettings', label: 'All email settings and configurations', dbPrefix: 'email_', localKeys: ['emailSettings', 'email_recipients', 'smtp_configuration'] },
    { id: 'callScripts', label: 'All call scripts', dbPrefix: 'call_script_', localKeys: ['callScripts'] },
    { id: 'notifications', label: 'All notification history', dbPrefix: 'notification_', localKeys: ['notifications'] },
  ];

  const toggleCategory = (categoryId: string) => {
    setDeleteCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const toggleAll = (checked: boolean) => {
    const newState: any = {};
    Object.keys(deleteCategories).forEach(key => {
      newState[key] = checked;
    });
    setDeleteCategories(newState);
  };

  const selectedCount = Object.values(deleteCategories).filter(Boolean).length;

  const handleClearClientCRM = async () => {
    const confirmation = prompt('⚠️ CLEAR ALL CLIENTCRM DATA?\n\nThis will permanently delete:\n• All clients in the database\n• All archived clients  \n• All assigned clients for all agents\n\nType "CLEAR" to confirm:');
    
    if (confirmation !== 'CLEAR') {
      if (confirmation !== null) {
        toast.error('Confirmation text did not match. Operation cancelled.');
      }
      return;
    }

    try {
      console.log('[ADMIN] 🗑️ Clearing all ClientCRM data...');
      toast.info('Clearing ClientCRM data...');

      const data = await backendService.clearAllClientCRMData();

      if (data.success) {
        console.log('[ADMIN] ✅ ClientCRM data cleared:', data);
        console.log('[ADMIN] Cleared counts:', data.cleared);
        toast.success(`✅ ClientCRM cleared! (${data.cleared?.assignedClientsCount || 0} assigned records deleted)`);
        
        // Reload page after 1.5 seconds
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        console.error('[ADMIN] ❌ Failed to clear ClientCRM data:', data);
        toast.error(`Failed to clear data: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('[ADMIN] ❌ Error clearing ClientCRM data:', error);
      toast.error(`Error clearing ClientCRM data: ${error.message}`);
    }
  };

  const handleDeleteSelectedData = async () => {
    if (selectedCount === 0) {
      toast.error('Please select at least one category to delete');
      return;
    }

    if (confirmationText !== 'DELETE_SELECTED_DATA') {
      toast.error('Confirmation code does not match');
      return;
    }

    setIsDeleting(true);

    try {
      // Get selected categories
      const selectedCategories = Object.entries(deleteCategories)
        .filter(([_, checked]) => checked)
        .map(([id, _]) => id);

      // Delete from server/database
      const result = await backendService.deleteSelectedData('DELETE_SELECTED_DATA', selectedCategories);

      if (result.success) {
        toast.success(`Deleted ${result.deletedCount || 'selected'} items from database`);
        
        // Clear localStorage for selected categories
        // CRITICAL: These keys must ALWAYS be preserved to prevent app from going blank
        const keysToPreserve = [
          'btm_current_user',        // User session - CRITICAL for login
          'btm_calls_today',         // Daily call counter
          'btm_last_reset_date',     // Last reset date for daily progress
          'users',                   // User management data
          'threecx_config',          // 3CX phone system configuration
          'call_history',            // 3CX call history
          'loginAuditLogs'           // Login audit logs
        ];
        
        console.log('[DELETE] Keys to preserve:', keysToPreserve);
        console.log('[DELETE] Current localStorage keys before deletion:', Object.keys(localStorage));
        
        let deletedCount = 0;
        selectedCategories.forEach(categoryId => {
          const category = dataCategories.find(c => c.id === categoryId);
          if (category) {
            console.log(`[DELETE] Processing category: ${categoryId}, localKeys:`, category.localKeys);
            category.localKeys.forEach(keyPattern => {
              // Check if it's a prefix pattern (ends with _)
              if (keyPattern.endsWith('_')) {
                // Remove all keys starting with this prefix
                Object.keys(localStorage).forEach(key => {
                  if (key.startsWith(keyPattern) && !keysToPreserve.includes(key)) {
                    console.log(`[DELETE] Removing localStorage key (prefix match): ${key}`);
                    localStorage.removeItem(key);
                    deletedCount++;
                  } else if (key.startsWith(keyPattern)) {
                    console.log(`[DELETE] PRESERVED key (in preserve list): ${key}`);
                  }
                });
              } else {
                // Remove exact key
                if (!keysToPreserve.includes(keyPattern)) {
                  console.log(`[DELETE] Removing localStorage key (exact match): ${keyPattern}`);
                  localStorage.removeItem(keyPattern);
                  deletedCount++;
                } else {
                  console.log(`[DELETE] PRESERVED key (in preserve list): ${keyPattern}`);
                }
              }
            });
          }
        });
        
        console.log('[DELETE] Remaining localStorage keys after deletion:', Object.keys(localStorage));
        console.log('[DELETE] Total localStorage keys deleted:', deletedCount);
        
        toast.success(`Cleared ${deletedCount} items from localStorage`);
        
        setIsDeleteDialogOpen(false);
        setConfirmationText('');
        setDeleteCategories({
          clientCRM: false,
          contacts: false,
          customers: false,
          callHistory: false,
          promotions: false,
          dailyProgress: false,
          archived: false,
          emailSettings: false,
          callScripts: false,
          notifications: false,
        });
        
        // Verify user session is still preserved before reload
        const userSession = localStorage.getItem('btm_current_user');
        console.log('[DELETE] ═══════════════════════════════════════');
        console.log('[DELETE] FINAL CHECK BEFORE RELOAD');
        console.log('[DELETE] User session (btm_current_user):', userSession ? '✅ EXISTS' : '❌ MISSING');
        console.log('[DELETE] All localStorage keys:', Object.keys(localStorage));
        console.log('[DELETE] ═══════════════════════════════════════');
        
        if (!userSession) {
          console.error('[DELETE] 🚨 CRITICAL ERROR: User session was deleted!');
          console.error('[DELETE] This will cause the app to show the login screen!');
          toast.error('CRITICAL: User session was lost! Please do not reload.');
          return; // DON'T RELOAD if user session is missing
        }
        
        // Reload page after 2 seconds to reset all state
        toast.info('Reloading page in 2 seconds...');
        setTimeout(() => {
          console.log('[DELETE] Reloading page now...');
          window.location.reload();
        }, 2000);
      } else {
        toast.error(result.error || 'Failed to delete database');
      }
    } catch (error: any) {
      // Silently fail if server is offline, but still clear localStorage
      if (error.message && error.message.includes('Backend')) {
        toast.info('Server offline - clearing localStorage only...');
        
        // Clear localStorage for selected categories even if server is offline
        const selectedCategories = Object.entries(deleteCategories)
          .filter(([_, checked]) => checked)
          .map(([id, _]) => id);

        // CRITICAL: These keys must ALWAYS be preserved to prevent app from going blank
        const keysToPreserve = [
          'btm_current_user',        // User session - CRITICAL for login
          'btm_calls_today',         // Daily call counter
          'btm_last_reset_date',     // Last reset date for daily progress
          'users',                   // User management data
          'threecx_config',          // 3CX phone system configuration
          'call_history',            // 3CX call history
          'loginAuditLogs'           // Login audit logs
        ];
        
        console.log('[DELETE OFFLINE] Keys to preserve:', keysToPreserve);
        console.log('[DELETE OFFLINE] Current localStorage keys before deletion:', Object.keys(localStorage));
        
        let deletedCount = 0;
        selectedCategories.forEach(categoryId => {
          const category = dataCategories.find(c => c.id === categoryId);
          if (category) {
            console.log(`[DELETE OFFLINE] Processing category: ${categoryId}, localKeys:`, category.localKeys);
            category.localKeys.forEach(keyPattern => {
              if (keyPattern.endsWith('_')) {
                Object.keys(localStorage).forEach(key => {
                  if (key.startsWith(keyPattern) && !keysToPreserve.includes(key)) {
                    console.log(`[DELETE OFFLINE] Removing localStorage key (prefix match): ${key}`);
                    localStorage.removeItem(key);
                    deletedCount++;
                  } else if (key.startsWith(keyPattern)) {
                    console.log(`[DELETE OFFLINE] PRESERVED key (in preserve list): ${key}`);
                  }
                });
              } else {
                if (!keysToPreserve.includes(keyPattern)) {
                  console.log(`[DELETE OFFLINE] Removing localStorage key (exact match): ${keyPattern}`);
                  localStorage.removeItem(keyPattern);
                  deletedCount++;
                } else {
                  console.log(`[DELETE OFFLINE] PRESERVED key (in preserve list): ${keyPattern}`);
                }
              }
            });
          }
        });
        
        console.log('[DELETE OFFLINE] Remaining localStorage keys after deletion:', Object.keys(localStorage));
        console.log('[DELETE OFFLINE] Total localStorage keys deleted:', deletedCount);
        
        toast.success('Selected data cleared from localStorage!');
        setIsDeleteDialogOpen(false);
        setConfirmationText('');
        setDeleteCategories({
          clientCRM: false,
          contacts: false,
          customers: false,
          callHistory: false,
          promotions: false,
          dailyProgress: false,
          archived: false,
          emailSettings: false,
          callScripts: false,
          notifications: false,
        });
        
        // Verify user session is still preserved before reload
        const userSession = localStorage.getItem('btm_current_user');
        console.log('[DELETE OFFLINE] ══════════════��════════════════════════');
        console.log('[DELETE OFFLINE] FINAL CHECK BEFORE RELOAD');
        console.log('[DELETE OFFLINE] User session (btm_current_user):', userSession ? '✅ EXISTS' : '❌ MISSING');
        console.log('[DELETE OFFLINE] All localStorage keys:', Object.keys(localStorage));
        console.log('[DELETE OFFLINE] ═══════════════════════════════════════');
        
        if (!userSession) {
          console.error('[DELETE OFFLINE] 🚨 CRITICAL ERROR: User session was deleted!');
          console.error('[DELETE OFFLINE] This will cause the app to show the login screen!');
          toast.error('CRITICAL: User session was lost! Please do not reload.');
          return; // DON'T RELOAD if user session is missing
        }
        
        toast.info('Reloading page in 2 seconds...');
        setTimeout(() => {
          console.log('[DELETE OFFLINE] Reloading page now...');
          window.location.reload();
        }, 2000);
      } else {
        console.error('[SYSTEM] Error deleting data:', error);
        toast.error('Failed to delete data');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Clear ClientCRM Data */}
      <Card className="bg-white/60 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Trash2 className="w-5 h-5" />
            Quick Clear ClientCRM Data
          </CardTitle>
          <CardDescription>
            Instantly clear all prospective client data from the CRM system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-orange-200 bg-orange-50 mb-4">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Warning:</strong> This will delete all clients in the database, all archived clients, and all assigned clients for all agents.
            </AlertDescription>
          </Alert>
          
          <Button
            onClick={handleClearClientCRM}
            variant="destructive"
            className="bg-gradient-to-br from-orange-600 to-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All ClientCRM Data
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/60 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect all system data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Warning:</strong> The following actions cannot be undone. Use with extreme caution.
            </AlertDescription>
          </Alert>

          <div className="p-6 border-2 border-red-200 rounded-lg bg-red-50/50 space-y-4">
            <div>
              <h3 className="font-semibold text-red-900 flex items-center gap-2 mb-3">
                <Database className="w-5 h-5" />
                Delete System Data
              </h3>
              <p className="text-sm text-red-700 mb-4">
                Select data categories to permanently delete from both database and localStorage:
              </p>

              {/* Select All Checkbox */}
              <div className="mb-3 pb-3 border-b border-red-300">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedCount === dataCategories.length}
                    onCheckedChange={toggleAll}
                    className="border-red-400 data-[state=checked]:bg-red-600"
                  />
                  <Label
                    htmlFor="select-all"
                    className="text-sm font-semibold text-red-900 cursor-pointer"
                  >
                    Select All ({selectedCount}/{dataCategories.length} selected)
                  </Label>
                </div>
              </div>

              {/* Individual Category Checkboxes */}
              <div className="space-y-2">
                {dataCategories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={deleteCategories[category.id as keyof typeof deleteCategories]}
                      onCheckedChange={() => toggleCategory(category.id)}
                      className="border-red-400 data-[state=checked]:bg-red-600"
                    />
                    <Label
                      htmlFor={category.id}
                      className="text-sm text-red-800 cursor-pointer hover:text-red-900"
                    >
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>

              <p className="text-sm text-red-700 mt-4 pt-3 border-t border-red-300 font-semibold">
                ⚠️ User accounts and login data will be preserved
              </p>
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive"
                  className="bg-gradient-to-br from-red-600 to-red-700 text-white"
                  disabled={selectedCount === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected Data {selectedCount > 0 && `(${selectedCount})`}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    Confirm Data Deletion
                  </DialogTitle>
                  <DialogDescription>
                    You are about to delete <strong>{selectedCount} categories</strong> of data. This action is <strong>PERMANENT</strong> and cannot be undone.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 text-sm">
                      The following data will be permanently deleted:
                    </AlertDescription>
                  </Alert>

                  {/* Show selected categories */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <ul className="text-sm text-red-800 space-y-1">
                      {dataCategories
                        .filter(cat => deleteCategories[cat.id as keyof typeof deleteCategories])
                        .map(cat => (
                          <li key={cat.id} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-red-600" />
                            {cat.label}
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmation" className="text-sm font-semibold">
                      Type <code className="bg-red-100 px-2 py-1 rounded text-xs">DELETE_SELECTED_DATA</code> to confirm:
                    </Label>
                    <Input
                      id="confirmation"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="Type confirmation code..."
                      className="font-mono text-sm"
                      disabled={isDeleting}
                    />
                  </div>

                  {confirmationText && confirmationText !== 'DELETE_SELECTED_DATA' && (
                    <p className="text-sm text-red-600">
                      ⚠️ Confirmation code does not match
                    </p>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDeleteDialogOpen(false);
                      setConfirmationText('');
                    }}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteSelectedData}
                    disabled={confirmationText !== 'DELETE_SELECTED_DATA' || isDeleting}
                    className="bg-gradient-to-br from-red-600 to-red-700"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Selected Data
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/50">
            <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
              <Server className="w-4 h-4" />
              System Information
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Database: MongoDB</p>
              <p>• Local Storage: Browser localStorage</p>
              <p>• Last Updated: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
