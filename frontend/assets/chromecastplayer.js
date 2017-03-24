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
  $("#chromecastContainer").hidden();
  this.pause();
};

ChromecastPlayer.prototype.playTrailer = function(trailerKey, fromUserInteraction) {
  // TODO: Accept a player start point as an optional argument (for when changing players.)
  var castSession = cast.framework.CastContext.getInstance().getCurrentSession();

  if (castSession) {
    return castSession.sendMessage(NAMESPACE, {
      trailerKey: trailerKey
    });
    this.currentlyPlayingTrailer = trailerKey;
  }
};

ChromecastPlayer.prototype.pause = function() {
  if (this.playerReady) {
    this.player.pauseVideo();
  }
};

ChromecastPlayer.prototype.noRemainingTrailers = function() {
  // TODO: When playing a trailer, undo the message.
  this.currentlyPlayingTrailer = null;
};
