var Promise = require('promise');
var knox = require('knox');
var tmp = require('tmp');
var jsonfile = require('jsonfile');
var moment = require('moment');

const FETCH_VIDEOS_DELAY = 400;

if (process.argv.length !== 3) {
  console.log('node index.js [config path]');
  return;
}

var envFilePath = process.argv[2];
var env = jsonfile.readFileSync(envFilePath);

var s3Client = knox.createClient({
  key: env.accessKeyId,
  secret: env.secretAccessKey,
  bucket: env.bucket,
  region: env.region
});

const MovieDB = require('moviedb')(env.tmdbKey);

var movieVideos = Promise.denodeify(MovieDB.movieVideos.bind(MovieDB));
var putFile = Promise.denodeify(s3Client.putFile.bind(s3Client));

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

function uploadToS3(file, filePath) {
  var headers = { 'Content-Type': 'application/json' };
  return putFile(file.name, filePath, headers);
}

function getTempJSON(content) {
  var tempFile = tmp.fileSync();
  jsonfile.writeFileSync(tempFile.name, content);

  return tempFile;
}

function uploadTrailerDetails(queryFunction, filename) {
  return loadMovieList(queryFunction).then(function(trailers) {
    var file = getTempJSON(trailers);
    return uploadToS3(file, filename).then(function() {
      console.log('Uploaded ' + filename + ' successfully!');
    });
  });
}


uploadTrailerDetails(upcomingMovies, 'upcoming.json').then(function() {
  return uploadTrailerDetails(nowPlayingMovies, 'now-showing.json').then(function() {
    console.log('Fetch completed.');
  });
}, function(error) {
  console.log('An error occurred.');
  console.log(error);
})
