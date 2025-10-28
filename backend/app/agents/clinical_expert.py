from app.services.llm.groq_client import GroqClient
from app.models.schemas import ClinicalValidation
import logging
from typing import List

logger = logging.getLogger(__name__)

class ClinicalExpertAgent:
    """Clinical Expert validation agent"""
    
    def __init__(self):
        self.llm_client = GroqClient()
    
    async def validate(self, answer: str, sources: List[dict]) -> ClinicalValidation:
        """Validate clinical relevance and safety"""
        
        system_prompt = """You are a senior clinical medical expert. Evaluate the clinical validity of medical information.
Focus on:
1. Clinical relevance and applicability
2. Patient safety considerations
3. Evidence quality from clinical perspective
4. Practical clinical implications

Provide scores between 0.0-1.0 and clear reasoning."""

        source_summary = "\n".join([
            f"- {s.get('title', 'Unknown')[:80]}" for s in sources[:5]
        ])

        prompt = f"""Evaluate this medical answer from a clinical perspective:

Answer: {answer}

Sources:
{source_summary}

Provide:
1. Clinical Relevance Score (0.0-1.0)
2. Overall Confidence Score (0.0-1.0)
3. Safety Concerns (list any, or "None identified")
4. Clinical Reasoning (brief explanation)

Format:
CLINICAL_RELEVANCE: [score]
CONFIDENCE: [score]
SAFETY_CONCERNS: [list or "None identified"]
REASONING: [explanation]"""

        try:
            response = await self.llm_client.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                max_tokens=400,
                temperature=0.3
            )
            
            # Parse response
            lines = response.split('\n')
            clinical_relevance = 0.7
            confidence = 0.7
            safety_concerns = []
            reasoning = "Clinical evaluation completed."
            
            for line in lines:
                if 'CLINICAL_RELEVANCE:' in line.upper():
                    try:
                        clinical_relevance = float(line.split(':')[1].strip())
                    except:
                        pass
                elif 'CONFIDENCE:' in line.upper():
                    try:
                        confidence = float(line.split(':')[1].strip())
                    except:
                        pass
                elif 'SAFETY_CONCERNS:' in line.upper():
                    concerns = line.split(':')[1].strip()
                    if concerns.lower() not in ['none', 'none identified', '']:
                        safety_concerns = [concerns]
                elif 'REASONING:' in line.upper():
                    reasoning = line.split(':')[1].strip()
            
            return ClinicalValidation(
                confidence=max(0.0, min(1.0, confidence)),
                reasoning=reasoning,
                flags=[],
                clinical_relevance=max(0.0, min(1.0, clinical_relevance)),
                safety_concerns=safety_concerns
            )
            
        except Exception as e:
            logger.error(f"Clinical validation error: {e}")
            return ClinicalValidation(
                confidence=0.5,
                reasoning="Validation partially completed",
                flags=["validation_error"],
                clinical_relevance=0.5,
                safety_concerns=[]
            )
