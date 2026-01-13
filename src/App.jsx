import { useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const url = formData.get('url')?.toString().trim()

    if (!url) {
      setIsError(true)
      setMessage('Please enter a URL in the format: https://example.com')
      return
    }

    const isHttps = /^https:\/\//i.test(url)

    if (isHttps) {
      setIsError(false)
      setMessage('lets go...')
      // You can add your navigation or further logic here
    } else {
      setIsError(true)
      setMessage('Invalid URL. Use format: https://example.com')
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
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
      {message && (
        <p className={isError ? 'message error' : 'message success'}>{message}</p>
      )}
    </div>
  )
}

export default App
