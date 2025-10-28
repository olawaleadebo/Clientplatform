import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Target, 
  TrendingUp, 
  User, 
  MessageSquare,
  PhoneCall,
  PhoneOff,
  FileText,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Loader2,
  Search,
  Filter,
  Calendar
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { backendService } from "../utils/backendService";
import { useUser } from "./UserContext";
import { useThreeCX } from "./ThreeCXContext";
import { motion } from "motion/react";

interface Assignment {
  id: string;
  agentId: string;
  type: 'client' | 'customer';
  recordId: string;
  record: {
    id: string;
    name?: string;
    phone: string;
    email?: string;
    company?: string;
    customerType?: string;
    notes?: string;
    source?: string;
  };
  status: 'pending' | 'claimed' | 'called' | 'completed';
  outcome?: string;
  claimedAt?: string;
  calledAt?: string;
  createdAt: string;
}

interface CallScript {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
  type: 'client' | 'customer' | 'general';
}

export function AgentPortal() {
  const { currentUser } = useUser();
  const { makeCall, config } = useThreeCX();
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showCallScript, setShowCallScript] = useState(false);
  const [callScripts, setCallScripts] = useState<CallScript[]>([]);
  const [activeScript, setActiveScript] = useState<CallScript | null>(null);
  
  // Call outcome dialog
  const [showOutcomeDialog, setShowOutcomeDialog] = useState(false);
  const [callOutcome, setCallOutcome] = useState("");
  const [callNotes, setCallNotes] = useState("");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    loadAssignments();
    loadCallScripts();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadAssignments, 30000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const loadAssignments = async () => {
    if (!currentUser?.id) return;
    
    try {
      const result = await backendService.getAssignments(currentUser.id);
      if (result.success) {
        setAssignments(result.assignments || []);
      }
    } catch (error) {
      console.error("Failed to load assignments:", error);
      if (!(error instanceof TypeError)) {
        toast.error("Failed to load your daily assignments");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadCallScripts = async () => {
    try {
      const result = await backendService.getCallScripts();
      if (result.success) {
        const scripts = result.scripts || [];
        setCallScripts(scripts);
        const active = scripts.find((s: CallScript) => s.isActive);
        if (active) setActiveScript(active);
      }
    } catch (error) {
      console.error("Failed to load call scripts:", error);
    }
  };

  const handleClaimContact = async (assignment: Assignment) => {
    try {
      const result = await backendService.claimAssignment(assignment.id, currentUser!.id);
      if (result.success) {
        setAssignments(assignments.map(a => 
          a.id === assignment.id ? { ...a, status: 'claimed', claimedAt: new Date().toISOString() } : a
        ));
        setSelectedAssignment({ ...assignment, status: 'claimed', claimedAt: new Date().toISOString() });
        toast.success("Contact claimed! You can now call them.");
      }
    } catch (error) {
      console.error("Failed to claim contact:", error);
      toast.error("Failed to claim contact");
    }
  };

  const handleMakeCall = (assignment: Assignment) => {
    if (!config.enabled) {
      toast.error("3CX integration is not enabled. Please contact your admin.");
      return;
    }

    const phoneNumber = assignment.record.phone;
    const contactName = assignment.record.name || 'Unknown Contact';
    
    makeCall(phoneNumber, contactName);
    setSelectedAssignment(assignment);
    
    // Show call script if available
    if (activeScript) {
      setShowCallScript(true);
    }
    
    toast.success(`Calling ${contactName}...`);
  };

  const handleCallComplete = async () => {
    if (!selectedAssignment) return;
    
    // Show outcome dialog
    setShowOutcomeDialog(true);
  };

  const handleSaveOutcome = async () => {
    if (!selectedAssignment || !callOutcome) {
      toast.error("Please select a call outcome");
      return;
    }

    try {
      const result = await backendService.markAssignmentCalled(
        selectedAssignment.id, 
        `${callOutcome}${callNotes ? ': ' + callNotes : ''}`
      );
      
      if (result.success) {
        // Update local state
        setAssignments(assignments.map(a => 
          a.id === selectedAssignment.id 
            ? { ...a, status: 'called', outcome: callOutcome, calledAt: new Date().toISOString() } 
            : a
        ));
        
        // Log the call
        await backendService.addCallLog({
          agentId: currentUser!.id,
          agentName: currentUser!.name,
          contactId: selectedAssignment.recordId,
          contactName: selectedAssignment.record.name || 'Unknown',
          phoneNumber: selectedAssignment.record.phone,
          outcome: callOutcome,
          notes: callNotes,
          duration: 0, // Would be set by actual call system
          timestamp: new Date().toISOString()
        });
        
        toast.success("Call logged successfully!");
        
        // Reset states
        setShowOutcomeDialog(false);
        setCallOutcome("");
        setCallNotes("");
        setSelectedAssignment(null);
        setShowCallScript(false);
      }
    } catch (error) {
      console.error("Failed to save call outcome:", error);
      toast.error("Failed to log call");
    }
  };

  // Calculate statistics
  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    claimed: assignments.filter(a => a.status === 'claimed').length,
    called: assignments.filter(a => a.status === 'called' || a.status === 'completed').length,
    progress: assignments.length > 0 
      ? Math.round((assignments.filter(a => a.status === 'called' || a.status === 'completed').length / assignments.length) * 100)
      : 0
  };

  // Apply filters
  const filteredAssignments = assignments.filter(assignment => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = assignment.record.name?.toLowerCase().includes(query);
      const matchPhone = assignment.record.phone?.includes(query);
      const matchCompany = assignment.record.company?.toLowerCase().includes(query);
      if (!matchName && !matchPhone && !matchCompany) return false;
    }

    // Status filter
    if (filterStatus !== "all" && assignment.status !== filterStatus) return false;

    // Type filter
    if (filterType !== "all" && assignment.type !== filterType) return false;

    return true;
  });

  // Group by status for better organization
  const pendingAssignments = filteredAssignments.filter(a => a.status === 'pending');
  const claimedAssignments = filteredAssignments.filter(a => a.status === 'claimed');
  const calledAssignments = filteredAssignments.filter(a => a.status === 'called' || a.status === 'completed');

  const formatPhoneNumber = (phone: string) => {
    // Format to Nigerian format: +234 XXX XXX XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('234') && cleaned.length === 13) {
      return `+234 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }
    return phone;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
          <p className="text-gray-600">Loading your daily assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Daily Progress</CardTitle>
                  <CardDescription>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </CardDescription>
                </div>
              </div>
              <Button 
                onClick={loadAssignments}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Completion Progress</span>
                <span className="font-bold text-purple-600">{stats.progress}%</span>
              </div>
              <Progress value={stats.progress} className="h-3" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs">Total Assigned</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm">
                <div className="flex items-center gap-2 text-orange-600 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Pending</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <PhoneCall className="w-4 h-4" />
                  <span className="text-xs">Claimed</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{stats.claimed}</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs">Completed</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.called}</div>
              </div>
            </div>

            {/* Daily Target Info */}
            {currentUser?.dailyTarget && (
              <Alert className="bg-purple-50 border-purple-200">
                <Target className="w-4 h-4 text-purple-600" />
                <AlertDescription className="text-purple-900">
                  Your daily target is <strong>{currentUser.dailyTarget}</strong> calls. 
                  You've completed <strong>{stats.called}</strong> so far!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-600" />
                My Assigned Contacts
              </CardTitle>
              <CardDescription>
                Your daily call list - {filteredAssignments.length} contact{filteredAssignments.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            
            {/* Active Call Script Badge */}
            {activeScript && (
              <Badge variant="outline" className="gap-2">
                <FileText className="w-4 h-4" />
                Active Script: {activeScript.name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, phone, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="claimed">Claimed</SelectItem>
                <SelectItem value="called">Called</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="client">Prospective Client</SelectItem>
                <SelectItem value="customer">Existing Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Empty State */}
          {filteredAssignments.length === 0 && (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                {assignments.length === 0 
                  ? "No contacts assigned yet. Your manager will assign contacts to you soon."
                  : "No contacts match your filters. Try adjusting the search or filters."
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Contact Lists - Organized by Status */}
          <div className="space-y-6">
            {/* Pending Contacts */}
            {pendingAssignments.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-orange-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pending ({pendingAssignments.length})
                </h3>
                <div className="space-y-2">
                  {pendingAssignments.map((assignment) => (
                    <ContactCard
                      key={assignment.id}
                      assignment={assignment}
                      onClaim={() => handleClaimContact(assignment)}
                      onCall={() => handleMakeCall(assignment)}
                      onViewScript={() => setShowCallScript(true)}
                      formatPhoneNumber={formatPhoneNumber}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Claimed Contacts */}
            {claimedAssignments.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-blue-600 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4" />
                  Ready to Call ({claimedAssignments.length})
                </h3>
                <div className="space-y-2">
                  {claimedAssignments.map((assignment) => (
                    <ContactCard
                      key={assignment.id}
                      assignment={assignment}
                      onCall={() => handleMakeCall(assignment)}
                      onComplete={() => {
                        setSelectedAssignment(assignment);
                        handleCallComplete();
                      }}
                      onViewScript={() => setShowCallScript(true)}
                      formatPhoneNumber={formatPhoneNumber}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Called/Completed Contacts */}
            {calledAssignments.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed ({calledAssignments.length})
                </h3>
                <div className="space-y-2">
                  {calledAssignments.map((assignment) => (
                    <ContactCard
                      key={assignment.id}
                      assignment={assignment}
                      formatPhoneNumber={formatPhoneNumber}
                      isCompleted
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Call Script Dialog */}
      {activeScript && (
        <Dialog open={showCallScript} onOpenChange={setShowCallScript}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Call Script: {activeScript.name}
              </DialogTitle>
              <DialogDescription>
                Follow this script during your call
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 whitespace-pre-wrap">
                  {activeScript.content}
                </div>
              </div>
              {selectedAssignment && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Contact Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedAssignment.record.name || 'N/A'}</p>
                    <p><strong>Phone:</strong> {formatPhoneNumber(selectedAssignment.record.phone)}</p>
                    {selectedAssignment.record.company && (
                      <p><strong>Company:</strong> {selectedAssignment.record.company}</p>
                    )}
                    {selectedAssignment.record.email && (
                      <p><strong>Email:</strong> {selectedAssignment.record.email}</p>
                    )}
                  </div>
                </div>
              )}
              <Button 
                onClick={handleCallComplete} 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark as Complete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Call Outcome Dialog */}
      <Dialog open={showOutcomeDialog} onOpenChange={setShowOutcomeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Call Outcome</DialogTitle>
            <DialogDescription>
              Record the result of your call
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Call Outcome *</Label>
              <Select value={callOutcome} onValueChange={setCallOutcome}>
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Interested">Interested</SelectItem>
                  <SelectItem value="Not Interested">Not Interested</SelectItem>
                  <SelectItem value="Call Back Later">Call Back Later</SelectItem>
                  <SelectItem value="Voicemail">Voicemail</SelectItem>
                  <SelectItem value="No Answer">No Answer</SelectItem>
                  <SelectItem value="Wrong Number">Wrong Number</SelectItem>
                  <SelectItem value="Booked">Booked/Converted</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add any additional notes about the call..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => setShowOutcomeDialog(false)} 
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveOutcome}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                disabled={!callOutcome}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Save Outcome
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Contact Card Component
interface ContactCardProps {
  assignment: Assignment;
  onClaim?: () => void;
  onCall?: () => void;
  onComplete?: () => void;
  onViewScript?: () => void;
  formatPhoneNumber: (phone: string) => string;
  isCompleted?: boolean;
}

function ContactCard({ 
  assignment, 
  onClaim, 
  onCall, 
  onComplete, 
  onViewScript, 
  formatPhoneNumber,
  isCompleted 
}: ContactCardProps) {
  const { config } = useThreeCX();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'claimed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'called': return 'bg-green-100 text-green-700 border-green-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'client' 
      ? 'bg-purple-100 text-purple-700 border-purple-200'
      : 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`border-2 hover:shadow-lg transition-all ${
        isCompleted ? 'bg-green-50/50' : 'bg-white'
      }`}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Contact Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-gray-900">
                      {assignment.record.name || 'Unknown Contact'}
                    </h4>
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status}
                    </Badge>
                    <Badge className={getTypeColor(assignment.type)}>
                      {assignment.type === 'client' ? 'Prospective' : 'Customer'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="font-mono">{formatPhoneNumber(assignment.record.phone)}</span>
                  </div>
                  
                  {assignment.record.company && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Company:</strong> {assignment.record.company}
                    </p>
                  )}
                  
                  {assignment.record.email && (
                    <p className="text-sm text-gray-600">
                      <strong>Email:</strong> {assignment.record.email}
                    </p>
                  )}
                  
                  {assignment.outcome && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                      <strong>Outcome:</strong> {assignment.outcome}
                    </div>
                  )}
                  
                  {assignment.calledAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Called: {new Date(assignment.calledAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 md:w-48">
              {assignment.status === 'pending' && onClaim && (
                <Button 
                  onClick={onClaim}
                  size="sm"
                  variant="outline"
                  className="w-full gap-2 border-orange-300 hover:bg-orange-50"
                >
                  <ChevronRight className="w-4 h-4" />
                  Claim Contact
                </Button>
              )}
              
              {assignment.status === 'claimed' && onCall && (
                <>
                  {config.enabled ? (
                    <Button 
                      onClick={onCall}
                      size="sm"
                      className="w-full gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <PhoneCall className="w-4 h-4" />
                      Call Now
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      variant="outline"
                      className="w-full gap-2"
                      disabled
                    >
                      <PhoneOff className="w-4 h-4" />
                      3CX Disabled
                    </Button>
                  )}
                  
                  {onViewScript && (
                    <Button 
                      onClick={onViewScript}
                      size="sm"
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View Script
                    </Button>
                  )}
                  
                  {onComplete && (
                    <Button 
                      onClick={onComplete}
                      size="sm"
                      variant="outline"
                      className="w-full gap-2 border-green-300 hover:bg-green-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Complete
                    </Button>
                  )}
                </>
              )}
              
              {isCompleted && (
                <div className="flex items-center justify-center gap-2 text-green-600 py-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Completed</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
