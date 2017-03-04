var prefix = 'https://api.themoviedb.org/3/';
var apiKey = '8f9dc61dae4de5e1d69cf48ab6be2c64';
var player;
var movies;

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

function setActiveNavigation(activeType) {
  var activeClass = 'active';
  $('.trailerType').removeClass(activeClass);
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
      controls: 1,
      disablekb: 1,
      iv_load_policy: 3,
      modestbranding: 1,
      showinfo: 0
    },
    events: {
      onReady: onReady,
    }
  });
};

function playRandomTrailer() {
  if (movies.length > 0) {
    var randomMovieIndex = Math.trunc(Math.random() * movies.length);
    var randomMovie = movies[randomMovieIndex];

    getVideos(randomMovie, function(videos) {
      // TODO: Find one that is of type "Tralier" and the biggest size possible.
      var video = videos[0];
      player.loadVideoById(video.key);

      player.addEventListener('onStateChange', function(event) {
        if (event.data == YT.PlayerState.ENDED) {
          // Play the next one.
          playRandomTrailer();
        }
      });
    });
  }
}

$(window).on('load', function() {
  setupPlayer(function() {
    upcoming();
  });
});
