export interface ScriptParams {
  title: string; // New: User-provided title for the script
  targetProductionBudget: number;
  targetAudience: string;
  creativeFlexibility: 'no-changes' | 'minor-dialogue-changes' | 'scene-level-changes';
  creativeDirectionNotes?: string;
}

export interface Script {
  id: string;
  title: string;
  text: string;
  params: ScriptParams;
}

export type CommercialQueryType = 'product' | 'environment' | 'situation' | 'thematic';

export interface CommercialQuery {
  id: string;
  term: string;
  type: CommercialQueryType;
  reason: string;
  estimatedRevenue: number;
  status: 'accepted' | 'rejected' | 'pending';
  scriptExcerpt: string; // The part of the script where the query was found
  startIndex: number; // New: Start index of the term in the scriptText
  endIndex: number;   // New: End index of the term in the scriptText
  confidenceScore: number; // New: A score indicating the AI's confidence in the opportunity (0-100)
}

export interface BudgetModel {
  baselineAdsenseRevenue: number;
  potentialSponsorshipRevenue: number;
  totalProjectedRevenue: number;
  productionBudget: number;
  netImpact: number; // totalProjectedRevenue - productionBudget
  categoryBreakdown?: { [key: string]: number }; // New: Breakdown of sponsorship revenue by category
  brandSafetyScore?: number; // New: AI-calculated brand safety score (0-100)
  monetizationTips?: string[]; // New: AI-generated tips for monetization
}
export interface SavedScriptAnalysis {
  script: Script;
  budgetModel: BudgetModel;
  commercialQueries: CommercialQuery[];
  savedAt: string;
}