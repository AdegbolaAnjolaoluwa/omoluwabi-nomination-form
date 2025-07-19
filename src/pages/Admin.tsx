
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import AdminAuth from "@/components/auth/AdminAuth";
import ExcoAdminDashboard from "@/components/admin/ExcoAdminDashboard";

const Admin = () => {
  const [adminData, setAdminData] = useState<{ name: string; isSuperAdmin: boolean } | null>(null);

  const handleSignOut = () => {
    setAdminData(null);
  };

  if (!adminData) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Access
            </h1>
            <p className="text-lg text-muted-foreground">
              2025 EXCO Election Administration
            </p>
          </div>
          <AdminAuth onSuccess={setAdminData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome, {adminData.name}
            </h1>
            <p className="text-muted-foreground">
              {adminData.isSuperAdmin ? "Super Administrator" : "Administrator"}
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
        <ExcoAdminDashboard isSuperAdmin={adminData.isSuperAdmin} />
      </div>
    </div>
  );
};

export default Admin;
