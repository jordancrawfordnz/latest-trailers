var LocalPlayer = function(trailerDoneCallback) {
  var _this = this;
  this.playerReady = false;
  this.autoPlayAllowed = false;
  this.trailerDoneCallback = trailerDoneCallback;
  this._setupPlayer();
};

LocalPlayer.prototype.playTrailer = function(trailerKey, fromUserInteraction) {
  // TODO: Accept a player start point as an optional argument (for when changing players.)
  var _this = this;

  if (this.playerReady) {
    if (fromUserInteraction) {
      $('#playOverride').hide();
    }
    this.player.loadVideoById(trailerKey);
  } else {
    setTimeout(function() {
      _this.playTrailer(trailerKey);
    }, 100);
  }
};

LocalPlayer.prototype.pause = function() {
  if (this.playerReady) {
    this.player.pauseVideo();
  }
};

LocalPlayer.prototype.noRemainingTrailers = function() {
  // TODO: When playing a trailer, undo the message.
};

LocalPlayer.prototype._onPlayerReady = function() {
  this._checkAutoplay();

  this.player.addEventListener('onStateChange', function(event) {
    if (event.data == YT.PlayerState.ENDED) {
      _this.trailerDoneCallback();
    }
  });

  this.playerReady = true;
};

LocalPlayer.prototype._setupPlayer = function() {
  var _this = this;

  this.player = new YT.Player('trailer', {
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
      onReady: function() {
        _this._onPlayerReady();
      }
    }
  });
};

LocalPlayer.prototype._checkAutoplay = function() {
  var promise = document.createElement('video').play();
  var _this = this;

  if (promise instanceof Promise) {
    promise.catch(function(error) {
        // Check if it is the right error
        if(error.name == 'NotAllowedError') {
          _this.autoPlayAllowed = false;
        } else {
          throw error;
        }
    }).then(function() {
      if (!_this.autoPlayAllowed) {
        $('#playOverride').show();

        $('#playOverrideButton').click(function() {
          _this.player.playVideo();
          $('#playOverride').hide();
        });
      }
    });
  }
};
