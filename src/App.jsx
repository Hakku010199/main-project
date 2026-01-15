import { useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [article, setArticle] = useState(null)
  const [rawResult, setRawResult] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [authMode, setAuthMode] = useState(null) // 'signin' | 'signup' | null

  const handleSubmit = async (event) => {
    event.preventDefault()
    setHasSubmitted(true)
    const formData = new FormData(event.currentTarget)
    const url = formData.get('url')?.toString().trim()

    setArticle(null)
    setRawResult(null)
    setAnalysis(null)

    if (!url) {
      setIsError(true)
      setMessage('Please enter a URL in the format: https://example.com')
      return
    }

    const isHttps = /^https:\/\//i.test(url)

    if (!isHttps) {
      setIsError(true)
      setMessage('Invalid URL. Use format: https://example.com')
      return
    }

    try {
      setIsLoading(true)
      setIsError(false)
      setMessage('Analyzing article...')

      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const detail = data && (data.detail || data.message)
        setIsError(true)
        setMessage(detail || 'Backend returned an error while analyzing the article.')
        return
      }

      setIsError(false)
      setMessage('Analysis complete.')
      setRawResult(data)
      setArticle(data.article || null)
      setAnalysis(data.analysis || null)
    } catch (error) {
      setIsError(true)
      setMessage('Could not reach backend. Make sure the server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="page"
      style={hasSubmitted ? { backgroundColor: 'rgb(201, 242, 232)' } : undefined}
    >
      <header className="app-header">
        <div className="app-header-left">
          VERITAS AI
          <p className="app-tagline">
            Veritas AI is a web-based assistant that helps users quickly understand the credibility and bias of online news articles. By taking a news URL as input, it automatically scrapes the page, extracts the main article text, and runs basic analysis to summarize key properties of the content. This makes Veritas AI a helpful companion for anyone who wants to read the news more critically and make better-informed judgments about what they consume online.
          </p>
        </div>
        <div className="app-header-right">
          <button
            type="button"
            className={authMode === 'signin' ? 'auth-toggle active' : 'auth-toggle'}
            onClick={() => setAuthMode(authMode === 'signin' ? null : 'signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={authMode === 'signup' ? 'auth-toggle active' : 'auth-toggle'}
            onClick={() => setAuthMode(authMode === 'signup' ? null : 'signup')}
          >
            Sign Up
          </button>
        </div>
      </header>
      <div className="app-container">
        {authMode && (
          <div className="auth-panel">
            <h2>{authMode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
            <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
              {authMode === 'signup' && (
                <div className="auth-field">
                  <label htmlFor="name">Name</label>
                  <input id="name" type="text" placeholder="Enter your name" />
                </div>
              )}
              <div className="auth-field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" placeholder="Enter your password" />
              </div>
              {authMode === 'signup' && (
                <div className="auth-field">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                  />
                </div>
              )}
              <button type="submit" className="auth-submit">
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        )}

        {(article || analysis) && (
          <div className="results-row">
            {article && (
              <div className="article-result">
                <h2>{article.title || 'No title found'}</h2>
                <p className="article-source">Source: {article.source}</p>
                <pre className="article-text">
                  {article.text}
                </pre>
              </div>
            )}

            {analysis && (
              <div className="article-result">
                <h2>Analysis</h2>
                <p>Word count: {analysis.word_count}</p>
                <p>Character count: {analysis.char_count}</p>
                <p>
                  Length: {analysis.is_long_article ? 'Long article' : 'Short article'}
                </p>
              </div>
            )}
          </div>
        )}

        {rawResult && (
          <div className="article-result">
            <h2>Raw backend response</h2>
            <pre className="article-text">
              {JSON.stringify(rawResult, null, 2)}
            </pre>
          </div>
        )}

        <h1>Review the News</h1>
        <form className="url-form" onSubmit={handleSubmit}>
          <input
            type="url"
            name="url"
            className="url-input"
            placeholder="Enter a URL (https://example.com)"
            required
          />
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Submit'}
          </button>
        </form>
        {message && (
          <p className={isError ? 'message error' : 'message success'}>{message}</p>
        )}
      </div>
    </div>
  )
}

export default App
