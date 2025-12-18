from datetime import datetime
from typing import Optional, Dict, List
from pydantic import BaseModel, ConfigDict, Field

class BudgetModel(BaseModel):
    """
    Budget impact analysis model
    """
    script_id: str = Field(alias="scriptId")
    baseline_adsense_revenue: float = Field(alias="baselineAdsenseRevenue")
    potential_sponsorship_revenue: float = Field(alias="potentialSponsorshipRevenue")
    total_projected_revenue: float = Field(alias="totalProjectedRevenue")
    production_budget: float = Field(alias="productionBudget")
    net_impact: float = Field(alias="netImpact")
    category_breakdown: Optional[Dict[str, float]] = Field(default=None, alias="categoryBreakdown")
    brand_safety_score: Optional[int] = Field(default=100, ge=0, le=100, alias="brandSafetyScore")
    monetization_tips: Optional[List[str]] = Field(default=None, alias="monetizationTips")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class BudgetInDB(BudgetModel):
    """
    Budget model stored in DB
    """
    id: str = Field(alias="_id")

class BudgetResponse(BudgetModel):
    """
    Budget model response
    """
    id: str