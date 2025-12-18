"use client";

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SavedScriptAnalysis } from "@/types";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, FileText } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSavedScripts } from "@/hooks/useSavedScripts";

const MyScriptsPage: React.FC = () => {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { allScripts, deleteScriptAnalysis, refreshScripts, loading: scriptsLoading } = useSavedScripts();

  // --- START: Moved hooks to the top ---
  const [filteredScripts, setFilteredScripts] = useState<SavedScriptAnalysis[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, authLoading, navigate]);

  useEffect(() => {
    console.log("MyScriptsPage: allScripts updated", allScripts);
    if (!allScripts || !Array.isArray(allScripts)) {
        setFilteredScripts([]);
        return;
    }
    setFilteredScripts(allScripts);
  }, [allScripts]);

  useEffect(() => {
    if (!allScripts || !Array.isArray(allScripts)) return;
    
    console.log("MyScriptsPage: filtering scripts with term:", searchTerm);
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const results = allScripts.filter(analysis =>
      analysis?.script?.title?.toLowerCase().includes(lowerCaseSearchTerm) ?? false
    );
    setFilteredScripts(results);
  }, [searchTerm, allScripts]);
  // --- END: Moved hooks to the top ---

  if (authLoading || scriptsLoading) {
    return (
      <AppLayout>
        <div className="min-h-[calc(100vh-150px)] flex items-center justify-center">
          <LoadingSpinner message="Loading your scripts..." />
        </div>
      </AppLayout>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleDelete = (scriptId: string) => {
    deleteScriptAnalysis(scriptId);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">My Script Analyses</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Here you can find all your previously analyzed scripts and their budget impact reports.
        </p>

        {allScripts.length > 0 && (
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search scripts by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {filteredScripts.length === 0 && allScripts.length > 0 ? (
          <div className="text-center p-8 border rounded-lg bg-gray-50 dark:bg-gray-700">
            <FileText className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">No scripts found matching your search.</p>
            <Button onClick={() => setSearchTerm("")}>Clear Search</Button>
          </div>
        ) : filteredScripts.length === 0 && allScripts.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-gray-50 dark:bg-gray-700">
            <FileText className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">No scripts analyzed yet.</p>
            <p className="text-md text-gray-500 dark:text-gray-400 mb-6">
              Start a new analysis from the dashboard to see your scripts here.
            </p>
            <Link to="/dashboard">
              <Button>Start New Analysis</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredScripts.map((analysis) => {
              // Defensive check for required data structure
              if (!analysis?.script?.id || !analysis?.budgetModel) {
                console.warn("Skipping invalid analysis object:", analysis);
                return null;
              }
              
              const netImpact = analysis.budgetModel.netImpact ?? 0;
              const isPositive = netImpact >= 0;
              
              return (
              <Card key={analysis.script.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {analysis.script.title || "Untitled Script"}
                    <Badge variant="secondary" className="text-sm">
                      {analysis.savedAt ? new Date(analysis.savedAt).toLocaleDateString() : "Unknown Date"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Budget: {analysis.script.params?.targetProductionBudget != null ? formatCurrency(analysis.script.params.targetProductionBudget) : 'N/A'} | Projected: {analysis.budgetModel?.totalProjectedRevenue != null ? formatCurrency(analysis.budgetModel.totalProjectedRevenue) : 'N/A'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <span className={`font-bold text-lg ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    Net Impact: {analysis.budgetModel?.netImpact != null ? formatCurrency(analysis.budgetModel.netImpact) : 'N/A'}
                  </span>
                  <div className="flex space-x-2">
                    <Link to={`/scripts/${analysis.script.id}`}> {/* Link to new ScriptDetailPage */}
                      <Button variant="outline" size="icon" title="View Report">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to={`/dashboard?scriptId=${analysis.script.id}&stage=review`}>
                      <Button variant="outline" size="icon" title="Review Script">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" title="Delete Analysis">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your script analysis.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(analysis.script.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MyScriptsPage;