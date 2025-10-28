import { useState, useEffect, useCallback } from 'react';
import { backendService } from '../utils/backendService';
import { toast } from 'sonner@2.0.3';

interface NumberClaim {
  claimedBy: string;
  claimedByName: string;
  claimedAt: number;
  expiresAt: number;
  contactId?: string;
  type?: string;
}

interface NumberClaims {
  [phoneNumber: string]: NumberClaim;
}

export function useNumberClaims(userId: string, userName: string) {
  const [claims, setClaims] = useState<NumberClaims>({});
  const [loading, setLoading] = useState(true);

  // Fetch all current claims
  const fetchClaims = useCallback(async () => {
    try {
      const data = await backendService.getNumberClaims();
      if (data.success) {
        setClaims(data.claims || {});
      }
    } catch (error) {
      // Silently fail if server is offline
      if (!(error instanceof TypeError && error.message.includes('fetch'))) {
        console.error('Error fetching number claims:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Claim a number
  const claimNumber = useCallback(async (phoneNumber: string, contactId?: string, type?: string) => {
    try {
      const data = await backendService.claimNumber(phoneNumber, userId, userName, contactId, type);

      if (!data.success) {
        if (data.claimed) {
          toast.error(`Number already being called by ${data.claimedBy}`);
          return false;
        }
        throw new Error(data.error || 'Failed to claim number');
      }

      // Update local state
      await fetchClaims();
      return true;
    } catch (error) {
      console.error('Error claiming number:', error);
      toast.error('Failed to claim number');
      return false;
    }
  }, [userId, userName, fetchClaims]);

  // Release a number
  const releaseNumber = useCallback(async (phoneNumber: string) => {
    try {
      const data = await backendService.releaseNumber(phoneNumber, userId);
      
      if (data.success) {
        // Update local state
        await fetchClaims();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error releasing number:', error);
      return false;
    }
  }, [userId, fetchClaims]);

  // Check if a number is claimed
  const isNumberClaimed = useCallback((phoneNumber: string) => {
    const claim = claims[phoneNumber];
    if (!claim) return false;

    const now = Date.now();
    return now < claim.expiresAt;
  }, [claims]);

  // Check if current user has claimed a number
  const isClaimedByMe = useCallback((phoneNumber: string) => {
    const claim = claims[phoneNumber];
    if (!claim) return false;

    const now = Date.now();
    return claim.claimedBy === userId && now < claim.expiresAt;
  }, [claims, userId]);

  // Get who claimed a number
  const getClaimInfo = useCallback((phoneNumber: string) => {
    return claims[phoneNumber] || null;
  }, [claims]);

  // Extend a claim
  const extendClaim = useCallback(async (phoneNumber: string) => {
    try {
      const data = await backendService.extendNumberClaim(phoneNumber, userId);
      
      if (data.success) {
        await fetchClaims();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error extending claim:', error);
      return false;
    }
  }, [userId, fetchClaims]);

  // Auto-refresh claims every 30 seconds
  useEffect(() => {
    fetchClaims();
    const interval = setInterval(fetchClaims, 30000);
    return () => clearInterval(interval);
  }, [fetchClaims]);

  return {
    claims,
    loading,
    claimNumber,
    releaseNumber,
    isNumberClaimed,
    isClaimedByMe,
    getClaimInfo,
    extendClaim,
    refreshClaims: fetchClaims
  };
}
