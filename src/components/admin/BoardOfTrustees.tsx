
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Crown, TrendingUp, Users } from "lucide-react";

interface TopNominee {
  nominee_name: string;
  total_nominations: number;
  positions: string[];
  percentage: number;
}

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

const BoardOfTrustees = () => {
  const [topNominees, setTopNominees] = useState<TopNominee[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const positions = [
    "President",
    "Tournament Director", 
    "Hon. Legal Adviser",
    "Secretary",
    "Hon. Social Secretary"
  ];

  useEffect(() => {
    fetchBoardOfTrusteesData();
  }, []);

  const fetchBoardOfTrusteesData = async () => {
    try {
      setIsLoading(true);
      
      console.log('Fetching nominations for Board of Trustees...');
      const { data: nominations, error } = await supabase
        .from('nominations_2025')
        .select('*');

      if (error) {
        console.error('Error fetching nominations:', error);
        toast({
          title: "Database Error",
          description: "Failed to fetch nomination data.",
          variant: "destructive",
        });
        throw error;
      }

      if (!nominations || nominations.length === 0) {
        console.log('No nominations found');
        setTopNominees([]);
        setTotalVotes(0);
        return;
      }

      console.log(`Processing ${nominations.length} nominations for top 9 selection`);
      
      // Calculate nominee counts and positions
      const nomineeData: { [nominee: string]: { count: number; positions: Set<string> } } = {};
      
      nominations.forEach((nomination: Nomination2025) => {
        positions.forEach(position => {
          let nominee = '';
          
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
          
          if (nominee && nominee.trim()) {
            if (!nomineeData[nominee]) {
              nomineeData[nominee] = { count: 0, positions: new Set() };
            }
            nomineeData[nominee].count++;
            nomineeData[nominee].positions.add(position);
          }
        });
      });

      // Convert to array and sort by total nominations
      const sortedNominees = Object.entries(nomineeData)
        .map(([name, data]) => ({
          nominee_name: name,
          total_nominations: data.count,
          positions: Array.from(data.positions),
          percentage: Math.round((data.count / nominations.length) * 100)
        }))
        .sort((a, b) => b.total_nominations - a.total_nominations)
        .slice(0, 9); // Top 9 for Board of Trustees

      console.log('Top 9 nominees calculated:', sortedNominees);
      
      setTopNominees(sortedNominees);
      setTotalVotes(nominations.length);

      toast({
        title: "Board of Trustees Data Loaded",
        description: `Top 9 nominees calculated from ${nominations.length} total votes.`,
      });

    } catch (error: any) {
      console.error('Error fetching Board of Trustees data:', error);
      toast({
        title: "Error",
        description: "Failed to load Board of Trustees data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-yellow-800">
            <Crown className="h-6 w-6" />
            Board of Trustees Selection
          </CardTitle>
          <p className="text-yellow-700">
            Top 9 most nominated individuals across all positions for Board of Trustees consideration
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-700">Total Nominees</p>
                <p className="text-2xl font-bold text-yellow-800">{topNominees.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-700">Total Votes</p>
                <p className="text-2xl font-bold text-yellow-800">{totalVotes}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-700">Selection Status</p>
                <p className="text-lg font-bold text-yellow-800">
                  {topNominees.length === 9 ? "Complete" : "In Progress"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 9 Nominees Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Top 9 Nominees for Board of Trustees
          </CardTitle>
          <p className="text-muted-foreground">
            These are the most nominated individuals across all EXCO positions
          </p>
        </CardHeader>
        <CardContent>
          {topNominees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gradient-to-r from-amber-50 to-yellow-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Rank</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Nominee Name</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Total Nominations</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Positions Nominated For</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {topNominees.map((nominee, index) => (
                    <tr 
                      key={nominee.nominee_name} 
                      className={`hover:bg-gray-50 ${index < 3 ? 'bg-amber-25' : ''}`}
                    >
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-lg ${
                            index === 0 ? 'text-yellow-600' : 
                            index === 1 ? 'text-gray-500' : 
                            index === 2 ? 'text-amber-600' : 'text-gray-700'
                          }`}>
                            #{index + 1}
                          </span>
                          {index < 3 && <Crown className="h-4 w-4 text-amber-500" />}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 font-medium">
                        {nominee.nominee_name}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {nominee.total_nominations} votes
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {nominee.positions.map((position) => (
                            <span 
                              key={position}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {position}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-amber-400 to-yellow-500 h-2 rounded-full"
                              style={{ width: `${Math.min(nominee.percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{nominee.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No nomination data available yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Board of Trustees selection will be available once voting begins.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BoardOfTrustees;
