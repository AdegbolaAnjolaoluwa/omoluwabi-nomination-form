
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EligibleVoter, NominationSubmission } from "@/types/nomination";

const ExcoNominationForm = () => {
  const [eligibleVoters, setEligibleVoters] = useState<EligibleVoter[]>([]);
  const [hasAlreadyVoted, setHasAlreadyVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voterName, setVoterName] = useState("");
  const [nominations, setNominations] = useState<NominationSubmission>({
    voter_name: "",
    president: "",
    tournament_director: "",
    hon_legal_adviser: "",
    secretary: "",
    hon_social_secretary: "",
  });
  const { toast } = useToast();

  const positions = [
    { key: 'president', label: 'President' },
    { key: 'tournament_director', label: 'Tournament Director' },
    { key: 'hon_legal_adviser', label: 'Hon. Legal Adviser' },
    { key: 'secretary', label: 'Secretary' },
    { key: 'hon_social_secretary', label: 'Hon. Social Secretary' },
  ];

  useEffect(() => {
    fetchEligibleVoters();
  }, []);

  const fetchEligibleVoters = async () => {
    try {
      console.log('Fetching eligible voters...');
      const { data, error } = await supabase
        .from('eligible_voters_2025')
        .select('*')
        .eq('is_active', true)
        .order('full_name');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched eligible voters:', data);
      setEligibleVoters(data || []);
    } catch (error: any) {
      console.error('Error fetching eligible voters:', error);
      toast({
        title: "Error",
        description: "Failed to load eligible voters. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfAlreadyVoted = async (voterName: string) => {
    try {
      console.log('Checking if voter already voted:', voterName);
      const { data, error } = await supabase
        .from('voter_submissions_2025')
        .select('id')
        .eq('voter_name', voterName)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking vote status:', error);
        throw error;
      }
      
      const alreadyVoted = !!data;
      console.log('Already voted:', alreadyVoted);
      setHasAlreadyVoted(alreadyVoted);
      return alreadyVoted;
    } catch (error: any) {
      console.error('Error checking vote status:', error);
      return false;
    }
  };

  const handleVoterSelect = async (selectedVoter: string) => {
    console.log('Selected voter:', selectedVoter);
    setVoterName(selectedVoter);
    setNominations(prev => ({ ...prev, voter_name: selectedVoter }));
    
    const alreadyVoted = await checkIfAlreadyVoted(selectedVoter);
    if (alreadyVoted) {
      toast({
        title: "Already Voted",
        description: "This member has already submitted their nominations.",
        variant: "destructive",
      });
    }
  };

  const handleNominationChange = (position: string, nominee: string) => {
    console.log('Nomination change:', position, nominee);
    setNominations(prev => ({
      ...prev,
      [position]: nominee
    }));
  };

  const validateForm = (): boolean => {
    if (!nominations.voter_name) {
      toast({
        title: "Validation Error",
        description: "Please select your name from the list.",
        variant: "destructive",
      });
      return false;
    }

    if (hasAlreadyVoted) {
      toast({
        title: "Validation Error",
        description: "You have already submitted your nominations.",
        variant: "destructive",
      });
      return false;
    }

    for (const position of positions) {
      if (!nominations[position.key as keyof NominationSubmission]) {
        toast({
          title: "Validation Error",
          description: `Please select a nominee for ${position.label}.`,
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      console.log('Submitting nominations:', nominations);
      
      // First, record that this voter has submitted
      const { error: submissionError } = await supabase
        .from('voter_submissions_2025')
        .insert({ voter_name: nominations.voter_name });

      if (submissionError) {
        console.error('Submission error:', submissionError);
        throw submissionError;
      }

      // Then, record the actual nominations
      const { error: nominationError } = await supabase
        .from('nominations_2025')
        .insert(nominations);

      if (nominationError) {
        console.error('Nomination error:', nominationError);
        throw nominationError;
      }

      toast({
        title: "Nominations Submitted!",
        description: "Your nominations for the 2025 EXCO have been successfully recorded.",
      });

      // Reset form
      setNominations({
        voter_name: "",
        president: "",
        tournament_director: "",
        hon_legal_adviser: "",
        secretary: "",
        hon_social_secretary: "",
      });
      setVoterName("");
      setHasAlreadyVoted(false);

    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your nominations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">
          Omoluwabi Golfers Forum
        </CardTitle>
        <p className="text-lg font-semibold text-muted-foreground">
          2025 Executive Council (EXCO) Nomination Form
        </p>
        <p className="text-sm text-muted-foreground">
          Select nominees for each position from the eligible members list
        </p>
      </CardHeader>
      
      <CardContent>
        {hasAlreadyVoted && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              You have already submitted your nominations for the 2025 EXCO elections.
              Each member can only vote once.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Voter Selection */}
          <div className="space-y-2">
            <Label htmlFor="voterName" className="text-sm font-medium">
              Select Your Name *
            </Label>
            <Select
              value={voterName}
              onValueChange={handleVoterSelect}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your name from the eligible voters list" />
              </SelectTrigger>
              <SelectContent>
                {eligibleVoters.map((voter) => (
                  <SelectItem key={voter.id} value={voter.full_name}>
                    {voter.full_name} ({voter.member_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nomination Selections */}
          {positions.map((position) => (
            <div key={position.key} className="space-y-2">
              <Label htmlFor={position.key} className="text-sm font-medium">
                {position.label} *
              </Label>
              <Select
                value={nominations[position.key as keyof NominationSubmission]}
                onValueChange={(value) => handleNominationChange(position.key, value)}
                required
                disabled={!voterName || hasAlreadyVoted}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Select nominee for ${position.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {eligibleVoters.map((voter) => (
                    <SelectItem key={voter.id} value={voter.full_name}>
                      {voter.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !voterName || hasAlreadyVoted}
              className="w-full py-3 text-base font-medium"
            >
              {isSubmitting ? "Submitting Nominations..." : "Submit Nominations"}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>⚠️ You can only submit nominations once. Please review your selections carefully.</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExcoNominationForm;
