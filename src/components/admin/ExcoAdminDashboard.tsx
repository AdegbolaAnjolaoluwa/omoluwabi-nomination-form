import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Users, Vote, TrendingUp, AlertCircle } from "lucide-react";

// Local interfaces for the 2025 tables
interface Nomination2025 {
  id: string;
  voter_name: string;
  president: string;
  tournament_director: string;
  hon_legal_adviser: string;
  secretary: string;
  hon_social_secretary: string;
  submitted_at: string;
}

interface VoterSubmission2025 {
  id: string;
  voter_name: string;
  submitted_at: string;
}

interface EligibleVoter2025 {
  id: string;
  full_name: string;
  member_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NominationStats {
  position: string;
  nominee_name: string;
  nomination_count: number;
}

interface ExcoAdminDashboardProps {
  isSuperAdmin: boolean;
}

const ExcoAdminDashboard = ({ isSuperAdmin }: ExcoAdminDashboardProps) => {
  const [nominations, setNominations] = useState<Nomination2025[]>([]);
  const [stats, setStats] = useState<NominationStats[]>([]);
  const [voterSubmissions, setVoterSubmissions] = useState<VoterSubmission2025[]>([]);
  const [eligibleVoters, setEligibleVoters] = useState<EligibleVoter2025[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const positions = [
    "President",
    "Tournament Director", 
    "Hon. Legal Adviser",
    "Secretary",
    "Hon. Social Secretary"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching EXCO dashboard data...');
      
      // Fetch nominations with detailed logging
      console.log('Fetching nominations from nominations_2025 table...');
      const { data: nominationsData, error: nominationsError, count: nominationsCount } = await supabase
        .from('nominations_2025')
        .select('*', { count: 'exact' })
        .order('submitted_at', { ascending: false });

      console.log('Nominations query result:', { 
        data: nominationsData, 
        error: nominationsError, 
        count: nominationsCount 
      });

      if (nominationsError) {
        console.error('Error fetching nominations:', nominationsError);
        setError(`Failed to fetch nominations: ${nominationsError.message}`);
        toast({
          title: "Database Error",
          description: `Failed to fetch nominations: ${nominationsError.message}`,
          variant: "destructive",
        });
        throw nominationsError;
      }

      // Fetch voter submissions with detailed logging
      console.log('Fetching voter submissions from voter_submissions_2025 table...');
      const { data: submissionsData, error: submissionsError, count: submissionsCount } = await supabase
        .from('voter_submissions_2025')
        .select('*', { count: 'exact' })
        .order('submitted_at', { ascending: false });

      console.log('Submissions query result:', { 
        data: submissionsData, 
        error: submissionsError, 
        count: submissionsCount 
      });

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
        setError(`Failed to fetch submissions: ${submissionsError.message}`);
        toast({
          title: "Database Error",
          description: `Failed to fetch submissions: ${submissionsError.message}`,
          variant: "destructive",
        });
        throw submissionsError;
      }

      // Fetch eligible voters with detailed logging
      console.log('Fetching eligible voters from eligible_voters_2025 table...');
      const { data: votersData, error: votersError, count: votersCount } = await supabase
        .from('eligible_voters_2025')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('full_name');

      console.log('Voters query result:', { 
        data: votersData, 
        error: votersError, 
        count: votersCount 
      });

      if (votersError) {
        console.error('Error fetching eligible voters:', votersError);
        setError(`Failed to fetch eligible voters: ${votersError.message}`);
        throw votersError;
      }

      // Set the data
      setNominations(nominationsData || []);
      setVoterSubmissions(submissionsData || []);
      setEligibleVoters(votersData || []);

      console.log('Final data set:', {
        nominations: nominationsData?.length || 0,
        submissions: submissionsData?.length || 0,
        voters: votersData?.length || 0
      });

      // Calculate statistics if we have nominations
      if (nominationsData && nominationsData.length > 0) {
        console.log('Calculating nomination statistics...');
        calculateStats(nominationsData);
      } else {
        console.log('No nominations found, setting empty stats');
        setStats([]);
      }

      toast({
        title: "Data Loaded Successfully",
        description: `Found ${nominationsData?.length || 0} nominations and ${submissionsData?.length || 0} submissions`,
      });

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(`Failed to load dashboard data: ${error.message}`);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try refreshing.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (nominationsData: Nomination2025[]) => {
    console.log('Starting stats calculation for', nominationsData.length, 'nominations');
    const positionStats: { [key: string]: { [nominee: string]: number } } = {};
    
    nominationsData.forEach((nomination, index) => {
      console.log(`Processing nomination ${index + 1}:`, nomination);
      positions.forEach(position => {
        const positionKey = position.toLowerCase().replace(/[.\s]/g, '_');
        let nominee = '';
        
        switch (positionKey) {
          case 'president':
            nominee = nomination.president;
            break;
          case 'tournament_director':
            nominee = nomination.tournament_director;
            break;
          case 'hon_legal_adviser':
            nominee = nomination.hon_legal_adviser;
            break;
          case 'secretary':
            nominee = nomination.secretary;
            break;
          case 'hon_social_secretary':
            nominee = nomination.hon_social_secretary;
            break;
        }
        
        if (nominee && nominee.trim()) {
          if (!positionStats[position]) {
            positionStats[position] = {};
          }
          
          if (!positionStats[position][nominee]) {
            positionStats[position][nominee] = 0;
          }
          
          positionStats[position][nominee]++;
          console.log(`Added vote for ${nominee} in ${position}, total: ${positionStats[position][nominee]}`);
        }
      });
    });

    // Convert to array format for display
    const statsArray: NominationStats[] = [];
    Object.entries(positionStats).forEach(([position, nominees]) => {
      Object.entries(nominees).forEach(([nominee, count]) => {
        statsArray.push({
          position,
          nominee_name: nominee,
          nomination_count: count
        });
      });
    });

    console.log('Final stats calculated:', statsArray);
    setStats(statsArray);
  };

  const getFilteredStats = () => {
    if (selectedPosition === "all") {
      return stats;
    }
    return stats.filter(stat => stat.position === selectedPosition);
  };

  const exportToCSV = () => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only Super Admin can export data.",
        variant: "destructive",
      });
      return;
    }

    if (nominations.length === 0) {
      toast({
        title: "No Data",
        description: "No nominations available to export.",
        variant: "destructive",
      });
      return;
    }

    const csvData = nominations.map(nomination => ({
      "Voter Name": nomination.voter_name,
      "President": nomination.president,
      "Tournament Director": nomination.tournament_director,
      "Hon. Legal Adviser": nomination.hon_legal_adviser,
      "Secretary": nomination.secretary,
      "Hon. Social Secretary": nomination.hon_social_secretary,
      "Submitted At": new Date(nomination.submitted_at).toLocaleString()
    }));

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exco_nominations_2025_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Nominations data has been exported to CSV.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Error Loading Data</h3>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button onClick={fetchData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const filteredStats = getFilteredStats();
  const participationRate = eligibleVoters.length > 0 
    ? Math.round((voterSubmissions.length / eligibleVoters.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Debug Info Card */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium">Nominations in DB:</p>
              <p className="text-lg font-bold">{nominations.length}</p>
            </div>
            <div>
              <p className="font-medium">Submissions in DB:</p>
              <p className="text-lg font-bold">{voterSubmissions.length}</p>
            </div>
            <div>
              <p className="font-medium">Eligible Voters:</p>
              <p className="text-lg font-bold">{eligibleVoters.length}</p>
            </div>
            <div>
              <p className="font-medium">Calculated Stats:</p>
              <p className="text-lg font-bold">{stats.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Eligible Voters</p>
                <p className="text-2xl font-bold">{eligibleVoters.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Vote className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Votes Submitted</p>
                <p className="text-2xl font-bold">{voterSubmissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Participation Rate</p>
                <p className="text-2xl font-bold">{participationRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Nominations</p>
                <p className="text-2xl font-bold">{nominations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Nomination Statistics</span>
            <div className="flex space-x-2">
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isSuperAdmin && (
                <Button onClick={exportToCSV} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStats.length > 0 ? (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="nominee_name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="nomination_count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No nomination data available</p>
              {nominations.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No nominations have been submitted yet.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Position</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Nominee</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Votes</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {filteredStats.length > 0 ? (
                  filteredStats
                    .sort((a, b) => {
                      if (a.position !== b.position) {
                        return a.position.localeCompare(b.position);
                      }
                      return b.nomination_count - a.nomination_count;
                    })
                    .map((stat, index) => (
                      <tr key={`${stat.position}-${stat.nominee_name}-${index}`} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {stat.position}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {stat.nominee_name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {stat.nomination_count}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {voterSubmissions.length > 0 
                            ? Math.round((stat.nomination_count / voterSubmissions.length) * 100)
                            : 0}%
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-muted-foreground">
                      No voting results available yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExcoAdminDashboard;
