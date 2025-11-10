import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Phone, Check, Clock, ChevronLeft, ChevronRight, FileText, Calendar as CalendarIcon, PhoneCall, Plus, Building2, Mail, ChevronDown, Upload, Download, Sparkles, TrendingUp, Target, Users, Trash2, Archive, ArchiveRestore, FileDown, Presentation } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner@2.0.3";
import { backendService } from '../utils/backendService';
import { useUser } from './UserContext';
import { ManagerDashboard } from './ManagerDashboard';
import { useThreeCX } from './ThreeCXContext';
import { DraggableDialog } from './DraggableDialog';
import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';
import logoImage from 'figma:asset/da4baf9e9e75fccb7e053a2cc52f5b251f4636a9.png';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  businessType?: "Online Sales" | "Corporate" | "Channel" | "Retails" | "Protocol" | "Others";
  corporate?: boolean;
  status?: "pending" | "completed" | "in-progress";
  lastContact?: string;
  notes?: string;
  source?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedAt?: string;
  createdAt?: string;
  assignmentId?: string; // Reference to the assignment in the database
  isSpecial?: boolean; // Flag for special database assignments
  specialPurpose?: string; // Purpose from special database
}

// No hardcoded contacts - all contacts come from the database

const defaultCallScript = {
  greeting: "Good morning/afternoon! This is [Your Name] from BTM Travel. Am I speaking with [Contact Name]?",
  introduction: "I'm calling today because we have some exciting new travel packages and adventure tours that might interest you and your company.",
  discovery: [
    "Have you traveled with us before?",
    "What types of trips is your company planning?",
    "What's your typical travel budget range?"
  ],
  value: "We specialize in corporate travel packages, adventure tours, and customized group experiences. Our clients save an average of 20% compared to booking individually.",
  objectionHandling: {
    "Not interested": "I understand. Can I ask what challenges you're currently facing with travel planning?",
    "Too expensive": "I appreciate that concern. We actually have flexible payment plans and group discounts that make it very affordable.",
    "Call back later": "Of course! When would be a better time? I'll make sure to follow up then."
  },
  closing: "Based on what you've shared, I think our [specific package] would be perfect. Can we schedule a quick 15-minute call to discuss the details?",
  followUp: "Thank you for your time today. I'll send you an email with more information, and I'll follow up [specific timeframe]. Have a great day!"
};

export function ClientCRM() {
  const { currentUser, isAdmin, incrementCallCount, callsToday } = useUser();
  const { makeCall } = useThreeCX();

  // Managers see team dashboard instead of call list
  if (currentUser?.role === 'manager') {
    return <ManagerDashboard />;
  }
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [archivedContacts, setArchivedContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  
  // Dynamic daily target based on assigned contacts from database
  const dailyTarget = contacts.length;
  
  // Calculate statistics from contacts
  const pendingCount = contacts.filter(c => c.status === "pending" || !c.status).length;
  const completedCount = contacts.filter(c => c.status === "completed").length;
  const inProgressCount = contacts.filter(c => c.status === "in-progress").length;
  
  // Debug logging for statistics
  useEffect(() => {
    console.log('[CRM] Statistics update:', {
      totalContacts: contacts.length,
      pendingCount,
      completedCount,
      inProgressCount,
      contactStatuses: contacts.map(c => c.status)
    });
  }, [contacts.length, pendingCount, completedCount, inProgressCount]);
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [currentNotes, setCurrentNotes] = useState("");
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importedContacts, setImportedContacts] = useState<Contact[]>([]);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [isSavingImport, setIsSavingImport] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Editable contact info state
  const [editableContact, setEditableContact] = useState<{
    name: string;
    phone: string;
    email: string;
    company: string;
    businessType: "Online Sales" | "Corporate" | "Channel" | "Retails" | "Protocol" | "Others";
    corporate: boolean;
  } | null>(null);
  
  // Add contact form state
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    businessType: "Online Sales" as "Online Sales" | "Corporate" | "Channel" | "Retails" | "Protocol" | "Others",
    corporate: false,
    notes: ""
  });
  
  // Call script state
  const [callScript, setCallScript] = useState(defaultCallScript);
  const [isLoadingScript, setIsLoadingScript] = useState(true);

  // Report generation state
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly" | "custom">("daily");
  const [reportFormat, setReportFormat] = useState<"html" | "csv" | "pdf" | "pptx">("html");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);

  // Quick email state
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailTemplate, setEmailTemplate] = useState<"custom" | "booking" | "payment" | "inquiry" | "urgent">("custom");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isEmailSectionOpen, setIsEmailSectionOpen] = useState(false);

  // Load active call script for prospective clients (CRM)
  useEffect(() => {
    const loadActiveScript = async () => {
      try {
        setIsLoadingScript(true);
        const data = await backendService.getCallScript('prospective');
        if (data.script) {
          setCallScript(data.script);
        }
      } catch (error) {
        console.log('[CRM] Using demo script');
        // Keep default script if loading fails
      } finally {
        setIsLoadingScript(false);
      }
    };

    loadActiveScript();
  }, []);

  // Load assigned contacts from database (using assignments system)
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setIsLoadingContacts(true);
        
        if (!currentUser) {
          console.log('[CRM] No current user - skipping contact load');
          setIsLoadingContacts(false);
          return;
        }

        // Load assignments from the centralized database
        const data = await backendService.getAssignments(currentUser.id);
        
        // Convert assignments to contacts (filter out already called and special assignments)
        const activeAssignments = (data.assignments || []).filter(
          (a: any) => !a.called && a.type !== 'special'
        );
        
        const userContacts = activeAssignments.map((assignment: any) => {
          const contact = {
            ...assignment.numberData,
            id: assignment.id,
            name: assignment.numberData?.name || assignment.numberData?.company || assignment.name || 'Unknown',
            phone: assignment.phoneNumber || assignment.numberData?.phoneNumber || assignment.numberData?.phone || '',
            email: assignment.numberData?.email || '',
            company: assignment.numberData?.company || '',
            businessType: assignment.numberData?.customerType || assignment.numberData?.businessType,
            assignedTo: assignment.agentId,
            assignedAt: assignment.assignedAt,
            assignmentId: assignment.id, // Keep track of assignment ID
            isSpecial: assignment.type === 'special', // Flag special assignments
            specialPurpose: assignment.purpose || undefined, // Purpose from special database
          };
          // Always set status to 'pending' for newly loaded assignments (override any existing status from numberData)
          contact.status = 'pending';
          return contact;
        });
        
        console.log(`[CRM] ✅ Loaded ${userContacts.length} assignments for ${currentUser.username}`);
        console.log('[CRM] Contact statuses:', userContacts.map(c => ({ name: c.name, status: c.status })));
        setContacts(userContacts);
      } catch (error) {
        console.error('[CRM] Failed to load contacts:', error);
        toast.error('Failed to load contacts. Please check backend connection.');
        setContacts([]);
      }
    };

    const loadArchivedContacts = async () => {
      try {
        // Archive functionality is now handled by the ArchiveManager component in Manager Portal
        // Silently attempt to load archived contacts, but don't fail if backend isn't ready
        const data = await backendService.getArchivedContacts();
        if (data?.contacts && Array.isArray(data.contacts)) {
          setArchivedContacts(data.contacts);
        } else {
          setArchivedContacts([]);
        }
      } catch (error) {
        // Silently ignore errors - archives are optional for agents
        setArchivedContacts([]);
      } finally {
        setIsLoadingContacts(false);
      }
    };

    loadContacts();
    loadArchivedContacts();
  }, [currentUser]);

  // Update contacts in local state (assignments are managed by backend)
  const updateContacts = async (updatedContacts: Contact[]) => {
    setContacts(updatedContacts);
    // Note: Individual assignments are updated via markAssignmentCalled() when needed
  };

  const handleDeleteClick = (contact: Contact) => {
    setContactToDelete(contact);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;

    const updatedContacts = contacts.filter(c => c.id !== contactToDelete.id);
    await updateContacts(updatedContacts);
    
    setDeleteDialogOpen(false);
    setContactToDelete(null);
    toast.success("Contact deleted successfully");
  };

  // Selection handlers
  const handleSelectContact = (contactId: string) => {
    setSelectedContactIds(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    const currentContacts = showArchived ? archivedContacts : contacts;
    if (selectedContactIds.length === currentContacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(currentContacts.map(c => c.id));
    }
  };

  // Archive handlers
  const handleArchiveSelected = () => {
    if (selectedContactIds.length === 0) {
      toast.error("Please select contacts to archive");
      return;
    }
    setArchiveDialogOpen(true);
  };

  const handleConfirmArchive = async () => {
    try {
      const contactsToArchive = contacts.filter(c => selectedContactIds.includes(c.id));
      
      // Archive each contact via backendService
      for (const contact of contactsToArchive) {
        await backendService.archiveContact(contact);
        
        // If this is an assignment, mark it as called
        if (contact.assignmentId) {
          await backendService.markAssignmentCalled(contact.assignmentId, 'archived');
        }
      }

      // Update local state
      const updatedContacts = contacts.filter(c => !selectedContactIds.includes(c.id));
      const updatedArchived = [...archivedContacts, ...contactsToArchive];
      setContacts(updatedContacts);
      setArchivedContacts(updatedArchived);
      
      setSelectedContactIds([]);
      setArchiveDialogOpen(false);
      toast.success(`${contactsToArchive.length} contact(s) archived successfully`);
    } catch (error) {
      console.error('[CRM] Error archiving contacts:', error);
      toast.error('Failed to archive contacts');
    }
  };

  const handleRestoreSelected = async () => {
    try {
      const contactsToRestore = archivedContacts.filter(c => selectedContactIds.includes(c.id));
      
      for (const contact of contactsToRestore) {
        await backendService.restoreFromArchive(contact.id, 'contact');
      }
      
      // Reload contacts to get updated list
      const data = await backendService.getAssignments(currentUser?.id);
      const activeAssignments = (data.assignments || []).filter((a: any) => !a.called);
      const userContacts = activeAssignments.map((assignment: any) => ({
        id: assignment.id,
        name: assignment.numberData?.name || assignment.numberData?.company || 'Unknown',
        phone: assignment.numberData?.phoneNumber || assignment.numberData?.phone || '',
        email: assignment.numberData?.email || '',
        company: assignment.numberData?.company || '',
        businessType: assignment.numberData?.customerType || assignment.numberData?.businessType,
        status: 'pending',
        assignedTo: assignment.agentId,
        assignedAt: assignment.assignedAt,
        assignmentId: assignment.id,
        ...assignment.numberData
      }));
      
      setContacts(userContacts);
      
      // Reload archived contacts (silently handle errors)
      try {
        const archiveData = await backendService.getArchivedContacts();
        setArchivedContacts(archiveData.contacts || []);
      } catch (err) {
        // Silently ignore - archives are optional
        setArchivedContacts([]);
      }
      
      setSelectedContactIds([]);
      toast.success(`${contactsToRestore.length} contact(s) restored successfully`);
    } catch (error) {
      console.error('[CRM] Error restoring contacts:', error);
      toast.error('Failed to restore contacts');
    }
  };

  const handleStartCall = (contact: Contact) => {
    setSelectedContact(contact);
    setCurrentNotes(contact.notes);
    
    // Initialize editable contact info
    setEditableContact({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || "",
      company: contact.company,
      businessType: contact.businessType || "Online Sales",
      corporate: contact.corporate || false
    });
    
    setIsCallDialogOpen(true);

    // Update contact status to in-progress
    const updatedContacts = contacts.map(c =>
      c.id === contact.id ? { ...c, status: "in-progress" as const } : c
    );
    updateContacts(updatedContacts);
  };

  const handleCompleteCall = async () => {
    if (!selectedContact) return;

    try {
      // Mark assignment as called in backend
      if (selectedContact.assignmentId) {
        await backendService.markAssignmentCalled(selectedContact.assignmentId, 'completed');
      }
      
      // Log the call
      await backendService.addCallLog({
        agentId: currentUser?.id,
        agentName: currentUser?.name,
        phoneNumber: selectedContact.phone,
        contactName: selectedContact.name,
        direction: 'outbound',
        duration: 0,
        outcome: 'completed',
        notes: currentNotes,
        callTime: new Date().toISOString(),
      });
      
      // Update contact status to completed (keep in list to show statistics)
      const updatedContacts = contacts.map(c =>
        c.id === selectedContact.id 
          ? { ...c, status: "completed" as const, lastContact: new Date().toISOString(), notes: currentNotes }
          : c
      );
      setContacts(updatedContacts);
      
      // Increment daily call count
      incrementCallCount();
      
      setIsCallDialogOpen(false);
      setSelectedContact(null);
      setCurrentNotes("");
      setEditableContact(null);
      toast.success("Call completed and logged!");
    } catch (error) {
      console.error('[CRM] Error completing call:', error);
      toast.error('Failed to complete call');
    }
  };

  const handleCancelCall = () => {
    if (!selectedContact) return;

    // Revert status back to pending
    const updatedContacts = contacts.map(c =>
      c.id === selectedContact.id ? { ...c, status: "pending" as const } : c
    );
    updateContacts(updatedContacts);
    
    setIsCallDialogOpen(false);
    setSelectedContact(null);
    setCurrentNotes("");
    setEditableContact(null);
  };

  const handleUpdateContactInfo = async () => {
    if (!selectedContact || !editableContact) return;

    try {
      const updatedContactData = {
        name: editableContact.name,
        phone: editableContact.phone,
        email: editableContact.email || undefined,
        company: editableContact.company,
        businessType: editableContact.businessType,
        corporate: editableContact.corporate
      };

      // Update in the agent's assigned contacts list
      const updatedContacts = contacts.map(c =>
        c.id === selectedContact.id
          ? { ...c, ...updatedContactData }
          : c
      );

      updateContacts(updatedContacts);
      
      // Note: Contact updates are saved locally for the assignment
      // The master record is updated when the assignment is completed

      setSelectedContact({
        ...selectedContact,
        ...updatedContactData
      });
      toast.success("Contact information updated in database!");
    } catch (error) {
      console.error('[CRM] Error updating contact:', error);
      toast.error("Failed to update contact information");
    }
  };

  const handleSendQuickEmail = async () => {
    if (!selectedContact?.email) {
      toast.error("No email address for this contact");
      return;
    }

    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast.error("Please enter both subject and message");
      return;
    }

    setIsSendingEmail(true);

    try {
      const data = await backendService.sendEmail(
        selectedContact.email,
        emailSubject,
        emailMessage.replace(/\n/g, '<br>')
      );

      if (data.success) {
        toast.success(`Email sent to ${selectedContact.email}!`);
        setEmailSubject("");
        setEmailMessage("");
        setEmailTemplate("custom");
        setIsEmailSectionOpen(false);
      } else {
        toast.error(data.error || "Failed to send email");
      }
    } catch (error) {
      console.error('[CRM] Error sending email:', error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleEmailTemplateChange = (template: string) => {
    setEmailTemplate(template as typeof emailTemplate);
    
    if (!selectedContact) return;
    
    switch (template) {
      case "booking":
        setEmailSubject("Your Travel Booking Confirmation");
        setEmailMessage(`Dear ${selectedContact.name},\n\nThank you for choosing BTM Travel! We're excited to help you plan your upcoming journey.\n\nOur team is currently processing your booking request and will get back to you within 24 hours with a detailed itinerary and pricing.\n\nIf you have any questions in the meantime, please don't hesitate to reach out.\n\nBest regards,\nBTM Travel Team`);
        break;
      case "payment":
        setEmailSubject("Payment Information for Your Booking");
        setEmailMessage(`Dear ${selectedContact.name},\n\nAttached is the payment information for your upcoming travel booking.\n\nPlease review the details and let us know if you have any questions about the payment process.\n\nWe look forward to serving you!\n\nBest regards,\nBTM Travel Team`);
        break;
      case "inquiry":
        setEmailSubject("Thank You for Your Inquiry");
        setEmailMessage(`Dear ${selectedContact.name},\n\nThank you for reaching out to BTM Travel!\n\nWe've received your inquiry and one of our travel specialists will be in touch with you shortly to discuss your travel needs.\n\nIn the meantime, feel free to browse our website for more information about our services.\n\nBest regards,\nBTM Travel Team`);
        break;
      case "urgent":
        setEmailSubject("URGENT: Important Update Regarding Your Booking");
        setEmailMessage(`Dear ${selectedContact.name},\n\nWe need to contact you regarding an important update to your travel booking.\n\nPlease call us at your earliest convenience at +234 XXX XXX XXXX.\n\nThank you for your prompt attention to this matter.\n\nBest regards,\nBTM Travel Team`);
        break;
      default:
        setEmailSubject("");
        setEmailMessage("");
    }
  };

  // Helper function to convert image to base64 and get dimensions
  const getLogoAsBase64 = (): Promise<{ data: string; width: number; height: number; aspectRatio: number }> => {
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
          resolve({
            data: canvas.toDataURL('image/png'),
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height
          });
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
        reportTitle = "Daily Call Report";
        dateRange = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        break;
      case "weekly":
        reportTitle = "Weekly Call Report";
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() + (6 - weekEnd.getDay()));
        dateRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        break;
      case "monthly":
        reportTitle = "Monthly Call Report";
        dateRange = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        break;
      case "custom":
        if (!customStartDate || !customEndDate) {
          toast.error("Please select both start and end dates");
          return;
        }
        reportTitle = "Custom Call Report";
        dateRange = `${customStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${customEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        break;
    }

    const completedCalls = contacts.filter(c => c.status === "completed");
    const pendingCalls = contacts.filter(c => c.status === "pending");
    const progressPercentage = dailyTarget > 0 ? Math.round((completedCalls.length / dailyTarget) * 100) : 0;

    if (reportFormat === "csv") {
      // Generate CSV Report
      const csvRows = [];
      
      // Header section
      csvRows.push([reportTitle]);
      csvRows.push([dateRange]);
      csvRows.push([`Generated by: ${currentUser?.name || 'Agent'}`]);
      csvRows.push([`Generated on: ${new Date().toLocaleString('en-US')}`]);
      csvRows.push([]);
      
      // Summary statistics
      csvRows.push(['SUMMARY STATISTICS']);
      csvRows.push(['Metric', 'Value']);
      csvRows.push(['Daily Target', dailyTarget.toString()]);
      csvRows.push(['Completed Calls', completedCalls.length.toString()]);
      csvRows.push(['Pending Calls', pendingCalls.length.toString()]);
      csvRows.push(['Progress', `${progressPercentage}%`]);
      csvRows.push([]);
      
      // Completed calls section
      csvRows.push(['COMPLETED CALLS']);
      csvRows.push(['Name', 'Company', 'Phone', 'Email', 'Business Type', 'Corporate', 'Last Contact', 'Notes']);
      completedCalls.forEach(contact => {
        csvRows.push([
          `"${contact.name}"`,
          `"${contact.company}"`,
          `"${contact.phone}"`,
          `"${contact.email || 'N/A'}"`,
          `"${contact.businessType || 'N/A'}"`,
          contact.corporate ? 'Yes' : 'No',
          `"${contact.lastContact || 'N/A'}"`,
          `"${contact.notes || 'N/A'}"`
        ]);
      });
      csvRows.push([]);
      
      // Pending calls section
      csvRows.push(['PENDING CALLS']);
      csvRows.push(['Name', 'Company', 'Phone', 'Email', 'Business Type', 'Corporate', 'Notes']);
      pendingCalls.forEach(contact => {
        csvRows.push([
          `"${contact.name}"`,
          `"${contact.company}"`,
          `"${contact.phone}"`,
          `"${contact.email || 'N/A'}"`,
          `"${contact.businessType || 'N/A'}"`,
          contact.corporate ? 'Yes' : 'No',
          `"${contact.notes || 'N/A'}"`
        ]);
      });
      
      // Convert to CSV string
      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("CSV report generated and downloaded!");
    } else if (reportFormat === "pdf") {
      // Generate PDF Report
      try {
        const logo = await getLogoAsBase64();
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = 20;

        // Header with logo
        doc.setFillColor(107, 70, 193);
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        // Add logo to header (top left) - maintain aspect ratio
        const logoWidth = 25;
        const logoHeight = logoWidth / logo.aspectRatio;
        doc.addImage(logo.data, 'PNG', 15, 5, logoWidth, logoHeight);
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text(reportTitle, pageWidth / 2, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.text(dateRange, pageWidth / 2, 25, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Generated by: ${currentUser?.name || 'Agent'}`, pageWidth / 2, 32, { align: 'center' });
      
      yPos = 50;

      // Summary Statistics
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text('Summary Statistics', 15, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFillColor(102, 126, 234);
      doc.rect(15, yPos, 55, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('Daily Target', 42.5, yPos + 8, { align: 'center' });
      doc.setFontSize(20);
      doc.text(dailyTarget.toString(), 42.5, yPos + 18, { align: 'center' });

      doc.setFillColor(102, 126, 234);
      doc.rect(75, yPos, 55, 25, 'F');
      doc.setFontSize(12);
      doc.text('Completed', 102.5, yPos + 8, { align: 'center' });
      doc.setFontSize(20);
      doc.text(completedCalls.length.toString(), 102.5, yPos + 18, { align: 'center' });

      doc.setFillColor(102, 126, 234);
      doc.rect(135, yPos, 55, 25, 'F');
      doc.setFontSize(12);
      doc.text('Pending', 162.5, yPos + 8, { align: 'center' });
      doc.setFontSize(20);
      doc.text(pendingCalls.length.toString(), 162.5, yPos + 18, { align: 'center' });

      yPos += 35;

      // Progress Bar
      doc.setFillColor(224, 224, 224);
      doc.rect(15, yPos, 180, 8, 'F');
      doc.setFillColor(102, 126, 234);
      doc.rect(15, yPos, (180 * Math.min(progressPercentage, 100)) / 100, 8, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`${progressPercentage}% Complete`, pageWidth / 2, yPos + 5.5, { align: 'center' });

      yPos += 18;

      // Completed Calls Section
      doc.setFontSize(14);
      doc.setTextColor(102, 126, 234);
      doc.text(`Completed Calls (${completedCalls.length})`, 15, yPos);
      yPos += 8;

      if (completedCalls.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        completedCalls.slice(0, 5).forEach((contact, index) => {
          if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFillColor(249, 249, 249);
          doc.rect(15, yPos, 180, 25, 'F');
          doc.setDrawColor(102, 126, 234);
          doc.setLineWidth(2);
          doc.line(15, yPos, 15, yPos + 25);
          
          doc.setFontSize(11);
          doc.text(`${contact.name} - ${contact.company}`, 20, yPos + 5);
          doc.setFontSize(9);
          doc.text(`Phone: ${contact.phone}`, 20, yPos + 11);
          if (contact.email) doc.text(`Email: ${contact.email}`, 20, yPos + 16);
          doc.text(`Notes: ${(contact.notes || 'N/A').substring(0, 50)}`, 20, yPos + 21);
          
          yPos += 28;
        });
        
        if (completedCalls.length > 5) {
          doc.setFontSize(9);
          doc.setTextColor(150, 150, 150);
          doc.text(`...and ${completedCalls.length - 5} more completed calls`, 15, yPos);
          yPos += 8;
        }
      } else {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('No completed calls yet.', 15, yPos);
        yPos += 8;
      }

      yPos += 5;

      // Pending Calls Section
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(102, 126, 234);
      doc.text(`Pending Calls (${pendingCalls.length})`, 15, yPos);
      yPos += 8;

      if (pendingCalls.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        pendingCalls.slice(0, 5).forEach((contact, index) => {
          if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFillColor(249, 249, 249);
          doc.rect(15, yPos, 180, 25, 'F');
          doc.setDrawColor(102, 126, 234);
          doc.setLineWidth(2);
          doc.line(15, yPos, 15, yPos + 25);
          
          doc.setFontSize(11);
          doc.text(`${contact.name} - ${contact.company}`, 20, yPos + 5);
          doc.setFontSize(9);
          doc.text(`Phone: ${contact.phone}`, 20, yPos + 11);
          if (contact.email) doc.text(`Email: ${contact.email}`, 20, yPos + 16);
          doc.text(`Notes: ${(contact.notes || 'N/A').substring(0, 50)}`, 20, yPos + 21);
          
          yPos += 28;
        });
        
        if (pendingCalls.length > 5) {
          doc.setFontSize(9);
          doc.setTextColor(150, 150, 150);
          doc.text(`...and ${pendingCalls.length - 5} more pending calls`, 15, yPos);
        }
      } else {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('No pending calls.', 15, yPos);
      }

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('BTM Travel CRM System - Confidential', pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
      }

        // Download PDF
        doc.save(`${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success("PDF report generated and downloaded!");
      } catch (error) {
        console.error('Error generating PDF with logo:', error);
        toast.error("Failed to generate PDF report");
      }
    } else if (reportFormat === "pptx") {
      // Generate PowerPoint Report
      try {
        const logo = await getLogoAsBase64();
        const pptx = new pptxgen();
        
        // Set presentation properties
        pptx.author = currentUser?.name || 'Agent';
        pptx.company = 'BTM Travel';
        pptx.title = reportTitle;
        pptx.subject = 'Call Report';

        // Slide 1: Title Slide
        const slide1 = pptx.addSlide();
        slide1.background = { color: '6B46C1' };
        
        // Add logo to title slide - maintain aspect ratio
        const logoWidth = 1.5;
        const logoHeight = logoWidth / logo.aspectRatio;
        slide1.addImage({ data: logo.data, x: 0.5, y: 0.3, w: logoWidth, h: logoHeight });
        
        slide1.addText(reportTitle, {
          x: 0.5, y: 1.5, w: 9, h: 1.5,
          fontSize: 44, bold: true, color: 'FFFFFF', align: 'center'
        });
      slide1.addText(dateRange, {
        x: 0.5, y: 3.0, w: 9, h: 0.5,
        fontSize: 24, color: 'FFFFFF', align: 'center'
      });
      slide1.addText(`Generated by: ${currentUser?.name || 'Agent'}`, {
        x: 0.5, y: 3.8, w: 9, h: 0.4,
        fontSize: 16, color: 'FFFFFF', align: 'center'
      });
      slide1.addText(`Generated on: ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`, {
        x: 0.5, y: 4.2, w: 9, h: 0.4,
        fontSize: 14, color: 'FFFFFF', align: 'center'
      });

      // Slide 2: Summary Statistics
      const slide2 = pptx.addSlide();
      slide2.addText('Summary Statistics', {
        x: 0.5, y: 0.5, w: 9, h: 0.6,
        fontSize: 32, bold: true, color: '333333'
      });

      // Statistics boxes
      slide2.addShape(pptx.ShapeType.rect, {
        x: 0.8, y: 1.5, w: 2.5, h: 1.5,
        fill: { type: 'solid', color: '667EEA' }
      });
      slide2.addText('Daily Target', {
        x: 0.8, y: 1.6, w: 2.5, h: 0.4,
        fontSize: 16, color: 'FFFFFF', align: 'center'
      });
      slide2.addText(dailyTarget.toString(), {
        x: 0.8, y: 2.2, w: 2.5, h: 0.6,
        fontSize: 36, bold: true, color: 'FFFFFF', align: 'center'
      });

      slide2.addShape(pptx.ShapeType.rect, {
        x: 3.75, y: 1.5, w: 2.5, h: 1.5,
        fill: { type: 'solid', color: '667EEA' }
      });
      slide2.addText('Completed', {
        x: 3.75, y: 1.6, w: 2.5, h: 0.4,
        fontSize: 16, color: 'FFFFFF', align: 'center'
      });
      slide2.addText(completedCalls.length.toString(), {
        x: 3.75, y: 2.2, w: 2.5, h: 0.6,
        fontSize: 36, bold: true, color: 'FFFFFF', align: 'center'
      });

      slide2.addShape(pptx.ShapeType.rect, {
        x: 6.7, y: 1.5, w: 2.5, h: 1.5,
        fill: { type: 'solid', color: '667EEA' }
      });
      slide2.addText('Pending', {
        x: 6.7, y: 1.6, w: 2.5, h: 0.4,
        fontSize: 16, color: 'FFFFFF', align: 'center'
      });
      slide2.addText(pendingCalls.length.toString(), {
        x: 6.7, y: 2.2, w: 2.5, h: 0.6,
        fontSize: 36, bold: true, color: 'FFFFFF', align: 'center'
      });

      // Progress bar
      slide2.addText(`Progress: ${progressPercentage}% Complete`, {
        x: 0.8, y: 3.5, w: 8.4, h: 0.4,
        fontSize: 18, bold: true, color: '333333', align: 'center'
      });
      slide2.addShape(pptx.ShapeType.rect, {
        x: 0.8, y: 4.0, w: 8.4, h: 0.4,
        fill: { type: 'solid', color: 'E0E0E0' }
      });
      slide2.addShape(pptx.ShapeType.rect, {
        x: 0.8, y: 4.0, w: (8.4 * Math.min(progressPercentage, 100)) / 100, h: 0.4,
        fill: { type: 'solid', color: '667EEA' }
      });

      // Slide 3: Completed Calls
      const slide3 = pptx.addSlide();
      slide3.addText(`Completed Calls (${completedCalls.length})`, {
        x: 0.5, y: 0.5, w: 9, h: 0.6,
        fontSize: 28, bold: true, color: '667EEA'
      });

      if (completedCalls.length > 0) {
        const completedRows = [
          [
            { text: 'Name', options: { bold: true, color: 'FFFFFF', fill: '667EEA' } },
            { text: 'Company', options: { bold: true, color: 'FFFFFF', fill: '667EEA' } },
            { text: 'Phone', options: { bold: true, color: 'FFFFFF', fill: '667EEA' } },
            { text: 'Email', options: { bold: true, color: 'FFFFFF', fill: '667EEA' } }
          ],
          ...completedCalls.slice(0, 8).map(contact => [
            contact.name,
            contact.company,
            contact.phone,
            contact.email || 'N/A'
          ])
        ];

        slide3.addTable(completedRows, {
          x: 0.5, y: 1.3, w: 9, h: 4.2,
          fontSize: 11,
          border: { pt: 1, color: 'CCCCCC' },
          fill: { color: 'F9F9F9' }
        });

        if (completedCalls.length > 8) {
          slide3.addText(`...and ${completedCalls.length - 8} more completed calls`, {
            x: 0.5, y: 5.8, w: 9, h: 0.3,
            fontSize: 12, italic: true, color: '999999', align: 'center'
          });
        }
      } else {
        slide3.addText('No completed calls yet.', {
          x: 0.5, y: 2.5, w: 9, h: 0.5,
          fontSize: 18, italic: true, color: '999999', align: 'center'
        });
      }

      // Slide 4: Pending Calls
      const slide4 = pptx.addSlide();
      slide4.addText(`Pending Calls (${pendingCalls.length})`, {
        x: 0.5, y: 0.5, w: 9, h: 0.6,
        fontSize: 28, bold: true, color: '667EEA'
      });

      if (pendingCalls.length > 0) {
        const pendingRows = [
          [
            { text: 'Name', options: { bold: true, color: 'FFFFFF', fill: '667EEA' } },
            { text: 'Company', options: { bold: true, color: 'FFFFFF', fill: '667EEA' } },
            { text: 'Phone', options: { bold: true, color: 'FFFFFF', fill: '667EEA' } },
            { text: 'Email', options: { bold: true, color: 'FFFFFF', fill: '667EEA' } }
          ],
          ...pendingCalls.slice(0, 8).map(contact => [
            contact.name,
            contact.company,
            contact.phone,
            contact.email || 'N/A'
          ])
        ];

        slide4.addTable(pendingRows, {
          x: 0.5, y: 1.3, w: 9, h: 4.2,
          fontSize: 11,
          border: { pt: 1, color: 'CCCCCC' },
          fill: { color: 'F9F9F9' }
        });

        if (pendingCalls.length > 8) {
          slide4.addText(`...and ${pendingCalls.length - 8} more pending calls`, {
            x: 0.5, y: 5.8, w: 9, h: 0.3,
            fontSize: 12, italic: true, color: '999999', align: 'center'
          });
        }
      } else {
        slide4.addText('No pending calls.', {
          x: 0.5, y: 2.5, w: 9, h: 0.5,
          fontSize: 18, italic: true, color: '999999', align: 'center'
        });
      }

        // Download PowerPoint
        pptx.writeFile({ fileName: `${reportType}-report-${new Date().toISOString().split('T')[0]}.pptx` });
        toast.success("PowerPoint report generated and downloaded!");
      } catch (error) {
        console.error('Error generating PowerPoint with logo:', error);
        toast.error("Failed to generate PowerPoint report");
      }
    } else {
      // Generate HTML Report
      try {
        const logo = await getLogoAsBase64();
        const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 1200px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #6b46c1; padding-bottom: 20px; }
            .logo { max-width: 120px; height: auto; margin: 0 auto 20px; display: block; object-fit: contain; }
            .header h1 { color: #6b46c1; margin: 0 0 10px 0; font-size: 32px; }
            .header p { color: #666; margin: 5px 0; font-size: 14px; }
            .stats { display: flex; justify-content: space-around; margin: 30px 0; }
            .stat-box { text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; min-width: 150px; }
            .stat-box .label { font-size: 14px; opacity: 0.9; }
            .stat-box .value { font-size: 32px; font-weight: bold; margin-top: 5px; }
            .progress-bar { background: #e0e0e0; height: 30px; border-radius: 15px; overflow: visible; margin: 20px 0; position: relative; }
            .progress-fill { background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 100%; border-radius: 15px; position: absolute; top: 0; left: 0; }
            .progress-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #333; font-weight: bold; z-index: 10; }
            .section { margin: 30px 0; }
            .section h2 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
            .contact-list { list-style: none; padding: 0; }
            .contact-item { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .contact-item h3 { margin: 0 0 8px 0; color: #333; font-size: 18px; }
            .contact-item p { margin: 5px 0; color: #555; font-size: 14px; line-height: 1.6; }
            .contact-item p strong { color: #333; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${logo.data}" alt="BTM Travel Logo" class="logo" />
              <h1>${reportTitle}</h1>
              <p style="font-size: 16px; font-weight: 600; color: #6b46c1; margin: 10px 0;">${dateRange}</p>
              <p>Generated by: ${currentUser?.name || 'Agent'}</p>
              <p>Generated on: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
            </div>
            
            <div class="stats">
              <div class="stat-box">
                <div class="label">Daily Target</div>
                <div class="value">${dailyTarget}</div>
              </div>
              <div class="stat-box">
                <div class="label">Completed</div>
                <div class="value">${completedCalls.length}</div>
              </div>
              <div class="stat-box">
                <div class="label">Pending</div>
                <div class="value">${pendingCalls.length}</div>
              </div>
            </div>
            
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(progressPercentage, 100)}%"></div>
              <div class="progress-text">${progressPercentage}% Complete</div>
            </div>
            
            <div class="section">
              <h2>Completed Calls (${completedCalls.length})</h2>
              ${completedCalls.length > 0 ? `
                <ul class="contact-list">
                  ${completedCalls.map(contact => `
                    <li class="contact-item">
                      <h3>${contact.name} - ${contact.company}</h3>
                      <p><strong>Phone:</strong> ${contact.phone}</p>
                      ${contact.email ? `<p><strong>Email:</strong> ${contact.email}</p>` : ''}
                      <p><strong>Business Type:</strong> ${contact.businessType || 'N/A'}</p>
                      ${contact.corporate ? '<p><strong>Corporate Client:</strong> Yes</p>' : ''}
                      <p><strong>Last Contact:</strong> ${contact.lastContact || 'N/A'}</p>
                      <p><strong>Notes:</strong> ${contact.notes || 'No notes available'}</p>
                    </li>
                  `).join('')}
                </ul>
              ` : '<p style="color: #999; font-style: italic; padding: 20px; text-align: center;">No completed calls yet.</p>'}
            </div>
            
            <div class="section">
              <h2>Pending Calls (${pendingCalls.length})</h2>
              ${pendingCalls.length > 0 ? `
                <ul class="contact-list">
                  ${pendingCalls.map(contact => `
                    <li class="contact-item">
                      <h3>${contact.name} - ${contact.company}</h3>
                      <p><strong>Phone:</strong> ${contact.phone}</p>
                      ${contact.email ? `<p><strong>Email:</strong> ${contact.email}</p>` : ''}
                      <p><strong>Business Type:</strong> ${contact.businessType || 'N/A'}</p>
                      ${contact.corporate ? '<p><strong>Corporate Client:</strong> Yes</p>' : ''}
                      <p><strong>Notes:</strong> ${contact.notes || 'No notes available'}</p>
                    </li>
                  `).join('')}
                </ul>
              ` : '<p style="color: #999; font-style: italic; padding: 20px; text-align: center;">No pending calls.</p>'}
            </div>
            
            <div class="footer">
              <p>This report was generated by BTM Travel CRM System</p>
              <p>For internal use only - Confidential</p>
            </div>
          </div>
        </body>
        </html>
      `;

        // Download HTML
        const blob = new Blob([reportHTML], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.html`;
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

    setIsReportDialogOpen(false);
  };

  const handleExportList = () => {
    // Create CSV content
    const headers = ["Name", "Phone", "Email", "Company", "Status", "Last Contact", "Notes"];
    const csvContent = [
      headers.join(","),
      ...contacts.map(contact => [
        `"${contact.name}"`,
        `"${contact.phone}"`,
        `"${contact.email || ''}"`,
        `"${contact.company}"`,
        contact.status,
        `"${contact.lastContact || 'N/A'}"`,
        `"${contact.notes}"`
      ].join(","))
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `call-list-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Call list exported successfully!");
  };

  const handleImportList = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header row
        const dataLines = lines.slice(1);
        
        if (dataLines.length === 0) {
          toast.error("CSV file is empty");
          return;
        }

        const newContacts: Contact[] = [];
        let errorCount = 0;

        dataLines.forEach((line, index) => {
          // Parse CSV line (handle quoted fields)
          const matches = line.match(/(\".*?\"|[^\",\s]+)(?=\s*,|\s*$)/g);
          if (!matches || matches.length < 3) {
            errorCount++;
            return;
          }

          const [name, phone, email, company, status, lastContact, notes] = matches.map(field => 
            field.replace(/^\"|\"$/g, '').replace(/\"\"/g, '\"')
          );

          if (!name || !phone || !company) {
            errorCount++;
            return;
          }

          const contact: Contact = {
            id: (contacts.length + newContacts.length + 1).toString(),
            name: name.trim(),
            phone: phone.trim(),
            email: (email && email.trim()) || undefined,
            company: company.trim(),
            status: (status && ['pending', 'completed', 'in-progress'].includes(status)) 
              ? status as Contact['status'] 
              : 'pending',
            lastContact: (lastContact && lastContact !== 'N/A') ? lastContact.trim() : undefined,
            notes: notes?.trim() || "Imported from CSV"
          };

          newContacts.push(contact);
        });

        if (newContacts.length > 0) {
          setImportedContacts(newContacts);
          setShowImportPreview(true);
          toast.success(`Loaded ${newContacts.length} contact${newContacts.length > 1 ? 's' : ''} for preview${errorCount > 0 ? `. ${errorCount} row${errorCount > 1 ? 's' : ''} skipped due to errors.` : ''}`);
          // setIsImportDialogOpen(false);
        } else {
          toast.error("No valid contacts found in CSV file");
        }

      } catch (error) {
        toast.error("Error reading CSV file. Please check the format.");
      }
    };

    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const headers = ["Name", "Phone", "Email", "Company", "Status", "Last Contact", "Notes"];
    const exampleRow = ["\"Chinedu Okafor\"", "\"+234 803 456 7890\"", "\"chinedu@techcorp.ng\"", "\"Tech Corp Nigeria\"", "pending", "\"Oct 14, 2025\"", "\"Example contact\""];
    const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "call-list-template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Template downloaded successfully!");
  };

  const handleSaveImportedContacts = async () => {
    setIsSavingImport(true);
    try {
      // Add assignment info to imported contacts
      const contactsWithAssignment = importedContacts.map(contact => ({
        ...contact,
        assignedTo: currentUser?.id,
        assignedToName: currentUser?.name,
        assignedAt: new Date().toISOString(),
        createdAt: contact.createdAt || new Date().toISOString()
      }));

      const updatedContacts = [...contactsWithAssignment, ...contacts];
      await saveContactsToBackend(updatedContacts);
      
      // Also save to central database using backendService
      const result = await backendService.importClients(contactsWithAssignment);
      
      if (!result.success) {
        console.error('[CRM] Failed to import contacts to central database');
      }
      
      setContacts(updatedContacts);
      setImportedContacts([]);
      setShowImportPreview(false);
      setIsImportDialogOpen(false);
      
      toast.success(`Successfully imported ${importedContacts.length} contact${importedContacts.length > 1 ? 's' : ''} to database!`);
    } catch (error) {
      console.error('[CRM] Error saving imported contacts:', error);
      toast.error('Failed to save imported contacts');
    } finally {
      setIsSavingImport(false);
    }
  };

  const handleCancelImport = () => {
    setImportedContacts([]);
    setShowImportPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name.trim() || !newContact.phone.trim() || !newContact.company.trim()) {
      toast.error("Please fill in all required fields (Name, Phone, Company)");
      return;
    }

    try {
      const contact: Contact = {
        id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newContact.name.trim(),
        phone: newContact.phone.trim(),
        email: newContact.email.trim() || undefined,
        company: newContact.company.trim(),
        businessType: newContact.businessType,
        corporate: newContact.corporate,
        status: "pending",
        notes: newContact.notes.trim() || "New contact",
        assignedTo: currentUser?.id,
        assignedToName: currentUser?.name,
        assignedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // Add to local state
      updateContacts([contact, ...contacts]);
      
      // Add to central database using backendService
      const result = await backendService.importClients([contact]);

      if (!result.success) {
        console.error('[CRM] Failed to add contact to central database');
        toast.error("Contact added locally but failed to save to central database");
      } else {
        toast.success(`Contact "${newContact.name}" added to database!`);
      }
      
      // Reset form
      setNewContact({
        name: "",
        phone: "",
        email: "",
        company: "",
        businessType: "Online Sales",
        corporate: false,
        notes: ""
      });
      
      setIsAddContactDialogOpen(false);
    } catch (error) {
      console.error('[CRM] Error adding contact:', error);
      toast.error("Failed to add contact");
    }
  };

  const displayContacts = showArchived ? archivedContacts : contacts;

  // Pagination calculations
  const totalPages = Math.ceil(displayContacts.length / contactsPerPage);
  const startIndex = (currentPage - 1) * contactsPerPage;
  const endIndex = startIndex + contactsPerPage;
  const currentContacts = displayContacts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative space-y-8 p-8">
        {/* Header Section */}
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/30">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-black">
                  Prospective Client Portal
                </h2>
                <p className="text-black flex items-center gap-2 mt-1">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  {dailyTarget > 0 
                    ? `${dailyTarget} contact${dailyTarget !== 1 ? 's' : ''} assigned from database`
                    : "No contacts assigned yet - waiting for admin assignment"
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            {/* Add New Contact Dialog */}
            <Dialog open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 border-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-black">
                    Add New Prospective Client
                  </DialogTitle>
                  <DialogDescription className="text-black">
                    Enter the contact details for the new prospective client
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., John Doe"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        placeholder="+234 XXX XXX XXXX"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="e.g., john@company.com"
                        value={newContact.email}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        placeholder="e.g., Tech Solutions Inc"
                        value={newContact.company}
                        onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select
                        value={newContact.businessType}
                        onValueChange={(value: any) => setNewContact({ ...newContact, businessType: value })}
                      >
                        <SelectTrigger id="businessType" className="border-purple-200">
                          <SelectValue placeholder="Select business type" />
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="corporate" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Corporate Client
                      </Label>
                      <div className="flex items-center h-10 px-3 rounded-md border border-purple-200 bg-white">
                        <Checkbox
                          id="corporate"
                          checked={newContact.corporate}
                          onCheckedChange={(checked) => setNewContact({ ...newContact, corporate: checked as boolean })}
                        />
                        <label htmlFor="corporate" className="ml-2 text-sm cursor-pointer">
                          Mark as corporate client
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Enter any additional notes about this contact..."
                      value={newContact.notes}
                      onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                      rows={3}
                      className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setIsAddContactDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddContact}
                    className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50/50 text-purple-700 shadow-lg backdrop-blur-sm bg-white/80 transition-all duration-300 hover:scale-105"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl border-0 shadow-2xl bg-white/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-black">
                    {showImportPreview ? 'Preview Imported Contacts' : 'Import Contacts from CSV'}
                  </DialogTitle>
                  <DialogDescription className="text-black">
                    {showImportPreview 
                      ? 'Review the contacts below and click Save to add them to your database'
                      : 'Upload a CSV file to import multiple contacts at once'}
                  </DialogDescription>
                </DialogHeader>
                
                {!showImportPreview ? (
                  <div className="space-y-4 mt-4">
                    {/* File Upload Area - Primary Action */}
                    <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-500 hover:bg-purple-50/50 transition-all cursor-pointer bg-gradient-to-br from-purple-50/30 to-pink-50/30"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Upload className="w-10 h-10 text-white" />
                      </div>
                      <p className="font-medium text-black mb-1">
                        Click to upload CSV file
                      </p>
                      <p className="text-xs text-black">
                        CSV files only (Max 10MB)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => {
                          handleImportList(e);
                        }}
                      />
                    </div>

                    {/* Download Template Button */}
                    <div className="flex items-center justify-center">
                      <Button
                        onClick={handleDownloadTemplate}
                        variant="outline"
                        className="border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download CSV Template
                      </Button>
                    </div>

                    {/* Instructions - Collapsible */}
                    <Collapsible>
                      <CollapsibleTrigger className="w-full">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between hover:bg-blue-100/50 transition-colors">
                          <h4 className="font-medium text-blue-900 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            CSV File Requirements
                          </h4>
                          <ChevronDown className="w-4 h-4 text-blue-600" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="bg-blue-50/50 border border-blue-200 border-t-0 rounded-b-lg p-3 -mt-1">
                          <ul className="text-xs text-blue-800 space-y-1">
                            <li>• File must be in CSV format (.csv)</li>
                            <li>• Headers: Name, Phone, Email, Company, Status, Last Contact, Notes</li>
                            <li>• Required: Name, Phone, Company</li>
                            <li>• Status: pending, completed, or in-progress</li>
                            <li>• Phone format: +234 XXX XXX XXXX</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Example Preview - Collapsible */}
                    <Collapsible>
                      <CollapsibleTrigger className="w-full">
                        <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 flex items-center justify-between hover:bg-gray-200/50 transition-colors">
                          <h4 className="font-medium text-black">Example CSV Format</h4>
                          <ChevronDown className="w-4 h-4 text-black" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="bg-gray-50 border border-gray-300 border-t-0 rounded-b-lg p-3 -mt-1">
                          <pre className="text-xs text-black overflow-x-auto bg-white p-2 rounded border border-gray-200">
{`Name,Phone,Email,Company,Status,Last Contact,Notes
"John Doe","+234 803 123 4567","john@email.com","Tech Corp","pending","Oct 18, 2025","Interested"
"Jane Smith","+234 805 234 5678","jane@company.ng","ABC Ltd","pending","","New lead"`}
                          </pre>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ) : (
                  <div className="space-y-4 mt-4">
                    {/* Success Alert */}
                    <Alert className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                      <Check className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Successfully loaded {importedContacts.length} contact{importedContacts.length > 1 ? 's' : ''}. Review below and click Save to add to your database.
                      </AlertDescription>
                    </Alert>

                    {/* Preview Table */}
                    <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-purple-100 to-pink-100 sticky top-0">
                          <tr>
                            <th className="text-left p-2 border-b">Name</th>
                            <th className="text-left p-2 border-b">Phone</th>
                            <th className="text-left p-2 border-b">Company</th>
                            <th className="text-left p-2 border-b">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importedContacts.map((contact, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="p-2 border-b">{contact.name}</td>
                              <td className="p-2 border-b">{contact.phone}</td>
                              <td className="p-2 border-b">{contact.company}</td>
                              <td className="p-2 border-b">
                                <Badge variant={contact.status === 'pending' ? 'secondary' : contact.status === 'completed' ? 'default' : 'outline'}>
                                  {contact.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <DialogFooter className="gap-2 mt-4">
                  {!showImportPreview ? (
                    <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                      Cancel
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={handleCancelImport} disabled={isSavingImport}>
                        Cancel Import
                      </Button>
                      <Button 
                        onClick={handleSaveImportedContacts}
                        disabled={isSavingImport}
                        className="bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                      >
                        {isSavingImport ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Save {importedContacts.length} Contact{importedContacts.length > 1 ? 's' : ''}
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Export Button */}
            <Button 
              onClick={handleExportList}
              variant="outline"
              className="border-2 border-green-300 hover:border-green-500 hover:bg-green-50/50 text-green-700 shadow-lg backdrop-blur-sm bg-white/80 transition-all duration-300 hover:scale-105"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>

            {/* Report Dialog */}
            <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setIsReportDialogOpen(true)}
                  className="bg-gradient-to-br from-green-600 via-emerald-600 to-green-600 text-white shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 border-0"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-gray-900">
                    Generate Call Report
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
                          <Popover>
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
                                onSelect={setCustomStartDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="end-date" className="text-sm">End Date</Label>
                          <Popover>
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
                                onSelect={setCustomEndDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-purple-900 mb-1.5">Report Includes:</h4>
                    <ul className="text-xs text-purple-800 space-y-0.5">
                      <li>✓ Summary stats & progress</li>
                      <li>✓ Completed & pending calls</li>
                      {reportFormat === "html" && (
                        <li>✓ Visual styling & progress bar</li>
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
                        Generate Report
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
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-white via-purple-50/30 to-white backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-1 font-medium">Daily Target</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-purple-600">{dailyTarget}</span>
                    <span className="text-sm text-gray-600">calls</span>
                  </div>
                  {dailyTarget === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No contacts assigned yet</p>
                  )}
                  {dailyTarget > 0 && (
                    <p className="text-xs text-purple-600 mt-1">From assigned database</p>
                  )}
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/30">
                  <Target className="w-6 h-6 text-white" />
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
                    {pendingCount}
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
                    {completedCount}
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg shadow-green-500/30">
                  <Check className="w-6 h-6 text-white" />
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
                    {dailyTarget > 0 ? Math.round((completedCount / dailyTarget) * 100) : 0}%
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${dailyTarget > 0 ? Math.min((completedCount / dailyTarget) * 100, 100) : 0}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Controls */}
        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedContactIds.length > 0 && selectedContactIds.length === (showArchived ? archivedContacts : contacts).length}
                    onCheckedChange={handleSelectAll}
                    className="border-2 border-purple-400"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({selectedContactIds.length} selected)
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowArchived(!showArchived);
                    setSelectedContactIds([]); // Clear selections when switching views
                  }}
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
                {!showArchived && isAdmin && selectedContactIds.length > 0 && (
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
                
                {showArchived && selectedContactIds.length > 0 && (
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

        {/* Daily Progress Card */}
        <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Today's Progress</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{callsToday}</span>
                  <span className="text-2xl text-purple-100">/ {dailyTarget}</span>
                </div>
                <p className="text-purple-100 text-sm mt-2">
                  {dailyTarget > 0 ? Math.round((callsToday / dailyTarget) * 100) : 0}% of daily target
                </p>
              </div>
              <div className="flex flex-col items-center">
                <Target className="w-16 h-16 text-white/30 mb-2" />
                {callsToday >= dailyTarget ? (
                  <Badge className="bg-green-500 text-white border-0">
                    Target Achieved! 🎉
                  </Badge>
                ) : callsToday >= dailyTarget * 0.8 ? (
                  <Badge className="bg-yellow-500 text-white border-0">
                    Almost There!
                  </Badge>
                ) : (
                  <Badge className="bg-white/20 text-white border-0">
                    Keep Going!
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact List */}
        {isLoadingContacts ? (
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="h-6 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg animate-pulse w-1/3"></div>
                      <div className="h-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg animate-pulse w-1/4"></div>
                    </div>
                    <div className="h-10 w-28 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg animate-pulse w-1/2"></div>
                    <div className="h-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg animate-pulse w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : dailyTarget === 0 && !showArchived ? (
          <Alert className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300">
            <Target className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <p className="font-semibold mb-2">No contacts assigned yet</p>
              <p className="text-sm">
                Your daily call target is based on contacts assigned to you by the admin/manager. 
                Please wait for contacts to be assigned from the central database, or contact your manager.
              </p>
            </AlertDescription>
          </Alert>
        ) : currentContacts.length === 0 ? (
          <Alert className="bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-300">
            <Archive className="h-5 w-5 text-gray-600" />
            <AlertDescription className="text-gray-900">
              <p className="font-semibold mb-2">
                {showArchived ? "No archived contacts" : "No contacts on this page"}
              </p>
              <p className="text-sm">
                {showArchived 
                  ? "You haven't archived any contacts yet. Archived contacts will appear here."
                  : "All contacts may be on other pages or have been archived."}
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-6">
            {currentContacts.map((contact) => (
            <Card 
              key={contact.id} 
              className={`transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:scale-[1.02] ${
                contact.status === "completed" ? "opacity-70" : ""
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedContactIds.includes(contact.id)}
                    onCheckedChange={() => handleSelectContact(contact.id)}
                    className="mt-1 border-2 border-purple-400"
                  />
                  <div className="flex items-start justify-between flex-1">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <CardTitle className="text-xl text-black">
                          {contact.name}
                        </CardTitle>
                      {contact.corporate && (
                        <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
                          <Building2 className="w-3 h-3 mr-1" />
                          Corporate
                        </Badge>
                      )}
                      {contact.businessType && (
                        <Badge variant="outline" className="border-purple-300 text-purple-700">
                          {contact.businessType}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2 text-black">
                      <Building2 className="w-4 h-4 text-purple-500" />
                      {contact.company}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={contact.status === "completed" ? "default" : contact.status === "in-progress" ? "secondary" : "outline"}
                    className={`${
                      contact.status === "completed" 
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg shadow-green-500/30" 
                        : contact.status === "in-progress"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-lg shadow-blue-500/30"
                        : "border-2 border-orange-300 text-orange-700"
                    }`}
                  >
                    {contact.status === "completed" ? (
                      <Check className="w-3 h-3 mr-1" />
                    ) : contact.status === "in-progress" ? (
                      <Clock className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {contact.status}
                  </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                        <Phone className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-black">{contact.phone}</span>
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-black">{contact.email}</span>
                      </div>
                    )}
                    {contact.lastContact && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                          <CalendarIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-black">Last: {contact.lastContact}</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                    <p className="text-xs text-purple-800 font-semibold mb-1">Notes:</p>
                    <p className="text-sm text-black line-clamp-2">{contact.notes}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => handleStartCall(contact)}
                          disabled={contact.status === "completed"}
                          className="flex-1 bg-gradient-to-br from-purple-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <PhoneCall className="w-4 h-4 mr-2" />
                          {contact.status === "completed" ? "Call Completed" : "Start Call"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {contact.status === "completed" 
                          ? "This call has been completed" 
                          : "Start a call with this contact"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {isAdmin && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleDeleteClick(contact)}
                            variant="outline"
                            size="icon"
                            className="border-2 border-red-300 hover:border-red-500 hover:bg-red-50 text-red-600 hover:text-red-700 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Delete contact (Admin only)
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoadingContacts && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 disabled:opacity-50 backdrop-blur-sm bg-white/80"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(i + 1)}
                  className={currentPage === i + 1 
                    ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 border-0" 
                    : "border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 backdrop-blur-sm bg-white/80"
                  }
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 disabled:opacity-50 backdrop-blur-sm bg-white/80"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Call Dialog */}
      {selectedContact && (
        <DraggableDialog
          isOpen={isCallDialogOpen}
          onClose={handleCancelCall}
          title={`Call with ${selectedContact.name}`}
          defaultPosition={{ x: window.innerWidth / 2 - 300, y: 50 }}
        >
          <div className="space-y-6">
            {/* Contact Info Section */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h3 className="font-bold text-black mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editableContact?.name || ""}
                    onChange={(e) => setEditableContact(prev => prev ? {...prev, name: e.target.value} : null)}
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Company</Label>
                  <Input
                    id="edit-company"
                    value={editableContact?.company || ""}
                    onChange={(e) => setEditableContact(prev => prev ? {...prev, company: e.target.value} : null)}
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-phone"
                      value={editableContact?.phone || ""}
                      onChange={(e) => setEditableContact(prev => prev ? {...prev, phone: e.target.value} : null)}
                      className="flex-1 border-purple-200 focus:border-purple-400"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => makeCall(editableContact?.phone || selectedContact.phone)}
                            className="border-2 border-green-300 hover:border-green-500 hover:bg-green-50"
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Call via 3CX</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    value={editableContact?.email || ""}
                    onChange={(e) => setEditableContact(prev => prev ? {...prev, email: e.target.value} : null)}
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-businessType">Business Type</Label>
                  <Select
                    value={editableContact?.businessType}
                    onValueChange={(value: any) => setEditableContact(prev => prev ? {...prev, businessType: value} : null)}
                  >
                    <SelectTrigger id="edit-businessType" className="border-purple-200">
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
                <div className="space-y-2">
                  <Label>Corporate Client</Label>
                  <div className="flex items-center h-10 px-3 rounded-md border border-purple-200 bg-white">
                    <Checkbox
                      checked={editableContact?.corporate}
                      onCheckedChange={(checked) => setEditableContact(prev => prev ? {...prev, corporate: checked as boolean} : null)}
                    />
                    <label className="ml-2 text-sm">Mark as corporate</label>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleUpdateContactInfo}
                variant="outline"
                size="sm"
                className="mt-4 border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50"
              >
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>

            {/* Call Script Section */}
            {!isLoadingScript && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 max-h-96 overflow-y-auto">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Call Script
                </h3>
                <div className="space-y-4 text-sm">
                  {callScript.greeting && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">1. Greeting</p>
                      <p className="text-gray-800 bg-white/80 p-3 rounded-lg">{callScript.greeting}</p>
                    </div>
                  )}
                  {callScript.introduction && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">2. Introduction</p>
                      <p className="text-gray-800 bg-white/80 p-3 rounded-lg">{callScript.introduction}</p>
                    </div>
                  )}
                  {callScript.discovery && Array.isArray(callScript.discovery) && callScript.discovery.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">3. Discovery Questions</p>
                      <ul className="text-gray-800 bg-white/80 p-3 rounded-lg space-y-1">
                        {callScript.discovery.map((q, i) => (
                          <li key={i}>• {q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {callScript.value && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">4. Value Proposition</p>
                      <p className="text-gray-800 bg-white/80 p-3 rounded-lg">{callScript.value}</p>
                    </div>
                  )}
                  {callScript.objectionHandling && typeof callScript.objectionHandling === 'object' && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">5. Objection Handling</p>
                      <div className="space-y-2">
                        {Object.entries(callScript.objectionHandling).map(([objection, response]) => (
                          <div key={objection} className="bg-white/80 p-3 rounded-lg">
                            <p className="font-semibold text-gray-900">{objection}</p>
                            <p className="text-gray-800 text-xs mt-1">→ {response}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {callScript.closing && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">6. Closing</p>
                      <p className="text-gray-800 bg-white/80 p-3 rounded-lg">{callScript.closing}</p>
                    </div>
                  )}
                  {callScript.followUp && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">7. Follow-up</p>
                      <p className="text-gray-800 bg-white/80 p-3 rounded-lg">{callScript.followUp}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Call Notes Section */}
            <div className="space-y-3">
              <Label htmlFor="call-notes" className="text-base font-bold text-gray-900">Call Notes</Label>
              <Textarea
                id="call-notes"
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                placeholder="Enter your notes about this call..."
                rows={4}
                className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              />
            </div>

            {/* Quick Email Section */}
            {selectedContact.email && (
              <Collapsible open={isEmailSectionOpen} onOpenChange={setIsEmailSectionOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50"
                  >
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Quick Email to {selectedContact.name}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isEmailSectionOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <div className="space-y-2">
                    <Label htmlFor="email-template">Template</Label>
                    <Select
                      value={emailTemplate}
                      onValueChange={handleEmailTemplateChange}
                    >
                      <SelectTrigger id="email-template" className="border-purple-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom Email</SelectItem>
                        <SelectItem value="booking">Booking Confirmation</SelectItem>
                        <SelectItem value="payment">Payment Information</SelectItem>
                        <SelectItem value="inquiry">Inquiry Response</SelectItem>
                        <SelectItem value="urgent">Urgent Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-subject">Subject</Label>
                    <Input
                      id="email-subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject..."
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-message">Message</Label>
                    <Textarea
                      id="email-message"
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      placeholder="Email message..."
                      rows={6}
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>

                  <Button
                    onClick={handleSendQuickEmail}
                    disabled={isSendingEmail || !emailSubject.trim() || !emailMessage.trim()}
                    className="w-full bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
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
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCancelCall}
                variant="outline"
                className="flex-1 border-2 border-gray-300 hover:border-gray-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompleteCall}
                className="flex-1 bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all"
              >
                <Check className="w-4 h-4 mr-2" />
                Complete Call
              </Button>
            </div>
          </div>
        </DraggableDialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-red-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Contact
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{contactToDelete?.name}</span>? This action cannot be undone.
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
              Archive Contacts
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive {selectedContactIds.length} contact(s)? Archived contacts can be restored later from the archived view.
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

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
