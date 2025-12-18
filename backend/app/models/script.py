from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum
from typing import List
from .budget import BudgetResponse
from .commercial_query import CommercialQueryResponse


class CreativeFlexibility(str, Enum):
    """Enum for creative flexibility options"""
    NO_CHANGES = "no-changes"
    MINOR_DIALOGUE_CHANGES = "minor-dialogue-changes"
    SCENE_LEVEL_CHANGES = "scene-level-changes"


class ScriptParams(BaseModel):
    """Parameters for script analysis and commercial query detection"""
    target_production_budget: float = Field(..., ge=0, description="Target production budget (must be >= 0)", alias="targetProductionBudget")
    target_audience: str = Field(..., min_length=3, description="Target audience description", alias="targetAudience")
    creative_flexibility: CreativeFlexibility = Field(..., description="Level of creative flexibility allowed", alias="creativeFlexibility")
    creative_direction_notes: Optional[str] = Field(None, description="Optional creative direction notes", alias="creativeDirectionNotes")
    title: Optional[str] = Field(None, description="Script title", alias="title")

    class Config:
        populate_by_name = True

    @field_validator('target_production_budget')
    @classmethod
    def validate_budget(cls, v):
        if v < 0:
            raise ValueError('target_production_budget must be >= 0')
        return v

    @field_validator('target_audience')
    @classmethod
    def validate_audience(cls, v):
        if len(v.strip()) < 3:
            raise ValueError('target_audience must be at least 3 characters')
        return v.strip()


class ScriptCreate(BaseModel):
    """Model for creating a new script"""
    title: Optional[str] = Field(None, description="Script title (auto-generated if not provided)")
    text: str = Field(..., min_length=10, description="Script text content")
    params: ScriptParams = Field(..., description="Script parameters")

    @field_validator('text')
    @classmethod
    def validate_text(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('text must be at least 10 characters')
        return v.strip()

    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if v is not None:
            return v.strip() if v.strip() else None
        return v


class ScriptInDB(BaseModel):
    """Model for script stored in database"""
    id: str = Field(..., description="Script unique identifier")
    user_id: str = Field(..., description="User ID who owns the script")
    title: str = Field(..., description="Script title")
    text: str = Field(..., description="Script text content")
    params: ScriptParams = Field(..., description="Script parameters")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "user_id": "507f1f77bcf86cd799439012",
                "title": "Coffee Shop Scene",
                "text": "INT. COFFEE SHOP - DAY\n\nSARAH enters...",
                "params": {
                    "target_production_budget": 100000,
                    "target_audience": "Young Adults (18-34)",
                    "creative_flexibility": "minor-dialogue-changes",
                    "creative_direction_notes": "Urban lifestyle focus"
                },
                "created_at": "2024-01-01T12:00:00Z",
                "updated_at": "2024-01-01T12:00:00Z"
            }
        }


class ScriptResponse(BaseModel):
    """Model for script response (summary view)"""
    id: str = Field(..., description="Script unique identifier")
    title: str = Field(..., description="Script title")
    created_at: datetime = Field(..., description="Creation timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "title": "Coffee Shop Scene",
                "created_at": "2024-01-01T12:00:00Z"
            }
        }

class ScriptAnalysisResponse(BaseModel):
    """Model for complete script analysis including budget and queries"""
    script: ScriptInDB
    budget_model: BudgetResponse = Field(..., alias="budgetModel")
    commercial_queries: List[CommercialQueryResponse] = Field(..., alias="commercialQueries")
    saved_at: datetime = Field(..., alias="savedAt")

    class Config:
        populate_by_name = True