"use client";

import { useState, useEffect, useCallback } from "react";
import { SavedScriptAnalysis } from "@/types";
import { showSuccess, showError } from "@/utils/toast";
import { api, useAuth } from "@/context/AuthContext";

interface UseSavedScriptsReturn {
  allScripts: SavedScriptAnalysis[];
  addScriptAnalysis: (analysis: SavedScriptAnalysis) => void;
  deleteScriptAnalysis: (scriptId: string) => Promise<void>;
  clearAllScriptAnalyses: () => void;
  refreshScripts: () => void;
  loading: boolean;
}

export const useSavedScripts = (): UseSavedScriptsReturn => {
  const [allScripts, setAllScripts] = useState<SavedScriptAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();

  const loadScripts = useCallback(async () => {
    if (!isLoggedIn) {
        setAllScripts([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    try {
      console.log("Fetching script analyses from backend...");
      const response = await api.get('/api/v1/scripts/analyses');
      console.log("Fetched analyses:", response.data);
      
      if (Array.isArray(response.data)) {
        setAllScripts(response.data);
      } else {
        console.error("Received invalid data format from backend:", response.data);
        setAllScripts([]);
      }
    } catch (error) {
      console.error("Failed to load scripts from backend:", error);
      setAllScripts([]); // Ensure we fallback to empty array on error
      // Don't show error on 401 as it might be just session expiry handled elsewhere
      // or initial load. But for other errors, yes.
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadScripts();
  }, [loadScripts]);

  const addScriptAnalysis = useCallback((_analysis: SavedScriptAnalysis) => {
    // With backend storage, the analysis is already saved during the flow.
    // We just need to refresh the list to see it.
    loadScripts();
  }, [loadScripts]);

  const deleteScriptAnalysis = useCallback(async (scriptId: string) => {
    try {
      await api.delete(`/api/v1/scripts/${scriptId}`);
      showSuccess("Script analysis deleted successfully.");
      loadScripts(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete script analysis:", error);
      showError("Failed to delete script analysis.");
    }
  }, [loadScripts]);

  const clearAllScriptAnalyses = useCallback(() => {
     // Not currently supported by backend API
     console.warn("Clear all not supported in backend mode yet");
  }, []);

  const refreshScripts = useCallback(() => {
    loadScripts();
  }, [loadScripts]);

  return {
    allScripts,
    addScriptAnalysis,
    deleteScriptAnalysis,
    clearAllScriptAnalyses,
    refreshScripts,
    loading,
  };
};