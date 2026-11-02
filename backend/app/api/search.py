from typing import Optional
from fastapi import APIRouter, Query
from app.pipeline.stage5_indexer import perform_search
from app.models.schemas import SearchResponse

router = APIRouter(tags=["Search API"])

@router.get("/search", response_model=SearchResponse)
async def search_documents(
    q: str = Query(default="", description="Search query string"),
    mode: str = Query(default="semantic", description="Search mode: 'keyword' or 'semantic'"),
    format: Optional[str] = Query(default="ALL", description="Filter by format"),
    status: Optional[str] = Query(default="ALL", description="Filter by validation status")
):
    """
    Search API: Queries SQLite via Exact Keyword matching or
    High-Dimensional AI Semantic Vector Cosine Similarity.
    """
    results = perform_search(
        query=q, 
        mode=mode, 
        format_filter=format or "ALL", 
        status_filter=status or "ALL"
    )

    return SearchResponse(
        query=q,
        mode=mode,
        totalMatches=len(results),
        results=results
    )

