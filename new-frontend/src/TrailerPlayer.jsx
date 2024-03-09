import YouTube from 'react-youtube';

function TrailerPlayer() {
  const opts = {
    height: '100%',
    width: '100%',
    host: '//www.youtube-nocookie.com',
    playerVars: {
      controls: 0,
      iv_load_policy: 3,
      rel: 0
    }
  }

  return <YouTube className="trailer-player__player" videoId="2g811Eo7K8U" opts={opts} />;
}

export default TrailerPlayer
