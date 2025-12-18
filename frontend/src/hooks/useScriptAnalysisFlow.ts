"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Script, ScriptParams, CommercialQuery, BudgetModel } from "@/types";
import { showSuccess, showError, showInfo } from "@/utils/toast"; // Import showInfo
import { useAuth, api } from "@/context/AuthContext";
import { LOCAL_STORAGE_KEY } from "@/utils/localStorageManager"; // Keep LOCAL_STORAGE_KEY for current analysis
import { useSavedScripts } from "./useSavedScripts"; // Import the new hook

type AppStage = 'input' | 'review' | 'dashboard' | 'loading';

interface UseScriptAnalysisFlowReturn {
  appStage: AppStage;
  currentScript: Script | null;
  commercialQueries: CommercialQuery[];
  budgetModel: BudgetModel | null;
  loadingMessage: string;
  handleScriptSubmit: (scriptText: string, params: ScriptParams) => Promise<void>;
  handleQueriesReviewed: (updatedQueries: CommercialQuery[]) => Promise<void>;
  handleReset: () => void;
  handleReviewScriptFromDashboard: () => void;
}

export const useScriptAnalysisFlow = (): UseScriptAnalysisFlowReturn => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addScriptAnalysis, allScripts, loading: scriptsLoading } = useSavedScripts(); // Use the new hook

  const [appStage, setAppStage] = useState<AppStage>('input');
  const [currentScript, setCurrentScript] = useState<Script | null>(null);
  const [commercialQueries, setCommercialQueries] = useState<CommercialQuery[]>([]);
  const [budgetModel, setBudgetModel] = useState<BudgetModel | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  // Load state from localStorage or URL on initial mount
  useEffect(() => {
    if (isLoggedIn) {
      const scriptIdFromUrl = searchParams.get('scriptId');
      const stageFromUrl = searchParams.get('stage');

      if (scriptIdFromUrl) {
        if (scriptsLoading) return; // Wait for scripts to load

        // Find the script in the globally managed allScripts
        const savedAnalysis = allScripts.find(analysis => analysis.script.id === scriptIdFromUrl);
        if (savedAnalysis) {
          setCurrentScript(savedAnalysis.script);
          setCommercialQueries(savedAnalysis.commercialQueries);
          setBudgetModel(savedAnalysis.budgetModel);
          setAppStage(stageFromUrl === 'review' ? 'review' : 'dashboard');
          showInfo(`Loaded analysis for "${savedAnalysis.script.title}" from URL.`);
          // Also save to LOCAL_STORAGE_KEY for current session persistence
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
            script: savedAnalysis.script,
            queries: savedAnalysis.commercialQueries,
            budget: savedAnalysis.budgetModel,
            appStage: stageFromUrl === 'review' ? 'review' : 'dashboard',
          }));
        } else {
          showError("Could not find the requested script analysis.");
          navigate('/dashboard', { replace: true });
          // Fallback to session storage if URL script not found
          const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (savedState) {
            try {
              const parsedState = JSON.parse(savedState);
              setCurrentScript(parsedState.script);
              setCommercialQueries(parsedState.queries);
              setBudgetModel(parsedState.budget);
              setAppStage(parsedState.appStage || 'input');
              showInfo("Loaded previous analysis from local storage.");
            } catch (error) {
              console.error("Failed to parse saved state from localStorage:", error);
              localStorage.removeItem(LOCAL_STORAGE_KEY);
            }
          }
        }
      } else {
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedState) {
          try {
            const parsedState = JSON.parse(savedState);
            setCurrentScript(parsedState.script);
            setCommercialQueries(parsedState.queries);
            setBudgetModel(parsedState.budget);
            setAppStage(parsedState.appStage || 'input');
            showInfo("Loaded previous analysis from local storage.");
          } catch (error) {
            console.error("Failed to parse saved state from localStorage:", error);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        }
      }
    }
  }, [isLoggedIn, navigate, searchParams, allScripts, scriptsLoading]); // Add scriptsLoading to dependencies

  // Save current analysis state to localStorage whenever relevant state changes
  useEffect(() => {
    if (isLoggedIn && currentScript && commercialQueries.length > 0 && budgetModel) {
      const stateToSave = {
        script: currentScript,
        queries: commercialQueries,
        budget: budgetModel,
        appStage: appStage,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } else if (isLoggedIn && appStage === 'input' && !searchParams.get('scriptId')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [isLoggedIn, currentScript, commercialQueries, budgetModel, appStage, searchParams]);

  const handleScriptSubmit = async (scriptText: string, params: ScriptParams) => {
    setAppStage('loading');
    setLoadingMessage("Analyzing your script for commercial opportunities...");
    
    try {
      const createResponse = await api.post('/api/v1/scripts', {
        text: scriptText,
        params: params,
        title: params.title,
      });
      
      const scriptId = createResponse.data.id;
      const newScript: Script = {
        id: scriptId,
        title: params.title,
        text: scriptText,
        params: params,
      };
      setCurrentScript(newScript);
      
      const analyzeResponse = await api.post(`/api/v1/scripts/${scriptId}/analyze`);
      const queries = analyzeResponse.data.queries;
      
      setCommercialQueries(queries);
      showSuccess("Script analyzed! Review commercial opportunities.");
      setAppStage('review');
      setLoadingMessage("");
    } catch (error: unknown) {
      console.error('Script submission error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          showError("Session expired. Please login again.");
          logout();
          navigate('/login');
        } else if (error.response?.status === 403) {
          showError("You don't have permission to perform this action.");
        } else if (error.response?.status === 404) {
          showError("Resource not found.");
        } else if (error.response?.status === 500) {
          showError("Server error. Please try again later.");
        } else {
          showError(error.response?.data?.detail || "Failed to analyze script. Please try again.");
        }
      } else {
        showError("An unexpected error occurred.");
      }
      
      setAppStage('input');
      setLoadingMessage("");
    }
  };

  const handleQueriesReviewed = async (updatedQueries: CommercialQuery[]) => {
    if (!currentScript) {
      showError("No script found to calculate budget impact.");
      return;
    }

    setAppStage('loading');
    setLoadingMessage("Calculating budget impact and generating insights...");
    
    try {
      const updates = updatedQueries.map(query => ({
        id: query.id,
        status: query.status
      }));
      
      const response = await api.patch(`/api/v1/scripts/${currentScript.id}/queries/batch-update`, {
        updates: updates
      });
      
      const updatedQueriesFromAPI = response.data.queries;
      setCommercialQueries(updatedQueriesFromAPI);
      
      const budgetResponse = await api.post(`/api/v1/scripts/${currentScript.id}/budget`);
      
      const categoryBreakdown: { [key: string]: number } = {};
      updatedQueriesFromAPI.forEach(query => {
        if (query.status === 'accepted') {
          const type = query.type.charAt(0).toUpperCase() + query.type.slice(1);
          categoryBreakdown[type] = (categoryBreakdown[type] || 0) + query.estimatedRevenue;
        }
      });

      const finalBudgetModel: BudgetModel = {
        ...budgetResponse.data,
        categoryBreakdown: categoryBreakdown,
      };

      setBudgetModel(finalBudgetModel);
      
      showSuccess("Budget impact calculated!");
      setAppStage('dashboard');
      setLoadingMessage("");

      const analysisToSave = {
        script: currentScript,
        budgetModel: finalBudgetModel,
        commercialQueries: updatedQueriesFromAPI,
        savedAt: new Date().toISOString(),
      };
      addScriptAnalysis(analysisToSave); // Use the hook's add function

    } catch (error: unknown) {
      console.error('Query review error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          showError("Session expired. Please login again.");
          logout();
          navigate('/login');
        } else if (error.response?.status === 403) {
          showError("You don't have permission to update these queries.");
        } else if (error.response?.status === 404) {
          showError("Script or queries not found.");
        } else if (error.response?.status === 500) {
          showError("Server error. Please try again later.");
        } else {
          showError(error.response?.data?.detail || "Failed to update queries. Please try again.");
        }
      } else {
        showError("An unexpected error occurred.");
      }
      
      setAppStage('review');
      setLoadingMessage("");
    }
  };

  const handleReset = () => {
    setAppStage('input');
    setCurrentScript(null);
    setCommercialQueries([]);
    setBudgetModel(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    navigate('/dashboard', { replace: true });
    setLoadingMessage("");
  };

  const handleReviewScriptFromDashboard = () => {
    if (currentScript && commercialQueries.length > 0) {
      setAppStage('review');
      showInfo("Returning to script review.");
    } else {
      showError("No script data available to review.");
    }
  };

  return {
    appStage,
    currentScript,
    commercialQueries,
    budgetModel,
    loadingMessage,
    handleScriptSubmit,
    handleQueriesReviewed,
    handleReset,
    handleReviewScriptFromDashboard,
  };
};