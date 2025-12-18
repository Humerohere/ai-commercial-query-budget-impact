"""
Budget router for budget analysis and calculation
"""
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime

from ..models.budget import BudgetResponse, BudgetInDB
from ..dependencies.auth import get_current_user
from ..database import get_database

router = APIRouter(
    prefix="/api/v1/scripts",
    tags=["budget"]
)

@router.post("/{script_id}/budget", response_model=BudgetResponse, response_model_by_alias=True)
async def calculate_budget(
    script_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """
    Calculate budget impact for a script based on accepted queries
    
    Args:
        script_id: Script ID to calculate budget for
        current_user_id: ID of the authenticated user
        
    Returns:
        BudgetResponse: Calculated budget model
        
    Raises:
        HTTPException: If script not found or user doesn't own script
    """
    db = get_database()
    scripts_collection = db["scripts"]
    queries_collection = db["commercial_queries"]
    budget_collection = db["budget_models"]
    
    # Validate ObjectId format
    try:
        script_object_id = ObjectId(script_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid script ID format"
        )
    
    # Fetch script to verify ownership and get params
    try:
        script = await scripts_collection.find_one({"_id": script_object_id})
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch script: {str(e)}"
        )
    
    # Check if script exists
    if not script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Script not found"
        )
    
    # Verify ownership
    if script["user_id"] != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this script"
        )
    
    # Fetch accepted queries for this script
    try:
        cursor = queries_collection.find({
            "script_id": script_id,
            "status": "accepted"
        })
        accepted_queries = await cursor.to_list(length=None)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch queries: {str(e)}"
        )
    
    # Calculate revenue
    # Baseline AdSense: Assume $5 per 1000 views, 10M views for target audience size
    # This is a simplified calculation as per PRD "predefined industry benchmarks"
    # In a real app, this would be more complex
    
    target_audience = script["params"].get("target_audience", "")
    production_budget = float(script["params"].get("target_production_budget", 0))
    
    # Simple baseline based on audience type (mock logic)
    baseline_adsense = 50000.0  # Default baseline
    if "young" in target_audience.lower():
        baseline_adsense = 60000.0
    elif "tech" in target_audience.lower():
        baseline_adsense = 75000.0
        
    # Calculate sponsorship revenue and category breakdown
    sponsorship_revenue = 0
    category_breakdown = {}
    
    for query in accepted_queries:
        revenue = query.get("estimated_revenue", 0)
        sponsorship_revenue += revenue
        
        # Get category/type
        query_type = query.get("type", "other")
        # Convert to string and capitalize
        category = str(query_type).capitalize()
            
        category_breakdown[category] = category_breakdown.get(category, 0) + revenue
    
    total_revenue = baseline_adsense + sponsorship_revenue
    net_impact = total_revenue - production_budget
    
    # Calculate Brand Safety Score (Mock logic for demonstration)
    # In a production app, this would analyze text sentiment, profanity, etc.
    brand_safety_score = 95
    if "Product" in category_breakdown and category_breakdown["Product"] > 10000:
        brand_safety_score -= 5 # Slightly lower if very heavy on product placement
    
    # Generate Monetization Tips
    monetization_tips = [
        "Focus on seamless integration to maintain viewer retention.",
        "Consider bundling multiple placements for a single brand partner."
    ]
    
    if sponsorship_revenue > production_budget * 0.5:
        monetization_tips.append("High sponsorship potential! Consider hiring a dedicated brand partnership manager.")
        
    if category_breakdown.get("Environment", 0) > 0:
        monetization_tips.append("Location-based sponsorships detected. Research local tax incentives or tourism board grants.")
        
    if category_breakdown.get("Product", 0) > 0:
        monetization_tips.append("Product placement rights clearance is essential. Ensure all agreements are in writing.")

    # Create or update budget model
    now = datetime.utcnow()
    budget_doc = {
        "script_id": script_id,
        "baseline_adsense_revenue": baseline_adsense,
        "potential_sponsorship_revenue": sponsorship_revenue,
        "total_projected_revenue": total_revenue,
        "production_budget": production_budget,
        "net_impact": net_impact,
        "category_breakdown": category_breakdown,
        "brand_safety_score": brand_safety_score,
        "monetization_tips": monetization_tips,
        "updated_at": now
    }
    
    try:
        # Check if budget model exists
        existing_budget = await budget_collection.find_one({"script_id": script_id})
        
        if existing_budget:
            # Update existing
            await budget_collection.update_one(
                {"_id": existing_budget["_id"]},
                {"$set": budget_doc}
            )
            budget_id = str(existing_budget["_id"])
            created_at = existing_budget.get("created_at", now)
        else:
            # Create new
            budget_doc["created_at"] = now
            result = await budget_collection.insert_one(budget_doc)
            budget_id = str(result.inserted_id)
            created_at = now
            
        return BudgetResponse(
            id=budget_id,
            script_id=script_id,
            baseline_adsense_revenue=baseline_adsense,
            potential_sponsorship_revenue=sponsorship_revenue,
            total_projected_revenue=total_revenue,
            production_budget=production_budget,
            net_impact=net_impact,
            category_breakdown=category_breakdown,
            brand_safety_score=brand_safety_score,
            monetization_tips=monetization_tips,
            created_at=created_at,
            updated_at=now
        )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save budget calculation: {str(e)}"
        )

@router.get("/{script_id}/budget", response_model=BudgetResponse, response_model_by_alias=True)
async def get_budget(
    script_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """
    Retrieve existing budget calculation
    
    Args:
        script_id: Script ID to retrieve budget for
        current_user_id: ID of the authenticated user
        
    Returns:
        BudgetResponse: Budget model
        
    Raises:
        HTTPException: If script/budget not found or user doesn't own script
    """
    db = get_database()
    scripts_collection = db["scripts"]
    budget_collection = db["budget_models"]
    
    # Validate ObjectId format
    try:
        script_object_id = ObjectId(script_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid script ID format"
        )
    
    # Fetch script to verify ownership
    try:
        script = await scripts_collection.find_one({"_id": script_object_id})
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch script: {str(e)}"
        )
    
    # Check if script exists
    if not script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Script not found"
        )
    
    # Verify ownership
    if script["user_id"] != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this script"
        )
        
    # Fetch budget model
    try:
        budget = await budget_collection.find_one({"script_id": script_id})
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch budget: {str(e)}"
        )
        
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget calculation not found"
        )
        
    return BudgetResponse(
        id=str(budget["_id"]),
        script_id=budget["script_id"],
        baseline_adsense_revenue=budget["baseline_adsense_revenue"],
        potential_sponsorship_revenue=budget["potential_sponsorship_revenue"],
        total_projected_revenue=budget["total_projected_revenue"],
        production_budget=budget["production_budget"],
        net_impact=budget["net_impact"],
        category_breakdown=budget.get("category_breakdown"),
        brand_safety_score=budget.get("brand_safety_score", 100),
        monetization_tips=budget.get("monetization_tips", []),
        created_at=budget["created_at"],
        updated_at=budget["updated_at"]
    )