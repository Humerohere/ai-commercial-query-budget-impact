"""
Scripts router for script management and analysis
"""
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime
from typing import List

from ..models.script import ScriptCreate, ScriptInDB, ScriptResponse, ScriptAnalysisResponse
from ..models.commercial_query import CommercialQueryResponse
from ..models.budget import BudgetResponse
from ..dependencies.auth import get_current_user
from ..database import get_database

router = APIRouter(
    prefix="/api/v1/scripts",
    tags=["scripts"]
)


def generate_title_from_text(text: str) -> str:
    """
    Generate a title from the first 50 characters of script text
    
    Args:
        text: Script text content
        
    Returns:
        str: Generated title
    """
    # Take first 50 chars and add ellipsis
    title = text[:50].strip()
    if len(text) > 50:
        title += "..."
    return title


@router.get("/analyses", response_model=List[ScriptAnalysisResponse], response_model_by_alias=True)
async def list_script_analyses(
    current_user_id: str = Depends(get_current_user)
):
    """
    List all script analyses for the current user, including budget and queries
    
    Args:
        current_user_id: ID of the authenticated user
        
    Returns:
        List[ScriptAnalysisResponse]: Array of complete script analyses
    """
    db = get_database()
    scripts_collection = db["scripts"]
    budget_collection = db["budget_models"]
    queries_collection = db["commercial_queries"]
    
    try:
        # Fetch all scripts for the user, sorted by created_at descending
        cursor = scripts_collection.find(
            {"user_id": current_user_id}
        ).sort("created_at", -1)
        
        scripts = await cursor.to_list(length=None)
        
        analyses = []
        
        from ..models.script import ScriptParams
        
        for script in scripts:
            try:
                script_id = str(script["_id"])
                
                # Fetch budget
                budget = await budget_collection.find_one({"script_id": script_id})
                if not budget:
                    continue # Skip if no budget calculated yet (incomplete analysis)
                    
                # Fetch queries
                queries_cursor = queries_collection.find({"script_id": script_id})
                queries = await queries_cursor.to_list(length=None)
                
                # Construct Query Responses
                query_responses = [
                    CommercialQueryResponse(
                        id=str(q["_id"]),
                        script_id=q["script_id"],
                        term=q["term"],
                        type=q["type"],
                        reason=q["reason"],
                        estimated_revenue=q["estimated_revenue"],
                        status=q["status"],
                        script_excerpt=q["script_excerpt"],
                        start_index=q["start_index"],
                        end_index=q["end_index"],
                        confidence_score=q["confidence_score"],
                        created_at=q["created_at"],
                        updated_at=q["updated_at"]
                    ) for q in queries
                ]
                
                # Construct Budget Response
                budget_response = BudgetResponse(
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
                
                # Construct ScriptInDB
                script_in_db = ScriptInDB(
                    id=script_id,
                    user_id=script["user_id"],
                    title=script["title"],
                    text=script["text"],
                    params=ScriptParams(**script["params"]),
                    created_at=script["created_at"],
                    updated_at=script["updated_at"]
                )
                
                analyses.append(ScriptAnalysisResponse(
                    script=script_in_db,
                    budget_model=budget_response,
                    commercial_queries=query_responses,
                    saved_at=budget["updated_at"] # Use budget update time as "saved at" equivalent
                ))
            except Exception as e:
                # Log error and skip this script if it's malformed
                print(f"Error processing script {script.get('_id')}: {e}")
                continue
            
        return analyses
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch analyses: {str(e)}"
        )


@router.post("", response_model=ScriptResponse, status_code=status.HTTP_201_CREATED)
async def create_script(
    script_data: ScriptCreate,
    current_user_id: str = Depends(get_current_user)
):
    """
    Create a new script
    
    Args:
        script_data: Script creation data
        current_user_id: ID of the authenticated user
        
    Returns:
        ScriptResponse: Created script summary (id, title, created_at)
        
    Raises:
        HTTPException: If validation fails or database error occurs
    """
    db = get_database()
    scripts_collection = db["scripts"]
    
    # Generate title if not provided
    title = script_data.title if script_data.title else generate_title_from_text(script_data.text)
    
    # Create script document
    now = datetime.utcnow()
    script_doc = {
        "user_id": current_user_id,
        "title": title,
        "text": script_data.text,
        "params": script_data.params.model_dump(),
        "created_at": now,
        "updated_at": now
    }
    
    try:
        # Insert into database
        result = await scripts_collection.insert_one(script_doc)
        script_id = str(result.inserted_id)
        
        # Return response
        return ScriptResponse(
            id=script_id,
            title=title,
            created_at=now
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create script: {str(e)}"
        )


@router.get("/{script_id}", response_model=ScriptInDB)
async def get_script(
    script_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """
    Get a script by ID
    
    Args:
        script_id: Script ID to retrieve
        current_user_id: ID of the authenticated user
        
    Returns:
        ScriptInDB: Full script object with all details
        
    Raises:
        HTTPException: If script not found or user doesn't own the script
    """
    db = get_database()
    scripts_collection = db["scripts"]
    
    # Validate ObjectId format
    try:
        script_object_id = ObjectId(script_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid script ID format"
        )
    
    # Fetch script from database
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
    
    # Convert MongoDB document to ScriptInDB model
    from ..models.script import ScriptParams
    
    return ScriptInDB(
        id=str(script["_id"]),
        user_id=script["user_id"],
        title=script["title"],
        text=script["text"],
        params=ScriptParams(**script["params"]),
        created_at=script["created_at"],
        updated_at=script["updated_at"]
    )


@router.delete("/{script_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_script(
    script_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """
    Delete a script and all associated data (budget, queries)
    
    Args:
        script_id: Script ID to delete
        current_user_id: ID of the authenticated user
        
    Raises:
        HTTPException: If script not found or user doesn't own script
    """
    db = get_database()
    scripts_collection = db["scripts"]
    budget_collection = db["budget_models"]
    queries_collection = db["commercial_queries"]
    
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
            detail="You don't have permission to delete this script"
        )
        
    try:
        # Delete script
        await scripts_collection.delete_one({"_id": script_object_id})
        
        # Delete associated budget
        await budget_collection.delete_many({"script_id": script_id})
        
        # Delete associated queries
        await queries_collection.delete_many({"script_id": script_id})
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete script data: {str(e)}"
        )


@router.get("", response_model=List[ScriptResponse])
async def list_user_scripts(
    current_user_id: str = Depends(get_current_user)
):
    """
    List all scripts for the current user
    
    Args:
        current_user_id: ID of the authenticated user
        
    Returns:
        List[ScriptResponse]: Array of script summaries (id, title, created_at)
    """
    db = get_database()
    scripts_collection = db["scripts"]
    
    try:
        # Fetch all scripts for the user, sorted by created_at descending
        cursor = scripts_collection.find(
            {"user_id": current_user_id}
        ).sort("created_at", -1)
        
        scripts = await cursor.to_list(length=None)
        
        # Convert to ScriptResponse models
        return [
            ScriptResponse(
                id=str(script["_id"]),
                title=script["title"],
                created_at=script["created_at"]
            )
            for script in scripts
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch scripts: {str(e)}"
        )


@router.post("/{script_id}/analyze")
async def analyze_script(
    script_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """
    Analyze a script for commercial queries
    
    Args:
        script_id: Script ID to analyze
        current_user_id: ID of the authenticated user
        
    Returns:
        dict: Dictionary containing array of detected commercial queries
        
    Raises:
        HTTPException: If script not found or user doesn't own the script
    """
    db = get_database()
    scripts_collection = db["scripts"]
    queries_collection = db["commercial_queries"]
    
    # Validate ObjectId format
    try:
        script_object_id = ObjectId(script_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid script ID format"
        )
    
    # Fetch script from database
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
            detail="You don't have permission to analyze this script"
        )
    
    # Import detection service
    from ..services.ai_detection import detect_commercial_queries
    from ..models.script import ScriptParams
    from ..models.commercial_query import CommercialQueryResponse
    
    # Reconstruct ScriptParams from stored data
    params = ScriptParams(**script["params"])
    
    # Detect commercial queries
    try:
        detected_queries = detect_commercial_queries(script["text"], params)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze script: {str(e)}"
        )
    
    # Delete existing queries for this script (to allow re-analysis)
    try:
        await queries_collection.delete_many({"script_id": script_id})
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear existing queries: {str(e)}"
        )
    
    # Store detected queries in database
    query_responses = []
    if detected_queries:
        try:
            # Prepare query documents for insertion
            query_docs = []
            for query in detected_queries:
                query_dict = query.model_dump()
                query_dict["script_id"] = script_id  # Set the script_id
                # Remove the 'id' field as MongoDB will generate _id
                query_dict.pop("id", None)
                query_docs.append(query_dict)
            
            # Insert all queries
            result = await queries_collection.insert_many(query_docs)
            
            # Create response objects with MongoDB IDs
            for i, inserted_id in enumerate(result.inserted_ids):
                query_dict = query_docs[i].copy()
                query_dict["id"] = str(inserted_id)
                query_responses.append(CommercialQueryResponse(**query_dict))
                
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to store queries: {str(e)}"
            )
    
    return {"queries": query_responses}


@router.get("/{script_id}/queries", response_model=List[CommercialQueryResponse])
async def get_script_queries(
    script_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """
    Get all commercial queries for a script
    
    Args:
        script_id: Script ID to get queries for
        current_user_id: ID of the authenticated user
        
    Returns:
        List[CommercialQueryResponse]: Array of commercial queries
        
    Raises:
        HTTPException: If script not found or user doesn't own the script
    """
    db = get_database()
    scripts_collection = db["scripts"]
    queries_collection = db["commercial_queries"]
    
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
            detail="You don't have permission to access queries for this script"
        )
    
    # Fetch all queries for this script
    try:
        cursor = queries_collection.find({"script_id": script_id})
        queries = await cursor.to_list(length=None)
        
        # Import response model
        from ..models.commercial_query import CommercialQueryResponse
        
        # Convert to response models
        return [
            CommercialQueryResponse(
                id=str(query["_id"]),
                script_id=query["script_id"],
                term=query["term"],
                type=query["type"],
                reason=query["reason"],
                estimated_revenue=query["estimated_revenue"],
                status=query["status"],
                script_excerpt=query["script_excerpt"],
                start_index=query["start_index"],
                end_index=query["end_index"],
                confidence_score=query["confidence_score"],
                created_at=query["created_at"],
                updated_at=query["updated_at"]
            )
            for query in queries
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch queries: {str(e)}"
        )


@router.patch("/{script_id}/queries/batch-update")
async def bulk_update_query_statuses(
    script_id: str,
    updates_data: dict,
    current_user_id: str = Depends(get_current_user)
):
    """
    Bulk update the status of multiple commercial queries
    
    Args:
        script_id: Script ID that owns the queries
        updates_data: Dictionary containing {"updates": [{"id": "query_id", "status": "accepted"}, ...]}
        current_user_id: ID of the authenticated user
        
    Returns:
        dict: {"updated_count": number, "queries": [updated_query_objects]}
        
    Raises:
        HTTPException: If script not found or user doesn't own script
    """
    db = get_database()
    scripts_collection = db["scripts"]
    queries_collection = db["commercial_queries"]
    
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
            detail="You don't have permission to modify queries for this script"
        )
    
    # Get updates list
    updates = updates_data.get("updates", [])
    if not updates:
        return {"updated_count": 0, "queries": []}
    
    # Validate statuses
    from ..models.commercial_query import QueryStatus
    valid_statuses = [s.value for s in QueryStatus]
    
    # Process updates
    updated_queries = []
    updated_count = 0
    now = datetime.utcnow()
    
    for update in updates:
        query_id = update.get("id")
        new_status = update.get("status")
        
        # Skip invalid updates
        if not query_id or not new_status:
            continue
        
        if new_status not in valid_statuses:
            continue
        
        # Validate query_id format
        try:
            query_object_id = ObjectId(query_id)
        except Exception:
            continue  # Skip invalid IDs
        
        try:
            # Verify query belongs to the script
            query = await queries_collection.find_one({
                "_id": query_object_id,
                "script_id": script_id
            })
            
            if not query:
                continue  # Skip queries that don't belong to this script
            
            # Update query status
            result = await queries_collection.update_one(
                {"_id": query_object_id},
                {
                    "$set": {
                        "status": new_status,
                        "updated_at": now
                    }
                }
            )
            
            if result.modified_count > 0:
                updated_count += 1
                # Fetch updated query
                updated_query = await queries_collection.find_one({"_id": query_object_id})
                updated_queries.append(
                    CommercialQueryResponse(
                        id=str(updated_query["_id"]),
                        script_id=updated_query["script_id"],
                        term=updated_query["term"],
                        type=updated_query["type"],
                        reason=updated_query["reason"],
                        estimated_revenue=updated_query["estimated_revenue"],
                        status=updated_query["status"],
                        script_excerpt=updated_query["script_excerpt"],
                        start_index=updated_query["start_index"],
                        end_index=updated_query["end_index"],
                        confidence_score=updated_query["confidence_score"],
                        created_at=updated_query["created_at"],
                        updated_at=updated_query["updated_at"]
                    )
                )
        except Exception:
            # Skip queries that fail to update
            continue
    
    return {
        "updated_count": updated_count,
        "queries": updated_queries
    }


@router.patch("/{script_id}/queries/{query_id}", response_model=CommercialQueryResponse)
async def update_query_status(
    script_id: str,
    query_id: str,
    status_update: dict,
    current_user_id: str = Depends(get_current_user)
):
    """
    Update the status of a single commercial query
    
    Args:
        script_id: Script ID that owns the query
        query_id: Query ID to update
        status_update: Dictionary containing {"status": "accepted" | "rejected" | "pending"}
        current_user_id: ID of the authenticated user
        
    Returns:
        CommercialQueryResponse: Updated query object
        
    Raises:
        HTTPException: If script/query not found, user doesn't own script, or invalid status
    """
    db = get_database()
    scripts_collection = db["scripts"]
    queries_collection = db["commercial_queries"]
    
    # Validate ObjectId formats
    try:
        script_object_id = ObjectId(script_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid script ID format"
        )
    
    try:
        query_object_id = ObjectId(query_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid query ID format"
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
            detail="You don't have permission to modify queries for this script"
        )
    
    # Validate status value
    new_status = status_update.get("status")
    if not new_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status field is required"
        )
    
    from ..models.commercial_query import QueryStatus
    valid_statuses = [s.value for s in QueryStatus]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    # Fetch query to verify it belongs to the script
    try:
        query = await queries_collection.find_one({"_id": query_object_id})
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch query: {str(e)}"
        )
    
    # Check if query exists
    if not query:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query not found"
        )
    
    # Verify query belongs to the script
    if query["script_id"] != script_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query does not belong to this script"
        )
    
    # Update query status
    try:
        now = datetime.utcnow()
        result = await queries_collection.update_one(
            {"_id": query_object_id},
            {
                "$set": {
                    "status": new_status,
                    "updated_at": now
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update query status"
            )
        
        # Fetch updated query
        updated_query = await queries_collection.find_one({"_id": query_object_id})
        
        # Return updated query
        return CommercialQueryResponse(
            id=str(updated_query["_id"]),
            script_id=updated_query["script_id"],
            term=updated_query["term"],
            type=updated_query["type"],
            reason=updated_query["reason"],
            estimated_revenue=updated_query["estimated_revenue"],
            status=updated_query["status"],
            script_excerpt=updated_query["script_excerpt"],
            start_index=updated_query["start_index"],
            end_index=updated_query["end_index"],
            confidence_score=updated_query["confidence_score"],
            created_at=updated_query["created_at"],
            updated_at=updated_query["updated_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update query: {str(e)}"
        )