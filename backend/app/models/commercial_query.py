from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class QueryType(str, Enum):
    """Enum for commercial query types"""
    PRODUCT = "product"
    ENVIRONMENT = "environment"
    SITUATION = "situation"
    THEMATIC = "thematic"


class QueryStatus(str, Enum):
    """Enum for commercial query status"""
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class CommercialQueryInDB(BaseModel):
    """Model for commercial query stored in database"""
    id: str = Field(..., description="Query unique identifier")
    script_id: str = Field(..., description="Associated script ID")
    term: str = Field(..., description="Detected commercial term")
    type: QueryType = Field(..., description="Type of commercial opportunity")
    reason: str = Field(..., description="Reason for commercial potential")
    estimated_revenue: float = Field(..., description="Estimated revenue potential")
    status: QueryStatus = Field(default=QueryStatus.PENDING, description="Query status")
    script_excerpt: str = Field(..., description="Script excerpt showing context")
    start_index: int = Field(..., description="Start position of term in script")
    end_index: int = Field(..., description="End position of term in script")
    confidence_score: int = Field(..., ge=0, le=100, description="Confidence score (0-100)")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "script_id": "507f1f77bcf86cd799439012",
                "term": "coffee",
                "type": "product",
                "reason": "CPG category; high advertiser demand",
                "estimated_revenue": 5000.0,
                "status": "pending",
                "script_excerpt": "...enters the coffee shop and orders a latte...",
                "start_index": 15,
                "end_index": 21,
                "confidence_score": 85,
                "created_at": "2024-01-01T12:00:00Z",
                "updated_at": "2024-01-01T12:00:00Z"
            }
        }


class CommercialQueryResponse(BaseModel):
    """Model for commercial query response"""
    id: str = Field(..., description="Query unique identifier")
    script_id: str = Field(..., description="Associated script ID", alias="scriptId")
    term: str = Field(..., description="Detected commercial term")
    type: QueryType = Field(..., description="Type of commercial opportunity")
    reason: str = Field(..., description="Reason for commercial potential")
    estimated_revenue: float = Field(..., description="Estimated revenue potential", alias="estimatedRevenue")
    status: QueryStatus = Field(..., description="Query status")
    script_excerpt: str = Field(..., description="Script excerpt showing context", alias="scriptExcerpt")
    start_index: int = Field(..., description="Start position of term in script", alias="startIndex")
    end_index: int = Field(..., description="End position of term in script", alias="endIndex")
    confidence_score: int = Field(..., ge=0, le=100, description="Confidence score (0-100)", alias="confidenceScore")
    created_at: datetime = Field(..., description="Creation timestamp", alias="createdAt")
    updated_at: datetime = Field(..., description="Last update timestamp", alias="updatedAt")

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "script_id": "507f1f77bcf86cd799439012",
                "term": "coffee",
                "type": "product",
                "reason": "CPG category; high advertiser demand",
                "estimated_revenue": 5000.0,
                "status": "pending",
                "script_excerpt": "...enters the coffee shop and orders a latte...",
                "start_index": 15,
                "end_index": 21,
                "confidence_score": 85,
                "created_at": "2024-01-01T12:00:00Z",
                "updated_at": "2024-01-01T12:00:00Z"
            }
        }