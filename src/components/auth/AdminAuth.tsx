
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminAuthProps {
  onSuccess: (adminData: { name: string; isSuperAdmin: boolean }) => void;
}

const AdminAuth = ({ onSuccess }: AdminAuthProps) => {
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const adminUsers = [
    "Anjola Adegbola",
    "Babatunde Oluwafemi Adegbola", 
    "Sunday Oluyemi",
    "Wilson Gbenro Olagbegi"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAdmin || !password) {
      toast({
        title: "Validation Error",
        description: "Please select your name and enter password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // For demo purposes, using a simple password check
      // In production, you'd want proper password hashing
      const validPassword = "admin2025"; // You should change this
      
      if (password !== validPassword) {
        throw new Error("Invalid password");
      }

      // Check if user is super admin
      const isSuperAdmin = selectedAdmin === "Anjola Adegbola";

      toast({
        title: "Login Successful",
        description: `Welcome, ${selectedAdmin}!`,
      });

      onSuccess({ name: selectedAdmin, isSuperAdmin });

    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Admin Access</CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          2025 EXCO Election Administration
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin">Select Your Name</Label>
            <Select value={selectedAdmin} onValueChange={setSelectedAdmin} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your name" />
              </SelectTrigger>
              <SelectContent>
                {adminUsers.map((admin) => (
                  <SelectItem key={admin} value={admin}>
                    {admin}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            <p>Contact Super Admin for password reset</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminAuth;
