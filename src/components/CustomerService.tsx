import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Mail, Phone, User, Calendar as CalendarIcon, ShoppingBag, Search, Plus, Pencil, Trash2, Download, Briefcase, UserPlus, Upload, PhoneCall, ChevronDown, Clock, Tag, TrendingUp, Archive, ArchiveRestore, Eye, AlertCircle, CheckCircle, XCircle, FileText, FileDown, Presentation, Headphones, RefreshCw, CheckCircle2, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { DialogFooter } from "./ui/dialog";
import { Calendar } from "./ui/calendar";
import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';
import logoImage from 'figma:asset/da4baf9e9e75fccb7e053a2cc52f5b251f4636a9.png';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner@2.0.3";
import { useUser } from "./UserContext";
import { useThreeCX } from "./ThreeCXContext";
import { DraggableDialog } from './DraggableDialog';
import { backendService } from '../utils/backendService';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  business: "Online Sales" | "Corporate" | "Channel" | "Retails" | "Protocol" | "Others";
  status: "active" | "inactive" | "vip" | "corporate";
  totalPurchases: number;
  purchaseHistory: {
    id: string;
    date: string;
    product: string;
    amount: number;
    status: string;
  }[];
  notes: string;
  bookingReference?: string;
  destination?: string;
  travelDate?: string;
  packageType?: string;
  customerType?: 'Retails' | 'Corporate' | 'Channel';
  flightInfo?: string;
  createdAt?: string;
  interactionCompleted?: boolean;
}

// Helper function to ensure all customers have unique IDs
const ensureUniqueIds = (customerList: Customer[]): Customer[] => {
  const seenIds = new Set<string>();
  return customerList.map(customer => {
    if (seenIds.has(customer.id)) {
      const newId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.warn(`[CUSTOMER SERVICE] Duplicate ID detected: ${customer.id}, reassigning to ${newId}`);
      seenIds.add(newId);
      return { ...customer, id: newId };
    }
    seenIds.add(customer.id);
    return customer;
  });
};

export function CustomerService() {
  const { isManager, isAdmin, currentUser, incrementCallCount } = useUser();
  const { makeCall, config } = useThreeCX();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [archivedCustomers, setArchivedCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [responseNote, setResponseNote] = useState("");
  const [latestPromotions, setLatestPromotions] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewCustomers, setPreviewCustomers] = useState<Customer[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    business: "Online Sales" as "Online Sales" | "Corporate" | "Channel" | "Retails" | "Protocol" | "Others",
    status: "active" as "active" | "inactive" | "vip" | "corporate",
    notes: ""
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<Customer[]>([]);
  const [parseError, setParseError] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<{ id: string; date: string; product: string; amount: number; status: string; } | null>(null);
  const [purchaseForm, setPurchaseForm] = useState({
    date: "",
    product: "",
    amount: "",
    status: "Completed"
  });
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly" | "custom">("daily");
  const [reportFormat, setReportFormat] = useState<"html" | "csv" | "pdf" | "pptx">("html");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);
  const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false);
  const [isEditCustomerDialogOpen, setIsEditCustomerDialogOpen] = useState(false);
  const [editCustomerForm, setEditCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    business: "Online Sales" as "Online Sales" | "Corporate" | "Channel" | "Retails" | "Protocol" | "Others",
    status: "active" as "active" | "inactive" | "vip" | "corporate",
    notes: ""
  });
  const [isEmailSectionOpen, setIsEmailSectionOpen] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState<string>("custom");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [callScript, setCallScript] = useState({
    greeting: "Hi [Name], this is [Your Name] calling from BTM Travel. How are you today?",
    purpose: "I'm calling to assist with your travel needs and ensure you have the best experience with our services.",
    discovery: [
      "How can I assist you with your current booking or travel plans?",
      "Are you aware of our latest travel promotions and packages?",
      "Is there anything specific you'd like to know about our services?"
    ],
    closing: "Thank you for your time. We're here to help anytime. Have a great day!"
  });
  const [isLoadingScript, setIsLoadingScript] = useState(true);
  const [isCallScriptOpen, setIsCallScriptOpen] = useState(false);
  const [isPurchaseHistoryOpen, setIsPurchaseHistoryOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [interactionOutcome, setInteractionOutcome] = useState<"resolved" | "escalated" | "follow-up" | "information-provided">("resolved");
  const [isCompletingInteraction, setIsCompletingInteraction] = useState(false);

  useEffect(() => {
    if (!isReportDialogOpen) {
      setStartDatePopoverOpen(false);
      setEndDatePopoverOpen(false);
    }
  }, [isReportDialogOpen]);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const data = await backendService.getPromotions();
        if (data.success) {
          const activePromos = (data.promotions || [])
            .filter((p: any) => p.status === 'active')
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
          setLatestPromotions(activePromos);
        }
      } catch (error: any) {
        const { isDatabaseInitializing } = await import('../utils/backendService');
        if (isDatabaseInitializing(error)) return;
        if (!(error instanceof TypeError && error.message.includes('fetch'))) {
          console.error('[CUSTOMER SERVICE] Failed to fetch promotions:', error);
        }
      }
    };

    const loadActiveScript = async () => {
      try {
        setIsLoadingScript(true);
        const data = await backendService.getActiveCallScript('existing');
        if (data.success && data.script) {
          setCallScript(data.script);
        }
      } catch (error) {
        console.error('[CUSTOMER SERVICE] Error loading existing client call script:', error);
      } finally {
        setIsLoadingScript(false);
      }
    };

    const loadCustomers = async () => {
      try {
        if (!currentUser) {
          console.log('[CUSTOMER SERVICE] No current user, skipping customer load');
          setCustomers([]);
          return;
        }
        console.log('[CUSTOMER SERVICE] Loading customers for agent:', currentUser.id, currentUser.name);
        const data = await backendService.getAssignedCustomers(currentUser.id);
        if (data.success) {
          if (data.customers && data.customers.length > 0) {
            console.log(`[CUSTOMER SERVICE] ✅ Loaded ${data.customers.length} assigned customers for agent ${currentUser.name}`);
            const transformedCustomers: Customer[] = data.customers.map((record: any) => ({
              id: record.id || `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: record.name || 'Unknown',
              email: record.email || '',
              phone: record.phone || '',
              company: record.company || '',
              business: record.packageType || record.customerType || 'Others',
              status: 'active',
              totalPurchases: 0,
              purchaseHistory: [],
              notes: record.notes || '',
              bookingReference: record.bookingReference || '',
              destination: record.destination || '',
              travelDate: record.travelDate || '',
              packageType: record.packageType || '',
              customerType: record.customerType || undefined,
              flightInfo: record.flightInfo || '',
              createdAt: record.createdAt || new Date().toISOString(),
              interactionCompleted: record.interactionCompleted || false
            }));
            const uniqueCustomers = ensureUniqueIds(transformedCustomers);
            setCustomers(uniqueCustomers);
          } else {
            console.log('[CUSTOMER SERVICE] No customers assigned to agent', currentUser.name);
            setCustomers([]);
          }
        } else {
          console.warn('[CUSTOMER SERVICE] Failed to load assigned customers from database');
          setCustomers([]);
        }
      } catch (error) {
        console.error('[CUSTOMER SERVICE] Failed to load customers:', error);
        setCustomers([]);
      }
    };

    const loadArchivedCustomers = async () => {
      try {
        const data = await backendService.getArchivedCustomers();
        if (data.success) {
          if (data.customers && Array.isArray(data.customers)) {
            const uniqueArchived = ensureUniqueIds(data.customers);
            setArchivedCustomers(uniqueArchived);
            if (JSON.stringify(uniqueArchived) !== JSON.stringify(data.customers)) {
              console.log('[CUSTOMER SERVICE] Duplicate IDs found in archived customers, saving corrected data');
              saveArchivedCustomersToBackend(uniqueArchived);
            }
          }
        }
      } catch (error) {
        setArchivedCustomers([]);
      }
    };

    fetchPromotions();
    loadActiveScript();
    loadCustomers();
    loadArchivedCustomers();
  }, [currentUser]);

  const saveCustomersToBackend = async (customersToSave: Customer[]) => {
    try {
      const result = await backendService.addCustomer({ customers: customersToSave });
      if (!result.success) {
        console.error('[CUSTOMER SERVICE] Failed to save customers to backend');
      } else {
        console.log('[CUSTOMER SERVICE] Customers saved successfully');
      }
    } catch (error) {
      console.error('[CUSTOMER SERVICE] Error saving customers:', error);
    }
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    const updatedCustomers = customers.filter(c => c.id !== customerToDelete.id);
    setCustomers(updatedCustomers);
    await saveCustomersToBackend(updatedCustomers);
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
    toast.success("Customer deleted successfully");
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerIds(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomerIds.length === filteredCustomers.length && filteredCustomers.length > 0) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(filteredCustomers.map(c => c.id));
    }
  };

  const handleArchiveSelected = () => {
    if (selectedCustomerIds.length === 0) {
      toast.error("Please select customers to archive");
      return;
    }
    setArchiveDialogOpen(true);
  };

  const handleConfirmArchive = async () => {
    const customersToArchive = customers.filter(c => selectedCustomerIds.includes(c.id));
    const updatedCustomers = customers.filter(c => !selectedCustomerIds.includes(c.id));
    const updatedArchived = [...archivedCustomers, ...customersToArchive];
    setCustomers(updatedCustomers);
    setArchivedCustomers(updatedArchived);
    await saveCustomersToBackend(updatedCustomers);
    await saveArchivedCustomersToBackend(updatedArchived);
    setSelectedCustomerIds([]);
    setArchiveDialogOpen(false);
    toast.success(`${customersToArchive.length} customer(s) archived successfully`);
  };

  const handleRestoreSelected = async () => {
    const customersToRestore = archivedCustomers.filter(c => selectedCustomerIds.includes(c.id));
    const updatedArchived = archivedCustomers.filter(c => !selectedCustomerIds.includes(c.id));
    const existingIds = new Set(customers.map(c => c.id));
    const restoredCustomers = customersToRestore.map(customer => {
      if (existingIds.has(customer.id)) {
        return {
          ...customer,
          id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      }
      return customer;
    });
    const updatedCustomers = [...customers, ...restoredCustomers];
    setCustomers(updatedCustomers);
    setArchivedCustomers(updatedArchived);
    await saveCustomersToBackend(updatedCustomers);
    await saveArchivedCustomersToBackend(updatedArchived);
    setSelectedCustomerIds([]);
    toast.success(`${customersToRestore.length} customer(s) restored successfully`);
  };

  const saveArchivedCustomersToBackend = async (archivedCustomersList: Customer[]) => {
    try {
      for (const customer of archivedCustomersList) {
        await backendService.archiveCustomer(customer);
      }
    } catch (error) {
      console.error('[CUSTOMER SERVICE] Error saving archived customers:', error);
    }
  };

  const displayCustomers = showArchived ? archivedCustomers : customers;
  const filteredCustomers = displayCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setResponseNote("");
    setEmailSubject("");
    setEmailMessage("");
    setEmailTemplate("custom");
    setIsEmailSectionOpen(false);
    setIsDialogOpen(true);
  };

  const handleMakeCall = (phoneNumber: string, contactName?: string) => {
    makeCall(phoneNumber, contactName);
    incrementCallCount();
    toast.success(`Call initiated to ${contactName || phoneNumber}`);
  };

  const handleSendResponse = () => {
    if (selectedCustomer && responseNote.trim()) {
      const updatedCustomers = customers.map(c =>
        c.id === selectedCustomer.id
          ? { ...c, notes: `${c.notes}\n\n[${new Date().toLocaleDateString()}] ${responseNote}`, lastContact: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
          : c
      );
      setCustomers(updatedCustomers);
      saveCustomersToBackend(updatedCustomers);
      toast.success("Note added! Remember to 'Complete Interaction' when done with this customer.", { duration: 4000 });
      setResponseNote("");
    }
  };

  const handleAddPurchase = () => {
    if (!selectedCustomer) return;
    if (!purchaseForm.date.trim()) {
      toast.error("Please enter purchase date");
      return;
    }
    if (!purchaseForm.product.trim()) {
      toast.error("Please enter product/service name");
      return;
    }
    if (!purchaseForm.amount || parseFloat(purchaseForm.amount) <= 0) {
      toast.error("Please enter valid amount");
      return;
    }
    const newPurchase = {
      id: `P${Date.now()}`,
      date: purchaseForm.date,
      product: purchaseForm.product,
      amount: parseFloat(purchaseForm.amount),
      status: purchaseForm.status
    };
    const updatedCustomers = customers.map(c => 
      c.id === selectedCustomer.id 
        ? { 
            ...c, 
            purchaseHistory: [...c.purchaseHistory, newPurchase],
            totalPurchases: c.totalPurchases + 1
          } 
        : c
    );
    setCustomers(updatedCustomers);
    saveCustomersToBackend(updatedCustomers);
    setSelectedCustomer({
      ...selectedCustomer,
      purchaseHistory: [...selectedCustomer.purchaseHistory, newPurchase],
      totalPurchases: selectedCustomer.totalPurchases + 1
    });
    setPurchaseForm({
      date: "",
      product: "",
      amount: "",
      status: "Completed"
    });
    toast.success("Purchase added successfully!");
    setIsPurchaseDialogOpen(false);
  };

  const handleEditPurchase = () => {
    if (!selectedCustomer || !editingPurchase) return;
    if (!purchaseForm.date.trim()) {
      toast.error("Please enter purchase date");
      return;
    }
    if (!purchaseForm.product.trim()) {
      toast.error("Please enter product/service name");
      return;
    }
    if (!purchaseForm.amount || parseFloat(purchaseForm.amount) <= 0) {
      toast.error("Please enter valid amount");
      return;
    }
    const updatedPurchase = {
      id: editingPurchase.id,
      date: purchaseForm.date,
      product: purchaseForm.product,
      amount: parseFloat(purchaseForm.amount),
      status: purchaseForm.status
    };
    const updatedCustomers = customers.map(c => 
      c.id === selectedCustomer.id 
        ? { 
            ...c, 
            purchaseHistory: c.purchaseHistory.map(p => 
              p.id === editingPurchase.id ? updatedPurchase : p
            )
          } 
        : c
    );
    setCustomers(updatedCustomers);
    saveCustomersToBackend(updatedCustomers);
    setSelectedCustomer({
      ...selectedCustomer,
      purchaseHistory: selectedCustomer.purchaseHistory.map(p => 
        p.id === editingPurchase.id ? updatedPurchase : p
      )
    });
    setPurchaseForm({
      date: "",
      product: "",
      amount: "",
      status: "Completed"
    });
    setEditingPurchase(null);
    toast.success("Purchase updated successfully!");
    setIsPurchaseDialogOpen(false);
  };

  const handleDeletePurchase = (purchaseId: string) => {
    if (!selectedCustomer) return;
    const updatedCustomers = customers.map(c => 
      c.id === selectedCustomer.id 
        ? { 
            ...c, 
            purchaseHistory: c.purchaseHistory.filter(p => p.id !== purchaseId),
            totalPurchases: Math.max(0, c.totalPurchases - 1)
          } 
        : c
    );
    setCustomers(updatedCustomers);
    saveCustomersToBackend(updatedCustomers);
    setSelectedCustomer({
      ...selectedCustomer,
      purchaseHistory: selectedCustomer.purchaseHistory.filter(p => p.id !== purchaseId),
      totalPurchases: Math.max(0, selectedCustomer.totalPurchases - 1)
    });
    toast.success("Purchase deleted successfully!");
  };

  const openAddPurchaseDialog = () => {
    setEditingPurchase(null);
    setPurchaseForm({
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      product: "",
      amount: "",
      status: "Completed"
    });
    setIsPurchaseDialogOpen(true);
  };

  const openEditPurchaseDialog = (purchase: { id: string; date: string; product: string; amount: number; status: string; }) => {
    setEditingPurchase(purchase);
    setPurchaseForm({
      date: purchase.date,
      product: purchase.product,
      amount: purchase.amount.toString(),
      status: purchase.status
    });
    setIsPurchaseDialogOpen(true);
  };

  const handleCompleteInteraction = async () => {
    if (!selectedCustomer) return;
    if (!completionNotes.trim()) {
      toast.error("Please add notes about this interaction");
      return;
    }
    setIsCompletingInteraction(true);
    try {
      const interaction = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        agentName: currentUser?.fullName || currentUser?.username || 'Unknown',
        agentUsername: currentUser?.username || 'Unknown',
        outcome: interactionOutcome,
        notes: completionNotes,
        completedAt: new Date().toISOString(),
        timestamp: new Date().toLocaleString('en-US', { 
          dateStyle: 'medium', 
          timeStyle: 'short' 
        })
      };
      const response = await backendService.logCustomerInteraction(selectedCustomer.id, interaction);
      if (!response.success) {
        throw new Error(response.error || 'Failed to save interaction');
      }
      const updatedNote = `[${interaction.timestamp}] ${currentUser?.fullName || currentUser?.username} - ${interactionOutcome.toUpperCase()}: ${completionNotes}\n\n${selectedCustomer.notes || ''}`;
      
      // Create customer with updated notes for archiving
      const completedCustomer = {
        ...selectedCustomer,
        notes: updatedNote,
        lastContact: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        interactionCompleted: true,
        completedAt: new Date().toISOString()
      };
      
      // Remove from active customers list
      const updatedCustomers = customers.filter(c => c.id !== selectedCustomer.id);
      setCustomers(updatedCustomers);
      await saveCustomersToBackend(updatedCustomers);
      
      // Archive the completed customer
      const updatedArchived = [...archivedCustomers, completedCustomer];
      setArchivedCustomers(updatedArchived);
      await saveArchivedCustomersToBackend(updatedArchived);
      
      console.log('[CUSTOMER SERVICE] ✅ Customer interaction completed and archived:', selectedCustomer.name);
      
      setCompletionNotes("");
      setInteractionOutcome("resolved");
      setIsCompleteDialogOpen(false);
      setIsDialogOpen(false);
      toast.success(`Interaction completed and archived! (${interactionOutcome.replace('-', ' ')})`);
    } catch (error) {
      console.error('[CUSTOMER SERVICE] Error completing interaction:', error);
      toast.error(`Failed to complete interaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCompletingInteraction(false);
    }
  };

  const openEditCustomerDialog = () => {
    if (!selectedCustomer) return;
    setEditCustomerForm({
      name: selectedCustomer.name,
      email: selectedCustomer.email,
      phone: selectedCustomer.phone,
      company: selectedCustomer.company || "",
      business: selectedCustomer.business,
      status: selectedCustomer.status,
      notes: selectedCustomer.notes
    });
    setIsEditCustomerDialogOpen(true);
  };

  const handleEditCustomer = () => {
    if (!selectedCustomer) return;
    if (!editCustomerForm.name.trim()) {
      toast.error("Please enter customer name");
      return;
    }
    if (!editCustomerForm.email.trim()) {
      toast.error("Please enter customer email");
      return;
    }
    if (!editCustomerForm.phone.trim()) {
      toast.error("Please enter customer phone");
      return;
    }
    const updatedCustomers = customers.map(c =>
      c.id === selectedCustomer.id
        ? {
            ...c,
            name: editCustomerForm.name,
            email: editCustomerForm.email,
            phone: editCustomerForm.phone,
            company: editCustomerForm.company,
            business: editCustomerForm.business,
            status: editCustomerForm.status,
            notes: editCustomerForm.notes
          }
        : c
    );
    setCustomers(updatedCustomers);
    saveCustomersToBackend(updatedCustomers);
    setSelectedCustomer({
      ...selectedCustomer,
      name: editCustomerForm.name,
      email: editCustomerForm.email,
      phone: editCustomerForm.phone,
      company: editCustomerForm.company,
      business: editCustomerForm.business,
      status: editCustomerForm.status,
      notes: editCustomerForm.notes
    });
    setIsEditCustomerDialogOpen(false);
    toast.success("Customer information updated successfully!");
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim()) {
      toast.error("Please enter customer name");
      return;
    }
    if (!newCustomer.email.trim()) {
      toast.error("Please enter customer email");
      return;
    }
    if (!newCustomer.phone.trim()) {
      toast.error("Please enter customer phone");
      return;
    }
    const customer: Customer = {
      id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      business: newCustomer.business,
      status: newCustomer.status,
      totalPurchases: 0,
      purchaseHistory: [],
      notes: newCustomer.notes,
      createdAt: new Date().toISOString()
    };
    const updatedCustomers = [...customers, customer];
    setCustomers(updatedCustomers);
    await saveCustomersToBackend(updatedCustomers);
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      business: "Online Sales",
      status: "active",
      notes: ""
    });
    setIsAddDialogOpen(false);
    toast.success("Customer added successfully!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const lines = csvData.split('\n');
        if (lines.length < 2) {
          setParseError("CSV file is empty or invalid");
          return;
        }
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const nameIndex = headers.findIndex(h => h.includes('name'));
        const emailIndex = headers.findIndex(h => h.includes('email'));
        const phoneIndex = headers.findIndex(h => h.includes('phone'));
        if (nameIndex === -1 || emailIndex === -1 || phoneIndex === -1) {
          setParseError("CSV must contain 'name', 'email', and 'phone' columns");
          return;
        }
        const parsedCustomers: Customer[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const values = line.split(',').map(v => v.trim());
          if (values.length < 3) continue;
          parsedCustomers.push({
            id: `customer_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
            name: values[nameIndex] || '',
            email: values[emailIndex] || '',
            phone: values[phoneIndex] || '',
            business: "Online Sales",
            status: "active",
            totalPurchases: 0,
            purchaseHistory: [],
            notes: "",
            createdAt: new Date().toISOString()
          });
        }
        setParsedData(parsedCustomers);
        setParseError("");
      } catch (error) {
        setParseError("Error parsing CSV file. Please check the format.");
        console.error('CSV parse error:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleImportCSV = async () => {
    if (parsedData.length === 0) {
      toast.error("No data to import");
      return;
    }
    setIsImporting(true);
    try {
      const existingIds = new Set(customers.map(c => c.id));
      const safeCustomers = parsedData.map(customer => {
        if (existingIds.has(customer.id)) {
          return {
            ...customer,
            id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };
        }
        return customer;
      });
      const updatedCustomers = [...customers, ...safeCustomers];
      setCustomers(updatedCustomers);
      await saveCustomersToBackend(updatedCustomers);
      toast.success(`Successfully imported ${parsedData.length} customer(s)!`);
      setIsImportDialogOpen(false);
      setParsedData([]);
      setParseError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error('Error importing customers:', error);
      toast.error("Failed to import customers");
    } finally {
      setIsImporting(false);
    }
  };

  const handleGenerateReport = async () => {
    toast.info("Generating report... This may take a moment.");
    try {
      let startDate: Date;
      let endDate = new Date();
      switch (reportType) {
        case 'daily':
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'weekly':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'monthly':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          break;
        case 'custom':
          if (!customStartDate || !customEndDate) {
            toast.error("Please select start and end dates");
            return;
          }
          startDate = customStartDate;
          endDate = customEndDate;
          break;
        default:
          startDate = new Date();
      }
      const filteredData = customers.filter(c => {
        if (!c.createdAt) return true;
        const createdDate = new Date(c.createdAt);
        return createdDate >= startDate && createdDate <= endDate;
      });
      const reportData = {
        title: `Customer Service Report - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`,
        dateRange: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        stats: {
          totalCustomers: filteredData.length,
          activeCustomers: filteredData.filter(c => c.status === 'active').length,
          vipCustomers: filteredData.filter(c => c.status === 'vip').length,
          totalRevenue: filteredData.reduce((sum, c) => sum + c.purchaseHistory.reduce((pSum, p) => pSum + p.amount, 0), 0)
        },
        customers: filteredData
      };
      if (reportFormat === 'html') {
        const htmlReport = generateHTMLReport(reportData);
        const blob = new Blob([htmlReport], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customer-service-report-${reportType}-${Date.now()}.html`;
        a.click();
      } else if (reportFormat === 'csv') {
        const csvReport = generateCSVReport(reportData);
        const blob = new Blob([csvReport], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customer-service-report-${reportType}-${Date.now()}.csv`;
        a.click();
      } else if (reportFormat === 'pdf') {
        await generatePDFReport(reportData);
      } else if (reportFormat === 'pptx') {
        await generatePPTXReport(reportData);
      }
      toast.success(`${reportFormat.toUpperCase()} report generated successfully!`);
      setIsReportDialogOpen(false);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error("Failed to generate report");
    }
  };

  const generateHTMLReport = (data: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${data.title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #9333ea; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #9333ea; color: white; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
          .stat-card { background: #f3e8ff; padding: 20px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>${data.title}</h1>
        <p><strong>Date Range:</strong> ${data.dateRange}</p>
        <div class="stats">
          <div class="stat-card"><h3>${data.stats.totalCustomers}</h3><p>Total Customers</p></div>
          <div class="stat-card"><h3>${data.stats.activeCustomers}</h3><p>Active Customers</p></div>
          <div class="stat-card"><h3>${data.stats.vipCustomers}</h3><p>VIP Customers</p></div>
          <div class="stat-card"><h3>₦${data.stats.totalRevenue.toLocaleString()}</h3><p>Total Revenue</p></div>
        </div>
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Business</th><th>Status</th><th>Notes</th></tr>
          </thead>
          <tbody>
            ${data.customers.map((c: any) => `
              <tr>
                <td>${c.name}</td>
                <td>${c.email}</td>
                <td>${c.phone}</td>
                <td>${c.business}</td>
                <td>${c.status}</td>
                <td>${c.notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
  };

  const generateCSVReport = (data: any) => {
    let csv = 'Name,Email,Phone,Business,Status,Notes\n';
    data.customers.forEach((c: any) => {
      csv += `"${c.name}","${c.email}","${c.phone}","${c.business}","${c.status}","${(c.notes || '').replace(/"/g, '""')}"\n`;
    });
    return csv;
  };

  const generatePDFReport = async (data: any) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(data.title, 14, 20);
    doc.setFontSize(12);
    doc.text(`Date Range: ${data.dateRange}`, 14, 30);
    doc.text(`Total Customers: ${data.stats.totalCustomers}`, 14, 40);
    doc.text(`Active Customers: ${data.stats.activeCustomers}`, 14, 47);
    doc.text(`VIP Customers: ${data.stats.vipCustomers}`, 14, 54);
    doc.text(`Total Revenue: ₦${data.stats.totalRevenue.toLocaleString()}`, 14, 61);
    let yPos = 75;
    doc.setFontSize(14);
    doc.text('Customer Details', 14, yPos);
    yPos += 10;
    doc.setFontSize(10);
    data.customers.forEach((c: any, idx: number) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${idx + 1}. ${c.name} - ${c.email} - ${c.phone}`, 14, yPos);
      yPos += 7;
    });
    doc.save(`customer-service-report-${data.dateRange}-${Date.now()}.pdf`);
  };

  const generatePPTXReport = async (data: any) => {
    const pptx = new pptxgen();
    const slide1 = pptx.addSlide();
    slide1.addText(data.title, { x: 1, y: 1, fontSize: 24, color: '9333ea', bold: true });
    slide1.addText(`Date Range: ${data.dateRange}`, { x: 1, y: 2, fontSize: 14 });
    slide1.addText(`Total Customers: ${data.stats.totalCustomers}`, { x: 1, y: 2.5, fontSize: 12 });
    slide1.addText(`Active Customers: ${data.stats.activeCustomers}`, { x: 1, y: 3, fontSize: 12 });
    slide1.addText(`VIP Customers: ${data.stats.vipCustomers}`, { x: 1, y: 3.5, fontSize: 12 });
    slide1.addText(`Total Revenue: ₦${data.stats.totalRevenue.toLocaleString()}`, { x: 1, y: 4, fontSize: 12 });
    const slide2 = pptx.addSlide();
    slide2.addText('Customer Details', { x: 1, y: 0.5, fontSize: 20, bold: true });
    const tableData = [
      ['Name', 'Email', 'Phone', 'Business', 'Status']
    ];
    data.customers.slice(0, 10).forEach((c: any) => {
      tableData.push([c.name, c.email, c.phone, c.business, c.status]);
    });
    slide2.addTable(tableData, { x: 0.5, y: 1.5, w: 9, fontSize: 10 });
    await pptx.writeFile({ fileName: `customer-service-report-${Date.now()}.pptx` });
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === "active" || c.status === "vip").length;
  const vipCustomers = customers.filter(c => c.status === "vip").length;
  const totalRevenue = customers.reduce((sum, c) => 
    sum + c.purchaseHistory.reduce((pSum, p) => pSum + p.amount, 0), 0
  );
  const completedInteractions = customers.filter(c => c.interactionCompleted === true).length;
  const pendingInteractions = customers.filter(c => c.interactionCompleted !== true).length;

  useEffect(() => {
    console.log('[CUSTOMER SERVICE] Statistics update:', {
      totalCustomers,
      completedInteractions,
      pendingInteractions,
      customers: customers.length,
      currentUser: currentUser?.name
    });
    customers.forEach(c => {
      console.log(`[CUSTOMER SERVICE] ${c.name}: interactionCompleted=${c.interactionCompleted}, hasNotes=${!!c.notes && c.notes.length > 0}`);
    });
  }, [totalCustomers, completedInteractions, pendingInteractions, customers.length, currentUser?.name]);

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-3xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-4xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">Customer Service Portal</h2>
            <p className="text-lg text-muted-foreground mt-2">Manage existing customer relationships and support</p>
          </div>
        
        <div className="flex gap-3 flex-wrap">
          {isManager && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all px-5 py-2.5 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>Add an existing customer to the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Customer Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter full name"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        className="bg-white/60 backdrop-blur-xl border-white/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business">Business Type *</Label>
                      <Select 
                        value={newCustomer.business} 
                        onValueChange={(value: "Online Sales" | "Corporate" | "Channel" | "Retails" | "Protocol" | "Others") => 
                          setNewCustomer({ ...newCustomer, business: value })
                        }
                      >
                        <SelectTrigger className="bg-white/60 backdrop-blur-xl border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Online Sales">Online Sales</SelectItem>
                          <SelectItem value="Corporate">Corporate</SelectItem>
                          <SelectItem value="Channel">Channel</SelectItem>
                          <SelectItem value="Retails">Retails</SelectItem>
                          <SelectItem value="Protocol">Protocol</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="customer@example.com"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                        className="bg-white/60 backdrop-blur-xl border-white/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        placeholder="+234 XXX XXX XXXX"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        className="bg-white/60 backdrop-blur-xl border-white/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Customer Status</Label>
                    <Select 
                      value={newCustomer.status} 
                      onValueChange={(value: "active" | "inactive" | "vip" | "corporate") => 
                        setNewCustomer({ ...newCustomer, status: value })
                      }
                    >
                      <SelectTrigger className="bg-white/60 backdrop-blur-xl border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional information about this customer..."
                      value={newCustomer.notes}
                      onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                      className="bg-white/60 backdrop-blur-xl border-white/20 min-h-[100px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddCustomer} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Customer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {selectedCustomerIds.length > 0 && (
            <>
              {!showArchived ? (
                <Button onClick={handleArchiveSelected} variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Selected ({selectedCustomerIds.length})
                </Button>
              ) : (
                <Button onClick={handleRestoreSelected} variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                  <ArchiveRestore className="w-4 h-4 mr-2" />
                  Restore Selected ({selectedCustomerIds.length})
                </Button>
              )}
            </>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => {
              setShowArchived(!showArchived);
              setSelectedCustomerIds([]);
            }}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            {showArchived ? <Eye className="w-4 h-4 mr-2" /> : <Archive className="w-4 h-4 mr-2" />}
            {showArchived ? 'View Active' : 'View Archived'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl shadow-blue-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{customers.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl shadow-green-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">{completedInteractions}</p>
            <p className="text-xs text-gray-500 mt-1">Interactions finished</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl shadow-orange-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">{pendingInteractions}</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting completion</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/60 backdrop-blur-xl border-white/20 shadow-inner"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {showArchived ? 'Archived Customers' : 'Active Customers'}
              </CardTitle>
              <CardDescription>
                {showArchived 
                  ? `${filteredCustomers.length} archived customer${filteredCustomers.length !== 1 ? 's' : ''}` 
                  : `${filteredCustomers.length} active customer${filteredCustomers.length !== 1 ? 's' : ''} in your queue`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-purple-100">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCustomerIds.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Interaction</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-lg">No customers found</p>
                      <p className="text-sm mt-1">
                        {showArchived 
                          ? 'No archived customers yet' 
                          : searchQuery 
                            ? 'Try adjusting your search' 
                            : 'Customers assigned to you will appear here'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow 
                      key={customer.id}
                      className="hover:bg-purple-50/50 transition-colors border-purple-50"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedCustomerIds.includes(customer.id)}
                          onCheckedChange={() => handleSelectCustomer(customer.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-gray-900">{customer.name}</p>
                          {customer.company && (
                            <p className="text-sm text-gray-500">{customer.company}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-3 h-3 mr-2" />
                            {customer.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-3 h-3 mr-2" />
                            {customer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {customer.business}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            customer.status === "vip" ? "default" :
                            customer.status === "corporate" ? "secondary" :
                            customer.status === "active" ? "outline" : "destructive"
                          }
                          className={
                            customer.status === "vip" ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white" :
                            customer.status === "corporate" ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white" :
                            customer.status === "active" ? "bg-green-100 text-green-700 border-green-300" : ""
                          }
                        >
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {customer.interactionCompleted ? (
                          <Badge className="bg-green-100 text-green-700 border-green-300">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('[CUSTOMER SERVICE] Call button clicked for:', customer.name);
                              handleMakeCall(customer.phone, customer.name);
                            }}
                            onMouseDown={(e) => {
                              console.log('[CUSTOMER SERVICE] Call button mousedown for:', customer.name);
                            }}
                            className="hover:bg-green-50 hover:text-green-700 cursor-pointer relative z-10"
                            type="button"
                            title="Call customer"
                            style={{ pointerEvents: 'auto' }}
                          >
                            <PhoneCall className="w-4 h-4 pointer-events-none" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('[CUSTOMER SERVICE] View details button clicked for:', customer.name);
                              handleViewCustomer(customer);
                            }}
                            onMouseDown={(e) => {
                              console.log('[CUSTOMER SERVICE] View button mousedown for:', customer.name);
                            }}
                            className="hover:bg-blue-50 hover:text-blue-700 cursor-pointer relative z-10"
                            type="button"
                            title="View details"
                            style={{ pointerEvents: 'auto' }}
                          >
                            <Eye className="w-4 h-4 pointer-events-none" />
                          </Button>
                          
                          {isManager && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('[CUSTOMER SERVICE] Delete button clicked for:', customer.name);
                                handleDeleteClick(customer);
                              }}
                              onMouseDown={(e) => {
                                console.log('[CUSTOMER SERVICE] Delete button mousedown for:', customer.name);
                              }}
                              className="hover:bg-red-50 hover:text-red-700 cursor-pointer relative z-10"
                              type="button"
                              title="Delete customer"
                              style={{ pointerEvents: 'auto' }}
                            >
                              <Trash2 className="w-4 h-4 pointer-events-none" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {customerToDelete?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {selectedCustomerIds.length} customer(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Archived customers will be moved to the archive and won't appear in your active customer list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmArchive} className="bg-orange-600 hover:bg-orange-700">
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isDialogOpen && selectedCustomer && (
        <DraggableDialog 
          isOpen={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)}
          title={selectedCustomer.name}
        >
          <div className="space-y-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={selectedCustomer.status === "vip" ? "default" : "outline"}
                    className={
                      selectedCustomer.status === "vip" ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white" :
                      selectedCustomer.status === "corporate" ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white" :
                      selectedCustomer.status === "active" ? "bg-green-100 text-green-700 border-green-300" : ""
                    }
                  >
                    {selectedCustomer.status}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {selectedCustomer.business}
                  </Badge>
                </div>
              </div>
              <Button
                size="sm"
                onClick={openEditCustomerDialog}
                variant="outline"
                className="hover:bg-purple-50"
              >
                <Pencil className="w-3 h-3 mr-2" />
                Edit Info
              </Button>
            </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg mb-4 text-blue-900">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-gray-900">{selectedCustomer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-gray-900">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  {selectedCustomer.company && (
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="text-gray-900">{selectedCustomer.company}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Add Note or Response</Label>
                <Textarea
                  placeholder="Type your note or response here..."
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  className="min-h-[100px] bg-white/60 backdrop-blur-xl border-white/20"
                />
                <Button 
                  onClick={handleSendResponse} 
                  disabled={!responseNote.trim()}
                  className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 w-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>

              {selectedCustomer.notes && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Customer Notes
                  </h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedCustomer.notes}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => setIsCompleteDialogOpen(true)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Interaction
                </Button>
                <Button
                  onClick={() => handleMakeCall(selectedCustomer.phone, selectedCustomer.name)}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <PhoneCall className="w-4 h-4 mr-2" />
                  Call Customer
                </Button>
              </div>
            </div>
        </DraggableDialog>
      )}

      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Customer Interaction</DialogTitle>
            <DialogDescription>
              Record the outcome of your interaction with {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Interaction Outcome</Label>
              <RadioGroup value={interactionOutcome} onValueChange={(value: any) => setInteractionOutcome(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="resolved" id="resolved" />
                  <Label htmlFor="resolved" className="font-normal cursor-pointer">Resolved - Issue/request completed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="follow-up" id="follow-up" />
                  <Label htmlFor="follow-up" className="font-normal cursor-pointer">Follow-up Required</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="escalated" id="escalated" />
                  <Label htmlFor="escalated" className="font-normal cursor-pointer">Escalated to Manager</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="information-provided" id="information-provided" />
                  <Label htmlFor="information-provided" className="font-normal cursor-pointer">Information Provided</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Completion Notes *</Label>
              <Textarea
                placeholder="Describe what was discussed, actions taken, and any next steps..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteInteraction}
              disabled={isCompletingInteraction || !completionNotes.trim()}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isCompletingInteraction ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Interaction
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditCustomerDialogOpen} onOpenChange={setIsEditCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer Information</DialogTitle>
            <DialogDescription>
              Update the customer's contact details and information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editCustomerForm.name}
                onChange={(e) => setEditCustomerForm({ ...editCustomerForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={editCustomerForm.email}
                onChange={(e) => setEditCustomerForm({ ...editCustomerForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={editCustomerForm.phone}
                onChange={(e) => setEditCustomerForm({ ...editCustomerForm, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCustomerDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCustomer}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}

export default CustomerService;
