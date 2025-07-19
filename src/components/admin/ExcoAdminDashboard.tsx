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
import { Download, Users, Vote, TrendingUp, RefreshCw } from "lucide-react";

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

interface TopNominee {
  nominee_name: string;
  total_nominations: number;
}

interface ExcoAdminDashboardProps {
  isSuperAdmin: boolean;
}

const ExcoAdminDashboard = ({ isSuperAdmin }: ExcoAdminDashboardProps) => {
  const [nominations, setNominations] = useState<Nomination2025[]>([]);
  const [stats, setStats] = useState<NominationStats[]>([]);
  const [topNominees, setTopNominees] = useState<TopNominee[]>([]);
  const [voterSubmissions, setVoterSubmissions] = useState<VoterSubmission2025[]>([]);
  const [eligibleVoters, setEligibleVoters] = useState<EligibleVoter2025[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      console.log('Fetching admin dashboard data...');
      setIsLoading(true);
      
      // Fetch nominations with detailed logging
      console.log('Querying nominations_2025 table...');
      const { data: nominationsData, error: nominationsError } = await supabase
        .from('nominations_2025')
        .select('*')
        .order('submitted_at', { ascending: false });

      console.log('Nominations query result:', { 
        data: nominationsData, 
        error: nominationsError,
        count: nominationsData?.length || 0 
      });

      if (nominationsError) {
        console.error('Error fetching nominations:', nominationsError);
        toast({
          title: "Database Error",
          description: `Failed to fetch nominations: ${nominationsError.message}`,
          variant: "destructive",
        });
        throw nominationsError;
      }

      // Fetch voter submissions with detailed logging
      console.log('Querying voter_submissions_2025 table...');
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('voter_submissions_2025')
        .select('*')
        .order('submitted_at', { ascending: false });

      console.log('Submissions query result:', { 
        data: submissionsData, 
        error: submissionsError,
        count: submissionsData?.length || 0 
      });

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
        toast({
          title: "Database Error",
          description: `Failed to fetch submissions: ${submissionsError.message}`,
          variant: "destructive",
        });
        throw submissionsError;
      }

      // Fetch eligible voters
      console.log('Querying eligible_voters_2025 table...');
      const { data: votersData, error: votersError } = await supabase
        .from('eligible_voters_2025')
        .select('*')
        .eq('is_active', true)
        .order('full_name');

      if (votersError) {
        console.error('Error fetching eligible voters:', votersError);
        throw votersError;
      }

      console.log('Final fetched data summary:', {
        nominations: nominationsData?.length || 0,
        submissions: submissionsData?.length || 0,
        voters: votersData?.length || 0
      });

      // Set the data
      setNominations(nominationsData || []);
      setVoterSubmissions(submissionsData || []);
      setEligibleVoters(votersData || []);

      // Calculate statistics if we have nominations
      if (nominationsData && nominationsData.length > 0) {
        console.log('Calculating stats for nominations...');
        calculateStats(nominationsData);
        if (isSuperAdmin) {
          calculateTopNominees(nominationsData);
        }
      } else {
        console.log('No nominations found - resetting stats');
        setStats([]);
        setTopNominees([]);
      }

      // Show success message only if we actually have data
      if (nominationsData?.length || submissionsData?.length) {
        toast({
          title: "Data Loaded",
          description: `Found ${nominationsData?.length || 0} nominations and ${submissionsData?.length || 0} submissions`,
        });
      }

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try refreshing.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const calculateStats = (nominationsData: Nomination2025[]) => {
    console.log('Calculating stats for', nominationsData.length, 'nominations');
    const positionStats: { [key: string]: { [nominee: string]: number } } = {};
    
    nominationsData.forEach(nomination => {
      // Count votes for each position
      positions.forEach(position => {
        const positionKey = position.toLowerCase().replace(/[.\s]/g, '_');
        let nominee = '';
        
        // Map position to database column
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
        
        if (nominee) {
          if (!positionStats[position]) {
            positionStats[position] = {};
          }
          
          if (!positionStats[position][nominee]) {
            positionStats[position][nominee] = 0;
          }
          
          positionStats[position][nominee]++;
        }
      });
    });

    console.log('Position stats calculated:', positionStats);

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

    console.log('Stats array:', statsArray);
    setStats(statsArray);
  };

  const calculateTopNominees = (nominationsData: Nomination2025[]) => {
    console.log('Calculating top nominees...');
    const nomineeCount: { [nominee: string]: number } = {};
    
    nominationsData.forEach(nomination => {
      positions.forEach(position => {
        let nominee = '';
        
        // Map position to database column
        switch (position.toLowerCase().replace(/[.\s]/g, '_')) {
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
        
        if (nominee) {
          if (!nomineeCount[nominee]) {
            nomineeCount[nominee] = 0;
          }
          nomineeCount[nominee]++;
        }
      });
    });

    const topNomineesArray = Object.entries(nomineeCount)
      .map(([nominee, count]) => ({ nominee_name: nominee, total_nominations: count }))
      .sort((a, b) => b.total_nominations - a.total_nominations)
      .slice(0, 9);

    console.log('Top nominees calculated:', topNomineesArray);
    setTopNominees(topNomineesArray);
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

  const filteredStats = getFilteredStats();
  const participationRate = eligibleVoters.length > 0 
    ? Math.round((voterSubmissions.length / eligibleVoters.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
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

      {/* Debug Information Card */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-yellow-800">
            <span>Debug Information</span>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={refreshing}
              className="border-yellow-300"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium text-yellow-700">Raw Nominations:</p>
              <p className="text-yellow-600">{nominations.length} records</p>
            </div>
            <div>
              <p className="font-medium text-yellow-700">Raw Submissions:</p>
              <p className="text-yellow-600">{voterSubmissions.length} records</p>
            </div>
            <div>
              <p className="font-medium text-yellow-700">Calculated Stats:</p>
              <p className="text-yellow-600">{stats.length} entries</p>
            </div>
            <div>
              <p className="font-medium text-yellow-700">Top Nominees:</p>
              <p className="text-yellow-600">{topNominees.length} entries</p>
            </div>
          </div>
          {nominations.length === 0 && (
            <div className="mt-3 p-3 bg-yellow-100 rounded-md">
              <p className="text-yellow-800 text-sm">
                <strong>No nominations found.</strong> This could mean:
              </p>
              <ul className="list-disc list-inside text-yellow-700 text-sm mt-1 space-y-1">
                <li>No votes have been submitted yet</li>
                <li>There's a database connection issue</li>
                <li>Row Level Security policies are blocking access</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* Top 9 Nominees (Super Admin Only) */}
      {isSuperAdmin && topNominees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 9 Most Nominated Individuals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Rank</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Nominee</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Total Nominations</th>
                  </tr>
                </thead>
                <tbody>
                  {topNominees.map((nominee, index) => (
                    <tr key={nominee.nominee_name} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        #{index + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {nominee.nominee_name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {nominee.total_nominations}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

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
