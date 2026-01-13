from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, HttpUrl
from urllib.parse import urlparse
from newspaper import Article
from newspaper.article import ArticleException

app = FastAPI()

# TODO: for production, restrict allow_origins to your frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    url: HttpUrl


@app.post("/analyze")
async def analyze_url(payload: AnalyzeRequest):
    # only accept https URLs
    if payload.url.scheme != "https":
        raise HTTPException(
            status_code=400,
            detail="Invalid URL. Only HTTPS is allowed (use format: https://example.com/path)",
        )

    return {
        "status": "ok",
        "message": "lets go...",
        "url": str(payload.url),
    }


class ScrapeRequest(BaseModel):
    url: HttpUrl


class ScrapeResult(BaseModel):
    title: str | None = None
    publish_date: str | None = None
    author: str | None = None
    text: str
    source: str


def scrape_article_sync(url: str) -> ScrapeResult:
    article = Article(url)
    try:
        article.download()
        article.parse()
    except ArticleException as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to download/parse article: {e}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected scrape error: {e}",
        )

    if not article.text or not article.text.strip():
        raise HTTPException(status_code=400, detail="Article text is empty")

    return ScrapeResult(
        title=article.title or None,
        publish_date=article.publish_date.isoformat() if article.publish_date else None,
        author=", ".join(article.authors) if article.authors else None,
        text=article.text.strip(),
        source=urlparse(url).netloc,
    )


@app.post("/scrape", response_model=ScrapeResult)
async def scrape_endpoint(payload: ScrapeRequest):
    # reuse the same HTTPS-only rule if you want strict URLs
    if payload.url.scheme != "https":
        raise HTTPException(
            status_code=400,
            detail="Invalid URL. Only HTTPS is allowed (use format: https://example.com/path)",
        )

    return await run_in_threadpool(scrape_article_sync, str(payload.url))
