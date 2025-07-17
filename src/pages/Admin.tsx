
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthForm from "@/components/auth/AuthForm";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Admin = () => {
  const { user, loading, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setCheckingAdmin(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIsAdmin(!!data);
    } catch (error: any) {
      console.error('Error checking admin status:', error);
      toast({
        title: "Error",
        description: "Failed to verify admin status",
        variant: "destructive",
      });
    } finally {
      setCheckingAdmin(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsAdmin(false);
  };

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Access
            </h1>
            <p className="text-lg text-muted-foreground">
              Sign in to access the admin dashboard
            </p>
          </div>
          <AuthForm onSuccess={checkAdminStatus} />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            You don't have admin privileges to access this page.
          </p>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-4">
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
        <AdminDashboard />
      </div>
    </div>
  );
};

export default Admin;
