
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Trophy, 
  Users, 
  FileText, 
  TrendingUp, 
  Crown,
  AlertTriangle,
  CheckCircle,
  X
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Candidate {
  id: string;
  canonical_name: string;
  position: string;
  vote_count: number;
  created_at: string;
}

interface Nomination {
  id: string;
  nominee_name: string;
  nominator_name: string;
  position: string;
  statement_of_purpose: string;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalNominations: 0,
    totalCandidates: 0,
    positionStats: {} as Record<string, number>
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .order('vote_count', { ascending: false });

      if (candidatesError) throw candidatesError;

      // Fetch nominations
      const { data: nominationsData, error: nominationsError } = await supabase
        .from('nominations')
        .select('*')
        .order('created_at', { ascending: false });

      if (nominationsError) throw nominationsError;

      setCandidates(candidatesData || []);
      setNominations(nominationsData || []);

      // Calculate stats
      const positionStats: Record<string, number> = {};
      nominationsData?.forEach(nom => {
        positionStats[nom.position] = (positionStats[nom.position] || 0) + 1;
      });

      setStats({
        totalNominations: nominationsData?.length || 0,
        totalCandidates: candidatesData?.length || 0,
        positionStats
      });

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTopCandidatesByPosition = () => {
    const positions = ['President', 'Secretary', 'Financial Secretary', 'Public Relations Officer'];
    const topByPosition: Record<string, Candidate | null> = {};
    
    positions.forEach(position => {
      const positionCandidates = candidates.filter(c => c.position === position);
      topByPosition[position] = positionCandidates.length > 0 
        ? positionCandidates.reduce((prev, current) => 
            (prev.vote_count > current.vote_count) ? prev : current
          )
        : null;
    });
    
    return topByPosition;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const topCandidates = getTopCandidatesByPosition();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Omoluwabi Golfers Club Election Management</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nominations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNominations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular Position</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(stats.positionStats).length > 0 
                ? Object.entries(stats.positionStats).reduce((a, b) => a[1] > b[1] ? a : b)[0]
                : 'None'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {Object.entries(stats.positionStats).length > 0 
                ? `${Object.entries(stats.positionStats).reduce((a, b) => a[1] > b[1] ? a : b)[1]} nominations`
                : ''
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes Cast</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.reduce((sum, candidate) => sum + candidate.vote_count, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Leaders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Current Leaders by Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(topCandidates).map(([position, candidate]) => (
              <div key={position} className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{position}</h3>
                {candidate ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{candidate.canonical_name}</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {candidate.vote_count} votes
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Leading since {formatDate(candidate.created_at)}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No candidates yet</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tables */}
      <Tabs defaultValue="candidates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="candidates">All Candidates</TabsTrigger>
          <TabsTrigger value="nominations">All Nominations</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Vote Count</TableHead>
                    <TableHead>First Nominated</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">{candidate.canonical_name}</TableCell>
                      <TableCell>{candidate.position}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {candidate.vote_count}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(candidate.created_at)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="default" 
                          className={candidate.vote_count > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {candidate.vote_count > 0 ? "Active" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nominations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Nominations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nominee</TableHead>
                    <TableHead>Nominator</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nominations.map((nomination) => (
                    <TableRow key={nomination.id}>
                      <TableCell className="font-medium">{nomination.nominee_name}</TableCell>
                      <TableCell>{nomination.nominator_name}</TableCell>
                      <TableCell>{nomination.position}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={nomination.status === 'active' ? 'default' : 'secondary'}
                          className={
                            nomination.status === 'active' 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {nomination.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(nomination.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
