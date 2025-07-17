
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

interface NominationData {
  nomineeName: string;
  nominatorName: string;
  position: string;
  statementOfPurpose: string;
}

const NominationForm = () => {
  const [formData, setFormData] = useState<NominationData>({
    nomineeName: "",
    nominatorName: "",
    position: "",
    statementOfPurpose: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Placeholder function for Supabase integration
  const submitNomination = async (data: NominationData) => {
    // This function will be implemented when Supabase is connected
    console.log("Nomination data to be submitted:", data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return { success: true };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitNomination(formData);

      if (result.success) {
        toast({
          title: "Nomination Submitted!",
          description: "Your nomination has been successfully submitted.",
        });

        // Reset form
        setFormData({
          nomineeName: "",
          nominatorName: "",
          position: "",
          statementOfPurpose: "",
        });
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
