var ChromecastPlayer = function(trailerDoneCallback) {
  var _this = this;
  this.playerReady = false;
  this.trailerDoneCallback = trailerDoneCallback;
};

ChromecastPlayer.prototype.makeActive = function() {
  // TODO: Hide/show required elements.
};

ChromecastPlayer.prototype.makeInactive = function() {
  this.pause();
};

ChromecastPlayer.prototype.playTrailer = function(trailerKey, fromUserInteraction) {
  // TODO: Accept a player start point as an optional argument (for when changing players.)
  var castSession = cast.framework.CastContext.getInstance().getCurrentSession();

  if (castSession) {
    return castSession.sendMessage(NAMESPACE, {
      trailerKey: trailerKey
    });
  }
};

ChromecastPlayer.prototype.pause = function() {
  if (this.playerReady) {
    this.player.pauseVideo();
  }
};

ChromecastPlayer.prototype.noRemainingTrailers = function() {
  // TODO: When playing a trailer, undo the message.
};
