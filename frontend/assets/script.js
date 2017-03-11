var player;
var movies;
var seenMovies;
var autoPlayAllowed = true;

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
  player.pauseVideo();
  setActiveNavigation('aboutNav');
  setDisplayState('about');
};

function resetSeenMovies() {
  seenMovies = [];
  playRandomTrailer();
}

function setActiveNavigation(activeType) {
  var activeClass = 'active';
  $('.navigationItem').removeClass(activeClass);
  $('#' + activeType).addClass(activeClass);
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

function unseenMovies() {
  return $.grep(movies, function(movie) {
    return seenMovies.indexOf(movie.movieId) === -1
  });
}

function setDisplayState(state) {
  var trailerElement = $('#trailerContainer');
  var noRemainingTrailersElement = $('#onNoRemainingTrailers');
  var playNextNavElement = $('#playNextNav');
  var resetSeenMoviesNavElement = $('#resetSeenMoviesNav');
  var aboutElement = $('#about');

  var elements = [trailerElement, noRemainingTrailersElement, playNextNavElement, resetSeenMoviesNavElement, aboutElement];

  var show;
  if (state === 'about') {
    show = [aboutElement];
  } else if (state === 'trailer') {
    show = [trailerElement, playNextNavElement];
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

function playNextButtonPressed() {
  player.pauseVideo();
  if (!autoPlayAllowed) {
    $('#playOverride').hide();
  }
  playRandomTrailer();
}

function playRandomTrailer() {
  var movies = unseenMovies();

  if (movies.length > 0) {
    setDisplayState('trailer');

    var movieIndex = Math.trunc(Math.random() * movies.length);
    var movie = movies[movieIndex];

    var trailerIndex = Math.trunc(Math.random() * movie.trailerKeys.length);
    var trailerKey = movie.trailerKeys[trailerIndex];

    player.loadVideoById(trailerKey);
    markTrailerAsSeen(movie);

    player.addEventListener('onStateChange', function(event) {
      if (event.data == YT.PlayerState.ENDED) {
        // Play the next one.
        playRandomTrailer();
      }
    });
  } else {
    setDisplayState('none-remaining');
  }
}

function markTrailerAsSeen(movie) {
  seenMovies.push(movie.movieId);
  localStorage.setObject('seenMovies', seenMovies);
}

function onRouteChange() {
  var url = location.hash.slice(1) || '/';
  if (url === '/upcoming/') {
    upcoming();
  } else if (url === '/now-showing/') {
    nowShowing();
  } else if (url === '/about/') {
    about();
  } else {
    location.hash = '#/upcoming/';
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

function checkAutoplay() {
  var promise = document.createElement('video').play();

  if (promise instanceof Promise) {
    promise.catch(function(error) {
        // Check if it is the right error
        if(error.name == 'NotAllowedError') {
            autoPlayAllowed = false;
        } else {
          throw error;
        }
    }).then(function() {
      if (!autoPlayAllowed) {
        $('#playOverride').show();
      }
    });
  }
};

function playOverride() {
  player.playVideo();
  $('#playOverride').hide();
};

window.onhashchange = onRouteChange;

$(window).on('load', function() {
  seenMovies = localStorage.getObject('seenMovies') || [];
  setupPlayer(function() {
    onRouteChange();
    showTooltips();
    checkAutoplay();
  });
});
