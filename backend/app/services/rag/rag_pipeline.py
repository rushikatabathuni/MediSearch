import chromadb
from chromadb.config import Settings as ChromaSettings
from transformers import AutoTokenizer, AutoModel
import torch
from typing import List, Dict, Tuple, Optional
import logging
from pathlib import Path
import re
import numpy as np
from rank_bm25 import BM25Okapi

from app.core.config import settings
from app.services.llm.groq_client import GroqClient
from app.models.schemas import SearchRequest, SourceEvidence, SearchFilters, DateRange, SourceType

logger = logging.getLogger(__name__)

class RAGPipeline:
    """RAG pipeline with Hybrid Search (BM25 + Semantic)"""
    
    def __init__(self):
        # Initialize ChromaDB
        chroma_path = Path(settings.CHROMADB_PATH)
        if not chroma_path.exists():
            raise FileNotFoundError(f"ChromaDB path not found: {chroma_path}")
        
        self.chroma_client = chromadb.PersistentClient(
            path=str(chroma_path),
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        
        try:
            self.collection = self.chroma_client.get_collection(settings.CHROMADB_COLLECTION)
            logger.info(f"Connected to ChromaDB: {settings.CHROMADB_COLLECTION}")
            logger.info(f"Collection size: {self.collection.count()} documents")
        except Exception as e:
            logger.error(f"Failed to get ChromaDB collection: {e}")
            raise
        
        # Initialize PubMedBERT
        logger.info("Loading PubMedBERT...")
        self.tokenizer = AutoTokenizer.from_pretrained(
            "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract"
        )
        self.embedding_model = AutoModel.from_pretrained(
            "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract"
        )
        self.device = torch.device('cpu')
        self.embedding_model = self.embedding_model.to(self.device)
        self.embedding_model.eval()
        logger.info("PubMedBERT loaded")
        
        # Initialize LLM
        self.llm_client = GroqClient()
        
        # Build BM25 index for keyword search
        logger.info("Building BM25 index...")
        self.build_bm25_index()
        
        logger.info("RAG Pipeline initialized with Hybrid Search")
    
    def build_bm25_index(self):
        """Build BM25 index for keyword matching"""
        try:
            results = self.collection.get(
                limit=100000,
                include=['documents', 'metadatas']
            )
            
            self.bm25_docs = results['documents']
            self.bm25_ids = results['ids']
            self.bm25_metadatas = results['metadatas']
            
            # Tokenize for BM25
            tokenized_docs = [doc.lower().split() for doc in self.bm25_docs]
            self.bm25_index = BM25Okapi(tokenized_docs)
            
            logger.info(f"BM25 index built with {len(self.bm25_docs)} documents")
        except Exception as e:
            logger.error(f"Failed to build BM25 index: {e}")
            self.bm25_index = None
    
    def expand_query(self, query: str) -> str:
        """Expand medical query with synonyms"""
        expansions = {
            'diabetes': 'diabetes mellitus diabetic hyperglycemia glucose insulin',
            'statin': 'statin atorvastatin simvastatin lipid cholesterol',
            'elderly': 'elderly older geriatric aged senior',
            'efficacy': 'efficacy effectiveness outcome benefit',
            'covid': 'covid-19 sars-cov-2 coronavirus pandemic',
            'vaccine': 'vaccine vaccination immunization',
            'hypertension': 'hypertension blood pressure cardiovascular',
            'cancer': 'cancer tumor neoplasm malignancy oncology',
        }
        
        query_lower = query.lower()
        expanded_terms = []
        for term, expansion in expansions.items():
            if term in query_lower:
                expanded_terms.append(expansion)
        
        if expanded_terms:
            return f"{query} {' '.join(expanded_terms)}"
        return query
    
    def generate_query_embedding(self, query: str) -> List[float]:
        """Generate query embedding with expansion"""
        expanded_query = self.expand_query(query)
        
        try:
            with torch.no_grad():
                encoded = self.tokenizer(
                    expanded_query,
                    padding=True,
                    truncation=True,
                    max_length=512,
                    return_tensors='pt'
                )
                
                input_ids = encoded['input_ids'].to(self.device)
                attention_mask = encoded['attention_mask'].to(self.device)
                
                outputs = self.embedding_model(
                    input_ids=input_ids,
                    attention_mask=attention_mask
                )
                
                embedding = outputs.last_hidden_state[:, 0, :].cpu().numpy()[0]
                
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
    
    def hybrid_search(
        self,
        query: str,
        query_embedding: List[float],
        top_k: int = 50
    ) -> List[SourceEvidence]:
        """Hybrid search: BM25 (70%) + Semantic (30%) with threshold filtering"""
        
        # 1. BM25 keyword search
        bm25_scores = {}
        if self.bm25_index:
            query_tokens = query.lower().split()
            scores = self.bm25_index.get_scores(query_tokens)
            
            # Get top 100 from BM25
            top_indices = np.argsort(scores)[-100:][::-1]
            for idx in top_indices:
                if scores[idx] > 0:
                    bm25_scores[self.bm25_ids[idx]] = scores[idx]
            
            logger.info(f"BM25 found {len(bm25_scores)} matches")
        
        # 2. Semantic search
        semantic_results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=100,
            include=['metadatas', 'documents', 'distances']
        )
        
        semantic_scores = {}
        semantic_data = {}
        for i in range(len(semantic_results['ids'][0])):
            doc_id = semantic_results['ids'][0][i]
            distance = semantic_results['distances'][0][i]
            similarity = max(0, 1 - distance)
            semantic_scores[doc_id] = similarity
            semantic_data[doc_id] = {
                'metadata': semantic_results['metadatas'][0][i],
                'document': semantic_results['documents'][0][i]
            }
        
        logger.info(f"Semantic search found {len(semantic_scores)} matches")
        
        # 3. Combine scores (BM25 70%, Semantic 30%)
        all_doc_ids = set(bm25_scores.keys()) | set(semantic_scores.keys())
        combined_scores = {}
        
        # Normalize BM25 scores
        max_bm25 = max(bm25_scores.values()) if bm25_scores else 1
        
        for doc_id in all_doc_ids:
            bm25_score = (bm25_scores.get(doc_id, 0) / max_bm25) * 0.7
            sem_score = semantic_scores.get(doc_id, 0) * 0.3
            combined_scores[doc_id] = bm25_score + sem_score
        
        # 4. Sort and filter by threshold (0.3 = 30%)
        sorted_ids = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)
        filtered_ids = [(doc_id, score) for doc_id, score in sorted_ids if score >= 0.3][:top_k]
        
        logger.info(f"Hybrid: {len(filtered_ids)} docs above 0.3 threshold (from {len(sorted_ids)} total)")
        
        # 5. Build SourceEvidence objects
        sources = []
        for doc_id, score in filtered_ids:
            # Get metadata
            if doc_id in semantic_data:
                metadata = semantic_data[doc_id]['metadata']
                document = semantic_data[doc_id]['document']
            else:
                # From BM25 only
                idx = self.bm25_ids.index(doc_id)
                metadata = self.bm25_metadatas[idx]
                document = self.bm25_docs[idx]
            
            paper_id = doc_id.split('_chunk_')[0] if '_chunk_' in doc_id else doc_id
            title = metadata.get('title', paper_id.replace('_', ' ').title())
            
            source = SourceEvidence(
                paper_id=paper_id,
                title=title,
                relevance_score=float(score),
                chunk_text=document[:500] + "..." if len(document) > 500 else document,
                source=metadata.get('source', 'unknown'),
                metadata=metadata
            )
            sources.append(source)
        
        return sources
    
    def apply_filters(self, sources: List[SourceEvidence], filters: Optional[SearchFilters]) -> List[SourceEvidence]:
        """Apply filters"""
        if not filters:
            return sources
        
        filtered = sources
        
        if filters.source_types and SourceType.ALL not in filters.source_types:
            filtered = [s for s in filtered if s.source in [st.value for st in filters.source_types]]
        
        if filters.date_range:
            filtered = self._filter_by_date(filtered, filters.date_range)
        
        if filters.mesh_terms:
            filtered = self._filter_by_mesh_terms(filtered, filters.mesh_terms)
        
        logger.info(f"Filtered {len(sources)} → {len(filtered)}")
        return filtered

    def _filter_by_date(self, sources: List[SourceEvidence], date_range: DateRange) -> List[SourceEvidence]:
        """Filter by date"""
        filtered = []
        for source in sources:
            pub_date = source.metadata.get('publication_date', '')
            if not pub_date:
                continue
            
            year_match = re.search(r'\b(19|20)\d{2}\b', str(pub_date))
            if not year_match:
                continue
            
            year = int(year_match.group(0))
            
            if date_range.start_date:
                start_year = int(date_range.start_date[:4])
                if year < start_year:
                    continue
            
            if date_range.end_date:
                end_year = int(date_range.end_date[:4])
                if year > end_year:
                    continue
            
            filtered.append(source)
        
        return filtered

    def _filter_by_mesh_terms(self, sources: List[SourceEvidence], mesh_terms: List[str]) -> List[SourceEvidence]:
        """Filter by MeSH"""
        filtered = []
        mesh_lower = [m.lower() for m in mesh_terms]
        
        for source in sources:
            source_mesh = source.metadata.get('mesh_terms', [])
            if not source_mesh:
                continue
            
            source_mesh_str = str(source_mesh).lower()
            
            if any(mesh in source_mesh_str for mesh in mesh_lower):
                filtered.append(source)
        
        return filtered
    
    def build_rag_context(self, sources: List[SourceEvidence], max_length: int = 2048) -> str:
        """Build context"""
        context_parts = []
        current_length = 0
        
        for idx, source in enumerate(sources, 1):
            chunk_text = f"[Source {idx} - {source.title[:80]}]\n{source.chunk_text}\n"
            chunk_length = len(chunk_text.split())
            
            if current_length + chunk_length > max_length:
                break
            
            context_parts.append(chunk_text)
            current_length += chunk_length
        
        context = "\n".join(context_parts)
        logger.info(f"Built context: {current_length} words from {len(context_parts)} sources")
        return context
        

    async def generate_answer(
        self,
        query: str,
        context: str,
        temperature: float = 0.3
    ) -> str:
        """Generate concise, well-formatted answer"""
        
        system_prompt = """You are a medical research assistant. Provide CONCISE answers in this format:

    ### Summary
    [2-3 sentence direct answer to the query]

    ### Key Findings
    - **Finding 1:** Brief description [1][2]
    - **Finding 2:** Brief description [3]
    - **Finding 3:** Brief description [4][5]

    ### Research Details
    [Optional: Mention study types, populations, or methodological details if relevant]

    CRITICAL RULES:
    - ONLY use information from provided sources
    - Cite EVERY statement with [1], [2], etc.
    - If sources don't match query: State clearly in 1-2 sentences
    - NO phrases like "Assessing relevance" or "Sources that discuss"
    - Get straight to the answer"""

        user_prompt = f"""Query: {query}

    Sources:
    {context}

    Provide a concise answer following the format above. Cite everything.

    Answer:"""
        
        try:
            answer = await self.llm_client.generate(
                prompt=user_prompt,
                system_prompt=system_prompt,
                max_tokens=700,
                temperature=temperature
            )
            return answer.strip()
        except Exception as e:
            logger.error(f"Error generating answer: {e}")
            raise


    
    async def search(self, request: SearchRequest) -> Tuple[str, List[SourceEvidence]]:
        """Execute RAG search with hybrid retrieval"""
        logger.info(f"Search: {request.query}")
        
        try:
            query_embedding = self.generate_query_embedding(request.query)
            
            # Hybrid search
            sources = self.hybrid_search(
                query=request.query,
                query_embedding=query_embedding,
                top_k=request.top_k
            )
            
            if not sources:
                return "No relevant information found.", []
            
            # Check top score
            top_score = sources[0].relevance_score
            if top_score < 0.4:
                return f"No highly relevant sources found. Best match: {top_score:.2f}. Try different terms.", sources[:3]
            
            # Apply filters
            if request.filters:
                sources = self.apply_filters(sources, request.filters)
            
            # Generate answer
            context = self.build_rag_context(sources, settings.MAX_CONTEXT_LENGTH)
            answer = await self.generate_answer(
                query=request.query,
                context=context,
                temperature=0.3
            )
            
            logger.info(f"Complete: {len(sources)} sources, top: {top_score:.3f}")
            return answer, sources
            
        except Exception as e:
            logger.error(f"Search error: {e}")
            raise
