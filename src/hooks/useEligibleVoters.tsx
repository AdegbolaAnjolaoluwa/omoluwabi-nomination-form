
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Local interface for the 2025 table since it's not in the generated types
interface EligibleVoter2025 {
  id: string;
  full_name: string;
  member_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UseEligibleVotersReturn {
  eligibleVoters: EligibleVoter2025[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useEligibleVoters = (): UseEligibleVotersReturn => {
  const [eligibleVoters, setEligibleVoters] = useState<EligibleVoter2025[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEligibleVoters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Initializing Supabase client...');
      console.log('Supabase URL:', 'https://aopckpsxjnzlorocwswi.supabase.co');
      console.log('Using public key for authentication');
      
      console.log('Fetching eligible voters from eligible_voters_2025 table...');
      
      // Use type assertion to work with the 2025 table
      const { data, error: fetchError } = (await supabase
        .from('eligible_voters_2025' as any)
        .select('*')
        .eq('is_active', true)
        .order('full_name')) as { data: EligibleVoter2025[] | null; error: any };

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        
        // Handle specific RLS policy errors
        if (fetchError.code === '42501' || fetchError.message?.includes('policy')) {
          const rlsMessage = `Access denied by Row Level Security (RLS) policy. 
          
To fix this, a Supabase admin should add this RLS policy:

CREATE POLICY "Allow authenticated users to view eligible voters" 
  ON public.eligible_voters_2025 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

Current error: ${fetchError.message}`;
          
          console.error('RLS Policy Error:', rlsMessage);
          setError('Access denied. Please contact admin to configure database permissions.');
          
          toast({
            title: "Database Access Error",
            description: "Row Level Security policy is blocking access. Contact your administrator.",
            variant: "destructive",
          });
          
          throw new Error(rlsMessage);
        }
        
        // Handle other database errors
        const errorMessage = `Database error: ${fetchError.message} (Code: ${fetchError.code})`;
        console.error('Database error:', errorMessage);
        setError(errorMessage);
        
        toast({
          title: "Database Error",
          description: "Failed to fetch eligible voters. Please try again or contact support.",
          variant: "destructive",
        });
        
        throw fetchError;
      }
      
      // Check if data is empty or null
      if (!data || data.length === 0) {
        const emptyMessage = 'No eligible voters found in the database. The list may be empty or all voters may be inactive.';
        console.warn('Empty data:', emptyMessage);
        setError(emptyMessage);
        
        toast({
          title: "No Data Found",
          description: "No eligible voters are currently available.",
          variant: "destructive",
        });
        
        setEligibleVoters([]);
        return;
      }
      
      console.log(`Successfully fetched ${data.length} eligible voters:`, data);
      console.log('Sample voter names:', data.slice(0, 3).map(v => v.full_name));
      
      setEligibleVoters(data);
      
      toast({
        title: "Success",
        description: `Loaded ${data.length} eligible voters successfully.`,
      });
      
    } catch (error: any) {
      console.error('Error in fetchEligibleVoters:', error);
      
      if (!error.message?.includes('policy') && !error.message?.includes('RLS')) {
        const genericError = 'Failed to load eligible voters. Please check your internet connection and try again.';
        setError(genericError);
        
        toast({
          title: "Connection Error",
          description: genericError,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEligibleVoters();
  }, []);

  return {
    eligibleVoters,
    isLoading,
    error,
    refetch: fetchEligibleVoters,
  };
};
