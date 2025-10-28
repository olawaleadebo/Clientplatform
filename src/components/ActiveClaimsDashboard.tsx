import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Phone, User, Clock, RefreshCw, Lock, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { backendService } from '../utils/backendService';

interface NumberClaim {
  claimedBy: string;
  claimedByName: string;
  claimedAt: number;
  expiresAt: number;
  contactId?: string;
  type?: string;
}

interface ClaimsData {
  [phoneNumber: string]: NumberClaim;
}

export function ActiveClaimsDashboard() {
  const [claims, setClaims] = useState<ClaimsData>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClaims = async () => {
    try {
      const data = await backendService.getNumberClaims();
      
      if (data.success) {
        setClaims(data.claims || {});
      }
    } catch (error) {
      // Silently fail if server is offline
      if (!(error instanceof TypeError && error.message.includes('fetch'))) {
        console.error('Error fetching claims:', error);
        toast.error('Failed to load active claims');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchClaims();
  };

  useEffect(() => {
    fetchClaims();
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchClaims, 15000);
    return () => clearInterval(interval);
  }, []);

  const getTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const remaining = expiresAt - now;
    
    if (remaining < 0) return 'Expired';
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    if (minutes === 0) return `${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const getTimeSinceClaimed = (claimedAt: number) => {
    const now = Date.now();
    const elapsed = now - claimedAt;
    const minutes = Math.floor(elapsed / 60000);
    
    if (minutes === 0) return 'Just now';
    if (minutes === 1) return '1 min ago';
    return `${minutes} mins ago`;
  };

  const claimEntries = Object.entries(claims);
  const activeClaims = claimEntries.filter(([_, claim]) => Date.now() < claim.expiresAt);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading claims...</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-xl">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Lock className="h-4 w-4 text-purple-600" />
              </div>
              Active Number Claims
            </CardTitle>
            <CardDescription>Real-time view of numbers currently being called by agents</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-white/80">
              {activeClaims.length} Active
            </Badge>
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              size="sm"
              variant="outline"
              className="border-purple-200 hover:bg-purple-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {activeClaims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-4">
              <Phone className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
            <p className="mb-2">No active claims</p>
            <p className="text-sm">Numbers will appear here when agents start calling</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="divide-y divide-border/50">
              {activeClaims.map(([phoneNumber, claim], index) => (
                <div
                  key={phoneNumber}
                  className="p-4 hover:bg-purple-50/30 transition-colors duration-200 animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left side - Number and Agent */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg flex-shrink-0">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono truncate">{phoneNumber}</span>
                            <Badge 
                              variant="secondary" 
                              className="bg-blue-100 text-blue-700 border-blue-200 flex-shrink-0"
                            >
                              {claim.type || 'CRM'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{claim.claimedByName}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Time info */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200">
                        <Clock className="h-3 w-3 text-green-700" />
                        <span className="text-xs text-green-700 font-medium min-w-[60px] text-right">
                          {getTimeRemaining(claim.expiresAt)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Started {getTimeSinceClaimed(claim.claimedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar for time remaining */}
                  <div className="mt-3">
                    <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.max(0, Math.min(100, ((claim.expiresAt - Date.now()) / (30 * 60 * 1000)) * 100))}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
