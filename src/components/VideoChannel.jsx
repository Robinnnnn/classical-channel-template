import NowPlayingCard from './NowPlayingCard'
import './VideoChannel.css'

export default function VideoChannel({ track, active, isPlaying, videoRef, iframeRef, nowPlaying }) {
  return (
    <div className={`screen-content video-layer${active ? ' active' : ''}`}>
      {nowPlaying.visible && (
        <NowPlayingCard track={nowPlaying.track} cycle={nowPlaying.cycle} />
      )}

      {track && track.videoUrl ? (
        <div className="video-wrapper video-wrapper--native">
          <video
            ref={videoRef}
            src={track.videoUrl}
            playsInline
            preload="auto"
            style={track.videoFit ? {
              width: track.videoFit.width || '100%',
              height: track.videoFit.height || '100%',
              objectFit: track.videoFit.objectFit || 'cover',
            } : undefined}
          />
        </div>
      ) : track ? (
        <div
          className="video-wrapper"
          style={track.crop ? {
            top: `${track.crop.top}%`,
            left: `${track.crop.left}%`,
            width: `${track.crop.width}%`,
            height: `${track.crop.height}%`,
          } : undefined}
        >
          <iframe
            ref={iframeRef}
            id="yt-player"
            src={`https://www.youtube.com/embed/${track.youtubeId}?enablejsapi=1&autoplay=${isPlaying ? 1 : 0}&rel=0&modestbranding=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title=""
          />
        </div>
      ) : null}
    </div>
  )
}
