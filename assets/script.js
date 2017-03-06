var prefix = 'https://api.themoviedb.org/3/';
var apiKey = '8f9dc61dae4de5e1d69cf48ab6be2c64';
var player;
var movies;
var seenTrailers;

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

function getQueryString() {
  return '?api_key=' + apiKey + '&language=en-US';
}

function nowShowing() {
  var url = prefix + 'movie/now_playing' + getQueryString() + '&page=1';
  var request = $.get(url);

  request.done(function(response) {
    movies = response.results;
    playRandomTrailer();
  });
  setActiveNavigation('nowShowingNav');
}

function upcoming() {
  var url = prefix + 'movie/upcoming' + getQueryString() + '&page=1';
  var request = $.get(url);

  request.done(function(response) {
    movies = response.results;
    playRandomTrailer();
  });
  setActiveNavigation('upcomingNav');
}

function about() {
  player.pauseVideo();
  setActiveNavigation('aboutNav');
  setDisplayState('about');
};

function resetSeenTrailers() {
  seenTrailers = [];
  playRandomTrailer();
}

function setActiveNavigation(activeType) {
  var activeClass = 'active';
  $('.navigationItem').removeClass(activeClass);
  $('#' + activeType).addClass(activeClass);
}

function getVideos(movie, onDone, onFailure) {
  var command = 'movie/' + movie.id + '/videos';
  var url = prefix + command + getQueryString();

  var request = $.get(url);
  request.done(function(response) {
    onDone(response.results);
  });
  request.fail(onFailure);
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

function unseenTrailers() {
  return $.grep(movies, function(movie) {
    return seenTrailers.indexOf(movie.id) === -1
  });
}

function setDisplayState(state) {
  var trailerElement = $('#trailerContainer');
  var noRemainingTrailersElement = $('#onNoRemainingTrailers');
  var playNextNavElement = $('#playNextNav');
  var resetSeenTrailersNavElement = $('#resetSeenTrailersNav');
  var aboutElement = $('#about');

  var elements = [trailerElement, noRemainingTrailersElement, playNextNavElement, resetSeenTrailersNavElement, aboutElement];

  var show;
  if (state === 'about') {
    show = [aboutElement];
  } else if (state === 'trailer') {
    show = [trailerElement, playNextNavElement];
  } else if (state === 'none-remaining') {
    show = [noRemainingTrailersElement, resetSeenTrailersNavElement];
  }

  $.each(elements, function(index, element) {
    if (show.indexOf(element) !== -1) {
      element.show();
    } else {
      element.hide();
    }
  });
}

function playRandomTrailer() {
  var trailers = unseenTrailers();

  player.pauseVideo();

  if (trailers.length > 0) {
    setDisplayState('trailer');

    var randomMovieIndex = Math.trunc(Math.random() * trailers.length);
    var randomMovie = trailers[randomMovieIndex];

    getVideos(randomMovie, function(videos) {
      // TODO: Find one that is of type "Tralier" and the biggest size possible.
      var video = videos[0];
      player.loadVideoById(video.key);
      markTrailerAsSeen(randomMovie);

      player.addEventListener('onStateChange', function(event) {
        if (event.data == YT.PlayerState.ENDED) {
          // Play the next one.
          playRandomTrailer();
        }
      });
    });
  } else {
    setDisplayState('none-remaining');
  }
}

function markTrailerAsSeen(movie) {
  seenTrailers.push(movie.id);
  localStorage.setObject('seenTrailers', seenTrailers);
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

window.onhashchange = onRouteChange;

$(window).on('load', function() {
  seenTrailers = localStorage.getObject('seenTrailers') || [];
  setupPlayer(function() {
    onRouteChange();
  });
});
