import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  CheckCircle2,
  AlertCircle 
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { backendService } from '../utils/backendService';

export interface CallScript {
  id: string;
  name: string;
  type: 'prospective' | 'existing'; // New field for script type
  greeting: string;
  purpose: string;
  discovery: string[];
  closing: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export function CallScriptManager() {
  const [scripts, setScripts] = useState<CallScript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<CallScript | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "prospective" as "prospective" | "existing",
    greeting: "",
    purpose: "",
    discovery: ["", "", ""],
    closing: ""
  });

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    try {
      setIsLoading(true);
      const data = await backendService.getCallScripts();
      setScripts(data.scripts || []);
    } catch (error: any) {
      console.error('Error loading call scripts:', error);
      toast.error(error.message || 'Failed to load call scripts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveScript = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter a script name');
      return;
    }
    if (!formData.greeting.trim()) {
      toast.error('Please enter a greeting');
      return;
    }
    if (!formData.purpose.trim()) {
      toast.error('Please enter the call purpose');
      return;
    }
    if (formData.discovery.filter(q => q.trim()).length === 0) {
      toast.error('Please add at least one discovery question');
      return;
    }
    if (!formData.closing.trim()) {
      toast.error('Please enter a closing statement');
      return;
    }

    try {
      const scriptData = {
        ...formData,
        discovery: formData.discovery.filter(q => q.trim()),
        id: editingScript?.id
      };

      const response = await backendService.addCallScript(scriptData);
      
      if (response.success) {
        toast.success(editingScript ? 'Script updated successfully' : 'Script created successfully');
        setIsDialogOpen(false);
        resetForm();
        loadScripts();
      } else {
        throw new Error(response.error || 'Failed to save script');
      }
    } catch (error: any) {
      console.error('Error saving script:', error);
      toast.error(error.message || 'Failed to save script');
    }
  };

  const handleDeleteScript = async (id: string) => {
    if (!confirm('Are you sure you want to delete this call script?')) {
      return;
    }

    try {
      const response = await backendService.deleteCallScript(id);
      
      if (response.success) {
        toast.success('Script deleted successfully');
        loadScripts();
      } else {
        throw new Error(response.error || 'Failed to delete script');
      }
    } catch (error: any) {
      console.error('Error deleting script:', error);
      toast.error(error.message || 'Failed to delete script');
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      const response = await backendService.activateCallScript(id);
      
      if (response.success) {
        toast.success('Active script updated');
        loadScripts();
      } else {
        throw new Error(response.error || 'Failed to set active script');
      }
    } catch (error: any) {
      console.error('Error setting active script:', error);
      toast.error(error.message || 'Failed to set active script');
    }
  };

  const handleEditScript = (script: CallScript) => {
    setEditingScript(script);
    setFormData({
      name: script.name,
      type: script.type || "prospective", // Default to prospective for old scripts
      greeting: script.greeting,
      purpose: script.purpose,
      discovery: [...script.discovery, "", ""].slice(0, 5), // Ensure at least 3, max 5
      closing: script.closing
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "prospective",
      greeting: "",
      purpose: "",
      discovery: ["", "", ""],
      closing: ""
    });
    setEditingScript(null);
  };

  const addDiscoveryQuestion = () => {
    if (formData.discovery.length < 10) {
      setFormData({
        ...formData,
        discovery: [...formData.discovery, ""]
      });
    }
  };

  const removeDiscoveryQuestion = (index: number) => {
    const newDiscovery = formData.discovery.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      discovery: newDiscovery.length > 0 ? newDiscovery : [""]
    });
  };

  const updateDiscoveryQuestion = (index: number, value: string) => {
    const newDiscovery = [...formData.discovery];
    newDiscovery[index] = value;
    setFormData({
      ...formData,
      discovery: newDiscovery
    });
  };

  const activeScript = scripts.find(s => s.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Call Script Management
          </h2>
          <p className="text-muted-foreground">Create and manage call scripts for your team</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/20">
              <Plus className="w-4 h-4 mr-2" />
              New Script
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingScript ? 'Edit Call Script' : 'Create New Call Script'}</DialogTitle>
              <DialogDescription>
                Define the script that agents will use during calls
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Script Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Standard Outreach, Follow-up Call"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Script Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "prospective" | "existing") => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger id="type" className="bg-white/60 backdrop-blur-xl border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospective">Prospective Client (CRM)</SelectItem>
                        <SelectItem value="existing">Existing Client (Customer Service)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      This determines which module will use this script
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="greeting">Greeting *</Label>
                  <Textarea
                    id="greeting"
                    placeholder="Hi [Name], this is [Your Name] calling from BTM Limited. How are you today?"
                    value={formData.greeting}
                    onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use [Name] for contact name, [Your Name] for agent name
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Call Purpose *</Label>
                  <Textarea
                    id="purpose"
                    placeholder="I'm reaching out to discuss how our services can help [Company] achieve [specific goal]."
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use [Company] for company name, [specific goal] for customization
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Discovery Questions *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDiscoveryQuestion}
                      disabled={formData.discovery.length >= 10}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Question
                    </Button>
                  </div>
                  {formData.discovery.map((question, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Question ${index + 1}`}
                        value={question}
                        onChange={(e) => updateDiscoveryQuestion(index, e.target.value)}
                      />
                      {formData.discovery.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDiscoveryQuestion(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="closing">Closing Statement *</Label>
                  <Textarea
                    id="closing"
                    placeholder="Based on what we discussed, I'd like to [next step]. Does [proposed time] work for you?"
                    value={formData.closing}
                    onChange={(e) => setFormData({ ...formData, closing: e.target.value })}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use [next step] and [proposed time] for customization
                  </p>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleSaveScript}>
                <Save className="w-4 h-4 mr-2" />
                {editingScript ? 'Update' : 'Create'} Script
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading scripts...</div>
        </div>
      ) : scripts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              No call scripts found. Create your first script to get started.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Script
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Prospective Client Scripts */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-blue-200 to-blue-400"></div>
              <h3 className="text-lg font-semibold text-blue-900 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Prospective Client Scripts (CRM)
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-blue-400 to-blue-200"></div>
            </div>
            <div className="grid gap-4">
              {scripts.filter(s => s.type === 'prospective' || !s.type).length === 0 ? (
                <Card className="border-dashed border-blue-200 bg-blue-50/30">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground text-sm">No prospective client scripts yet</p>
                  </CardContent>
                </Card>
              ) : (
                scripts.filter(s => s.type === 'prospective' || !s.type).map((script) => (
            <Card key={script.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500 bg-white/60 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{script.name}</CardTitle>
                      {script.isActive && (
                        <Badge className="bg-green-600">Active</Badge>
                      )}
                    </div>
                    <CardDescription>
                      Last updated: {new Date(script.updatedAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {!script.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetActive(script.id)}
                        className="bg-green-50 hover:bg-green-100 border-green-200"
                      >
                        Set Active
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditScript(script)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteScript(script.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Greeting:</p>
                  <p className="line-clamp-2">{script.greeting}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Purpose:</p>
                  <p className="line-clamp-2">{script.purpose}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    Discovery Questions: {script.discovery.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
              )}
            </div>
          </div>

          {/* Existing Client Scripts */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-purple-200 to-purple-400"></div>
              <h3 className="text-lg font-semibold text-purple-900 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Existing Client Scripts (Customer Service)
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-purple-400 to-purple-200"></div>
            </div>
            <div className="grid gap-4">
              {scripts.filter(s => s.type === 'existing').length === 0 ? (
                <Card className="border-dashed border-purple-200 bg-purple-50/30">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground text-sm">No existing client scripts yet</p>
                  </CardContent>
                </Card>
              ) : (
                scripts.filter(s => s.type === 'existing').map((script) => (
            <Card key={script.id} className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500 bg-white/60 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{script.name}</CardTitle>
                      {script.isActive && (
                        <Badge className="bg-green-600">Active</Badge>
                      )}
                    </div>
                    <CardDescription>
                      Last updated: {new Date(script.updatedAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {!script.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetActive(script.id)}
                        className="bg-green-50 hover:bg-green-100 border-green-200"
                      >
                        Set Active
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditScript(script)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteScript(script.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Greeting:</p>
                  <p className="line-clamp-2">{script.greeting}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Purpose:</p>
                  <p className="line-clamp-2">{script.purpose}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    Discovery Questions: {script.discovery.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
