var Promise = require('promise');
var s3 = require('s3');
var tmp = require('tmp');
var jsonfile = require('jsonfile')

const FETCH_VIDEOS_DELAY = 400;

if (process.argv.length !== 3) {
  console.log('node index.js [config path]');
  return;
}

var envFilePath = process.argv[2];
var env = jsonfile.readFileSync(envFilePath);

var s3Client = s3.createClient({
  s3Options: {
    accessKeyId: env.accessKeyId,
    secretAccessKey: env.secretAccessKey,
    region: env.region
  }
});

const MovieDB = require('moviedb')(env.tmdbKey);

var upcomingMovies = Promise.denodeify(MovieDB.miscUpcomingMovies.bind(MovieDB));
var nowPlayingMovies = Promise.denodeify(MovieDB.miscNowPlayingMovies.bind(MovieDB));
var movieVideos = Promise.denodeify(MovieDB.movieVideos.bind(MovieDB));

function getTrailer(movie) {
  process.stdout.write('Getting trailer for ' + movie.title + '...');
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
    return getTrailer(currentMovie).then(function(trailers) {
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
  return new Promise(function(resolve, reject) {
    var uploadParams = {
      localFile: file.name,
      s3Params: {
        Bucket: 'latesttrailerstest',
        Key: filePath
      }
    };

    var uploader = s3Client.uploadFile(uploadParams);
    uploader.on('error', function(err) {
      reject(err);
    });

    uploader.on('end', function() {
      resolve();
    });
  });
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
