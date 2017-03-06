var Promise = require('promise');
const MovieDB = require('moviedb')('8f9dc61dae4de5e1d69cf48ab6be2c64');

const FETCH_VIDEOS_DELAY = 400;

var upcomingMovies = Promise.denodeify(MovieDB.miscUpcomingMovies.bind(MovieDB));
var movieVideos = Promise.denodeify(MovieDB.movieVideos.bind(MovieDB));

function getTrailer(movie) {
  process.stdout.write('Getting trailer for ' + movie.title + '...');
  return movieVideos({ id: movie.id }).then(function(response) {
    process.stdout.write('Done.\n');

    // TODO: Filter to Trailers and respond with the movie ID and a list of trailers.

    return response.results;
  });
}

function getTrailers(remainingMovies, movieTrailers) {
  if (movieTrailers === undefined) {
    movieTrailers = [];
  }

  if (remainingMovies.length > 0) {
    var currentMovie = remainingMovies.shift();
    return getTrailer(currentMovie).then(function(trailers) {
      movieTrailers.push(trailers);

      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          getTrailers(remainingMovies, movieTrailers).then(resolve, reject);
        }, FETCH_VIDEOS_DELAY);
      });
    });
  } else {
    return Promise.resolve(movieTrailers);
  }
}

function loadMovieList(queryFunction) {
  return queryFunction({ language: 'en-US' }).then(function(movies) {
    return getTrailers(movies.results);
  });
}

loadMovieList(upcomingMovies).then(function(trailers) {
  console.log('Done :)');
  console.log(trailers);

  // TODO: Build a file and upload it to Amazon S3.
}, function(error) {
  console.log('An error occurred.');
  console.log(error);
});
