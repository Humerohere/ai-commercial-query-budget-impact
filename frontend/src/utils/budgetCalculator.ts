import { BudgetModel, CommercialQuery, ScriptParams } from "@/types";

// Mock data for calculations (these would be more sophisticated in a real app)
const BASELINE_ADSENSE_RPM = 5; // Revenue per 1000 views
const ASSUMED_VIEWERSHIP_PER_SCRIPT_PAGE = 10000; // Mock views per page for long-form content
const ASSUMED_FILL_RATE = 0.7; // 70% of opportunities convert

export function calculateBudgetImpact(
  scriptLengthPages: number,
  scriptParams: ScriptParams,
  acceptedQueries: CommercialQuery[]
): BudgetModel {
  // 1. Baseline AdSense Revenue (mock calculation)
  const totalAssumedViews = scriptLengthPages * ASSUMED_VIEWERSHIP_PER_SCRIPT_PAGE;
  const baselineAdsenseRevenue = (totalAssumedViews / 1000) * BASELINE_ADSENSE_RPM;

  // 2. Potential Sponsorship Revenue from accepted queries
  const potentialSponsorshipRevenue = acceptedQueries.reduce((sum, query) => {
    return sum + query.estimatedRevenue * ASSUMED_FILL_RATE;
  }, 0);

  // 3. Total Projected Revenue
  const totalProjectedRevenue = baselineAdsenseRevenue + potentialSponsorshipRevenue;

  // 4. Net Impact
  const netImpact = totalProjectedRevenue - scriptParams.targetProductionBudget;

  return {
    baselineAdsenseRevenue,
    potentialSponsorshipRevenue,
    totalProjectedRevenue,
    productionBudget: scriptParams.targetProductionBudget,
    netImpact,
  };
}