from app.agents.clinical_expert import ClinicalExpertAgent
from app.agents.statistical_validator import StatisticalValidatorAgent
from app.agents.contradiction_detector import ContradictionDetectorAgent
from app.models.schemas import MultiAgentValidation, SourceEvidence
import asyncio
import logging
from typing import List

logger = logging.getLogger(__name__)

class MultiAgentValidator:
    """Orchestrates multi-agent validation"""
    
    def __init__(self):
        self.clinical_expert = ClinicalExpertAgent()
        self.statistical_validator = StatisticalValidatorAgent()
        self.contradiction_detector = ContradictionDetectorAgent()
    
    async def validate(self, answer: str, sources: List[SourceEvidence]) -> MultiAgentValidation:
        """Run all validation agents in parallel"""
        
        logger.info("Starting multi-agent validation")
        
        # Convert sources to dict format for agents
        source_dicts = [
            {
                'title': s.title,
                'source': s.source,
                'relevance': s.relevance_score
            }
            for s in sources
        ]
        
        try:
            # Run all agents in parallel
            clinical, statistical, contradiction = await asyncio.gather(
                self.clinical_expert.validate(answer, source_dicts),
                self.statistical_validator.validate(answer, source_dicts),
                self.contradiction_detector.validate(answer, source_dicts)
            )
            
            # Calculate overall confidence
            overall_confidence = (
                clinical.confidence * 0.4 +
                statistical.confidence * 0.3 +
                contradiction.confidence * 0.3
            )
            
            logger.info(f"Validation complete. Overall confidence: {overall_confidence:.2f}")
            
            return MultiAgentValidation(
                clinical_expert=clinical,
                statistical_validator=statistical,
                contradiction_detector=contradiction,
                overall_confidence=overall_confidence
            )
            
        except Exception as e:
            logger.error(f"Validation error: {e}")
            # Return default scores on error
            from app.models.schemas import ClinicalValidation, StatisticalValidation, ContradictionAnalysis
            
            return MultiAgentValidation(
                clinical_expert=ClinicalValidation(
                    confidence=0.5,
                    reasoning="Validation incomplete",
                    flags=["error"],
                    clinical_relevance=0.5,
                    safety_concerns=[]
                ),
                statistical_validator=StatisticalValidation(
                    confidence=0.5,
                    reasoning="Validation incomplete",
                    flags=["error"],
                    statistical_score=0.5,
                    methodology_notes=""
                ),
                contradiction_detector=ContradictionAnalysis(
                    confidence=0.5,
                    reasoning="Validation incomplete",
                    flags=["error"],
                    contradiction_level="unknown",
                    conflicting_sources=[]
                ),
                overall_confidence=0.5
            )
