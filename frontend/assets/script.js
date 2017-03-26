var CAST_APPLICATION_ID = 'FC515287';
var NAMESPACE = 'urn:x-cast:net.latesttrailers.chromecast';

var movies;
var seenMovies;
var localPlayer;
var chromecastPlayer;
var player;

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

function nowShowing() {
  var url = 'now-showing.json';
  var request = $.get(url);

  request.done(function(response) {
    movies = response;
    playRandomTrailer();
  });
  setActiveNavigation('nowShowingNav');
}

function upcoming() {
  var url = 'upcoming.json';
  var request = $.get(url);

  request.done(function(response) {
    movies = response;
    playRandomTrailer();
  });
  setActiveNavigation('upcomingNav');
}

function about() {
  player.pause();
  setActiveNavigation('aboutNav');
  setDisplayState('about');
};

function setActiveNavigation(activeType) {
  var activeClass = 'active';
  $('.navigationItem').removeClass(activeClass);
  $('#' + activeType).addClass(activeClass);
}

function unseenMovies() {
  if (!movies) return null;

  return $.grep(movies, function(movie) {
    return seenMovies.indexOf(movie.movieId) === -1
  });
}

function setDisplayState(state) {
  var playerElement = $('#playerContainer');
  var noRemainingTrailersElement = $('#onNoRemainingTrailers');
  var playNextNavElement = $('#playNextNav');
  var resetSeenMoviesNavElement = $('#resetSeenMoviesNav');
  var aboutElement = $('#about');

  var elements = [playerElement, noRemainingTrailersElement, playNextNavElement, resetSeenMoviesNavElement, aboutElement];

  var show;
  if (state === 'about') {
    show = [aboutElement];
  } else if (state === 'trailer') {
    show = [playerElement, playNextNavElement];
  } else if (state === 'none-remaining') {
    show = [noRemainingTrailersElement, resetSeenMoviesNavElement];
  }

  $.each(elements, function(index, element) {
    if (show.indexOf(element) !== -1) {
      element.show();
    } else {
      element.hide();
    }
  });
}

function playRandomTrailer(fromUserInteraction) {
  var unseenMovieList = unseenMovies();

  if (unseenMovieList.length > 0) {
    setDisplayState('trailer');

    var movieIndex = Math.trunc(Math.random() * unseenMovieList.length);
    var movie = unseenMovieList[movieIndex];

    var trailerIndex = Math.trunc(Math.random() * movie.trailerKeys.length);
    var trailerKey = movie.trailerKeys[trailerIndex];

    player.playTrailer(trailerKey, fromUserInteraction);
    markTrailerAsSeen(movie);
  } else {
    setDisplayState('none-remaining');
    player.noRemainingTrailers();
  }
}

function markTrailerAsSeen(movie) {
  seenMovies.push(movie.movieId);
  localStorage.setObject('seenMovies', seenMovies);
}

function onRouteChange(event) {
  var url = location.hash.slice(1) || '/';
  if (url === '/upcoming/') {
    upcoming();
  } else if (url === '/now-showing/') {
    nowShowing();
  } else if (url === '/about/') {
    about();
  } else {
    history.replaceState(undefined, undefined, "#/upcoming/");
    upcoming();
  }
}

function showTooltips() {
  tooltipsShown = localStorage.getObject('tooltipsShown') || {};
  if (!tooltipsShown.first) {
    setTimeout(function() {
      Materialize.toast("This page will remember the trailers you watch so you'll see fresh ones next time. Enjoy!", 4000);
    }, 2000);
    tooltipsShown.first = true;
  } else if (!tooltipsShown.second) {
    setTimeout(function() {
      Materialize.toast("Welcome back! Continuing from where you left off...", 4000);
    }, 2000);
    tooltipsShown.second = true;
  }
  localStorage.setObject('tooltipsShown', tooltipsShown);
}

window.onhashchange = onRouteChange;

$('#playNextNav').click(function(event) {
  event.preventDefault();
  player.pause();
  playRandomTrailer(true);
});

$('#resetSeenMoviesNav').click(function(event) {
  event.preventDefault();
  seenMovies = [];
  playRandomTrailer(true);
});

$(window).on('load', function() {
  // Setup the local player.
  localPlayer = new LocalPlayer(function() {
    // Play the next one.
    playRandomTrailer();
  });
  switchActivePlayer(null, localPlayer);

  seenMovies = localStorage.getObject('seenMovies') || [];
  onRouteChange();
  showTooltips();
});

$("#chromecastButton").click(function(event) {
  event.preventDefault();
});

function switchActivePlayer(from, to) {
  var fromPlayerTrailer;
  if (from) {
    from.makeInactive();
    fromPlayerTrailer = from.currentTrailer();
  }

  to.makeActive();

  var unseenMovieList = unseenMovies();
  if (unseenMovieList && unseenMovieList.length == 0) {
    to.noRemainingTrailers();
  } else if (fromPlayerTrailer) {
    to.playTrailer(fromPlayerTrailer);
  }

  player = to;
};

function pause() {
  player.pause();
}

function play() {
  player.play();
}

function switchPlayers() {
  if (cast.framework.CastContext.getInstance().getCurrentSession()) {
    if (!chromecastPlayer) {
      chromecastPlayer = new ChromecastPlayer(function() {
        playRandomTrailer();
      });
    }
    switchActivePlayer(localPlayer, chromecastPlayer);
  } else {
    switchActivePlayer(chromecastPlayer, localPlayer);
  }
  // TODO: Send the currently playing video to the Chromecast, ideally at the current playback point.
  // TODO: Support pausing videos.
}

function initializeCastApi() {
  cast.framework.CastContext.getInstance().setOptions({
    receiverApplicationId: CAST_APPLICATION_ID
  });

  // When connecting to Chromecast, call switchToChromecast.
  this.remotePlayer = new cast.framework.RemotePlayer();
  this.remotePlayerController = new cast.framework.RemotePlayerController(this.remotePlayer);
  this.remotePlayerController.addEventListener(
    cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
    switchPlayers
  );
};
