
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const NominationForm = () => {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">
          Legacy Nomination Form
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            This form has been replaced by the new 2025 EXCO Nomination Form. 
            Please use the main form on the homepage for the current election.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default NominationForm;
