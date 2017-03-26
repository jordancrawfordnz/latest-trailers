var NAMESPACE = 'urn:x-cast:net.latesttrailers.chromecast';

var playerReady = false;

window.onload = function() {
  window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
  console.log('Starting Receiver Manager');

  castReceiverManager.onSenderDisconnected = function(event) {
    // Close the app if there are no senders remaining.
    if (window.castReceiverManager.getSenders().length == 0) {
      window.close();
    }
  };

  window.messageBus = window.castReceiverManager.getCastMessageBus(NAMESPACE);

  window.messageBus.onMessage = function(event) {
    var data = JSON.parse(event.data);

    // TODO: Support other event types.
    if (data.caughtUp) {
      $("#onNoRemainingTrailers").show();
      $("#trailerContainer").hide();
      pauseVideo();
      // TODO: Show the caught up message.
    } else if (data.trailerKey) {
      playTrailerWhenReady(data.trailerKey);
    }
  }

  // TODO: On no more videos event.
  // TODO: On pause.

  console.log('Receiver Manager started');

  window.castReceiverManager.start();

  setupPlayer(function() {
    playerReady = true;
  });
};

function pauseVideo() {
  if (playerReady) {
    player.pauseVideo();
  }
}

function playTrailerWhenReady(trailerKey) {
  if (playerReady) {
    $("#onNoRemainingTrailers").hide();
    $("#trailerContainer").show();

    playTrailer(trailerKey);
  } else {
    setTimeout(function() {
      playTrailerWhenReady(trailerKey);
    }, 100);
  }
}

function playTrailer(trailerKey) {
  player.loadVideoById(trailerKey);
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
