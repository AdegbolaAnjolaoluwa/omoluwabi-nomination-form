
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
    { name: "Anjola Adegbola", email: "anjola@example.com", isSuperAdmin: true },
    { name: "Babatunde Oluwafemi Adegbola", email: "babatunde@example.com", isSuperAdmin: false }, 
    { name: "Sunday Oluyemi", email: "sunday@example.com", isSuperAdmin: false },
    { name: "Wilson Gbenro Olagbegi", email: "wilson@example.com", isSuperAdmin: false }
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

      // Simple password validation
      if (password !== 'admin2025') {
        throw new Error('Invalid credentials');
      }

      // Check if admin exists in database
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', selectedUser.email)
        .single();

      if (adminError && adminError.code !== 'PGRST116') {
        console.error('Database error:', adminError);
        throw new Error('Authentication failed');
      }

      // If admin doesn't exist in database, create them
      if (!adminData) {
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert({
            email: selectedUser.email,
            is_super_admin: selectedUser.isSuperAdmin
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          throw new Error('Failed to create admin record');
        }
      }

      console.log('Admin authenticated successfully');

      toast({
        title: "Login Successful",
        description: `Welcome, ${selectedAdmin}!`,
      });

      onSuccess({ 
        name: selectedAdmin, 
        email: selectedUser.email,
        isSuperAdmin: selectedUser.isSuperAdmin 
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
