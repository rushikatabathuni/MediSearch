import bibtexparser
from typing import List, Dict
from app.models.schemas import CitationFormat
import logging

logger = logging.getLogger(__name__)

class CitationService:
    
    @staticmethod
    def format_citation(source: Dict, format: CitationFormat) -> str:
        """Format single source citation"""
        
        if format == CitationFormat.BIBTEX:
            return CitationService._format_bibtex(source)
        elif format == CitationFormat.APA:
            return CitationService._format_apa(source)
        elif format == CitationFormat.JSON:
            return CitationService._format_json(source)
        else:
            raise ValueError(f"Unsupported citation format: {format}")
    
    @staticmethod
    def _format_bibtex(source: Dict) -> str:
        """Format as BibTeX"""
        paper_id = source.get('paper_id', 'unknown')
        title = source.get('title', 'Untitled')
        authors = source.get('metadata', {}).get('authors', ['Unknown Author'])
        journal = source.get('metadata', {}).get('journal', '')
        year = CitationService._extract_year(source.get('metadata', {}).get('publication_date', ''))
        
        # Create BibTeX entry
        entry = f"""@article{{{paper_id},
    title = {{{title}}},
    author = {{{' and '.join(authors) if isinstance(authors, list) else authors}}},
    journal = {{{journal}}},
    year = {{{year}}},
    source = {{{source.get('source', '')}}}
}}"""
        return entry
    
    @staticmethod
    def _format_apa(source: Dict) -> str:
        """Format as APA 7th edition"""
        metadata = source.get('metadata', {})
        
        # Authors
        authors = metadata.get('authors', ['Unknown Author'])
        if isinstance(authors, list):
            if len(authors) == 1:
                author_str = authors[0]
            elif len(authors) == 2:
                author_str = f"{authors[0]} & {authors[1]}"
            else:
                author_str = f"{', '.join(authors[:-1])}, & {authors[-1]}"
        else:
            author_str = str(authors)
        
        # Year
        year = CitationService._extract_year(metadata.get('publication_date', ''))
        
        # Title
        title = source.get('title', 'Untitled')
        
        # Journal
        journal = metadata.get('journal', '')
        
        # Format APA citation
        citation = f"{author_str} ({year}). {title}. {journal}."
        return citation
    
    @staticmethod
    def _format_json(source: Dict) -> str:
        """Format as JSON"""
        import json
        return json.dumps(source, indent=2)
    
    @staticmethod
    def _extract_year(date_string: str) -> str:
        """Extract year from date string"""
        if not date_string:
            return "n.d."
        
        # Try to extract 4-digit year
        import re
        year_match = re.search(r'\b(19|20)\d{2}\b', str(date_string))
        if year_match:
            return year_match.group(0)
        
        return "n.d."
    
    @staticmethod
    def format_multiple_citations(sources: List[Dict], format: CitationFormat) -> str:
        """Format multiple citations"""
        citations = []
        
        for source in sources:
            try:
                citation = CitationService.format_citation(source, format)
                citations.append(citation)
            except Exception as e:
                logger.error(f"Error formatting citation: {e}")
                continue
        
        if format == CitationFormat.JSON:
            import json
            return json.dumps(sources, indent=2)
        else:
            return "\n\n".join(citations)
