import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { 
  BookOpen, Users, Phone, Settings, BarChart3, PlayCircle,
  CheckCircle2, AlertCircle, Lightbulb, Target, Megaphone,
  Headphones, Key, UserCircle, Search,
  Plus, Edit, ChevronRight, Shield, ArrowLeft, Home, Archive, HelpCircle,
  Server, Database, Info,
  AlertTriangle, Globe, Wifi, WifiOff,
  UserPlus, Activity, LayoutDashboard, 
  FileSpreadsheet, Monitor, Chrome, Mail, Download, Upload,
  Eye, Trash2, Copy, Filter, Calendar, Clock, TrendingUp,
  Lock, Unlock, RefreshCw, CheckCircle, XCircle, Zap,
  Award, Star, MousePointerClick, Send, Inbox, RotateCcw
} from "lucide-react";
import { BTMTravelLogo } from "./BTMTravelLogo";

interface HelpProps {
  onBack?: () => void;
}

type HelpSection = 
  | "overview"
  | "getting-started"
  | "backend-setup"
  | "database-system"
  | "special-database"
  | "roles-permissions"
  | "crm"
  | "promo-sales"
  | "customer-service"
  | "phone-system"
  | "manager-portal"
  | "reports"
  | "troubleshooting"
  | "faq";

export function Help({ onBack }: HelpProps) {
  const [activeSection, setActiveSection] = useState<HelpSection>("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = [
    { id: "overview" as HelpSection, icon: Home, label: "Overview", color: "text-blue-600", bgColor: "bg-blue-50" },
    { id: "getting-started" as HelpSection, icon: PlayCircle, label: "Getting Started", color: "text-green-600", bgColor: "bg-green-50" },
    { id: "backend-setup" as HelpSection, icon: Server, label: "Backend Setup", color: "text-orange-600", bgColor: "bg-orange-50" },
    { id: "database-system" as HelpSection, icon: Database, label: "Clients & Customers Database", color: "text-cyan-600", bgColor: "bg-cyan-50" },
    { id: "special-database" as HelpSection, icon: FileSpreadsheet, label: "Special Database", color: "text-violet-600", bgColor: "bg-violet-50" },
    { id: "roles-permissions" as HelpSection, icon: Shield, label: "Roles & Permissions", color: "text-red-600", bgColor: "bg-red-50" },
    { id: "crm" as HelpSection, icon: Users, label: "Prospective Client (CRM)", color: "text-blue-600", bgColor: "bg-blue-50" },
    { id: "promo-sales" as HelpSection, icon: Megaphone, label: "Promo Sales", color: "text-purple-600", bgColor: "bg-purple-50" },
    { id: "customer-service" as HelpSection, icon: Headphones, label: "Customer Service", color: "text-green-600", bgColor: "bg-green-50" },
    { id: "phone-system" as HelpSection, icon: Phone, label: "3CX Phone System", color: "text-teal-600", bgColor: "bg-teal-50" },
    { id: "manager-portal" as HelpSection, icon: LayoutDashboard, label: "Manager Portal", color: "text-indigo-600", bgColor: "bg-indigo-50" },
    { id: "reports" as HelpSection, icon: BarChart3, label: "Reports & Analytics", color: "text-pink-600", bgColor: "bg-pink-50" },
    { id: "troubleshooting" as HelpSection, icon: AlertCircle, label: "Troubleshooting", color: "text-rose-600", bgColor: "bg-rose-50" },
    { id: "faq" as HelpSection, icon: HelpCircle, label: "FAQ", color: "text-amber-600", bgColor: "bg-amber-50" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" style={{
      backgroundImage: 'linear-gradient(to bottom right, #f8fafc, #dbeafe, #e9d5ff)',
      WebkitBackgroundClip: 'padding-box',
      backgroundClip: 'padding-box'
    }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 border-b-2 border-white/30 shadow-xl" style={{
        backgroundImage: 'linear-gradient(to right, #2563eb, #9333ea, #7c3aed)',
        WebkitBackgroundClip: 'padding-box',
        backgroundClip: 'padding-box'
      }}>
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-white drop-shadow-lg text-3xl font-extrabold">Help & Documentation</h1>
                  <p className="text-white/90 mt-1">Complete guide to BTMTravel CRM Platform</p>
                </div>
              </div>
            </div>
            <BTMTravelLogo className="w-32 h-auto" />
          </div>
          
          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search help topics..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/90 backdrop-blur text-gray-900 placeholder-gray-500 border-white/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Sidebar + Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar Navigation */}
          <div className="col-span-3">
            <Card className="sticky top-6 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Help Topics</CardTitle>
                <CardDescription className="text-xs">Select a topic to view details</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="space-y-1 p-4 pt-0">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            isActive
                              ? `${item.bgColor} ${item.color} font-semibold shadow-md`
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? item.color : "text-gray-500"}`} />
                          <span className="text-sm text-left flex-1">{item.label}</span>
                          {isActive && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Content Area */}
          <div className="col-span-9">
            <ScrollArea className="h-[calc(100vh-240px)]">
              <div className="pr-4">
                {activeSection === "overview" && <OverviewContent />}
                {activeSection === "getting-started" && <GettingStartedContent />}
                {activeSection === "backend-setup" && <BackendSetupContent />}
                {activeSection === "database-system" && <DatabaseSystemContent />}
                {activeSection === "special-database" && <SpecialDatabaseContent />}
                {activeSection === "roles-permissions" && <RolesPermissionsContent />}
                {activeSection === "crm" && <CRMContent />}
                {activeSection === "promo-sales" && <PromoSalesContent />}
                {activeSection === "customer-service" && <CustomerServiceContent />}
                {activeSection === "phone-system" && <PhoneSystemContent />}
                {activeSection === "manager-portal" && <ManagerPortalContent />}
                {activeSection === "reports" && <ReportsContent />}
                {activeSection === "troubleshooting" && <TroubleshootingContent />}
                {activeSection === "faq" && <FAQContent />}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== CONTENT COMPONENTS ====================

function OverviewContent() {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3">
            <Home className="h-8 w-8 text-blue-600" />
            Welcome to BTMTravel CRM
          </CardTitle>
          <CardDescription className="text-lg">
            Your complete customer relationship management solution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-700 text-lg leading-relaxed">
            BTMTravel CRM is a comprehensive platform designed for managing prospective clients, existing customers, 
            promotional campaigns, and customer service operations. Built with modern technology and integrated with 
            3CX phone system for seamless communication.
          </p>

          {/* Key Features Grid */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <Shield className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle className="text-lg">Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Role-based permissions with complete audit trail and logging
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <Database className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle className="text-lg">Centralized Database</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  MongoDB-powered single source of truth for all customer data
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <Phone className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle className="text-lg">3CX Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Click-to-call functionality with automatic call logging
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <BarChart3 className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle className="text-lg">Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Track team performance and individual agent metrics
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Platform Information */}
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-6 border-2 border-blue-200 mt-6">
            <h3 className="font-bold text-xl mb-4 text-gray-800">Platform Information</h3>
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <strong>Production URL:</strong> https://btmn.3cx.ng
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <strong>Phone Format:</strong> +234 XXX XXX XXXX (Nigerian)
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <strong>Daily Call Target:</strong> 30 calls per agent (customizable)
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <strong>User Roles:</strong> Admin, Manager, Agent
                </p>
              </div>
            </div>
          </div>

          {/* Quick Start Alert */}
          <Alert className="bg-green-50 border-green-200 mt-6">
            <Lightbulb className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>New User?</strong> Start with the "Getting Started" section to learn how to log in and navigate the platform.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

function GettingStartedContent() {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <PlayCircle className="h-8 w-8 text-green-600" />
            Getting Started Guide
          </CardTitle>
          <CardDescription>Everything you need to know to start using BTMTravel CRM</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            
            {/* Agent Registration */}
            <AccordionItem value="agent-registration">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  Agent Self-Registration
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 ml-7">
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    <strong>New Feature!</strong> Agents can now register themselves. Managers and Admins are added by administrators only.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    How to Register as an Agent
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-700">
                    <li>Go to the BTMTravel CRM login page</li>
                    <li>Click on "Register as Agent" button</li>
                    <li>Fill in your details:
                      <ul className="list-disc ml-10 mt-1 space-y-1 text-sm">
                        <li><strong>Username:</strong> Choose a unique username (letters, numbers, underscores only)</li>
                        <li><strong>Full Name:</strong> Your complete name</li>
                        <li><strong>Email:</strong> Valid email address (for verification)</li>
                        <li><strong>Password:</strong> Strong password (minimum 6 characters)</li>
                      </ul>
                    </li>
                    <li>Click "Create Account"</li>
                    <li>Check your email for verification link</li>
                    <li>Click the verification link in your email</li>
                    <li>Once verified, you can log in to the system</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Important Notes
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 ml-4">
                    <li>You must verify your email before you can log in</li>
                    <li>Verification emails may take a few minutes to arrive</li>
                    <li>Check your spam folder if you don't see the email</li>
                    <li>Your account will be activated immediately after verification</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* First Time Login */}
            <AccordionItem value="first-login">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-blue-600" />
                  First Time Login
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 ml-7">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    For managers and admins, your administrator will provide you with login credentials
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Step-by-Step Login Process
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-700">
                    <li>Open the BTMTravel CRM application in your browser</li>
                    <li>Enter your username or email</li>
                    <li>Enter your password</li>
                    <li>Click "Sign In" button</li>
                    <li>You'll be redirected to your dashboard based on your role:
                      <ul className="list-disc ml-10 mt-1 space-y-1 text-sm">
                        <li><strong>Admin:</strong> Full system access with Admin Settings tab</li>
                        <li><strong>Manager:</strong> Team monitoring and management portal</li>
                        <li><strong>Agent:</strong> Daily call list and customer management</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4" />
                    Password Security Tips
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 ml-4">
                    <li>Change your password after first login (ask admin for access)</li>
                    <li>Use a strong password with letters, numbers, and symbols</li>
                    <li>Never share your password with anyone</li>
                    <li>Log out when leaving your desk</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Dashboard Overview */}
            <AccordionItem value="dashboard">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-purple-600" />
                  Dashboard Overview
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 ml-7">
                <div className="space-y-3">
                  <h4 className="font-semibold">Main Navigation Tabs</h4>
                  <div className="grid gap-3">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Users className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-blue-900">Prospective Client (CRM)</h5>
                        <p className="text-sm text-blue-700 mt-1">
                          Manage your daily call list, make calls, send emails, and track leads through the sales pipeline
                        </p>
                        <Badge className="mt-2 bg-blue-200 text-blue-800">All Users</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <Megaphone className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-purple-900">Promo Sales</h5>
                        <p className="text-sm text-purple-700 mt-1">
                          Manage promotional campaigns for adventure.btmtravel.net with targeted offers
                        </p>
                        <Badge className="mt-2 bg-purple-200 text-purple-800">All Users</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <Headphones className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-green-900">Customer Service</h5>
                        <p className="text-sm text-green-700 mt-1">
                          Handle existing customer inquiries, manage bookings, and resolve support tickets
                        </p>
                        <Badge className="mt-2 bg-green-200 text-green-800">All Users</Badge>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <LayoutDashboard className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-indigo-900">Manager Portal</h5>
                        <p className="text-sm text-indigo-700 mt-1">
                          Monitor team performance, track agent activity, and manage daily assignments
                        </p>
                        <Badge className="mt-2 bg-indigo-200 text-indigo-800">Manager + Admin</Badge>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <Archive className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-orange-900">Archive Manager</h5>
                        <p className="text-sm text-orange-700 mt-1">
                          View and restore archived records from all modules
                        </p>
                        <Badge className="mt-2 bg-orange-200 text-orange-800">Admin Only</Badge>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                      <Settings className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-red-900">Admin Settings</h5>
                        <p className="text-sm text-red-700 mt-1">
                          System configuration, user management, database management, and platform settings
                        </p>
                        <Badge className="mt-2 bg-red-200 text-red-800">Admin Only</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* User Roles */}
            <AccordionItem value="roles">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Understanding User Roles
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 ml-7">
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4 py-3 bg-red-50 rounded-r-lg">
                    <h4 className="font-semibold text-red-900 flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5" />
                      Administrator
                    </h4>
                    <p className="text-sm text-red-700 mb-3">
                      Full system access with complete control over all features and settings
                    </p>
                    <ul className="list-disc list-inside text-sm text-red-600 space-y-1 ml-4">
                      <li>Create and manage all users (Agents, Managers, Admins)</li>
                      <li>Configure 3CX phone system integration</li>
                      <li>Set up email SMTP settings</li>
                      <li>Manage centralized number database</li>
                      <li>Import and export data (CSV)</li>
                      <li>View all reports and analytics</li>
                      <li>Delete and archive records</li>
                      <li>Access system logs and audit trails</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded-r-lg">
                    <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5" />
                      Manager
                    </h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Team oversight and management capabilities with customizable permissions
                    </p>
                    <ul className="list-disc list-inside text-sm text-blue-600 space-y-1 ml-4">
                      <li>View team performance dashboard with real-time metrics</li>
                      <li>Monitor individual agent activity and progress</li>
                      <li>Assign numbers from database to agents daily</li>
                      <li>Access team-wide call history and logs</li>
                      <li>Generate team reports (PDF/PowerPoint)</li>
                      <li>Limited settings access based on admin permissions</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 py-3 bg-green-50 rounded-r-lg">
                    <h4 className="font-semibold text-green-900 flex items-center gap-2 mb-2">
                      <UserCircle className="h-5 w-5" />
                      Agent
                    </h4>
                    <p className="text-sm text-green-700 mb-3">
                      Front-line user with call and customer management access
                    </p>
                    <ul className="list-disc list-inside text-sm text-green-600 space-y-1 ml-4">
                      <li>View daily assigned numbers (from database)</li>
                      <li>Make calls using 3CX click-to-call</li>
                      <li>Send emails to prospects and customers</li>
                      <li>Log call notes and outcomes</li>
                      <li>Update customer status and information</li>
                      <li>View personal call history</li>
                      <li>Track daily progress toward targets (30 calls default)</li>
                      <li>Access call scripts and templates</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

function BackendSetupContent() {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Server className="h-8 w-8 text-orange-600" />
            Backend Server Setup
          </CardTitle>
          <CardDescription>Complete guide to setting up and running the BTMTravel CRM backend</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            
            {/* Prerequisites */}
            <AccordionItem value="prerequisites">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Prerequisites & Requirements
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 ml-7">
                <div className="space-y-4">
                  <h4 className="font-semibold">Before you begin, ensure you have:</h4>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900 mb-3">Required Software</h5>
                    <ul className="list-disc list-inside space-y-2 text-sm text-blue-800 ml-4">
                      <li><strong>Deno Runtime:</strong> Version 1.40+ (Download from deno.land)</li>
                      <li><strong>MongoDB Atlas Account:</strong> Free tier is sufficient</li>
                      <li><strong>Text Editor:</strong> VS Code or any code editor</li>
                      <li><strong>Internet Connection:</strong> For MongoDB cloud connection</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-semibold text-green-900 mb-3">Included in Project</h5>
                    <ul className="list-disc list-inside space-y-2 text-sm text-green-800 ml-4">
                      <li><strong>Backend Server:</strong> /backend/server.tsx</li>
                      <li><strong>MongoDB Config:</strong> /backend/mongodb.tsx</li>
                      <li><strong>Start Scripts:</strong> Automated startup files</li>
                      <li><strong>Connection String:</strong> Pre-configured for MongoDB Atlas</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Quick Start */}
            <AccordionItem value="quick-start">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Quick Start (One-Click)
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 ml-7">
                <Alert className="bg-green-50 border-green-200">
                  <Zap className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <strong>Easiest Method:</strong> Use the automated startup scripts for instant setup!
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-gray-700" />
                      Windows Users
                    </h5>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
                      <li>Double-click <code className="bg-red-100 px-2 py-1 rounded">🔴-START-BACKEND-FIXED.bat</code></li>
                      <li>Wait for "✅ MongoDB connected successfully" message</li>
                      <li>Look for "SERVER - FULLY OPERATIONAL" confirmation</li>
                      <li>Backend is now running on <code className="bg-blue-100 px-2 py-1 rounded">http://localhost:3000</code></li>
                    </ol>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Chrome className="h-5 w-5 text-gray-700" />
                      Mac/Linux Users
                    </h5>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
                      <li>Open terminal in project directory</li>
                      <li>Run: <code className="bg-gray-200 px-2 py-1 rounded">./🔴-START-BACKEND-FIXED.sh</code></li>
                      <li>Or run: <code className="bg-gray-200 px-2 py-1 rounded">cd backend && deno run --allow-all server.tsx</code></li>
                      <li>Wait for connection confirmation</li>
                    </ol>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Manual Setup */}
            <AccordionItem value="manual-setup">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Manual Setup & Configuration
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 ml-7">
                <div className="space-y-4">
                  <h4 className="font-semibold">Step-by-Step Manual Setup</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 border-l-4 border-blue-500 p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Step 1: Install Deno</h5>
                      <p className="text-sm text-gray-700 mb-2">Download and install from deno.land</p>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded text-xs">
                        # Windows (PowerShell)<br />
                        irm https://deno.land/install.ps1 | iex<br /><br />
                        # Mac/Linux<br />
                        curl -fsSL https://deno.land/install.sh | sh
                      </code>
                    </div>

                    <div className="bg-gray-50 border-l-4 border-blue-500 p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Step 2: Navigate to Backend</h5>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded text-xs">
                        cd backend
                      </code>
                    </div>

                    <div className="bg-gray-50 border-l-4 border-blue-500 p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Step 3: Start Server</h5>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded text-xs">
                        deno run --allow-all server.tsx
                      </code>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Troubleshooting */}
            <AccordionItem value="backend-troubleshooting">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Common Issues & Solutions
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 ml-7">
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h5 className="font-semibold text-red-900 mb-2">MongoDB Connection Failed</h5>
                    <p className="text-sm text-red-700 mb-2">Solutions:</p>
                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1 ml-4">
                      <li>Check your internet connection</li>
                      <li>Verify MongoDB Atlas cluster is running</li>
                      <li>Ensure firewall isn't blocking MongoDB ports</li>
                      <li>Wait 30-45 seconds for initial connection</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-semibold text-yellow-900 mb-2">Port 3000 Already in Use</h5>
                    <p className="text-sm text-yellow-700 mb-2">Solutions:</p>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1 ml-4">
                      <li>Check if backend is already running</li>
                      <li>Kill existing process on port 3000</li>
                      <li>Change port in server.tsx if needed</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

function DatabaseSystemContent() {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Database className="h-8 w-8 text-cyan-600" />
            Clients & Customers Database (Number Bank)
          </CardTitle>
          <CardDescription>
            Centralized database management for prospective clients and existing customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-cyan-50 border-cyan-200">
            <Info className="h-4 w-4 text-cyan-600" />
            <AlertDescription>
              <strong>Single Source of Truth:</strong> All client and customer numbers are stored centrally and assigned to agents daily by managers/admins.
            </AlertDescription>
          </Alert>

          <Accordion type="multiple" className="w-full">
            
            {/* Overview */}
            <AccordionItem value="overview">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-cyan-600" />
                  Database System Overview
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 ml-7">
                <p className="text-gray-700">
                  The Number Bank is a centralized repository where managers upload and manage all prospect and customer phone numbers. 
                  This eliminates data duplication and ensures consistent record-keeping across the organization.
                </p>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900 mb-2">Clients Database</h5>
                    <p className="text-sm text-blue-700">
                      Prospective clients for new business development and sales outreach
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-semibold text-green-900 mb-2">Customers Database</h5>
                    <p className="text-sm text-green-700">
                      Existing customers for service, support, and retention activities
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Importing Data */}
            <AccordionItem value="importing">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-green-600" />
                  Importing Numbers (CSV)
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 ml-7">
                <Alert className="bg-orange-50 border-orange-200">
                  <Shield className="h-4 w-4 text-orange-600" />
                  <AlertDescription>
                    <strong>Admin/Manager Only:</strong> Only users with proper permissions can import data
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h4 className="font-semibold">How to Import Client/Customer Numbers</h4>
                  <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-700">
                    <li>Go to <strong>Admin Settings</strong> → <strong>Database Manager</strong></li>
                    <li>Select the appropriate database tab (Clients or Customers)</li>
                    <li>Click <strong>"Import from CSV"</strong> button</li>
                    <li>Prepare your CSV file with required columns:
                      <div className="bg-gray-50 border border-gray-200 rounded p-3 mt-2 text-sm">
                        <p className="font-semibold mb-2">For Clients:</p>
                        <code className="text-xs">phoneNumber, customerType, airplane, status</code>
                        
                        <p className="font-semibold mt-3 mb-2">For Customers:</p>
                        <code className="text-xs">phoneNumber, name, email, customerType, status</code>
                      </div>
                    </li>
                    <li>Select your CSV file</li>
                    <li>Click "Import" and wait for confirmation</li>
                  </ol>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <h5 className="font-semibold text-yellow-900 mb-2">CSV Format Tips</h5>
                    <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1 ml-4">
                      <li>Phone numbers must be in Nigerian format: +234 XXX XXX XXXX</li>
                      <li>First row should contain column headers</li>
                      <li>Save file as CSV (Comma delimited)</li>
                      <li>Remove any special characters from data</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Assigning Numbers */}
            <AccordionItem value="assigning">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-purple-600" />
                  Assigning Numbers to Agents
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 ml-7">
                <p className="text-gray-700">
                  Managers can assign numbers from the database to specific agents daily. Each assignment creates a work queue for the agent.
                </p>

                <div className="space-y-4">
                  <h4 className="font-semibold">Assignment Process</h4>
                  <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-700">
                    <li>Go to <strong>Manager Portal</strong> or <strong>Admin Settings → Database Manager</strong></li>
                    <li>Select numbers to assign:
                      <ul className="list-disc ml-10 mt-1 space-y-1 text-sm">
                        <li>Check individual numbers, OR</li>
                        <li>Use filters to select by criteria, OR</li>
                        <li>Specify quantity to auto-select</li>
                      </ul>
                    </li>
                    <li>Click <strong>"Assign to Agent"</strong></li>
                    <li>Select the target agent from dropdown</li>
                    <li>Confirm assignment</li>
                    <li>Agent will see these numbers in their daily queue</li>
                  </ol>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900 mb-2">Smart Assignment Features</h5>
                    <ul className="list-disc list-inside text-sm text-blue-700 space-y-1 ml-4">
                      <li>Prevent duplicate assignments (same number to multiple agents)</li>
                      <li>Track assignment history and dates</li>
                      <li>Filter by customer type, status, or date range</li>
                      <li>Bulk assign with quantity limits</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Managing Database */}
            <AccordionItem value="managing">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Managing Database Records
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 ml-7">
                <div className="grid gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      View & Search
                    </h5>
                    <p className="text-sm text-green-700">
                      Use search and filters to find specific numbers quickly. Filter by customer type, status, date uploaded, or assignment status.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Records
                    </h5>
                    <p className="text-sm text-blue-700">
                      Click edit icon to update phone number, customer type, status, or other details. Changes sync across all assignments.
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h5 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Records
                    </h5>
                    <p className="text-sm text-red-700">
                      Admins can delete numbers permanently. This action cannot be undone. Use Archive instead for soft deletion.
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export Data
                    </h5>
                    <p className="text-sm text-purple-700">
                      Export current view to CSV for backup or analysis. Includes all visible columns and respects active filters.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

function SpecialDatabaseContent() {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-violet-600" />
            Special Database
          </CardTitle>
          <CardDescription>
            Separate database for special purposes with CSV import and offline capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-violet-50 border-violet-200">
            <Info className="h-4 w-4 text-violet-600" />
            <AlertDescription>
              <strong>Special Purpose:</strong> This database operates independently with localStorage fallback for offline mode.
            </AlertDescription>
          </Alert>

          <Accordion type="multiple" className="w-full">
            
            <AccordionItem value="overview">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-violet-600" />
                  What is Special Database?
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 ml-7">
                <p className="text-gray-700">
                  The Special Database is a flexible data store for unique campaigns, temporary projects, or specialized outreach initiatives 
                  that require separate tracking from the main client/customer databases.
                </p>

                <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                  <h5 className="font-semibold text-violet-900 mb-3">Key Features</h5>
                  <ul className="list-disc list-inside text-sm text-violet-700 space-y-2 ml-4">
                    <li><strong>Independent Storage:</strong> Separate from main databases</li>
                    <li><strong>CSV Import:</strong> Quick bulk data upload</li>
                    <li><strong>Offline Mode:</strong> Works with localStorage when backend unavailable</li>
                    <li><strong>Custom Fields:</strong> Flexible schema for various use cases</li>
                    <li><strong>Archive Support:</strong> Move completed records to archive</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="csv-import">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-green-600" />
                  CSV Import Process
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 ml-7">
                <div className="space-y-4">
                  <h4 className="font-semibold">Step-by-Step Import Guide</h4>
                  <ol className="list-decimal list-inside space-y-3 ml-4 text-gray-700">
                    <li>
                      <strong>Prepare Your CSV File</strong>
                      <div className="bg-gray-50 border border-gray-200 rounded p-3 mt-2 text-sm">
                        <p className="mb-2">Required columns:</p>
                        <code className="text-xs block bg-gray-800 text-green-400 p-2 rounded">
                          phoneNumber, name, email, category, status, notes
                        </code>
                        <p className="mt-2 text-gray-600">Phone format: +234 XXX XXX XXXX</p>
                      </div>
                    </li>
                    <li>Navigate to <strong>Admin Settings → Special Database Manager</strong></li>
                    <li>Click <strong>"Import CSV"</strong> button</li>
                    <li>Select your prepared CSV file</li>
                    <li>Review preview of imported data</li>
                    <li>Click <strong>"Confirm Import"</strong></li>
                    <li>Wait for success confirmation</li>
                  </ol>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-semibold text-yellow-900 mb-2">Import Best Practices</h5>
                    <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1 ml-4">
                      <li>Remove duplicate phone numbers before import</li>
                      <li>Validate phone number format</li>
                      <li>Keep file size under 10MB for best performance</li>
                      <li>Use UTF-8 encoding for special characters</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="offline-mode">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <WifiOff className="h-5 w-5 text-orange-600" />
                  Offline Mode Operation
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 ml-7">
                <Alert className="bg-blue-50 border-blue-200">
                  <Wifi className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    Special Database automatically falls back to localStorage when backend is unavailable
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <p className="text-gray-700">
                    When working offline, all Special Database operations are stored locally in your browser. 
                    Data syncs automatically when backend connection is restored.
                  </p>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h5 className="font-semibold text-orange-900 mb-2">Offline Capabilities</h5>
                    <ul className="list-disc list-inside text-sm text-orange-700 space-y-1 ml-4">
                      <li>View all imported numbers</li>
                      <li>Update contact status</li>
                      <li>Add notes and comments</li>
                      <li>Make calls (3CX must be online)</li>
                      <li>Send emails (requires connection)</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h5 className="font-semibold text-red-900 mb-2">Offline Limitations</h5>
                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1 ml-4">
                      <li>Cannot import new CSV files</li>
                      <li>No real-time sync with other users</li>
                      <li>Changes not visible to team until online</li>
                      <li>Limited to browser localStorage capacity</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

function RolesPermissionsContent() {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-600" />
            Roles & Permissions System
          </CardTitle>
          <CardDescription>
            Enterprise-grade security with role-based access control and audit trails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-red-600" />
              <h4 className="font-semibold text-red-900">Enterprise Security</h4>
            </div>
            <p className="text-sm text-red-700">
              Role-based permissions with complete audit trail and logging ensure data security and accountability across your organization.
            </p>
          </div>

          <Accordion type="multiple" className="w-full">
            
            <AccordionItem value="permission-matrix">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Permission Matrix
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 ml-7">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">Feature/Action</th>
                        <th className="border border-gray-300 px-4 py-2 text-center bg-red-50">Admin</th>
                        <th className="border border-gray-300 px-4 py-2 text-center bg-blue-50">Manager</th>
                        <th className="border border-gray-300 px-4 py-2 text-center bg-green-50">Agent</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Create/Delete Users</td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-red-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-blue-50"><XCircle className="h-4 w-4 text-red-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-green-50"><XCircle className="h-4 w-4 text-red-600 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Import Database (CSV)</td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-red-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-blue-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-green-50"><XCircle className="h-4 w-4 text-red-600 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Assign Numbers to Agents</td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-red-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-blue-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-green-50"><XCircle className="h-4 w-4 text-red-600 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">View Team Performance</td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-red-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-blue-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-green-50"><XCircle className="h-4 w-4 text-red-600 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Make Calls</td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-red-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-blue-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-green-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">View Own Call History</td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-red-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-blue-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-green-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">View All Call History</td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-red-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-blue-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-green-50"><XCircle className="h-4 w-4 text-red-600 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Generate Reports</td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-red-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-blue-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-green-50"><XCircle className="h-4 w-4 text-red-600 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Configure 3CX/SMTP</td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-red-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-blue-50"><XCircle className="h-4 w-4 text-red-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-green-50"><XCircle className="h-4 w-4 text-red-600 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Access Archive</td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-red-50"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-blue-50"><XCircle className="h-4 w-4 text-red-600 mx-auto" /></td>
                        <td className="border border-gray-300 px-4 py-2 text-center bg-green-50"><XCircle className="h-4 w-4 text-red-600 mx-auto" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="audit-trail">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Audit Trail & Logging
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 ml-7">
                <p className="text-gray-700">
                  Every action in the system is logged for security and compliance. Administrators can review complete audit trails.
                </p>

                <div className="grid gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900 mb-2">Logged Activities</h5>
                    <ul className="list-disc list-inside text-sm text-blue-700 space-y-1 ml-4">
                      <li>User login/logout with timestamp and IP</li>
                      <li>User creation, modification, deletion</li>
                      <li>Database imports and exports</li>
                      <li>Number assignments to agents</li>
                      <li>Settings changes (3CX, SMTP, etc.)</li>
                      <li>Call activity and outcomes</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-semibold text-green-900 mb-2">Accessing Audit Logs</h5>
                    <ol className="list-decimal list-inside text-sm text-green-700 space-y-1 ml-4">
                      <li>Navigate to <strong>Admin Settings</strong></li>
                      <li>Click <strong>"Login Audit"</strong> tab</li>
                      <li>View complete login history with filters</li>
                      <li>Export logs for compliance reporting</li>
                    </ol>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="custom-permissions">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  Custom Manager Permissions
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 ml-7">
                <Alert className="bg-purple-50 border-purple-200">
                  <Info className="h-4 w-4 text-purple-600" />
                  <AlertDescription>
                    Administrators can customize manager permissions for granular access control
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <p className="text-gray-700">
                    While managers have predefined permissions, admins can grant or revoke specific capabilities on a per-manager basis.
                  </p>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-3">Customizable Permissions</h5>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-4">
                      <li>View team performance metrics</li>
                      <li>Access agent monitoring tools</li>
                      <li>Manage database assignments</li>
                      <li>Generate and export reports</li>
                      <li>View audit logs</li>
                      <li>Manage call scripts</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

// Placeholder components for remaining sections (to be filled with detailed content)
function CRMContent() {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          Prospective Client (CRM)
        </CardTitle>
        <CardDescription>Managing your daily call list and prospective clients</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">
          The CRM module helps you manage prospective clients through your daily call assignments. 
          Make calls, send emails, log notes, and track your progress toward daily targets.
        </p>
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>Quick Tip:</strong> Check your assigned numbers daily in the main CRM tab. These are pulled from the centralized database by your manager.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function PromoSalesContent() {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-purple-600" />
          Promo Sales
        </CardTitle>
        <CardDescription>Managing promotional campaigns for adventure.btmtravel.net</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">
          The Promo Sales module allows you to manage promotional offers and campaigns targeted at existing customers and prospects.
        </p>
      </CardContent>
    </Card>
  );
}

function CustomerServiceContent() {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          <Headphones className="h-8 w-8 text-green-600" />
          Customer Service
        </CardTitle>
        <CardDescription>Handling existing customer inquiries and support</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">
          The Customer Service module is designed for managing existing customer relationships, handling support inquiries, and managing bookings.
        </p>
      </CardContent>
    </Card>
  );
}

function PhoneSystemContent() {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          <Phone className="h-8 w-8 text-teal-600" />
          3CX Phone System Integration
        </CardTitle>
        <CardDescription>Making calls with click-to-call functionality</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">
          BTMTravel CRM integrates seamlessly with 3CX phone system for click-to-call functionality and automatic call logging.
        </p>
      </CardContent>
    </Card>
  );
}

function ManagerPortalContent() {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-indigo-600" />
          Manager Portal
        </CardTitle>
        <CardDescription>Team monitoring and performance management</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">
          The Manager Portal provides real-time insights into team performance, agent activity tracking, and assignment management tools.
        </p>
      </CardContent>
    </Card>
  );
}

function ReportsContent() {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-pink-600" />
          Reports & Analytics
        </CardTitle>
        <CardDescription>Generating insights and performance reports</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">
          Generate comprehensive reports in PDF and PowerPoint format for team performance, individual metrics, and call analytics.
        </p>
      </CardContent>
    </Card>
  );
}

function TroubleshootingContent() {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          <AlertCircle className="h-8 w-8 text-rose-600" />
          Troubleshooting Guide
        </CardTitle>
        <CardDescription>Common issues and solutions</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="backend-not-running">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-red-600" />
                Backend Server Not Running
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 ml-7">
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  Error: "Cannot connect to backend server" or "Backend server not responding"
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <h5 className="font-semibold">Solution:</h5>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 ml-4">
                  <li>Double-click <code className="bg-red-100 px-2 py-1 rounded">🔴-START-BACKEND-FIXED.bat</code> (Windows)</li>
                  <li>Or run <code className="bg-gray-200 px-2 py-1 rounded">./🔴-START-BACKEND-FIXED.sh</code> (Mac/Linux)</li>
                  <li>Wait for "✅ MongoDB connected successfully"</li>
                  <li>Refresh the web application</li>
                </ol>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="mongodb-connection">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-orange-600" />
                MongoDB Connection Issues
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 ml-7">
              <Alert className="bg-orange-50 border-orange-200">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription>
                  Error: "MongoDB connection failed" or "Database not ready"
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <h5 className="font-semibold">Solutions:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                  <li>Check your internet connection</li>
                  <li>Wait 30-45 seconds for MongoDB to connect</li>
                  <li>Verify MongoDB Atlas cluster is running</li>
                  <li>Check firewall settings (allow MongoDB ports)</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="login-failed">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-yellow-600" />
                Login Failed / Invalid Credentials
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 ml-7">
              <div className="space-y-2">
                <h5 className="font-semibold">Common Causes:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                  <li>Incorrect username or password</li>
                  <li>Account not yet verified (for new agent registrations)</li>
                  <li>Backend server offline</li>
                  <li>User account disabled by admin</li>
                </ul>
                <h5 className="font-semibold mt-3">Solutions:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                  <li>Check your email for verification link (new users)</li>
                  <li>Verify backend server is running</li>
                  <li>Contact administrator to verify account status</li>
                  <li>Try password reset (contact admin)</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

function FAQContent() {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-amber-600" />
          Frequently Asked Questions
        </CardTitle>
        <CardDescription>Quick answers to common questions</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="faq-1">
            <AccordionTrigger className="font-semibold">
              How do I get my daily call assignments?
            </AccordionTrigger>
            <AccordionContent className="ml-7 text-gray-700">
              Your manager assigns numbers to you daily from the centralized database. Check the "Prospective Client" or "Customer Service" 
              tabs to see your assigned numbers. You'll receive a notification when new numbers are assigned.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2">
            <AccordionTrigger className="font-semibold">
              Can I add my own numbers to the system?
            </AccordionTrigger>
            <AccordionContent className="ml-7 text-gray-700">
              No, agents cannot add numbers to the main database. All numbers must be imported by managers or admins to maintain data quality. 
              However, you can use the Special Database for temporary or project-specific numbers (if you have permission).
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3">
            <AccordionTrigger className="font-semibold">
              What happens if I don't verify my email after registration?
            </AccordionTrigger>
            <AccordionContent className="ml-7 text-gray-700">
              You will not be able to log in until your email is verified. Check your email inbox (and spam folder) for the verification link. 
              If you didn't receive it, contact your administrator to resend the verification email.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-4">
            <AccordionTrigger className="font-semibold">
              How is my daily call target determined?
            </AccordionTrigger>
            <AccordionContent className="ml-7 text-gray-700">
              The default target is 30 calls per day, but administrators can set custom targets for individual users or adjust the global target. 
              Check with your manager if you have questions about your specific target.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-5">
            <AccordionTrigger className="font-semibold">
              Can I work offline?
            </AccordionTrigger>
            <AccordionContent className="ml-7 text-gray-700">
              Limited offline functionality is available for the Special Database only. The main CRM system requires backend connection for real-time 
              data sync. Call features require 3CX to be online.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-6">
            <AccordionTrigger className="font-semibold">
              Who can see my call history and notes?
            </AccordionTrigger>
            <AccordionContent className="ml-7 text-gray-700">
              Agents can only see their own call history. Managers can see call history for all agents in their team. 
              Administrators have access to all call records system-wide for reporting and compliance purposes.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
