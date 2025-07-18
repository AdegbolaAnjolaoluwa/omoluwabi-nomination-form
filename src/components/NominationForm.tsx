import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NominationData, NominationResponse } from "@/types/nomination";

const NominationForm = () => {
  const [formData, setFormData] = useState<NominationData>({
    nomineeName: "",
    nominatorName: "",
    position: "",
    statementOfPurpose: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [similarNameSuggestion, setSimilarNameSuggestion] = useState<any>(null);
  const { toast } = useToast();

  const positions = [
    "President",
    "Secretary", 
    "Financial Secretary",
    "Public Relations Officer"
  ];

  const handleInputChange = (field: keyof NominationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear suggestions when nominee name changes
    if (field === 'nomineeName') {
      setSimilarNameSuggestion(null);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.nomineeName.trim()) {
      toast({
        title: "Validation Error",
        description: "Nominee's Full Name is required.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.nominatorName.trim()) {
      toast({
        title: "Validation Error",
        description: "Your Name (Nominator) is required.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.position) {
      toast({
        title: "Validation Error", 
        description: "Please select a position.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.statementOfPurpose.trim()) {
      toast({
        title: "Validation Error",
        description: "Statement of Purpose is required.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.statementOfPurpose.length > 300) {
      toast({
        title: "Validation Error",
        description: "Statement of Purpose must be 300 characters or less.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const submitNomination = async (data: NominationData): Promise<NominationResponse> => {
    const { data: result, error } = await supabase.rpc('process_nomination', {
      nominee_name_input: data.nomineeName,
      nominator_name_input: data.nominatorName,
      position_input: data.position,
      statement_input: data.statementOfPurpose
    });

    if (error) {
      console.error('Nomination submission error:', error);
      throw error;
    }

    return result as unknown as NominationResponse;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitNomination(formData);
      console.log('Nomination result:', result);

      if (result.success) {
        if (result.action === 'similar_found') {
          setSimilarNameSuggestion(result.suggestions?.[0]);
          toast({
            title: "Similar Name Found",
            description: "We found a similar name. Please review the suggestion below.",
          });
        } else {
          const actionMessages = {
            'vote_added': `Vote added for ${result.canonical_name}!`,
            'new_candidate': `New candidate ${result.canonical_name} created!`
          };

          toast({
            title: "Nomination Submitted!",
            description: actionMessages[result.action] || "Your nomination has been successfully submitted.",
          });

          // Reset form
          setFormData({
            nomineeName: "",
            nominatorName: "",
            position: "",
            statementOfPurpose: "",
          });
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your nomination. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const acceptSuggestion = () => {
    if (similarNameSuggestion) {
      setFormData(prev => ({
        ...prev,
        nomineeName: similarNameSuggestion.canonical_name
      }));
      setSimilarNameSuggestion(null);
      toast({
        title: "Name Updated",
        description: "The nominee name has been updated to match the existing candidate.",
      });
    }
  };

  const rejectSuggestion = () => {
    setSimilarNameSuggestion(null);
    toast({
      title: "Suggestion Rejected",
      description: "Your original nomination will be processed as a new candidate.",
    });
  };

  const characterCount = formData.statementOfPurpose.length;
  const characterLimit = 300;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">
          Election Nomination Form
        </CardTitle>
        <p className="text-muted-foreground">
          Nominate a member for club leadership positions
        </p>
      </CardHeader>
      
      <CardContent>
        {similarNameSuggestion && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="text-sm text-orange-800">
                  We found a similar name: <strong>{similarNameSuggestion.canonical_name}</strong>
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={acceptSuggestion} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Use This Name
                  </Button>
                  <Button size="sm" variant="outline" onClick={rejectSuggestion}>
                    Keep Original
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nominee's Full Name */}
          <div className="space-y-2">
            <Label htmlFor="nomineeName" className="text-sm font-medium">
              Nominee's Full Name *
            </Label>
            <Input
              id="nomineeName"
              type="text"
              value={formData.nomineeName}
              onChange={(e) => handleInputChange("nomineeName", e.target.value)}
              placeholder="Enter the nominee's full name"
              className="w-full"
              required
            />
          </div>

          {/* Nominator's Name */}
          <div className="space-y-2">
            <Label htmlFor="nominatorName" className="text-sm font-medium">
              Your Name (Nominator) *
            </Label>
            <Input
              id="nominatorName"
              type="text"
              value={formData.nominatorName}
              onChange={(e) => handleInputChange("nominatorName", e.target.value)}
              placeholder="Enter your full name"
              className="w-full"
              required
            />
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="position" className="text-sm font-medium">
              Position Applying For *
            </Label>
            <Select
              value={formData.position}
              onValueChange={(value) => handleInputChange("position", value)}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Statement of Purpose */}
          <div className="space-y-2">
            <Label htmlFor="statement" className="text-sm font-medium">
              Statement of Purpose *
            </Label>
            <Textarea
              id="statement"
              value={formData.statementOfPurpose}
              onChange={(e) => handleInputChange("statementOfPurpose", e.target.value)}
              placeholder="Describe why this person would be suitable for this position..."
              className="w-full min-h-[120px] resize-none"
              maxLength={characterLimit}
              required
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Maximum 300 characters</span>
              <span className={`${characterCount > characterLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                {characterCount}/{characterLimit}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-base font-medium"
            >
              {isSubmitting ? "Submitting..." : "Submit Nomination"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NominationForm;
