var NAMESPACE = 'urn:x-cast:net.latesttrailers.chromecast';

var playerReady = false;

window.onload = function() {
  window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
  console.log('Starting Receiver Manager');

  castReceiverManager.onReady = function(event) {
    console.log('Received Ready event: ' + JSON.stringify(event.data));
    window.castReceiverManager.setApplicationState('Ready to roll!');
  };

  castReceiverManager.onSenderConnected = function(event) {
    console.log('Received Sender Connected event: ' + event.data);
    console.log(window.castReceiverManager.getSender(event.data).userAgent);
  };

  castReceiverManager.onSenderDisconnected = function(event) {
    // Close the app if there are no senders remaining.
    if (window.castReceiverManager.getSenders().length == 0) {
      window.close();
    }
  };

  window.messageBus = window.castReceiverManager.getCastMessageBus(NAMESPACE);

  window.messageBus.onMessage = function(event) {
    var data = JSON.parse(event.data);

    console.log(data);
    playTrailerWhenReady(data);
  }

  window.castReceiverManager.start({statusText: 'Application is starting'});
  console.log('Receiver Manager started');

  setupPlayer(function() {
    console.log('player ready now')
    playerReady = true;
  });
};

function playTrailerWhenReady(messageData) {
  if (playerReady) {
    playTrailer(messageData);
  } else {
    console.log('player not ready');
    setTimeout(function() {
      playTrailerWhenReady(messageData);
    }, 100);
  }
}

function playTrailer(messageData) {
  console.log('play trailer called.');
  if (messageData.movie) {
    var movie = messageData.movie;
    player.loadVideoById(movie.trailerKeys[0]);
  } else {
    console.log('no Movie data');
  }
}

function setupPlayer(onReady) {
  player = new YT.Player('trailer', {
    height: '100%',
    width: '100%',
    playerVars: {
      controls: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      showinfo: 0,
      rel: 0
    },
    events: {
      onReady: onReady,
    }
  });
}
