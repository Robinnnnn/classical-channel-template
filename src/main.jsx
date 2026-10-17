import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { loadPlaylist } from './data/tracks'
import './styles/global.css'

const { tracks, error } = await loadPlaylist()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App tracks={tracks} playlistError={error} />
    </BrowserRouter>
  </StrictMode>,
)
