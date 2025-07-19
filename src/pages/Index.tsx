
import ExcoNominationForm from "@/components/ExcoNominationForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Vote } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-4">
          <Link to="/admin">
            <Button variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Admin Access
            </Button>
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Vote className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Omoluwabi Golfers Forum
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-primary mb-2">
            2025 Executive Council Elections
          </h2>
          <p className="text-lg text-muted-foreground">
            Secure Internal Nomination Platform
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Instructions:</strong> Only paid-up members (61 total) can nominate candidates. 
              Each member can submit nominations only once. Select nominees from the dropdown lists for all 5 EXCO positions.
            </p>
          </div>
        </div>
        
        <ExcoNominationForm />
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            This is a secure internal platform for the Omoluwabi Golfers Forum 2025 EXCO elections.
          </p>
          <p className="mt-2">
            For technical support, contact the Super Admin.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
