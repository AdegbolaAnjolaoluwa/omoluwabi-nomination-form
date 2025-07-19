
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Download, Users, TrendingUp, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NominationStats {
  position: string;
  nominee_name: string;
  nomination_count: number;
}

interface TopNominee {
  nominee_name: string;
  total_nominations: number;
}

interface AdminUser {
  admin_name: string;
  is_super_admin: boolean;
}

const ExcoAdminDashboard = ({ currentUser }: { currentUser: AdminUser }) => {
  const [nominationStats, setNominationStats] = useState<NominationStats[]>([]);
  const [topNominees, setTopNominees] = useState<TopNominee[]>([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [totalEligibleVoters, setTotalEligibleVoters] = useState(0);
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const positions = [
    { value: "all", label: "All Positions" },
    { value: "President", label: "President" },
    { value: "Tournament Director", label: "Tournament Director" },
    { value: "Hon. Legal Adviser", label: "Hon. Legal Adviser" },
    { value: "Secretary", label: "Secretary" },
    { value: "Hon. Social Secretary", label: "Hon. Social Secretary" },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      
      // Fetch nomination statistics
      const { data: statsData, error: statsError } = await supabase.rpc('get_nomination_stats');
      if (statsError) {
        console.error('Stats error:', statsError);
        throw statsError;
      }
      console.log('Nomination stats:', statsData);
      setNominationStats(statsData || []);

      // Fetch top nominees (Super Admin only)
      if (currentUser.is_super_admin) {
        const { data: topData, error: topError } = await supabase.rpc('get_top_nominees');
        if (topError) {
          console.error('Top nominees error:', topError);
          throw topError;
        }
        console.log('Top nominees:', topData);
        setTopNominees(topData || []);
      }

      // Get total submissions count
      const { count: submissionCount, error: submissionError } = await supabase
        .from('voter_submissions_2025')
        .select('*', { count: 'exact', head: true });

      if (submissionError) {
        console.error('Submission count error:', submissionError);
        throw submissionError;
      }
      console.log('Total submissions:', submissionCount);
      setTotalSubmissions(submissionCount || 0);

      // Get total eligible voters
      const { count: voterCount, error: voterError } = await supabase
        .from('eligible_voters_2025')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (voterError) {
        console.error('Voter count error:', voterError);
        throw voterError;
      }
      console.log('Total eligible voters:', voterCount);
      setTotalEligibleVoters(voterCount || 0);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    if (!currentUser.is_super_admin) {
      toast({
        title: "Access Denied",
        description: "Only Super Admin can export data.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Exporting nomination data...');
      const { data, error } = await supabase
        .from('nominations_2025')
        .select('*')
        .order('submitted_at');

      if (error) {
        console.error('Export error:', error);
        throw error;
      }

      // Convert to CSV
      if (data && data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        const csvData = data.map(row => 
          Object.values(row).map(value => 
            typeof value === 'string' ? `"${value}"` : value
          ).join(',')
        ).join('\n');
        
        const csv = headers + '\n' + csvData;
        
        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nomination_data_2025_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Export Successful",
          description: "Nomination data has been downloaded as CSV.",
        });
      }
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getFilteredStats = () => {
    if (selectedPosition === "all") {
      return nominationStats;
    }
    return nominationStats.filter(stat => stat.position === selectedPosition);
  };

  const getChartData = () => {
    const filtered = getFilteredStats();
    return filtered.map(stat => ({
      name: stat.nominee_name,
      nominations: stat.nomination_count,
      position: stat.position
    }));
  };

  const participationRate = totalEligibleVoters > 0 
    ? Math.round((totalSubmissions / totalEligibleVoters) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            2025 EXCO Nomination Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome, {currentUser.admin_name} ({currentUser.is_super_admin ? 'Super Admin' : 'Admin'})
          </p>
        </div>
        
        {currentUser.is_super_admin && (
          <Button onClick={exportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data (CSV)
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              out of {totalEligibleVoters} eligible voters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participation Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participationRate}%</div>
            <p className="text-xs text-muted-foreground">
              voter participation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nominations</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nominationStats.reduce((sum, stat) => sum + stat.nomination_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              across all positions
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="statistics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="statistics">Nomination Statistics</TabsTrigger>
          {currentUser.is_super_admin && (
            <TabsTrigger value="top-nominees">Top 9 Nominees</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="statistics" className="space-y-4">
          {/* Position Filter */}
          <div className="flex flex-wrap gap-2">
            {positions.map((position) => (
              <Badge
                key={position.value}
                variant={selectedPosition === position.value ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setSelectedPosition(position.value)}
              >
                {position.label}
              </Badge>
            ))}
          </div>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                Nominations by Candidate
                {selectedPosition !== "all" && ` - ${selectedPosition}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="nominations" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Statistics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Position</th>
                      <th className="text-left p-2">Nominee</th>
                      <th className="text-left p-2">Nominations</th>
                      <th className="text-left p-2">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredStats().map((stat, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{stat.position}</td>
                        <td className="p-2 font-medium">{stat.nominee_name}</td>
                        <td className="p-2">{stat.nomination_count}</td>
                        <td className="p-2">
                          {totalSubmissions > 0 
                            ? Math.round((stat.nomination_count / totalSubmissions) * 100)
                            : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {currentUser.is_super_admin && (
          <TabsContent value="top-nominees">
            <Card>
              <CardHeader>
                <CardTitle>Top 9 Most Nominated Individuals</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Showing the most nominated individuals across all positions
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topNominees.map((nominee, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{nominee.nominee_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {nominee.total_nominations} nominations
                          </p>
                        </div>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ExcoAdminDashboard;
