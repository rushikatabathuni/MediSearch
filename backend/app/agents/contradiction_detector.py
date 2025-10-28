from app.services.llm.groq_client import GroqClient
from app.models.schemas import ContradictionAnalysis
import logging
from typing import List

logger = logging.getLogger(__name__)

class ContradictionDetectorAgent:
    """Contradiction detection agent"""
    
    def __init__(self):
        self.llm_client = GroqClient()
    
    async def validate(self, answer: str, sources: List[dict]) -> ContradictionAnalysis:
        """Detect contradictions across sources"""
        
        system_prompt = """You are an expert at analyzing medical literature for contradictions and conflicts.
Focus on:
1. Conflicting findings across studies
2. Contradictory conclusions
3. Inconsistent evidence
4. Consensus vs disagreement

Rate contradiction level as: low, medium, or high."""

        source_summary = "\n".join([
            f"- {s.get('title', 'Unknown')[:80]}" for s in sources[:5]
        ])

        prompt = f"""Analyze potential contradictions in this medical information:

Answer: {answer}

Sources:
{source_summary}

Provide:
1. Contradiction Level (low/medium/high)
2. Confidence Score (0.0-1.0)
3. Conflicting Sources (if any, or "None identified")
4. Reasoning

Format:
CONTRADICTION_LEVEL: [low/medium/high]
CONFIDENCE: [score]
CONFLICTING_SOURCES: [list or "None identified"]
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
            contradiction_level = "low"
            confidence = 0.8
            conflicting_sources = []
            reasoning = "No significant contradictions detected."
            
            for line in lines:
                if 'CONTRADICTION_LEVEL:' in line.upper():
                    level = line.split(':')[1].strip().lower()
                    if level in ['low', 'medium', 'high']:
                        contradiction_level = level
                elif 'CONFIDENCE:' in line.upper():
                    try:
                        confidence = float(line.split(':')[1].strip())
                    except:
                        pass
                elif 'CONFLICTING_SOURCES:' in line.upper():
                    conflicts = line.split(':')[1].strip()
                    if conflicts.lower() not in ['none', 'none identified', '']:
                        conflicting_sources = [conflicts]
                elif 'REASONING:' in line.upper():
                    reasoning = line.split(':')[1].strip()
            
            return ContradictionAnalysis(
                confidence=max(0.0, min(1.0, confidence)),
                reasoning=reasoning,
                flags=[],
                contradiction_level=contradiction_level,
                conflicting_sources=conflicting_sources
            )
            
        except Exception as e:
            logger.error(f"Contradiction detection error: {e}")
            return ContradictionAnalysis(
                confidence=0.5,
                reasoning="Analysis partially completed",
                flags=["validation_error"],
                contradiction_level="unknown",
                conflicting_sources=[]
            )
