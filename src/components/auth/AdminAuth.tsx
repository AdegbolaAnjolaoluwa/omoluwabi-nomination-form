
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
  onSuccess: (adminData: { name: string; email: string; isSuperAdmin: boolean }) => void;
}

const AdminAuth = ({ onSuccess }: AdminAuthProps) => {
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const adminUsers = [
    { name: "Anjola Adegbola", email: "anjola@example.com" },
    { name: "Babatunde Oluwafemi Adegbola", email: "babatunde@example.com" }, 
    { name: "Sunday Oluyemi", email: "sunday@example.com" },
    { name: "Wilson Gbenro Olagbegi", email: "wilson@example.com" }
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
      const selectedUser = adminUsers.find(admin => admin.name === selectedAdmin);
      if (!selectedUser) {
        throw new Error("Selected admin not found");
      }

      // Use the Supabase function to authenticate admin
      const { data, error } = await supabase.rpc('authenticate_admin', {
        admin_email: selectedUser.email,
        admin_password: password
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw new Error('Authentication failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Set the admin email in the session for RLS policies
      await supabase.rpc('set_config', {
        setting_name: 'app.current_admin_email',
        setting_value: selectedUser.email,
        is_local: true
      });

      console.log('Admin authenticated successfully:', data.admin);

      toast({
        title: "Login Successful",
        description: `Welcome, ${selectedAdmin}!`,
      });

      onSuccess({ 
        name: selectedAdmin, 
        email: selectedUser.email,
        isSuperAdmin: data.admin.is_super_admin 
      });

    } catch (error: any) {
      console.error('Authentication error:', error);
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
                  <SelectItem key={admin.name} value={admin.name}>
                    {admin.name}
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
