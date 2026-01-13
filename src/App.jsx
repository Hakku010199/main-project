import { useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [article, setArticle] = useState(null)
  const [rawResult, setRawResult] = useState(null)
  const [analysis, setAnalysis] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
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
    <div className="app-container">
      <h1>Submit a URL</h1>
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

      {rawResult && (
        <div className="article-result">
          <h2>Raw backend response</h2>
          <pre className="article-text">
            {JSON.stringify(rawResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default App
