var ChromecastPlayer = function(trailerDoneCallback) {
  var _this = this;
  this.playerReady = false;
  this.trailerDoneCallback = trailerDoneCallback;
};

ChromecastPlayer.prototype.currentTrailer = function() {
  return this.currentlyPlayingTrailer;
};

ChromecastPlayer.prototype.makeActive = function() {
  $("#chromecastContainer").show();
};

ChromecastPlayer.prototype.makeInactive = function() {
  $("#chromecastContainer").hide();
};

ChromecastPlayer.prototype.playTrailer = function(trailerKey, fromUserInteraction) {
  // TODO: Accept a player start point as an optional argument (for when changing players.)
  var castSession = cast.framework.CastContext.getInstance().getCurrentSession();

  if (castSession) {
    this.currentlyPlayingTrailer = trailerKey;

    return castSession.sendMessage(NAMESPACE, {
      trailerKey: trailerKey
    });
  }
};

ChromecastPlayer.prototype.pause = function() {
  // TODO: Implement a pause command.
};

ChromecastPlayer.prototype.noRemainingTrailers = function() {
  this.currentlyPlayingTrailer = null;

  var castSession = cast.framework.CastContext.getInstance().getCurrentSession();

  if (castSession) {
    return castSession.sendMessage(NAMESPACE, {
      caughtUp: true
    });
  }
};
