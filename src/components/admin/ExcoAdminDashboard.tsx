
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
  Download,
  BarChart3
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { NominationStats, TopNominee } from "@/types/nomination";

interface ExcoAdminDashboardProps {
  isSuperAdmin: boolean;
}

const ExcoAdminDashboard = ({ isSuperAdmin }: ExcoAdminDashboardProps) => {
  const [stats, setStats] = useState<NominationStats[]>([]);
  const [topNominees, setTopNominees] = useState<TopNominee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [totalSubmissions, setTotalSubmissions] = useState(0);
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
      setLoading(true);
      
      // Get nomination statistics
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_nomination_stats');

      if (statsError) throw statsError;
      setStats(statsData || []);

      // Get total submissions count
      const { count, error: countError } = await supabase
        .from('voter_submissions_2025')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setTotalSubmissions(count || 0);

      // Get top nominees (Super Admin only)
      if (isSuperAdmin) {
        const { data: topData, error: topError } = await supabase
          .rpc('get_top_nominees');

        if (topError) throw topError;
        setTopNominees(topData || []);
      }

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

  const getFilteredStats = () => {
    if (selectedPosition === "all") return stats;
    return stats.filter(stat => stat.position === selectedPosition);
  };

  const getChartData = () => {
    const filtered = getFilteredStats();
    return filtered.map(stat => ({
      name: stat.nominee_name,
      nominations: stat.nomination_count,
      position: stat.position
    }));
  };

  const exportData = async () => {
    try {
      const { data, error } = await supabase
        .from('nominations_2025')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const headers = ['Voter Name', 'President', 'Tournament Director', 'Hon. Legal Adviser', 'Secretary', 'Hon. Social Secretary', 'Submitted At'];
      const csvContent = [
        headers.join(','),
        ...data.map(row => [
          row.voter_name,
          row.president,
          row.tournament_director,
          row.hon_legal_adviser,
          row.secretary,
          row.hon_social_secretary,
          new Date(row.submitted_at).toLocaleString()
        ].join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exco-nominations-2025-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Nomination data has been exported to CSV file.",
      });

    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export nomination data",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isSuperAdmin ? "Super Admin" : "Admin"} Dashboard
          </h1>
          <p className="text-muted-foreground">
            Omoluwabi Golfers Forum - 2025 EXCO Election Management
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline">
            Refresh Data
          </Button>
          {isSuperAdmin && (
            <Button onClick={exportData} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">out of 61 eligible voters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participation Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((totalSubmissions / 61) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {61 - totalSubmissions} members yet to vote
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">EXCO positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Nominees</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...new Set(stats.map(s => s.nominee_name))].length}
            </div>
            <p className="text-xs text-muted-foreground">across all positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Top 9 Nominees (Super Admin Only) */}
      {isSuperAdmin && topNominees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Top 9 Most Nominated Members (All Positions Combined)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topNominees.map((nominee, index) => (
                <div key={nominee.nominee_name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">#{index + 1} {nominee.nominee_name}</span>
                    <Badge variant="secondary" className="bg-gold-100 text-gold-800">
                      {nominee.total_nominations} nominations
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts and Data */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="charts">Visual Analytics</TabsTrigger>
          <TabsTrigger value="tables">Detailed Tables</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Nomination Statistics by Position
                </CardTitle>
                <select 
                  value={selectedPosition} 
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="px-3 py-1 border rounded"
                >
                  <option value="all">All Positions</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="nominations" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nomination Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Nominee Name</TableHead>
                    <TableHead>Nomination Count</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredStats().map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{stat.position}</TableCell>
                      <TableCell>{stat.nominee_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {stat.nomination_count}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {totalSubmissions > 0 
                          ? `${((stat.nomination_count / totalSubmissions) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </TableCell>
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

export default ExcoAdminDashboard;
