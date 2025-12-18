"""
AI Detection Service for Commercial Query Detection
Uses rule-based logic with predefined commercial terms
"""
import re
from typing import List, Dict, Set, Tuple
from datetime import datetime
import uuid

from ..models.script import ScriptParams, CreativeFlexibility
from ..models.commercial_query import CommercialQueryInDB, QueryType, QueryStatus


# Commercial Terms Database
COMMERCIAL_TERMS = [
    # Products
    {"term": "coffee", "type": QueryType.PRODUCT, "reason": "CPG category; high advertiser demand", "base_revenue": 5000, "base_confidence": 85},
    {"term": "laptop", "type": QueryType.PRODUCT, "reason": "Tech product; premium sponsorship potential", "base_revenue": 8000, "base_confidence": 90},
    {"term": "smartphone", "type": QueryType.PRODUCT, "reason": "Tech product; high-value category", "base_revenue": 10000, "base_confidence": 92},
    {"term": "phone", "type": QueryType.PRODUCT, "reason": "Tech product; high-value category", "base_revenue": 9000, "base_confidence": 88},
    {"term": "car", "type": QueryType.PRODUCT, "reason": "Automotive; premium sponsorship", "base_revenue": 15000, "base_confidence": 88},
    {"term": "vehicle", "type": QueryType.PRODUCT, "reason": "Automotive; premium sponsorship", "base_revenue": 14000, "base_confidence": 86},
    {"term": "watch", "type": QueryType.PRODUCT, "reason": "Luxury goods; high-value placement", "base_revenue": 12000, "base_confidence": 89},
    {"term": "sneakers", "type": QueryType.PRODUCT, "reason": "Fashion/athletic; strong brand partnerships", "base_revenue": 7000, "base_confidence": 84},
    {"term": "shoes", "type": QueryType.PRODUCT, "reason": "Fashion/athletic; strong brand partnerships", "base_revenue": 6500, "base_confidence": 82},
    {"term": "beer", "type": QueryType.PRODUCT, "reason": "Beverage; established product placement", "base_revenue": 8500, "base_confidence": 87},
    {"term": "wine", "type": QueryType.PRODUCT, "reason": "Beverage; premium brand opportunities", "base_revenue": 7500, "base_confidence": 85},
    {"term": "soda", "type": QueryType.PRODUCT, "reason": "Beverage; major brand category", "base_revenue": 6000, "base_confidence": 86},
    
    # Environments
    {"term": "kitchen", "type": QueryType.ENVIRONMENT, "reason": "Home setting; appliance/food brands", "base_revenue": 6000, "base_confidence": 80},
    {"term": "office", "type": QueryType.ENVIRONMENT, "reason": "Workplace setting; B2B opportunities", "base_revenue": 7000, "base_confidence": 82},
    {"term": "gym", "type": QueryType.ENVIRONMENT, "reason": "Fitness setting; health/wellness brands", "base_revenue": 6500, "base_confidence": 85},
    {"term": "restaurant", "type": QueryType.ENVIRONMENT, "reason": "Dining setting; food/beverage brands", "base_revenue": 5500, "base_confidence": 83},
    {"term": "cafe", "type": QueryType.ENVIRONMENT, "reason": "Dining setting; food/beverage brands", "base_revenue": 5000, "base_confidence": 81},
    {"term": "store", "type": QueryType.ENVIRONMENT, "reason": "Retail setting; multiple brand categories", "base_revenue": 7500, "base_confidence": 84},
    {"term": "mall", "type": QueryType.ENVIRONMENT, "reason": "Retail setting; multiple brand categories", "base_revenue": 8000, "base_confidence": 85},
    {"term": "airport", "type": QueryType.ENVIRONMENT, "reason": "Travel setting; premium brand opportunities", "base_revenue": 9000, "base_confidence": 86},
    {"term": "hotel", "type": QueryType.ENVIRONMENT, "reason": "Hospitality setting; luxury brand placement", "base_revenue": 8500, "base_confidence": 84},
    
    # Situations
    {"term": "wedding", "type": QueryType.SITUATION, "reason": "Life event; multiple brand categories", "base_revenue": 9000, "base_confidence": 87},
    {"term": "travel", "type": QueryType.SITUATION, "reason": "Tourism/hospitality opportunities", "base_revenue": 8500, "base_confidence": 86},
    {"term": "vacation", "type": QueryType.SITUATION, "reason": "Tourism/hospitality opportunities", "base_revenue": 8000, "base_confidence": 85},
    {"term": "party", "type": QueryType.SITUATION, "reason": "Social event; food/beverage/entertainment", "base_revenue": 6000, "base_confidence": 82},
    {"term": "meeting", "type": QueryType.SITUATION, "reason": "Business setting; B2B opportunities", "base_revenue": 5500, "base_confidence": 80},
    {"term": "date", "type": QueryType.SITUATION, "reason": "Social setting; lifestyle brands", "base_revenue": 5000, "base_confidence": 79},
    {"term": "shopping", "type": QueryType.SITUATION, "reason": "Retail activity; multiple brand categories", "base_revenue": 7000, "base_confidence": 83},
    
    # Thematic
    {"term": "luxury", "type": QueryType.THEMATIC, "reason": "Premium lifestyle; high-value brands", "base_revenue": 10000, "base_confidence": 88},
    {"term": "technology", "type": QueryType.THEMATIC, "reason": "Tech theme; innovation-focused brands", "base_revenue": 9500, "base_confidence": 87},
    {"term": "fashion", "type": QueryType.THEMATIC, "reason": "Style theme; apparel/accessory brands", "base_revenue": 8000, "base_confidence": 85},
    {"term": "fitness", "type": QueryType.THEMATIC, "reason": "Health theme; wellness brands", "base_revenue": 7500, "base_confidence": 84},
    {"term": "adventure", "type": QueryType.THEMATIC, "reason": "Action theme; outdoor/travel brands", "base_revenue": 8500, "base_confidence": 86},
]


def calculate_revenue_multiplier(flexibility: CreativeFlexibility) -> float:
    """
    Calculate revenue multiplier based on creative flexibility
    
    Args:
        flexibility: Creative flexibility level
        
    Returns:
        float: Revenue multiplier
    """
    multipliers = {
        CreativeFlexibility.NO_CHANGES: 0.7,
        CreativeFlexibility.MINOR_DIALOGUE_CHANGES: 1.0,
        CreativeFlexibility.SCENE_LEVEL_CHANGES: 1.3
    }
    return multipliers.get(flexibility, 1.0)


def calculate_confidence_adjustment(flexibility: CreativeFlexibility) -> int:
    """
    Calculate confidence score adjustment based on creative flexibility
    
    Args:
        flexibility: Creative flexibility level
        
    Returns:
        int: Confidence adjustment value
    """
    adjustments = {
        CreativeFlexibility.NO_CHANGES: -10,
        CreativeFlexibility.MINOR_DIALOGUE_CHANGES: 0,
        CreativeFlexibility.SCENE_LEVEL_CHANGES: 5
    }
    return adjustments.get(flexibility, 0)


def extract_excerpt(text: str, start: int, end: int, context_chars: int = 50) -> str:
    """
    Extract script excerpt with context around the matched term
    
    Args:
        text: Full script text
        start: Start index of match
        end: End index of match
        context_chars: Number of characters to include before and after
        
    Returns:
        str: Excerpt with context
    """
    # Calculate excerpt boundaries
    excerpt_start = max(0, start - context_chars)
    excerpt_end = min(len(text), end + context_chars)
    
    # Extract excerpt
    excerpt = text[excerpt_start:excerpt_end]
    
    # Add ellipsis if truncated
    if excerpt_start > 0:
        excerpt = "..." + excerpt
    if excerpt_end < len(text):
        excerpt = excerpt + "..."
    
    return excerpt


def detect_commercial_queries(script_text: str, params: ScriptParams) -> List[CommercialQueryInDB]:
    """
    Detect commercial queries in script text using rule-based logic
    
    Args:
        script_text: The script text to analyze
        params: Script parameters including creative flexibility
        
    Returns:
        List[CommercialQueryInDB]: List of detected commercial queries
    """
    queries: List[CommercialQueryInDB] = []
    detected_positions: Set[Tuple[str, int]] = set()  # Track (term, position) to avoid duplicates
    
    # Get multipliers based on creative flexibility
    revenue_multiplier = calculate_revenue_multiplier(params.creative_flexibility)
    confidence_adjustment = calculate_confidence_adjustment(params.creative_flexibility)
    
    # Search for each commercial term
    for term_data in COMMERCIAL_TERMS:
        term = term_data["term"]
        
        # Create regex pattern for whole word matching (case-insensitive)
        pattern = r'\b' + re.escape(term) + r'\b'
        
        # Find all matches
        for match in re.finditer(pattern, script_text, re.IGNORECASE):
            start_index = match.start()
            end_index = match.end()
            
            # Check if this position was already detected
            position_key = (term.lower(), start_index)
            if position_key in detected_positions:
                continue
            
            # Mark as detected
            detected_positions.add(position_key)
            
            # Calculate adjusted revenue and confidence
            estimated_revenue = term_data["base_revenue"] * revenue_multiplier
            confidence_score = term_data["base_confidence"] + confidence_adjustment
            
            # Ensure confidence is within 0-100 range
            confidence_score = max(0, min(100, confidence_score))
            
            # Extract excerpt
            script_excerpt = extract_excerpt(script_text, start_index, end_index)
            
            # Create query object
            now = datetime.utcnow()
            query = CommercialQueryInDB(
                id=str(uuid.uuid4()),
                script_id="",  # Will be set when storing in database
                term=match.group(),  # Use actual matched text (preserves case)
                type=term_data["type"],
                reason=term_data["reason"],
                estimated_revenue=round(estimated_revenue, 2),
                status=QueryStatus.PENDING,
                script_excerpt=script_excerpt,
                start_index=start_index,
                end_index=end_index,
                confidence_score=confidence_score,
                created_at=now,
                updated_at=now
            )
            
            queries.append(query)
    
    return queries