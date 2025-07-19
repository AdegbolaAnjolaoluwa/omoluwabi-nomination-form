
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Users, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EligibleVoter {
  id: string;
  full_name: string;
  member_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface VoterManagementProps {
  isSuperAdmin: boolean;
}

const VoterManagement = ({ isSuperAdmin }: VoterManagementProps) => {
  const [voters, setVoters] = useState<EligibleVoter[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newVoterName, setNewVoterName] = useState("");
  const [newMemberId, setNewMemberId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isSuperAdmin) {
      fetchVoters();
    }
  }, [isSuperAdmin]);

  const fetchVoters = async () => {
    try {
      const { data, error } = await supabase
        .from('eligible_voters_2025' as any)
        .select('*')
        .order('full_name') as { data: EligibleVoter[] | null; error: any };

      if (error) throw error;
      setVoters(data || []);
    } catch (error: any) {
      console.error('Error fetching voters:', error);
      toast({
        title: "Error",
        description: "Failed to load voters list.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addVoter = async () => {
    if (!newVoterName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a voter name.",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from('eligible_voters_2025' as any)
        .insert({
          full_name: newVoterName.trim(),
          member_id: newMemberId.trim() || null,
          is_active: true
        } as any);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Voter added successfully.",
      });

      setNewVoterName("");
      setNewMemberId("");
      fetchVoters();
    } catch (error: any) {
      console.error('Error adding voter:', error);
      toast({
        title: "Error",
        description: "Failed to add voter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const toggleVoterStatus = async (voterId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('eligible_voters_2025' as any)
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', voterId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Voter ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });

      fetchVoters();
    } catch (error: any) {
      console.error('Error updating voter status:', error);
      toast({
        title: "Error",
        description: "Failed to update voter status.",
        variant: "destructive",
      });
    }
  };

  const deleteVoter = async (voterId: string) => {
    if (!confirm('Are you sure you want to permanently delete this voter? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('eligible_voters_2025' as any)
        .delete()
        .eq('id', voterId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Voter deleted successfully.",
      });

      fetchVoters();
    } catch (error: any) {
      console.error('Error deleting voter:', error);
      toast({
        title: "Error",
        description: "Failed to delete voter.",
        variant: "destructive",
      });
    }
  };

  if (!isSuperAdmin) {
    return (
      <Alert>
        <AlertDescription>
          Access denied. Only Super Administrators can manage eligible voters.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredVoters = voters.filter(voter =>
    voter.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (voter.member_id && voter.member_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeVoters = voters.filter(v => v.is_active).length;
  const inactiveVoters = voters.filter(v => !v.is_active).length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Voters</p>
                <p className="text-2xl font-bold">{activeVoters}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive Voters</p>
                <p className="text-2xl font-bold">{inactiveVoters}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Voters</p>
                <p className="text-2xl font-bold">{voters.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Voter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Eligible Voter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="voterName">Full Name *</Label>
              <Input
                id="voterName"
                value={newVoterName}
                onChange={(e) => setNewVoterName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="memberId">Member ID</Label>
              <Input
                id="memberId"
                value={newMemberId}
                onChange={(e) => setNewMemberId(e.target.value)}
                placeholder="Enter member ID (optional)"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={addVoter}
                disabled={isAdding}
                className="w-full"
              >
                {isAdding ? "Adding..." : "Add Voter"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voters List */}
      <Card>
        <CardHeader>
          <CardTitle>Eligible Voters Management</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search voters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Member ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVoters.map((voter) => (
                  <TableRow key={voter.id}>
                    <TableCell className="font-medium">{voter.full_name}</TableCell>
                    <TableCell>{voter.member_id || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        voter.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {voter.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(voter.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleVoterStatus(voter.id, voter.is_active)}
                        >
                          {voter.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteVoter(voter.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredVoters.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No voters found matching your search.' : 'No voters found.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoterManagement;
