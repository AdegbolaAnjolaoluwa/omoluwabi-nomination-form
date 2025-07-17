
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
import { Upload } from "lucide-react";

interface NominationData {
  fullName: string;
  position: string;
  statementOfPurpose: string;
  profilePhoto?: File;
}

const NominationForm = () => {
  const [formData, setFormData] = useState<NominationData>({
    fullName: "",
    position: "",
    statementOfPurpose: "",
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setProfilePhoto(file);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Full Name is required.",
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
    console.log("Profile photo:", profilePhoto);
    
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
      const nominationData = {
        ...formData,
        profilePhoto: profilePhoto || undefined,
      };

      const result = await submitNomination(nominationData);

      if (result.success) {
        toast({
          title: "Nomination Submitted!",
          description: "Your nomination has been successfully submitted.",
        });

        // Reset form
        setFormData({
          fullName: "",
          position: "",
          statementOfPurpose: "",
        });
        setProfilePhoto(null);
        
        // Reset file input
        const fileInput = document.getElementById('profile-photo') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
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

  const characterCount = formData.statementOfPurpose.length;
  const characterLimit = 300;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">
          Election Nomination Form
        </CardTitle>
        <p className="text-muted-foreground">
          Submit your nomination for club leadership positions
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name *
            </Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
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
              placeholder="Describe your vision and goals for this position..."
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

          {/* Profile Photo Upload */}
          <div className="space-y-2">
            <Label htmlFor="profile-photo" className="text-sm font-medium">
              Profile Photo (Optional)
            </Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  id="profile-photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                />
              </div>
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            {profilePhoto && (
              <p className="text-sm text-muted-foreground">
                Selected: {profilePhoto.name}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Accepted formats: JPG, PNG, GIF (Max 5MB)
            </p>
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
