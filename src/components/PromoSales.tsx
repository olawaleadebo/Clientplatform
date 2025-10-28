import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Progress } from "./ui/progress";
import { TrendingUp, TrendingDown, Tag, Eye, ShoppingCart, RefreshCw, Filter, XCircle, Plane, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { backendService } from '../utils/backendService';
import { toast } from "sonner@2.0.3";

interface Promotion {
  id: string;
  name: string;
  code: string;
  discount: string;
  website: string;
  status: "active" | "scheduled" | "expired";
  startDate: string;
  endDate: string;
  usage: number;
  target: number;
  revenue: number;
  views: number;
  conversions: number;
  targetCustomerTypes?: string[]; // Array of 'Retails', 'Corporate', 'Channel'
  targetFlights?: string[]; // Array of flight names/codes
}

export function PromoSales() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterCustomerTypes, setFilterCustomerTypes] = useState<string[]>([]);
  const [filterFlight, setFilterFlight] = useState('');

  // Fetch promotions from backend with optional filters
  const fetchPromotions = async (showToast = false) => {
    try {
      setIsRefreshing(true);
      
      const data = await backendService.getPromotions();
      
      // Map backend promotions to include default analytics if not present
      const mappedPromotions = (data.promotions || []).map((promo: any) => ({
        ...promo,
        usage: promo.usage || 0,
        target: promo.target || 100,
        revenue: promo.revenue || 0,
        views: promo.views || 0,
        conversions: promo.conversions || 0,
        targetCustomerTypes: promo.targetCustomerTypes || [],
        targetFlights: promo.targetFlights || []
      }));
      
      setPromotions(mappedPromotions);
      
      if (showToast) {
        toast.success(`${mappedPromotions.length} promotions loaded`);
      }
    } catch (error: any) {
      // Silently fail if server is offline
      if (!(error instanceof TypeError && error.message.includes('fetch'))) {
        console.error('[PROMO SALES] Error fetching promotions:', error);
        if (showToast) {
          toast.error(error.message || 'Error refreshing promotions');
        }
      }
      // Set empty array on error
      setPromotions([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchPromotions(false);
  }, [filterCustomerTypes, filterFlight]);

  const activePromos = promotions.filter(p => p.status === "active");
  const totalRevenue = activePromos.reduce((sum, p) => sum + p.revenue, 0);
  const totalConversions = activePromos.reduce((sum, p) => sum + p.conversions, 0);
  const avgConversionRate = activePromos.length > 0 
    ? (activePromos.reduce((sum, p) => sum + (p.conversions / (p.views || 1) * 100), 0) / activePromos.length).toFixed(1)
    : "0.0";

  const handleViewDetails = (promo: Promotion) => {
    setSelectedPromo(promo);
    setIsDialogOpen(true);
  };

  const handleRefresh = () => {
    fetchPromotions(true);
  };

  const toggleCustomerType = (type: string) => {
    setFilterCustomerTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setFilterCustomerTypes([]);
    setFilterFlight('');
    toast.success('Filters cleared');
  };

  const hasActiveFilters = filterCustomerTypes.length > 0 || filterFlight.trim() !== '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Promotional Performance</h2>
          <p className="text-muted-foreground">Track and manage targeted promotional campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowFilters(!showFilters)}
            variant={hasActiveFilters ? "default" : "outline"}
            className={hasActiveFilters 
              ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white" 
              : "bg-white/60 backdrop-blur-xl border-white/20 hover:bg-white/80"
            }
          >
            <Filter className="w-4 h-4 mr-2" />
            {hasActiveFilters ? `Filters (${filterCustomerTypes.length + (filterFlight ? 1 : 0)})` : 'Filters'}
          </Button>
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="bg-white/60 backdrop-blur-xl border-white/20 hover:bg-white/80"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Smart Filtering Panel */}
      {showFilters && (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200/50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-purple-600" />
                  Smart Campaign Targeting
                </CardTitle>
                <CardDescription>Filter promotions by customer type and flight information</CardDescription>
              </div>
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Type Filter */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <Users className="w-4 h-4 text-purple-600" />
                  Customer Type
                </Label>
                <div className="space-y-2 p-4 bg-white/60 backdrop-blur-xl rounded-lg border border-purple-200/30">
                  {['Retails', 'Corporate', 'Channel'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`filter-${type}`}
                        checked={filterCustomerTypes.includes(type)}
                        onCheckedChange={() => toggleCustomerType(type)}
                        className="border-purple-400 data-[state=checked]:bg-purple-600"
                      />
                      <Label
                        htmlFor={`filter-${type}`}
                        className="cursor-pointer hover:text-purple-600 transition-colors"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                  {filterCustomerTypes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <p className="text-xs text-purple-600">
                        Showing promotions for: <strong>{filterCustomerTypes.join(', ')}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Flight Filter */}
              <div className="space-y-3">
                <Label htmlFor="flight-filter" className="flex items-center gap-2 text-base">
                  <Plane className="w-4 h-4 text-purple-600" />
                  Flight / Airplane
                </Label>
                <div className="space-y-2">
                  <Input
                    id="flight-filter"
                    placeholder="Enter flight code or airplane name..."
                    value={filterFlight}
                    onChange={(e) => setFilterFlight(e.target.value)}
                    className="bg-white/60 backdrop-blur-xl border-purple-200/50 focus:border-purple-400"
                  />
                  <p className="text-xs text-muted-foreground">
                    Filter promotions targeting specific flights (e.g., "Boeing 737", "BA100")
                  </p>
                  {filterFlight && (
                    <div className="p-2 bg-purple-50 rounded border border-purple-200">
                      <p className="text-xs text-purple-600">
                        Filtering by flight: <strong>{filterFlight}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <CardHeader className="pb-3 relative">
            <CardDescription className="text-purple-100">Active Promotions</CardDescription>
            <CardTitle className="flex items-center gap-2">
              {activePromos.length}
              <Tag className="w-5 h-5 text-purple-100" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <CardHeader className="pb-3 relative">
            <CardDescription className="text-green-100">Total Revenue</CardDescription>
            <CardTitle className="flex items-center gap-2">
              ${totalRevenue.toLocaleString()}
              <TrendingUp className="w-5 h-5 text-green-100" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <CardHeader className="pb-3 relative">
            <CardDescription className="text-blue-100">Avg. Conversion Rate</CardDescription>
            <CardTitle className="flex items-center gap-2">
              {avgConversionRate}%
              <ShoppingCart className="w-5 h-5 text-blue-100" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl shadow-purple-500/5 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
        <CardHeader>
          <CardTitle>All Promotions</CardTitle>
          <CardDescription>Manage and monitor promotional campaigns with smart targeting</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="text-muted-foreground">Loading promotions...</p>
            </div>
          ) : promotions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Tag className="w-16 h-16 text-muted-foreground/40" />
              <div className="text-center">
                <p className="font-medium text-muted-foreground">No promotions found</p>
                <p className="text-sm text-muted-foreground">Create promotions in Admin Settings to get started</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Promotion</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Targeting</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo) => {
                const progressPercent = (promo.usage / (promo.target || 1)) * 100;
                const conversionRate = promo.views > 0 ? ((promo.conversions / promo.views) * 100).toFixed(1) : "0.0";
                const hasTargeting = (promo.targetCustomerTypes && promo.targetCustomerTypes.length > 0) || 
                                    (promo.targetFlights && promo.targetFlights.length > 0);
                
                return (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <div>
                        <div>{promo.name}</div>
                        <div className="text-sm text-muted-foreground">{promo.discount}</div>
                        <div className="text-xs text-muted-foreground mt-1">{promo.website}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">{promo.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {hasTargeting ? (
                          <>
                            {promo.targetCustomerTypes && promo.targetCustomerTypes.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {promo.targetCustomerTypes.map((type, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                    <Users className="w-3 h-3 mr-1" />
                                    {type}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {promo.targetFlights && promo.targetFlights.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {promo.targetFlights.slice(0, 2).map((flight, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                    <Plane className="w-3 h-3 mr-1" />
                                    {flight}
                                  </Badge>
                                ))}
                                {promo.targetFlights.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{promo.targetFlights.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">All customers</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        promo.status === "active" ? "default" :
                        promo.status === "scheduled" ? "secondary" :
                        "outline"
                      }>
                        {promo.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 min-w-32">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{promo.usage}/{promo.target}</span>
                          <span className="text-sm text-muted-foreground">{progressPercent.toFixed(0)}%</span>
                        </div>
                        <Progress value={progressPercent} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          <span>{promo.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <ShoppingCart className="w-3 h-3" />
                          <span>{conversionRate}%</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(promo)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedPromo && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPromo.name}</DialogTitle>
                <DialogDescription>
                  {selectedPromo.startDate} - {selectedPromo.endDate}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Promo Code</CardDescription>
                    <CardTitle className="font-mono">{selectedPromo.code}</CardTitle>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Discount</CardDescription>
                    <CardTitle>{selectedPromo.discount}</CardTitle>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Website</CardDescription>
                    <CardTitle className="text-base text-muted-foreground">{selectedPromo.website}</CardTitle>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Status</CardDescription>
                    <Badge variant={
                      selectedPromo.status === "active" ? "default" :
                      selectedPromo.status === "scheduled" ? "secondary" :
                      "outline"
                    } className="w-fit">
                      {selectedPromo.status}
                    </Badge>
                  </CardHeader>
                </Card>
              </div>

              <div className="space-y-4 mt-4">
                <h4>Performance Metrics</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Usage</p>
                    <p className="text-lg font-semibold">{selectedPromo.usage} / {selectedPromo.target}</p>
                    <Progress value={(selectedPromo.usage / (selectedPromo.target || 1)) * 100} className="mt-2" />
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue Generated</p>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      ${selectedPromo.revenue.toLocaleString()}
                      {selectedPromo.revenue > 10000 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Page Views</p>
                    <p className="text-lg font-semibold">{selectedPromo.views.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-lg font-semibold">
                      {selectedPromo.views > 0 
                        ? ((selectedPromo.conversions / selectedPromo.views) * 100).toFixed(1)
                        : "0.0"}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Show targeting info if available */}
              {(selectedPromo.targetCustomerTypes && selectedPromo.targetCustomerTypes.length > 0) || 
               (selectedPromo.targetFlights && selectedPromo.targetFlights.length > 0) ? (
                <div className="space-y-3 mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="text-sm font-semibold text-purple-900">Campaign Targeting</h4>
                  {selectedPromo.targetCustomerTypes && selectedPromo.targetCustomerTypes.length > 0 && (
                    <div>
                      <p className="text-xs text-purple-700 mb-1">Customer Types:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedPromo.targetCustomerTypes.map((type, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-purple-100 text-purple-700">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedPromo.targetFlights && selectedPromo.targetFlights.length > 0 && (
                    <div>
                      <p className="text-xs text-purple-700 mb-1">Target Flights:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedPromo.targetFlights.map((flight, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-700">
                            {flight}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
