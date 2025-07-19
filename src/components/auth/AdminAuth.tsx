
import React, { useState, useEffect } from "react";
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

interface AdminUser {
  id: string;
  email: string;
  is_super_admin: boolean;
  full_name: string;
}

const AdminAuth = ({ onSuccess }: AdminAuthProps) => {
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const getFullNameFromEmail = (email: string): string => {
    const nameMap: { [key: string]: string } = {
      'anjola@example.com': 'Anjola Adegbola',
      'babatunde@example.com': 'Babatunde Oluwafemi Adegbola',
      'sunday@example.com': 'Sunday Oluyemi',
      'wilson@example.com': 'Wilson Gbenro Olagbegi'
    };
    return nameMap[email] || 'Unknown Admin';
  };

  const fetchAdminUsers = async () => {
    try {
      setIsLoadingAdmins(true);
      const { data: admins, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('email');

      if (error) {
        console.error('Error fetching admin users:', error);
        toast({
          title: "Database Error",
          description: "Failed to load admin users.",
          variant: "destructive",
        });
        return;
      }

      // Transform the data to include full_name
      const adminUsersWithNames = (admins || []).map(admin => ({
        id: admin.id,
        email: admin.email,
        is_super_admin: admin.is_super_admin,
        full_name: getFullNameFromEmail(admin.email)
      }));

      setAdminUsers(adminUsersWithNames);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({
        title: "Error",
        description: "Failed to load admin users.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAdmins(false);
    }
  };

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
      const selectedUser = adminUsers.find(admin => admin.full_name === selectedAdmin);
      if (!selectedUser) {
        throw new Error("Selected admin not found");
      }

      // Simple password validation
      if (password !== 'admin2025') {
        throw new Error('Invalid credentials');
      }

      console.log('Admin authenticated successfully');

      toast({
        title: "Login Successful",
        description: `Welcome, ${selectedAdmin}!`,
      });

      onSuccess({ 
        name: selectedAdmin, 
        email: selectedUser.email,
        isSuperAdmin: selectedUser.is_super_admin 
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

  if (isLoadingAdmins) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                  <SelectItem key={admin.id} value={admin.full_name}>
                    {admin.full_name}
                    {admin.is_super_admin && (
                      <span className="ml-2 text-xs text-amber-600 font-medium">
                        (Super Admin)
                      </span>
                    )}
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
