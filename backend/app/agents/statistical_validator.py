from app.services.llm.groq_client import GroqClient
from app.models.schemas import StatisticalValidation
import logging
from typing import List

logger = logging.getLogger(__name__)

class StatisticalValidatorAgent:
    """Statistical methodology validation agent"""
    
    def __init__(self):
        self.llm_client = GroqClient()
    
    async def validate(self, answer: str, sources: List[dict]) -> StatisticalValidation:
        """Validate statistical methodology and evidence quality"""
        
        system_prompt = """You are a biostatistics expert. Evaluate the statistical validity of medical research.
Focus on:
1. Statistical methodology quality
2. Sample size adequacy
3. P-value and confidence interval interpretation
4. Study design appropriateness

Provide scores between 0.0-1.0 and clear reasoning."""

        source_summary = "\n".join([
            f"- {s.get('title', 'Unknown')[:80]}" for s in sources[:5]
        ])

        prompt = f"""Evaluate the statistical quality of this medical answer:

Answer: {answer}

Sources:
{source_summary}

Provide:
1. Statistical Score (0.0-1.0) - quality of statistical methods
2. Overall Confidence (0.0-1.0)
3. Methodology Notes (concerns or strengths)
4. Reasoning

Format:
STATISTICAL_SCORE: [score]
CONFIDENCE: [score]
METHODOLOGY_NOTES: [notes]
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
            statistical_score = 0.7
            confidence = 0.7
            methodology_notes = "Statistical evaluation completed."
            reasoning = "Analysis based on available evidence."
            
            for line in lines:
                if 'STATISTICAL_SCORE:' in line.upper():
                    try:
                        statistical_score = float(line.split(':')[1].strip())
                    except:
                        pass
                elif 'CONFIDENCE:' in line.upper():
                    try:
                        confidence = float(line.split(':')[1].strip())
                    except:
                        pass
                elif 'METHODOLOGY_NOTES:' in line.upper():
                    methodology_notes = line.split(':')[1].strip()
                elif 'REASONING:' in line.upper():
                    reasoning = line.split(':')[1].strip()
            
            return StatisticalValidation(
                confidence=max(0.0, min(1.0, confidence)),
                reasoning=reasoning,
                flags=[],
                statistical_score=max(0.0, min(1.0, statistical_score)),
                methodology_notes=methodology_notes
            )
            
        except Exception as e:
            logger.error(f"Statistical validation error: {e}")
            return StatisticalValidation(
                confidence=0.5,
                reasoning="Validation partially completed",
                flags=["validation_error"],
                statistical_score=0.5,
                methodology_notes="Statistical evaluation encountered issues"
            )
