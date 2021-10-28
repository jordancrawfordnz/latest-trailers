var Promise = require('promise');
const fs = require('fs');
var tmp = require('tmp');
var moment = require('moment');
var request = require('request');

const FETCH_VIDEOS_DELAY = 400;

var env = {
  tmdbKey: process.env.FETCHER_TMDB_KEY,
  fetcherSavePath: process.env.FETCHER_SAVE_PATH,
  successPublishUrl: process.env.FETCHER_SUCCESS_PUBLISH_URL
};

const MovieDB = require('moviedb')(env.tmdbKey);

var movieVideos = Promise.denodeify(MovieDB.movieVideos.bind(MovieDB));

function formatDateForTMDB(date) {
  return date.format('YYYY-MM-DD');
}

function upcomingMovies() {
  var releaseDateGreaterThan = formatDateForTMDB(moment());

  return Promise.denodeify(MovieDB.discoverMovie.bind(MovieDB))({
    'sort_by': 'popularity.desc',
    'include_adult': false,
    'primary_release_date.gte': releaseDateGreaterThan,
    'with_release_type': '2|3',
    'with_original_language': 'en'
  });
}

function nowPlayingMovies() {
  var releaseDateLessThan = formatDateForTMDB(moment());
  var releaseDateGreaterThan = formatDateForTMDB(moment().subtract(3, 'months'));

  return Promise.denodeify(MovieDB.discoverMovie.bind(MovieDB))({
    'sort_by': 'popularity.desc',
    'include_adult': false,
    'primary_release_date.gte': releaseDateGreaterThan,
    'primary_release_date.lte': releaseDateLessThan,
    'with_release_type': '2|3',
    'with_original_language': 'en'
  });
}

function getTrailersForMovie(movie) {
  process.stdout.write('Getting trailers for ' + movie.title + '...');
  return movieVideos({ id: movie.id }).then(function(response) {
    process.stdout.write('Done.\n');

    var trailers = response.results.filter(function(video) {
      return video.type === "Trailer";
    });

    if (trailers.length > 0) {
      var trailerKeys = trailers.map(function(trailer) {
        return trailer.key;
      });

      return {
        movieId: movie.id,
        trailerKeys: trailerKeys
      }
    } else {
      return null;
    }
  });
}

function getTrailers(remainingMovies, movieTrailers) {
  if (movieTrailers === undefined) {
    movieTrailers = [];
  }

  if (remainingMovies.length > 0) {
    var currentMovie = remainingMovies.shift();
    return getTrailersForMovie(currentMovie).then(function(trailers) {
      if (trailers) {
        movieTrailers.push(trailers);
      }

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

function saveToFile(content, filePath) {
  writeFile = Promise.denodeify(fs.writeFile);

  return writeFile(filePath, JSON.stringify(content));
}

function uploadTrailerDetails(queryFunction, filename) {
  return loadMovieList(queryFunction).then(function(trailers) {
    return saveToFile(trailers, filename).then(function() {
      console.log('Saved ' + filename + ' successfully!');
    });
  });
}

function buildSavePath(filename) {
  prefix = env.fetcherSavePath && env.fetcherSavePath.length > 0 ? env.fetcherSavePath + "/" : ""

  return prefix + filename;
}

uploadTrailerDetails(upcomingMovies, buildSavePath('upcoming.json')).then(function() {
  return uploadTrailerDetails(nowPlayingMovies, buildSavePath('now-showing.json')).then(function() {
    console.log('Fetch completed.');

    if (env.successPublishUrl && env.successPublishUrl.length > 0) {
      console.log('Hitting success URL ' + env.successPublishUrl);
      request(env.successPublishUrl);
    }
  });
}, function(error) {
  console.log('An error occurred.');
  console.log(error);
})
