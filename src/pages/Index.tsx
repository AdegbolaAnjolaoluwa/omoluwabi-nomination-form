
import NominationForm from "@/components/NominationForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-end mb-4">
          <Link to="/admin">
            <Button variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Admin Access
            </Button>
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Omoluwabi Golfers Club
          </h1>
          <p className="text-lg text-muted-foreground">
            Election Nomination Form
          </p>
        </div>
        <NominationForm />
      </div>
    </div>
  );
};

export default Index;
