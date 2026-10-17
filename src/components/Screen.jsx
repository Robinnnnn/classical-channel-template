import { CRT_CLIP_PATH } from '../constants/layout'
import { useVideoPlayer } from '../hooks/useVideoPlayer'
import { useNowPlaying } from '../hooks/useNowPlaying'
import TextChannel from './TextChannel'
import VideoChannel from './VideoChannel'
import PlaylistChannel from './PlaylistChannel'
import './Screen.css'

export default function Screen({ tracks, currentTrack, channel, isPlaying, volume, onPlay, hasInteracted, onNext, onPrev }) {
  const track = tracks[currentTrack]
  const { videoRef, iframeRef } = useVideoPlayer({ track, currentTrack, isPlaying, volume, onNext, onPrev })
  const nowPlaying = useNowPlaying({ tracks, currentTrack, isPlaying, channel })

  return (
    <div className={`screen${isPlaying ? '' : ' paused'}`}>
      {/* SVG clip-path for CRT screen curve */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="crt-clip" clipPathUnits="objectBoundingBox">
            <path d={CRT_CLIP_PATH} />
          </clipPath>
        </defs>
      </svg>

      <TextChannel track={track} active={channel === 'text'} hasInteracted={hasInteracted} currentTrack={currentTrack} />
      <VideoChannel track={track} active={channel === 'video'} isPlaying={isPlaying} videoRef={videoRef} iframeRef={iframeRef} nowPlaying={nowPlaying} />
      <PlaylistChannel tracks={tracks} currentTrack={currentTrack} active={channel === 'playlist'} onPlay={onPlay} />
    </div>
  )
}
