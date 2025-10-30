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
import { Mail, Phone, User, Calendar as CalendarIcon, ShoppingBag, Search, Plus, Pencil, Trash2, Download, Briefcase, UserPlus, Upload, PhoneCall, ChevronDown, Clock, Tag, TrendingUp, Archive, ArchiveRestore, Eye, AlertCircle, CheckCircle, XCircle, FileText, FileDown, Presentation, Headphones } from "lucide-react";
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
}



// Helper function to ensure all customers have unique IDs
const ensureUniqueIds = (customerList: Customer[]): Customer[] => {
  const seenIds = new Set<string>();
  return customerList.map(customer => {
    if (seenIds.has(customer.id)) {
      // Duplicate ID found, generate a new unique one
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

  // Add customer dialog state
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

  // Purchase history management state
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<{ id: string; date: string; product: string; amount: number; status: string; } | null>(null);
  const [purchaseForm, setPurchaseForm] = useState({
    date: "",
    product: "",
    amount: "",
    status: "Completed"
  });

  // Report generation state
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly" | "custom">("daily");
  const [reportFormat, setReportFormat] = useState<"html" | "csv" | "pdf" | "pptx">("html");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);
  const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false);

  // Edit customer info state
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

  // Quick Email Response state
  const [isEmailSectionOpen, setIsEmailSectionOpen] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState<string>("custom");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Call Script state
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

  // Interaction completion state
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [interactionOutcome, setInteractionOutcome] = useState<"resolved" | "escalated" | "follow-up" | "information-provided">("resolved");
  const [isCompletingInteraction, setIsCompletingInteraction] = useState(false);

  // Reset popover states when report dialog closes
  useEffect(() => {
    if (!isReportDialogOpen) {
      setStartDatePopoverOpen(false);
      setEndDatePopoverOpen(false);
    }
  }, [isReportDialogOpen]);

  // Fetch promotions, call script, and customers on mount
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const data = await backendService.getPromotions();

        if (data.success) {
          // Filter for active promotions and sort by most recent
          const activePromos = (data.promotions || [])
            .filter((p: any) => p.status === 'active')
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3); // Get latest 3 active promotions
          
          setLatestPromotions(activePromos);
        }
      } catch (error: any) {
        // Suppress database initialization errors (503)
        const { isDatabaseInitializing } = await import('../utils/backendService');
        if (isDatabaseInitializing(error)) {
          // Database is still initializing, silently skip
          return;
        }
        
        // Silently fail if server is offline
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
        // Keep default script if loading fails
      } finally {
        setIsLoadingScript(false);
      }
    };

    const loadCustomers = async () => {
      try {
        // Only load if we have a logged-in user
        if (!currentUser) {
          console.log('[CUSTOMER SERVICE] No current user, skipping customer load');
          setCustomers([]);
          return;
        }

        // Fetch only customers assigned to this agent
        console.log('[CUSTOMER SERVICE] Loading customers for agent:', currentUser.id, currentUser.name);
        
        const data = await backendService.getAssignedCustomers(currentUser.id);

        if (data.success) {
          if (data.customers && data.customers.length > 0) {
            console.log(`[CUSTOMER SERVICE] ✅ Loaded ${data.customers.length} assigned customers for agent ${currentUser.name}`);
            
            // Transform database customers to CustomerService format
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
              createdAt: record.createdAt || new Date().toISOString()
            }));
            
            const uniqueCustomers = ensureUniqueIds(transformedCustomers);
            setCustomers(uniqueCustomers);
          } else {
            // No customers assigned to this agent yet
            console.log('[CUSTOMER SERVICE] No customers assigned to agent', currentUser.name);
            setCustomers([]);
          }
        } else {
          // If backend call fails, start with empty list
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
            // Ensure all archived customers have unique IDs
            const uniqueArchived = ensureUniqueIds(data.customers);
            setArchivedCustomers(uniqueArchived);
            
            // If we had to fix any duplicate IDs, save the corrected data back
            if (JSON.stringify(uniqueArchived) !== JSON.stringify(data.customers)) {
              console.log('[CUSTOMER SERVICE] Duplicate IDs found in archived customers, saving corrected data');
              saveArchivedCustomersToBackend(uniqueArchived);
            }
          }
        }
      } catch (error) {
        // Silently ignore errors loading archived customers - they're optional
        setArchivedCustomers([]);
      }
    };

    fetchPromotions();
    loadActiveScript();
    loadCustomers();
    loadArchivedCustomers();
  }, [currentUser]); // Re-load when current user changes

  // Function to save customers to backend (CustomerService storage)
  const saveCustomersToBackend = async (customersToSave: Customer[]) => {
    try {
      // Use backendService which now handles both single and bulk customers
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

  // Selection handlers
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

  // Archive handlers
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
    
    // Save both to backend
    await saveCustomersToBackend(updatedCustomers);
    await saveArchivedCustomersToBackend(updatedArchived);
    
    setSelectedCustomerIds([]);
    setArchiveDialogOpen(false);
    toast.success(`${customersToArchive.length} customer(s) archived successfully`);
  };

  const handleRestoreSelected = async () => {
    const customersToRestore = archivedCustomers.filter(c => selectedCustomerIds.includes(c.id));
    const updatedArchived = archivedCustomers.filter(c => !selectedCustomerIds.includes(c.id));
    
    // Ensure unique IDs when restoring (in case of conflicts)
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
    
    // Save both to backend
    await saveCustomersToBackend(updatedCustomers);
    await saveArchivedCustomersToBackend(updatedArchived);
    
    setSelectedCustomerIds([]);
    toast.success(`${customersToRestore.length} customer(s) restored successfully`);
  };

  const saveArchivedCustomersToBackend = async (archivedCustomersList: Customer[]) => {
    try {
      // Archive each customer individually
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
    // Make the call via 3CX
    makeCall(phoneNumber, contactName);
    
    // Increment daily call count
    incrementCallCount();
    
    // Show success message
    toast.success(`Call initiated to ${contactName || phoneNumber}`);
  };

  const handleSendResponse = () => {
    if (selectedCustomer && responseNote.trim()) {
      // Update customer notes
      const updatedCustomers = customers.map(c =>
        c.id === selectedCustomer.id
          ? { ...c, notes: `${c.notes}\n\n[${new Date().toLocaleDateString()}] ${responseNote}`, lastContact: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
          : c
      );
      setCustomers(updatedCustomers);
      saveCustomersToBackend(updatedCustomers);
      
      toast.success("Note added! Remember to 'Complete Interaction' when done with this customer.", { duration: 4000 });
      setResponseNote("");
      // Do NOT close dialog automatically - agent may need to continue working
      // Dialog will close when agent clicks "Complete Interaction" button
    }
  };

  const handleAddPurchase = () => {
    if (!selectedCustomer) return;

    // Validation
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

    // Update customer with new purchase
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

    // Update selected customer
    setSelectedCustomer({
      ...selectedCustomer,
      purchaseHistory: [...selectedCustomer.purchaseHistory, newPurchase],
      totalPurchases: selectedCustomer.totalPurchases + 1
    });

    // Reset form
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

    // Validation
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

    // Update customer with edited purchase
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

    // Update selected customer
    setSelectedCustomer({
      ...selectedCustomer,
      purchaseHistory: selectedCustomer.purchaseHistory.map(p => 
        p.id === editingPurchase.id ? updatedPurchase : p
      )
    });

    // Reset form
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

    // Update customer by removing purchase
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

    // Update selected customer
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

  // Interaction completion handler
  const handleCompleteInteraction = async () => {
    if (!selectedCustomer) return;
    if (!completionNotes.trim()) {
      toast.error("Please add notes about this interaction");
      return;
    }

    setIsCompletingInteraction(true);

    try {
      // Create interaction record
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

      // Save interaction to backend
      const response = await backendService.logCustomerInteraction(selectedCustomer.id, interaction);

      if (!response.success) {
        throw new Error(response.error || 'Failed to save interaction');
      }

      // Update customer's last contact and notes
      const updatedNote = `[${interaction.timestamp}] ${currentUser?.fullName || currentUser?.username} - ${interactionOutcome.toUpperCase()}: ${completionNotes}\n\n${selectedCustomer.notes || ''}`;
      
      const updatedCustomers = customers.map(c =>
        c.id === selectedCustomer.id
          ? {
              ...c,
              notes: updatedNote,
              lastContact: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            }
          : c
      );
      
      setCustomers(updatedCustomers);
      await saveCustomersToBackend(updatedCustomers);

      // Reset form
      setCompletionNotes("");
      setInteractionOutcome("resolved");
      setIsCompleteDialogOpen(false);
      setIsDialogOpen(false);

      toast.success(`Interaction completed successfully! (${interactionOutcome.replace('-', ' ')})`);
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
      business: selectedCustomer.business,
      status: selectedCustomer.status,
      notes: selectedCustomer.notes
    });
    setIsEditCustomerDialogOpen(true);
  };

  const handleEditCustomer = () => {
    if (!selectedCustomer) return;

    // Validation
    if (!editCustomerForm.name.trim()) {
      toast.error("Please enter customer name");
      return;
    }
    if (!editCustomerForm.email.trim()) {
      toast.error("Please enter customer email");
      return;
    }
    if (!editCustomerForm.phone.trim()) {
      toast.error("Please enter customer phone number");
      return;
    }

    // Update customer
    const updatedCustomers = customers.map(c =>
      c.id === selectedCustomer.id
        ? {
            ...c,
            name: editCustomerForm.name,
            email: editCustomerForm.email,
            phone: editCustomerForm.phone,
            business: editCustomerForm.business,
            status: editCustomerForm.status,
            notes: editCustomerForm.notes
          }
        : c
    );
    setCustomers(updatedCustomers);
    saveCustomersToBackend(updatedCustomers);

    // Update selected customer
    setSelectedCustomer({
      ...selectedCustomer,
      name: editCustomerForm.name,
      email: editCustomerForm.email,
      phone: editCustomerForm.phone,
      business: editCustomerForm.business,
      status: editCustomerForm.status,
      notes: editCustomerForm.notes
    });

    setIsEditCustomerDialogOpen(false);
    toast.success(`Customer \"${editCustomerForm.name}\" updated successfully!`);
  };

  const handleAddCustomer = () => {
    // Validation
    if (!newCustomer.name.trim()) {
      toast.error("Please enter customer name");
      return;
    }
    if (!newCustomer.email.trim()) {
      toast.error("Please enter customer email");
      return;
    }
    if (!newCustomer.phone.trim()) {
      toast.error("Please enter customer phone number");
      return;
    }

    // Create new customer
    const customer: Customer = {
      id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      business: newCustomer.business,
      status: newCustomer.status,
      lastContact: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      totalPurchases: 0,
      purchaseHistory: [],
      notes: newCustomer.notes
    };

    // Add to customers list
    const updatedCustomers = [...customers, customer];
    setCustomers(updatedCustomers);
    saveCustomersToBackend(updatedCustomers);

    // Reset form
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      business: "Online Sales",
      status: "active",
      notes: ""
    });

    setIsAddDialogOpen(false);
    toast.success(`Customer "${customer.name}" added successfully!`);
  };

  const handleEmailTemplateChange = (value: string) => {
    setEmailTemplate(value);
    if (!selectedCustomer) return;

    switch (value) {
      case "urgent":
        setEmailSubject("🚨 Urgent: Immediate Assistance Required");
        setEmailMessage(`Dear ${selectedCustomer.name},\n\nWe have received your urgent request and are prioritizing your case. Our team is working to resolve this matter as quickly as possible.\n\nWe will provide an update within the next 2 hours.\n\nThank you for your patience.\n\nBest regards,\nBTMTravel Customer Service`);
        break;
      case "booking":
        setEmailSubject("📋 Your Booking Confirmation");
        setEmailMessage(`Dear ${selectedCustomer.name},\n\nThank you for choosing BTMTravel. This email confirms your booking details.\n\nIf you have any questions or need to make changes, please don't hesitate to contact us.\n\nBest regards,\nBTMTravel Team`);
        break;
      case "payment":
        setEmailSubject("💳 Payment Information Request");
        setEmailMessage(`Dear ${selectedCustomer.name},\n\nThank you for your inquiry regarding payment information.\n\nPlease find the payment details below:\n[Add payment details here]\n\nIf you have any questions, please feel free to reach out.\n\nBest regards,\nBTMTravel Billing`);
        break;
      case "inquiry":
        setEmailSubject("💬 Response to Your Inquiry");
        setEmailMessage(`Dear ${selectedCustomer.name},\n\nThank you for contacting BTMTravel.\n\nWe are pleased to assist you with your inquiry.\n\n[Add response details here]\n\nPlease let us know if you need any additional information.\n\nBest regards,\nBTMTravel Team`);
        break;
      case "custom":
        setEmailSubject("");
        setEmailMessage("");
        break;
    }
  };

  const handleSendQuickEmail = async () => {
    if (!selectedCustomer?.email) {
      toast.error("No email address available for this customer");
      return;
    }

    if (!emailSubject.trim()) {
      toast.error("Please enter an email subject");
      return;
    }

    if (!emailMessage.trim()) {
      toast.error("Please enter an email message");
      return;
    }

    setIsSendingEmail(true);

    try {
      // Create the HTML content for the email
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Dear ${selectedCustomer.name},</h2>
          <div style="margin: 20px 0;">
            ${emailMessage.replace(/\n/g, '<br>')}
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 12px;">
            BTM Travel Customer Service<br>
            From: customer-service
          </p>
        </div>
      `;

      const data = await backendService.sendQuickEmail(
        selectedCustomer.email,
        emailSubject,
        htmlContent
      );

      if (data.success) {
        toast.success(`Email sent successfully to ${selectedCustomer.email}!`);
        
        // Update customer notes with email record
        const updatedCustomers = customers.map(c =>
          c.id === selectedCustomer.id
            ? { 
                ...c, 
                notes: `${c.notes}\n\n[${new Date().toLocaleDateString()}] Email sent: ${emailSubject}`,
                lastContact: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              }
            : c
        );
        setCustomers(updatedCustomers);
        saveCustomersToBackend(updatedCustomers);

        // Reset email form
        setEmailSubject("");
        setEmailMessage("");
        setEmailTemplate("custom");
        setIsEmailSectionOpen(false);
      } else {
        console.error('[EMAIL ERROR]', data.error);
        toast.error(data.error || "Failed to send email. Please check SMTP configuration.");
      }
    } catch (error) {
      console.error('[EMAIL ERROR] Failed to send email:', error);
      toast.error("Failed to send email. Please check your connection and SMTP settings.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleExportCustomers = () => {
    // Create CSV content with customer data
    const headers = ["Name", "Email", "Phone", "Business", "Status", "Total Purchases", "Total Revenue", "Notes"];
    const csvContent = [
      headers.join(","),
      ...customers.map(customer => {
        const totalRevenue = customer.purchaseHistory.reduce((sum, p) => sum + p.amount, 0);
        return [
          `"${customer.name}"`,
          `"${customer.email}"`,
          `"${customer.phone}"`,
          `"${customer.business}"`,
          customer.status,
          customer.totalPurchases,
          totalRevenue,
          `"${customer.notes.replace(/"/g, '""')}"`
        ].join(",");
      })
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `btmtravel-customers-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Customer list exported successfully!");
  };

  const handleImportCustomers = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log(`[CSV IMPORT] Starting import of file: ${file.name}, size: ${file.size} bytes`);
    toast.info(`Reading CSV file: ${file.name}...`);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter(line => line.trim());
        
        console.log(`[CSV IMPORT] File read successfully. Found ${lines.length} lines`);
        
        if (lines.length < 2) {
          toast.error("CSV file is empty or invalid");
          return;
        }

        // Skip header row
        const dataLines = lines.slice(1);
        const newCustomers: Customer[] = [];
        let errorCount = 0;

        dataLines.forEach((line, index) => {
          try {
            // Parse CSV line (handle quoted fields)
            const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
            const fields: string[] = [];
            let match;
            
            while ((match = regex.exec(line)) !== null) {
              let field = match[1];
              if (field.startsWith('"') && field.endsWith('"')) {
                field = field.slice(1, -1).replace(/""/g, '"');
              }
              fields.push(field);
            }

            // Remove empty first field if present
            if (fields[0] === "") fields.shift();

            const [name, email, phone, business, status, totalPurchases, totalRevenue, notes] = fields;

            if (!name?.trim() || !email?.trim() || !phone?.trim()) {
              errorCount++;
              return;
            }

            // Validate business type
            const validBusinessTypes = ["Online Sales", "Corporate", "Channel", "Retails", "Protocol", "Others"];
            const customerBusiness = validBusinessTypes.includes(business) ? business as "Online Sales" | "Corporate" | "Channel" | "Retails" | "Protocol" | "Others" : "Others";

            // Validate status
            const validStatuses = ["active", "inactive", "vip", "corporate"];
            const customerStatus = validStatuses.includes(status) ? status as "active" | "inactive" | "vip" | "corporate" : "active";

            const customer: Customer = {
              id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim(),
              business: customerBusiness,
              status: customerStatus,
              totalPurchases: parseInt(totalPurchases) || 0,
              purchaseHistory: [],
              notes: notes?.trim() || ""
            };

            newCustomers.push(customer);
          } catch (err) {
            errorCount++;
            console.error(`Error parsing line ${index + 2}:`, err);
          }
        });

        if (newCustomers.length > 0) {
          // Show preview dialog instead of immediately importing
          console.log(`[CSV IMPORT] Successfully parsed ${newCustomers.length} customers from CSV`);
          setPreviewCustomers(newCustomers);
          setImportErrors(errorCount > 0 ? [`${errorCount} row${errorCount > 1 ? 's' : ''} had errors and were skipped`] : []);
          setIsImportDialogOpen(false);
          setIsPreviewDialogOpen(true);
          toast.success(`CSV parsed! Review ${newCustomers.length} customer${newCustomers.length > 1 ? 's' : ''} before importing.`);
        } else {
          toast.error("No valid customers found in CSV file");
        }

      } catch (error) {
        console.error('[CSV IMPORT] Error parsing CSV:', error);
        toast.error("Error reading CSV file. Please check the format.");
      }
    };

    reader.onerror = (error) => {
      console.error('[CSV IMPORT] FileReader error:', error);
      toast.error("Failed to read the file. Please try again.");
    };

    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (previewCustomers.length === 0) return;

    // Ensure unique IDs when importing (in case of conflicts)
    const existingIds = new Set(customers.map(c => c.id));
    const safePreviewCustomers = previewCustomers.map(customer => {
      if (existingIds.has(customer.id)) {
        return {
          ...customer,
          id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      }
      return customer;
    });

    const updatedCustomers = [...customers, ...safePreviewCustomers];
    setCustomers(updatedCustomers);
    await saveCustomersToBackend(updatedCustomers);
    
    toast.success(`Successfully imported ${previewCustomers.length} customer${previewCustomers.length > 1 ? 's' : ''}!`);
    
    setIsPreviewDialogOpen(false);
    setPreviewCustomers([]);
    setImportErrors([]);
  };

  const handleCancelImport = () => {
    setIsPreviewDialogOpen(false);
    setPreviewCustomers([]);
    setImportErrors([]);
    toast.info("Import cancelled");
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const headers = ["Name", "Email", "Phone", "Business", "Status", "Last Contact", "Total Purchases", "Total Revenue", "Notes"];
    const exampleRow = ["Chinedu Okafor", "chinedu.okafor@email.com", "+234 803 456 7890", "Online Sales", "active", "Oct 15, 2025", "5", "2500", "Regular customer"];
    const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "customer-import-template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Template downloaded successfully!");
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Business", "Status", "Last Contact", "Total Purchases", "Total Revenue", "Notes"];
    const rows = customers.map(customer => [
      customer.name,
      customer.email,
      customer.phone,
      customer.business,
      customer.status,
      customer.lastContact,
      customer.purchaseHistory.length.toString(),
      customer.purchaseHistory.reduce((sum, p) => sum + p.amount, 0).toString(),
      customer.notes.replace(/,/g, ';') // Replace commas with semicolons to avoid CSV issues
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `customers-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${customers.length} customer records!`);
  };

  // Helper function to convert image to base64
  const getLogoAsBase64 = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject('Failed to get canvas context');
        }
      };
      img.onerror = () => reject('Failed to load logo');
      img.src = logoImage;
    });
  };

  const handleGenerateReport = async () => {
    let reportTitle = "";
    let dateRange = "";
    
    switch (reportType) {
      case "daily":
        reportTitle = "Daily Customer Service Report";
        dateRange = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        break;
      case "weekly":
        reportTitle = "Weekly Customer Service Report";
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() + (6 - weekEnd.getDay()));
        dateRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        break;
      case "monthly":
        reportTitle = "Monthly Customer Service Report";
        dateRange = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        break;
      case "custom":
        if (!customStartDate || !customEndDate) {
          toast.error("Please select both start and end dates");
          return;
        }
        reportTitle = "Custom Customer Service Report";
        dateRange = `${customStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${customEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        break;
    }

    const activeCount = customers.filter(c => c.status === "active").length;
    const vipCount = customers.filter(c => c.status === "vip").length;
    const corporateCount = customers.filter(c => c.status === "corporate").length;
    const totalCustomers = customers.length;
    const revenue = customers.reduce((sum, c) => 
      sum + c.purchaseHistory.reduce((pSum, p) => pSum + p.amount, 0), 0
    );

    if (reportFormat === "csv") {
      // CSV Report
      const csvRows = [];
      csvRows.push([reportTitle]);
      csvRows.push([dateRange]);
      csvRows.push([`Generated on: ${new Date().toLocaleString('en-US')}`]);
      csvRows.push([]);
      csvRows.push(['SUMMARY STATISTICS']);
      csvRows.push(['Metric', 'Value']);
      csvRows.push(['Total Customers', totalCustomers]);
      csvRows.push(['Active Customers', activeCount]);
      csvRows.push(['VIP Customers', vipCount]);
      csvRows.push(['Corporate Customers', corporateCount]);
      csvRows.push(['Total Revenue', `₦${revenue.toLocaleString()}`]);
      csvRows.push([]);
      csvRows.push(['CUSTOMER LIST']);
      csvRows.push(['Name', 'Email', 'Phone', 'Business', 'Status', 'Total Purchases', 'Revenue']);
      customers.forEach(c => {
        const custRevenue = c.purchaseHistory.reduce((sum, p) => sum + p.amount, 0);
        csvRows.push([c.name, c.email, c.phone, c.business, c.status, c.purchaseHistory.length, custRevenue]);
      });

      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportType}-customer-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("CSV report generated and downloaded!");
    } else if (reportFormat === "pdf") {
      // PDF Report
      try {
        const logoBase64 = await getLogoAsBase64();
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = 20;

        // Header with logo
        doc.setFillColor(147, 51, 234);
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        // Add logo to header (top left)
        doc.addImage(logoBase64, 'PNG', 15, 5, 20, 20);
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text(reportTitle, pageWidth / 2, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.text(dateRange, pageWidth / 2, 25, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}`, pageWidth / 2, 32, { align: 'center' });
      
      yPos = 50;

      // Summary Statistics
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text('Summary Statistics', 15, yPos);
      yPos += 10;

      const stats = [
        { label: 'Total Customers', value: totalCustomers.toString() },
        { label: 'Active', value: activeCount.toString() },
        { label: 'VIP', value: vipCount.toString() },
        { label: 'Corporate', value: corporateCount.toString() }
      ];

      stats.forEach((stat, index) => {
        const xPos = 15 + (index % 2) * 95;
        if (index % 2 === 0 && index > 0) yPos += 28;
        
        doc.setFillColor(147, 51, 234);
        doc.rect(xPos, yPos, 85, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.text(stat.label, xPos + 42.5, yPos + 8, { align: 'center' });
        doc.setFontSize(20);
        doc.text(stat.value, xPos + 42.5, yPos + 18, { align: 'center' });
      });

      yPos += 35;

      // Revenue
      doc.setFillColor(34, 197, 94);
      doc.rect(15, yPos, 180, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('Total Revenue', pageWidth / 2, yPos + 7, { align: 'center' });
      doc.setFontSize(18);
      doc.text(`₦${revenue.toLocaleString()}`, pageWidth / 2, yPos + 15, { align: 'center' });

      yPos += 30;

      // Customer List
      doc.setFontSize(14);
      doc.setTextColor(147, 51, 234);
      doc.text(`Customer List (${customers.length})`, 15, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      customers.slice(0, 10).forEach((customer, index) => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFillColor(249, 249, 249);
        doc.rect(15, yPos, 180, 18, 'F');
        doc.setDrawColor(147, 51, 234);
        doc.setLineWidth(2);
        doc.line(15, yPos, 15, yPos + 18);
        
        doc.setFontSize(11);
        doc.text(`${customer.name} - ${customer.business}`, 20, yPos + 5);
        doc.setFontSize(9);
        doc.text(`${customer.phone} | ${customer.email}`, 20, yPos + 10);
        doc.text(`Status: ${customer.status} | Purchases: ${customer.purchaseHistory.length}`, 20, yPos + 15);
        
        yPos += 20;
      });

      if (customers.length > 10) {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(`...and ${customers.length - 10} more customers`, 15, yPos);
      }

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('BTM Travel Customer Service - Confidential', pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
      }

        doc.save(`${reportType}-customer-report-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success("PDF report generated and downloaded!");
      } catch (error) {
        console.error('Error generating PDF with logo:', error);
        toast.error("Failed to generate PDF report");
      }
    } else if (reportFormat === "pptx") {
      // PowerPoint Report
      try {
        const logoBase64 = await getLogoAsBase64();
        const pptx = new pptxgen();
        pptx.author = 'BTM Travel';
        pptx.company = 'BTM Travel';
        pptx.title = reportTitle;

        // Slide 1: Title
        const slide1 = pptx.addSlide();
        slide1.background = { color: '9333EA' };
        
        // Add logo to title slide
        slide1.addImage({ data: logoBase64, x: 0.5, y: 0.3, w: 1.0, h: 1.0 });
        
        slide1.addText(reportTitle, {
          x: 0.5, y: 1.5, w: 9, h: 1.5,
          fontSize: 44, bold: true, color: 'FFFFFF', align: 'center'
        });
      slide1.addText(dateRange, {
        x: 0.5, y: 3.0, w: 9, h: 0.5,
        fontSize: 24, color: 'FFFFFF', align: 'center'
      });
      slide1.addText(`Generated on: ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`, {
        x: 0.5, y: 4.2, w: 9, h: 0.4,
        fontSize: 14, color: 'FFFFFF', align: 'center'
      });

      // Slide 2: Summary
      const slide2 = pptx.addSlide();
      slide2.addText('Summary Statistics', {
        x: 0.5, y: 0.5, w: 9, h: 0.6,
        fontSize: 32, bold: true, color: '333333'
      });

      const statBoxes = [
        { label: 'Total Customers', value: totalCustomers.toString(), x: 0.5 },
        { label: 'Active', value: activeCount.toString(), x: 2.75 },
        { label: 'VIP', value: vipCount.toString(), x: 5.0 },
        { label: 'Corporate', value: corporateCount.toString(), x: 7.25 }
      ];

      statBoxes.forEach(box => {
        slide2.addShape(pptx.ShapeType.rect, {
          x: box.x, y: 1.5, w: 2.0, h: 1.5,
          fill: { type: 'solid', color: '9333EA' }
        });
        slide2.addText(box.label, {
          x: box.x, y: 1.6, w: 2.0, h: 0.4,
          fontSize: 14, color: 'FFFFFF', align: 'center'
        });
        slide2.addText(box.value, {
          x: box.x, y: 2.2, w: 2.0, h: 0.6,
          fontSize: 32, bold: true, color: 'FFFFFF', align: 'center'
        });
      });

      slide2.addShape(pptx.ShapeType.rect, {
        x: 2.5, y: 3.5, w: 5, h: 1.0,
        fill: { type: 'solid', color: '22C55E' }
      });
      slide2.addText(`Total Revenue: ₦${revenue.toLocaleString()}`, {
        x: 2.5, y: 3.7, w: 5, h: 0.6,
        fontSize: 24, bold: true, color: 'FFFFFF', align: 'center'
      });

      // Slide 3: Customer List
      const slide3 = pptx.addSlide();
      slide3.addText(`Customer List (${customers.length})`, {
        x: 0.5, y: 0.5, w: 9, h: 0.6,
        fontSize: 28, bold: true, color: '9333EA'
      });

      if (customers.length > 0) {
        const customerRows = [
          [
            { text: 'Name', options: { bold: true, color: 'FFFFFF', fill: '9333EA' } },
            { text: 'Business', options: { bold: true, color: 'FFFFFF', fill: '9333EA' } },
            { text: 'Status', options: { bold: true, color: 'FFFFFF', fill: '9333EA' } },
            { text: 'Purchases', options: { bold: true, color: 'FFFFFF', fill: '9333EA' } }
          ],
          ...customers.slice(0, 8).map(c => [
            c.name,
            c.business,
            c.status,
            c.purchaseHistory.length.toString()
          ])
        ];

        slide3.addTable(customerRows, {
          x: 0.5, y: 1.3, w: 9, h: 4.2,
          fontSize: 11,
          border: { pt: 1, color: 'CCCCCC' },
          fill: { color: 'F9F9F9' }
        });

        if (customers.length > 8) {
          slide3.addText(`...and ${customers.length - 8} more customers`, {
            x: 0.5, y: 5.8, w: 9, h: 0.3,
            fontSize: 12, italic: true, color: '999999', align: 'center'
          });
        }
      } else {
        slide3.addText('No customer data available.', {
          x: 0.5, y: 2.5, w: 9, h: 0.5,
          fontSize: 18, italic: true, color: '999999', align: 'center'
        });
      }

        pptx.writeFile({ fileName: `${reportType}-customer-report-${new Date().toISOString().split('T')[0]}.pptx` });
        toast.success("PowerPoint report generated and downloaded!");
      } catch (error) {
        console.error('Error generating PowerPoint with logo:', error);
        toast.error("Failed to generate PowerPoint report");
      }
    } else {
      // HTML Report
      try {
        const logoBase64 = await getLogoAsBase64();
        const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 1200px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #9333ea; padding-bottom: 20px; }
            .logo { width: 80px; height: 80px; margin: 0 auto 20px; display: block; }
            .header h1 { color: #9333ea; margin: 0 0 10px 0; font-size: 32px; }
            .header p { color: #666; margin: 5px 0; font-size: 14px; }
            .stats { display: flex; justify-content: space-around; margin: 30px 0; flex-wrap: wrap; gap: 15px; }
            .stat-box { text-align: center; padding: 20px; background: linear-gradient(135deg, #9333ea 0%, #c026d3 100%); color: white; border-radius: 10px; min-width: 140px; }
            .stat-box .label { font-size: 14px; opacity: 0.9; }
            .stat-box .value { font-size: 32px; font-weight: bold; margin-top: 5px; }
            .revenue-box { text-align: center; padding: 20px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; border-radius: 10px; margin: 20px 0; }
            .section { margin: 30px 0; }
            .section h2 { color: #333; border-bottom: 2px solid #9333ea; padding-bottom: 10px; }
            .customer-list { list-style: none; padding: 0; }
            .customer-item { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #9333ea; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .customer-item h3 { margin: 0 0 8px 0; color: #333; font-size: 18px; }
            .customer-item p { margin: 5px 0; color: #555; font-size: 14px; line-height: 1.6; }
            .customer-item p strong { color: #333; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${logoBase64}" alt="BTM Travel Logo" class="logo" />
              <h1>${reportTitle}</h1>
              <p style="font-size: 16px; font-weight: 600; color: #9333ea; margin: 10px 0;">${dateRange}</p>
              <p>Generated on: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
            </div>
            
            <div class="stats">
              <div class="stat-box">
                <div class="label">Total Customers</div>
                <div class="value">${totalCustomers}</div>
              </div>
              <div class="stat-box">
                <div class="label">Active</div>
                <div class="value">${activeCount}</div>
              </div>
              <div class="stat-box">
                <div class="label">VIP</div>
                <div class="value">${vipCount}</div>
              </div>
              <div class="stat-box">
                <div class="label">Corporate</div>
                <div class="value">${corporateCount}</div>
              </div>
            </div>
            
            <div class="revenue-box">
              <div class="label" style="font-size: 16px;">Total Revenue</div>
              <div class="value" style="font-size: 36px;">₦${revenue.toLocaleString()}</div>
            </div>
            
            <div class="section">
              <h2>Customer List (${customers.length})</h2>
              ${customers.length > 0 ? `
                <ul class="customer-list">
                  ${customers.map(customer => {
                    const custRevenue = customer.purchaseHistory.reduce((sum, p) => sum + p.amount, 0);
                    return `
                      <li class="customer-item">
                        <h3>${customer.name} - ${customer.business}</h3>
                        <p><strong>Phone:</strong> ${customer.phone}</p>
                        <p><strong>Email:</strong> ${customer.email}</p>
                        <p><strong>Status:</strong> ${customer.status} | <strong>Total Purchases:</strong> ${customer.purchaseHistory.length} | <strong>Revenue:</strong> ₦${custRevenue.toLocaleString()}</p>
                        <p><strong>Last Contact:</strong> ${customer.lastContact}</p>
                        ${customer.notes ? `<p><strong>Notes:</strong> ${customer.notes}</p>` : ''}
                      </li>
                    `;
                  }).join('')}
                </ul>
              ` : '<p style="color: #999; font-style: italic; padding: 20px; text-align: center;">No customer data available.</p>'}
            </div>
            
            <div class="footer">
              <p>This report was generated by BTM Travel Customer Service System</p>
              <p>For internal use only - Confidential</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([reportHTML], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${reportType}-customer-report-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success("HTML report generated and downloaded!");
      } catch (error) {
        console.error('Error generating HTML report with logo:', error);
        toast.error("Failed to generate HTML report");
      }
    }
  };

  // Calculate statistics for customers
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === "active" || c.status === "vip").length;
  const vipCustomers = customers.filter(c => c.status === "vip").length;
  const totalRevenue = customers.reduce((sum, c) => 
    sum + c.purchaseHistory.reduce((pSum, p) => pSum + p.amount, 0), 0
  );
  
  // Calculate completion statistics (for tracking customer interactions)
  const completedInteractions = customers.filter(c => c.notes && c.notes.length > 0).length;
  const pendingInteractions = customers.filter(c => !c.notes || c.notes.length === 0).length;
  
  // Debug logging for statistics
  useEffect(() => {
    console.log('[CUSTOMER SERVICE] Statistics update:', {
      totalCustomers,
      completedInteractions,
      pendingInteractions,
      customers: customers.length,
      currentUser: currentUser?.name
    });
  }, [totalCustomers, completedInteractions, pendingInteractions, customers.length, currentUser?.name]);

  return (
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
              <DialogDescription>
                Add an existing customer to the system
              </DialogDescription>
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
                  <Label htmlFor="status">Status *</Label>
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
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="customer@email.com"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      className="pl-10 bg-white/60 backdrop-blur-xl border-white/20"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+234 XXX XXX XXXX"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      className="pl-10 bg-white/60 backdrop-blur-xl border-white/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Customer Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any relevant information about this customer..."
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  rows={4}
                  className="bg-white/60 backdrop-blur-xl border-white/20"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setNewCustomer({
                    name: "",
                    email: "",
                    phone: "",
                    business: "Online Sales",
                    status: "active",
                    notes: ""
                  });
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddCustomer}
                  className="bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/20"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
          )}
        
        {isManager && (
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 transition-all px-5 py-2.5 rounded-xl"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Import Customer List</DialogTitle>
              <DialogDescription>
                Upload a CSV file to import multiple customers at once
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-blue-900 mb-2">CSV Format Requirements</h4>
                <p className="text-blue-800 mb-3">
                  Your CSV file should include the following columns in order:
                </p>
                <ul className="list-disc list-inside text-blue-800 space-y-1 mb-3">
                  <li>Name (required)</li>
                  <li>Email (required)</li>
                  <li>Phone (required)</li>
                  <li>Status (optional: active, inactive, vip, corporate)</li>
                  <li>Last Contact (optional)</li>
                  <li>Total Purchases (optional, number)</li>
                  <li>Total Revenue (optional, number)</li>
                  <li>Notes (optional)</li>
                </ul>
                <Button 
                  variant="outline" 
                  onClick={handleDownloadTemplate}
                  className="bg-blue-100 border-blue-300 hover:bg-blue-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="csv-file">Select CSV File</Label>
                <Input
                  ref={fileInputRef}
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleImportCustomers}
                  className="bg-white/60 backdrop-blur-xl border-white/20 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-br file:from-violet-600 file:to-purple-600 file:text-white file:cursor-pointer hover:file:opacity-90"
                />
              </div>
              <p className="text-muted-foreground">
                Select a CSV file from your computer to import customers
              </p>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        )}
        
        <Button 
          onClick={handleExportCSV}
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transition-all px-5 py-2.5 rounded-xl"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>

        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all px-5 py-2.5 rounded-xl"
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-gray-900">
                Generate Customer Service Report
              </DialogTitle>
              <DialogDescription className="text-gray-700">
                Select the type of report you want to generate
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <RadioGroup value={reportType} onValueChange={(value: any) => setReportType(value)}>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2 p-2.5 rounded-lg border border-purple-200 hover:bg-purple-50/50 cursor-pointer transition-colors">
                      <RadioGroupItem value="daily" id="daily" />
                      <Label htmlFor="daily" className="flex-1 cursor-pointer text-sm">
                        Daily
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2.5 rounded-lg border border-purple-200 hover:bg-purple-50/50 cursor-pointer transition-colors">
                      <RadioGroupItem value="weekly" id="weekly" />
                      <Label htmlFor="weekly" className="flex-1 cursor-pointer text-sm">
                        Weekly
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2.5 rounded-lg border border-purple-200 hover:bg-purple-50/50 cursor-pointer transition-colors">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly" className="flex-1 cursor-pointer text-sm">
                        Monthly
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2.5 rounded-lg border border-purple-200 hover:bg-purple-50/50 cursor-pointer transition-colors">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="flex-1 cursor-pointer text-sm">
                        Custom Range
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="border-t border-gray-200"></div>

              <div className="space-y-2">
                <Label>Report Format</Label>
                <RadioGroup value={reportFormat} onValueChange={(value: any) => setReportFormat(value)}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 p-2.5 rounded-lg border border-green-200 hover:bg-green-50/50 cursor-pointer transition-colors">
                      <RadioGroupItem value="html" id="html" />
                      <Label htmlFor="html" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm">HTML</span>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2.5 rounded-lg border border-red-200 hover:bg-red-50/50 cursor-pointer transition-colors">
                      <RadioGroupItem value="pdf" id="pdf" />
                      <Label htmlFor="pdf" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-1.5">
                          <FileDown className="w-4 h-4 text-red-600" />
                          <span className="text-sm">PDF</span>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2.5 rounded-lg border border-orange-200 hover:bg-orange-50/50 cursor-pointer transition-colors">
                      <RadioGroupItem value="pptx" id="pptx" />
                      <Label htmlFor="pptx" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-1.5">
                          <Presentation className="w-4 h-4 text-orange-600" />
                          <span className="text-sm">PowerPoint</span>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2.5 rounded-lg border border-green-200 hover:bg-green-50/50 cursor-pointer transition-colors">
                      <RadioGroupItem value="csv" id="csv" />
                      <Label htmlFor="csv" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-1.5">
                          <Download className="w-4 h-4 text-green-600" />
                          <span className="text-sm">CSV</span>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
                <p className="text-xs text-gray-500 mt-2">
                  {reportFormat === "html" && "📄 Best for quick viewing in browser"}
                  {reportFormat === "pdf" && "📑 Best for printing and archiving"}
                  {reportFormat === "pptx" && "📊 Best for presentations and meetings"}
                  {reportFormat === "csv" && "📈 Best for data analysis in Excel"}
                </p>
              </div>

              {reportType === "custom" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
                  <h4 className="text-sm font-medium text-blue-900">Select Date Range</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="start-date" className="text-sm">Start Date</Label>
                      {reportType === "custom" && isReportDialogOpen && (
                        <Popover open={startDatePopoverOpen} onOpenChange={setStartDatePopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              id="start-date"
                              variant="outline"
                              className="w-full justify-start text-left font-normal bg-white h-9 text-sm"
                            >
                              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                              {customStartDate ? customStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={customStartDate}
                              onSelect={(date) => {
                                setCustomStartDate(date);
                                setStartDatePopoverOpen(false);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="end-date" className="text-sm">End Date</Label>
                      {reportType === "custom" && isReportDialogOpen && (
                        <Popover open={endDatePopoverOpen} onOpenChange={setEndDatePopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              id="end-date"
                              variant="outline"
                              className="w-full justify-start text-left font-normal bg-white h-9 text-sm"
                            >
                              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                              {customEndDate ? customEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={customEndDate}
                              onSelect={(date) => {
                                setCustomEndDate(date);
                                setEndDatePopoverOpen(false);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-purple-900 mb-1.5">Report Includes:</h4>
                <ul className="text-xs text-purple-800 space-y-0.5">
                  <li>✓ Summary stats & customer data</li>
                  <li>✓ Revenue & purchase history</li>
                  {reportFormat === "html" && (
                    <li>✓ Visual styling & detailed layout</li>
                  )}
                  {reportFormat === "pdf" && (
                    <li>✓ Multi-page PDF with page numbers</li>
                  )}
                  {reportFormat === "pptx" && (
                    <li>✓ Presentation slides with charts</li>
                  )}
                  {reportFormat === "csv" && (
                    <li>✓ Spreadsheet for Excel</li>
                  )}
                </ul>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleGenerateReport}
                className="bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20"
              >
                {reportFormat === "html" && (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate HTML Report
                  </>
                )}
                {reportFormat === "pdf" && (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    Generate PDF Report
                  </>
                )}
                {reportFormat === "pptx" && (
                  <>
                    <Presentation className="w-4 h-4 mr-2" />
                    Generate PowerPoint
                  </>
                )}
                {reportFormat === "csv" && (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate CSV Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
      
      {/* Main Statistics - Matching ClientCRM Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-white via-purple-50/30 to-white backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 mb-1 font-medium">Total</p>
                <div className="text-3xl font-bold text-purple-600">
                  {totalCustomers}
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/30">
                <Headphones className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white via-orange-50/30 to-white backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 mb-1 font-medium">Pending</p>
                <div className="text-3xl font-bold text-orange-600">
                  {pendingInteractions}
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl shadow-lg shadow-orange-500/30">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white via-green-50/30 to-white backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 mb-1 font-medium">Completed</p>
                <div className="text-3xl font-bold text-green-600">
                  {completedInteractions}
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg shadow-green-500/30">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/90 mb-1">Progress</p>
                <div className="text-3xl font-bold">
                  {totalCustomers > 0 ? Math.round((completedInteractions / totalCustomers) * 100) : 0}%
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${totalCustomers > 0 ? Math.min((completedInteractions / totalCustomers) * 100, 100) : 0}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-purple-400" />
        <Input
          placeholder="🔍 Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-14 h-14 bg-white/80 backdrop-blur-xl border-2 border-purple-200 shadow-xl focus:shadow-2xl focus:shadow-purple-500/20 focus:border-purple-400 transition-all rounded-2xl text-lg"
        />
      </div>

      {/* Action Controls */}
      <Card className="bg-white/80 backdrop-blur-xl border-2 border-purple-200 shadow-lg rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedCustomerIds.length > 0 && selectedCustomerIds.length === filteredCustomers.length}
                  onCheckedChange={handleSelectAll}
                  className="border-2 border-purple-400"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({selectedCustomerIds.length} selected)
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
                className="border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50"
              >
                {showArchived ? (
                  <>
                    <ArchiveRestore className="w-4 h-4 mr-2" />
                    Show Active
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4 mr-2" />
                    Show Archived
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {!showArchived && isAdmin && selectedCustomerIds.length > 0 && (
                <Button
                  onClick={handleArchiveSelected}
                  variant="outline"
                  size="sm"
                  className="border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50 text-orange-600"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Selected
                </Button>
              )}
              
              {showArchived && selectedCustomerIds.length > 0 && (
                <Button
                  onClick={handleRestoreSelected}
                  variant="outline"
                  size="sm"
                  className="border-2 border-green-300 hover:border-green-500 hover:bg-green-50 text-green-600"
                >
                  <ArchiveRestore className="w-4 h-4 mr-2" />
                  Restore Selected
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-xl border-2 border-purple-200 shadow-2xl shadow-purple-500/10 hover:shadow-3xl hover:shadow-purple-500/20 transition-all duration-300 rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 border-b-2 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Customer Database</CardTitle>
              <CardDescription className="text-base">View and manage all existing customers</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-100 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100">
                <TableHead className="text-purple-900 font-bold w-12"></TableHead>
                <TableHead className="text-purple-900 font-bold">Customer</TableHead>
                <TableHead className="text-purple-900 font-bold">Contact</TableHead>
                <TableHead className="text-purple-900 font-bold">Status</TableHead>
                <TableHead className="text-purple-900 font-bold">Business</TableHead>
                <TableHead className="text-purple-900 font-bold">Purchases</TableHead>
                <TableHead className="text-purple-900 font-bold">Total Spent</TableHead>
                <TableHead className="text-purple-900 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer, index) => {
                const totalSpent = customer.purchaseHistory.reduce((sum, p) => sum + p.amount, 0);
                const rowColors = [
                  'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50',
                  'hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50',
                  'hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50'
                ];
                
                return (
                  <TableRow key={customer.id} className={`border-b border-purple-100 transition-all ${rowColors[index % 3]} ${selectedCustomerIds.includes(customer.id) ? 'ring-2 ring-purple-500' : ''}`}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCustomerIds.includes(customer.id)}
                        onCheckedChange={() => handleSelectCustomer(customer.id)}
                        className="border-2 border-purple-400"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold shadow-lg">
                          {customer.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-purple-500" />
                          <span className="text-gray-700">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-700">{customer.phone}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleMakeCall(customer.phone, customer.name)}
                                  className="ml-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg h-7 px-2.5 rounded-lg"
                                >
                                  <PhoneCall className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Click to call {customer.name}{config.enabled ? ' via 3CX' : ' (Simulation)'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          customer.status === "vip" 
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg shadow-yellow-500/30 px-3 py-1" 
                            : customer.status === "corporate"
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-lg shadow-blue-500/30 px-3 py-1"
                            : customer.status === "active"
                            ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg shadow-green-500/30 px-3 py-1"
                            : "bg-gray-200 text-gray-700 border-0 px-3 py-1"
                        }
                      >
                        {customer.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`whitespace-nowrap font-medium border-2 px-3 py-1 ${
                          customer.business === "Corporate" ? "border-blue-300 bg-blue-50 text-blue-700" :
                          customer.business === "Online Sales" ? "border-purple-300 bg-purple-50 text-purple-700" :
                          customer.business === "Channel" ? "border-green-300 bg-green-50 text-green-700" :
                          customer.business === "Retails" ? "border-pink-300 bg-pink-50 text-pink-700" :
                          customer.business === "Protocol" ? "border-orange-300 bg-orange-50 text-orange-700" :
                          "border-gray-300 bg-gray-50 text-gray-700"
                        }`}
                      >
                        {customer.business}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-900">
                        <ShoppingBag className="w-4 h-4 text-indigo-500" />
                        <span className="font-semibold">{customer.totalPurchases}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-green-600 text-lg">${totalSpent.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewCustomer(customer)}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all"
                        >
                          View Details
                        </Button>
                        {isAdmin && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => handleDeleteClick(customer)}
                                  variant="outline"
                                  size="sm"
                                  className="border-2 border-red-300 hover:border-red-500 hover:bg-red-50 text-red-600 hover:text-red-700 transition-all h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Delete customer (Admin only)
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DraggableDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          toast.info("⚠️ Reminder: If you assisted this customer, mark it complete using 'Complete Interaction' button!", { duration: 5000 });
        }}
        title={selectedCustomer ? `${selectedCustomer.name} - Customer Details` : "Customer Details"}
        defaultWidth={900}
        defaultHeight={700}
        minWidth={700}
        minHeight={500}
      >
        {selectedCustomer && (
          <div className="h-full overflow-y-auto bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6 space-y-6">
            {/* Header Section */}
            <div className="space-y-3 pb-4 border-b border-purple-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 shrink-0">
                    <User className="w-7 h-7" />
                  </div>
                  <div className="space-y-2 min-w-0 flex-1">
                    <h2 className="text-2xl lg:text-3xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {selectedCustomer.name}
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge 
                        variant={
                          selectedCustomer.status === "vip" ? "default" :
                          selectedCustomer.status === "corporate" ? "default" :
                          selectedCustomer.status === "active" ? "secondary" :
                          "outline"
                        }
                        className={
                          selectedCustomer.status === "vip" || selectedCustomer.status === "corporate"
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 border-0 shadow-lg shadow-yellow-500/30"
                            : ""
                        }
                      >
                        {selectedCustomer.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="bg-white/60 backdrop-blur-xl border-purple-200">
                        {selectedCustomer.business}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complete customer profile and interaction history
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 shrink-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={openEditCustomerDialog}
                          variant="outline"
                          className="bg-white/60 backdrop-blur-xl border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit Info
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit customer information</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => makeCall(selectedCustomer.phone, selectedCustomer.name)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all"
                        >
                          <PhoneCall className="w-4 h-4 mr-2" />
                          Call Now
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Call {selectedCustomer.name}{config.enabled ? ' via 3CX' : ' (Simulation)'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="space-y-6">
                {/* Contact Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg hover:shadow-purple-500/20 transition-all">
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md shrink-0">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardDescription className="text-xs mb-0.5">Email Address</CardDescription>
                          <p className="text-sm break-all">{selectedCustomer.email}</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg hover:shadow-green-500/20 transition-all">
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md shrink-0">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardDescription className="text-xs mb-0.5">Phone Number</CardDescription>
                          <p className="text-sm">{selectedCustomer.phone}</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shrink-0">
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardDescription className="text-xs mb-0.5">Business Type</CardDescription>
                          <p className="text-sm">{selectedCustomer.business}</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/20 transition-all">
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md shrink-0">
                          <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardDescription className="text-xs mb-0.5">Total Purchases</CardDescription>
                          <p className="text-sm">{selectedCustomer.totalPurchases} orders</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 hover:shadow-lg hover:shadow-pink-500/20 transition-all">
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-md shrink-0">
                          <span className="text-white">$</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardDescription className="text-xs mb-0.5">Total Revenue</CardDescription>
                          <p className="text-sm">
                            ${selectedCustomer.purchaseHistory.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </div>

                {/* Latest Promotions Section */}
                <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 shadow-lg shadow-orange-500/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-md">
                        <Tag className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                          Latest Promotions
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Share these current offers with the customer
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {latestPromotions.map((promo, index) => (
                      <div 
                        key={promo.id}
                        className="p-4 bg-white rounded-lg border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{promo.name}</h4>
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                Active
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">Valid until {promo.endDate}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                              {promo.discount}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-md border border-orange-200">
                            <span className="text-xs text-gray-500">Code:</span>
                            <code className="font-mono font-bold text-orange-600">{promo.code}</code>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(promo.code);
                              toast.success(`Promo code "${promo.code}" copied!`);
                            }}
                            className="h-7 text-xs border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                          >
                            Copy Code
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Usage</span>
                              <span>{promo.usage}/{promo.target}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-gradient-to-r from-orange-500 to-yellow-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${(promo.usage / promo.target) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingUp className="w-3 h-3" />
                            <span className="font-medium">{Math.round((promo.usage / promo.target) * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-2">
                      <p className="text-xs text-center text-gray-500">
                        🌐 All promotions available at <span className="font-medium text-orange-600">adventure.btmtravel.net</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Purchase History Section */}
                <Collapsible open={isPurchaseHistoryOpen} onOpenChange={setIsPurchaseHistoryOpen}>
                  <Card className="bg-white/80 backdrop-blur-xl border-purple-200 shadow-xl shadow-purple-500/10">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md">
                              <ShoppingBag className="w-5 h-5 text-white" />
                            </div>
                            <CardTitle className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                              Purchase History
                            </CardTitle>
                            <ChevronDown className={`w-5 h-5 text-purple-600 transition-transform ${isPurchaseHistoryOpen ? 'rotate-180' : ''}`} />
                          </div>
                          <Button 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openAddPurchaseDialog();
                            }}
                            className="bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:from-violet-700 hover:to-purple-700 transition-all"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Purchase
                          </Button>
                        </div>
                      </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="pt-6">
                    {selectedCustomer.purchaseHistory.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-4">
                          <ShoppingBag className="w-10 h-10 text-purple-400" />
                        </div>
                        <p className="text-muted-foreground mb-1">No purchase history yet</p>
                        <p className="text-sm text-muted-foreground">Add the first purchase to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedCustomer.purchaseHistory.map((purchase) => (
                          <div 
                            key={purchase.id}
                            className="p-4 rounded-lg bg-gradient-to-r from-purple-50/50 to-blue-50/50 border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-3">
                                  <p className="font-medium">{purchase.product}</p>
                                  <Badge variant="outline" className="bg-white/80">
                                    {purchase.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{purchase.date}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-purple-600">
                                      ${purchase.amount.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditPurchaseDialog(purchase)}
                                  className="h-8 w-8 p-0 hover:bg-purple-100"
                                >
                                  <Pencil className="w-4 h-4 text-purple-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this purchase?")) {
                                      handleDeletePurchase(purchase.id);
                                    }
                                  }}
                                  className="h-8 w-8 p-0 hover:bg-red-100"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Call Script Section */}
                <Collapsible open={isCallScriptOpen} onOpenChange={setIsCallScriptOpen}>
                  <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200 shadow-lg shadow-cyan-500/10">
                    <CardHeader>
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md">
                              <PhoneCall className="w-5 h-5 text-white" />
                            </div>
                            <CardTitle className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                              Call Script
                            </CardTitle>
                            <ChevronDown className={`w-5 h-5 text-cyan-600 transition-transform ${isCallScriptOpen ? 'rotate-180' : ''}`} />
                          </div>
                          <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200">
                            📞 Guide
                          </Badge>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardDescription className="mt-2">
                          Use this script as a guide when assisting customers with inquiries and support
                        </CardDescription>
                      </CollapsibleContent>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        {isLoadingScript ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                            <p className="text-sm text-muted-foreground mt-2">Loading call script...</p>
                          </div>
                        ) : (
                          <>
                            <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-100">
                              <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide mb-2">Greeting</p>
                              <p className="text-sm text-gray-900 leading-relaxed">
                                {callScript.greeting
                                  .replace('[Name]', selectedCustomer.name.split(' ')[0])
                                  .replace('[Your Name]', 'your name')}
                              </p>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Purpose</p>
                              <p className="text-sm text-gray-900 leading-relaxed">
                                {callScript.purpose}
                              </p>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">Key Questions</p>
                              <ul className="space-y-2">
                                {callScript.discovery.map((question: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-900">
                                    <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span className="leading-relaxed">{question}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">Closing</p>
                              <p className="text-sm text-gray-900 leading-relaxed">
                                {callScript.closing}
                              </p>
                            </div>

                            <Alert className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
                              <AlertDescription className="text-xs text-cyan-800">
                                <strong>💡 Pro Tip:</strong> Customize the script based on the customer's specific needs and situation. Keep the conversation natural and friendly.
                              </AlertDescription>
                            </Alert>
                          </>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Quick Email Response Section */}
                <Collapsible open={isEmailSectionOpen} onOpenChange={setIsEmailSectionOpen}>
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg shadow-purple-500/10">
                    <CardHeader>
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                              <Mail className="w-5 h-5 text-white" />
                            </div>
                            <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              Quick Email Response
                            </CardTitle>
                            <ChevronDown className={`w-5 h-5 text-purple-600 transition-transform ${isEmailSectionOpen ? 'rotate-180' : ''}`} />
                          </div>
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            ✓ Ready
                          </Badge>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardDescription className="mt-2">
                          Send urgent information or assistance to the customer instantly
                        </CardDescription>
                        
                        {/* SMTP Configuration Info */}
                        <div className="mt-3">
                          <Alert className="bg-blue-50 border-blue-200">
                            <AlertDescription className="text-xs text-blue-800">
                              <strong>📧 Email Configuration:</strong> Configure SMTP in <strong>Settings → SMTP Configuration</strong> to send emails to customers. Without SMTP, email sending may fail.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </CollapsibleContent>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email-template">Email Template</Label>
                          <Select value={emailTemplate} onValueChange={handleEmailTemplateChange}>
                            <SelectTrigger id="email-template" className="bg-white">
                              <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="urgent">🚨 Urgent Assistance</SelectItem>
                              <SelectItem value="booking">📋 Booking Confirmation</SelectItem>
                              <SelectItem value="payment">💳 Payment Information</SelectItem>
                              <SelectItem value="inquiry">💬 General Inquiry</SelectItem>
                              <SelectItem value="custom">✏️ Custom Message</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email-to">To</Label>
                          <Input
                            id="email-to"
                            type="email"
                            value={selectedCustomer?.email || ""}
                            readOnly
                            className="bg-white"
                            placeholder="email@company.com"
                          />
                          {!selectedCustomer?.email && (
                            <p className="text-xs text-orange-500">
                              No email address available for this customer
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email-subject">Subject</Label>
                          <Input
                            id="email-subject"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            placeholder="Email subject"
                            className="bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email-message">Message</Label>
                          <Textarea
                            id="email-message"
                            value={emailMessage}
                            onChange={(e) => setEmailMessage(e.target.value)}
                            placeholder="Type your message here..."
                            rows={6}
                            className="bg-white"
                          />
                        </div>

                        <Button
                          onClick={handleSendQuickEmail}
                          disabled={isSendingEmail || !selectedCustomer?.email}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          {isSendingEmail ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Response Section */}
                <Card className="bg-white/80 backdrop-blur-xl border-green-200 shadow-xl shadow-green-500/10">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <CardTitle className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Send Response / Add Note
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <Textarea
                      id="response"
                      placeholder="Enter your response or add notes..."
                      value={responseNote}
                      onChange={(e) => setResponseNote(e.target.value)}
                      rows={4}
                      className="bg-white/80 border-green-200 focus:border-green-400 focus:ring-green-400"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSendResponse} 
                        disabled={!responseNote.trim()}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Add Note & Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Complete Interaction Section */}
                <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 shadow-2xl shadow-emerald-500/20">
                  <CardHeader className="bg-gradient-to-r from-emerald-100 to-green-100 border-b-2 border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
                          Complete Interaction
                        </CardTitle>
                        <CardDescription className="text-emerald-700 text-xs mt-1">
                          Mark this customer service interaction as completed
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 mb-4">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-xs text-blue-800">
                        <strong>Complete this interaction</strong> when you're done assisting this customer. This helps track agent productivity and customer service metrics.
                      </AlertDescription>
                    </Alert>
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => setIsCompleteDialogOpen(true)}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-xl shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Interaction
                      </Button>
                    </div>
                  </CardContent>
                </Card>
            </div>
          </div>
        )}
      </DraggableDialog>

      {/* Purchase Add/Edit Dialog */}
      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPurchase ? "Edit Purchase" : "Add New Purchase"}</DialogTitle>
            <DialogDescription>
              {editingPurchase ? "Update purchase details" : "Add a new purchase to customer history"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase-date">Purchase Date *</Label>
                <Input
                  id="purchase-date"
                  placeholder="Oct 14, 2025"
                  value={purchaseForm.date}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, date: e.target.value })}
                  className="bg-white/60 backdrop-blur-xl border-white/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purchase-amount">Amount (USD) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="purchase-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={purchaseForm.amount}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, amount: e.target.value })}
                    className="pl-7 bg-white/60 backdrop-blur-xl border-white/20"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase-product">Product/Service Name *</Label>
              <Input
                id="purchase-product"
                placeholder="Enter product or service name"
                value={purchaseForm.product}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, product: e.target.value })}
                className="bg-white/60 backdrop-blur-xl border-white/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase-status">Status *</Label>
              <Select 
                value={purchaseForm.status} 
                onValueChange={(value) => setPurchaseForm({ ...purchaseForm, status: value })}
              >
                <SelectTrigger className="bg-white/60 backdrop-blur-xl border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsPurchaseDialogOpen(false);
                setEditingPurchase(null);
                setPurchaseForm({
                  date: "",
                  product: "",
                  amount: "",
                  status: "Completed"
                });
              }}>
                Cancel
              </Button>
              <Button 
                onClick={editingPurchase ? handleEditPurchase : handleAddPurchase}
                className="bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/20"
              >
                {editingPurchase ? (
                  <>
                    <Pencil className="w-4 h-4 mr-2" />
                    Update Purchase
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Purchase
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-red-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Customer
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{customerToDelete?.name}</span>? This will permanently remove all their information including purchase history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/60 hover:bg-white/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-orange-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
              <Archive className="w-5 h-5" />
              Archive Customers
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive {selectedCustomerIds.length} customer(s)? Archived customers can be restored later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/60 hover:bg-white/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmArchive}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Customer Info Dialog */}
      <Dialog open={isEditCustomerDialogOpen} onOpenChange={setIsEditCustomerDialogOpen}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-purple-600" />
              Edit Customer Information
            </DialogTitle>
            <DialogDescription>
              Update customer details and contact information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-customer-name">Name *</Label>
                <Input
                  id="edit-customer-name"
                  placeholder="Customer name"
                  value={editCustomerForm.name}
                  onChange={(e) => setEditCustomerForm({ ...editCustomerForm, name: e.target.value })}
                  className="bg-white/60 backdrop-blur-xl border-white/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-customer-email">Email *</Label>
                <Input
                  id="edit-customer-email"
                  type="email"
                  placeholder="email@example.com"
                  value={editCustomerForm.email}
                  onChange={(e) => setEditCustomerForm({ ...editCustomerForm, email: e.target.value })}
                  className="bg-white/60 backdrop-blur-xl border-white/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-customer-phone">Phone *</Label>
                <Input
                  id="edit-customer-phone"
                  placeholder="+234 XXX XXX XXXX"
                  value={editCustomerForm.phone}
                  onChange={(e) => setEditCustomerForm({ ...editCustomerForm, phone: e.target.value })}
                  className="bg-white/60 backdrop-blur-xl border-white/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-customer-business">Business Type</Label>
                <Select 
                  value={editCustomerForm.business} 
                  onValueChange={(value) => setEditCustomerForm({ ...editCustomerForm, business: value as any })}
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

            <div className="space-y-2">
              <Label htmlFor="edit-customer-status">Status</Label>
              <Select 
                value={editCustomerForm.status} 
                onValueChange={(value) => setEditCustomerForm({ ...editCustomerForm, status: value as any })}
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
              <Label htmlFor="edit-customer-notes">Notes</Label>
              <Textarea
                id="edit-customer-notes"
                placeholder="Additional notes about this customer..."
                value={editCustomerForm.notes}
                onChange={(e) => setEditCustomerForm({ ...editCustomerForm, notes: e.target.value })}
                rows={4}
                className="bg-white/60 backdrop-blur-xl border-white/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsEditCustomerDialogOpen(false)}
                className="bg-white/60 hover:bg-white/80"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditCustomer}
                className="bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Interaction Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              Complete Customer Service Interaction
            </DialogTitle>
            <DialogDescription className="text-emerald-800">
              Record the outcome of this customer service interaction
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            {/* Outcome Selection */}
            <div className="space-y-3">
              <Label className="text-base">Interaction Outcome *</Label>
              <RadioGroup value={interactionOutcome} onValueChange={(value: any) => setInteractionOutcome(value)}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 bg-white/80 border-2 border-green-200 rounded-lg p-3 hover:border-green-400 transition-all">
                    <RadioGroupItem value="resolved" id="resolved" />
                    <Label htmlFor="resolved" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-medium">Resolved</div>
                        <div className="text-xs text-muted-foreground">Issue fully resolved</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 bg-white/80 border-2 border-blue-200 rounded-lg p-3 hover:border-blue-400 transition-all">
                    <RadioGroupItem value="information-provided" id="information-provided" />
                    <Label htmlFor="information-provided" className="flex items-center gap-2 cursor-pointer flex-1">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-medium">Info Provided</div>
                        <div className="text-xs text-muted-foreground">Information shared</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 bg-white/80 border-2 border-orange-200 rounded-lg p-3 hover:border-orange-400 transition-all">
                    <RadioGroupItem value="follow-up" id="follow-up" />
                    <Label htmlFor="follow-up" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <div>
                        <div className="font-medium">Follow-up</div>
                        <div className="text-xs text-muted-foreground">Requires follow-up</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 bg-white/80 border-2 border-red-200 rounded-lg p-3 hover:border-red-400 transition-all">
                    <RadioGroupItem value="escalated" id="escalated" />
                    <Label htmlFor="escalated" className="flex items-center gap-2 cursor-pointer flex-1">
                      <TrendingUp className="w-4 h-4 text-red-600" />
                      <div>
                        <div className="font-medium">Escalated</div>
                        <div className="text-xs text-muted-foreground">Escalated to manager</div>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Completion Notes */}
            <div className="space-y-2">
              <Label htmlFor="completion-notes" className="text-base">Interaction Notes *</Label>
              <Textarea
                id="completion-notes"
                placeholder="Describe what was discussed, actions taken, and any follow-up needed..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={6}
                className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
              />
              <p className="text-xs text-muted-foreground">
                These notes will be added to the customer's record with a timestamp and your name.
              </p>
            </div>

            {/* Info Alert */}
            <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-800">
                Completing this interaction will close the customer detail view and log this activity for tracking and analytics purposes.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCompleteDialogOpen(false);
                setCompletionNotes("");
                setInteractionOutcome("resolved");
              }}
              className="bg-white/60 hover:bg-white/80"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteInteraction}
              disabled={!completionNotes.trim() || isCompletingInteraction}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-xl shadow-emerald-500/40 disabled:opacity-50"
            >
              {isCompletingInteraction ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

      {/* Import Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Preview Import - {previewCustomers.length} Customer{previewCustomers.length !== 1 ? 's' : ''} Ready
            </DialogTitle>
            <DialogDescription>
              Review the customers below before importing. You can cancel or proceed with the import.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Import Errors */}
            {importErrors.length > 0 && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Warning:</strong> {importErrors.join(", ")}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-900 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <strong>Import Summary</strong>
              </div>
              <p className="text-green-800 text-sm">
                <strong>{previewCustomers.length}</strong> customer{previewCustomers.length !== 1 ? 's' : ''} will be added to your existing customer list.
              </p>
              <p className="text-green-700 text-xs mt-1">
                Current customers: <strong>{customers.length}</strong> → After import: <strong>{customers.length + previewCustomers.length}</strong>
              </p>
            </div>

            {/* Preview Table */}
            <div className="flex-1 overflow-hidden border rounded-lg bg-white">
              <div className="overflow-auto h-full max-h-[400px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewCustomers.map((customer, index) => (
                      <TableRow key={customer.id}>
                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="text-sm">{customer.email}</TableCell>
                        <TableCell className="text-sm font-mono">{customer.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {customer.business}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              customer.status === "vip" || customer.status === "corporate" ? "default" :
                              customer.status === "active" ? "secondary" :
                              "outline"
                            }
                            className={
                              customer.status === "vip" || customer.status === "corporate"
                                ? "bg-gradient-to-r from-yellow-500 to-orange-500 border-0 text-xs"
                                : "text-xs"
                            }
                          >
                            {customer.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {customer.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Ready to import? Click <strong>"Confirm Import"</strong> to add these customers.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleCancelImport}
                className="bg-white/60 hover:bg-white/80"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmImport}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Import ({previewCustomers.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
