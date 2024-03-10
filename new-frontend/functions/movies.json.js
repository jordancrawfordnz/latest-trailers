const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer xxx'
  }
};

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
const threeMonthsAgo = new Date();
threeMonthsAgo.setDate(today.getDate() - 90);

function dateToIsoDateOnly(date) {
  return date.toISOString().substring(0, 10);
}

const todayString = dateToIsoDateOnly(today);
const tomorrowString = dateToIsoDateOnly(tomorrow);
const threeMonthsAgoString = dateToIsoDateOnly(threeMonthsAgo);
console.log(todayString)
console.log(tomorrowString)
console.log(threeMonthsAgoString)

const nowShowingParams = new URLSearchParams({
  'sort_by': 'popularity.desc',
  'include_adult': false,
  'primary_release_date.gte': threeMonthsAgoString,
  'primary_release_date.lte': todayString,
  'with_release_type': '2|3',
  'with_original_language': 'en'
});

const upcomingParams = new URLSearchParams({
  'sort_by': 'popularity.desc',
  'include_adult': false,
  'primary_release_date.gte': tomorrowString,
  'with_release_type': '2|3',
  'with_original_language': 'en'
});

async function fetchMoviesAndTrailers(params) {
  let movieResult = await fetch(`https://api.themoviedb.org/3/discover/movie?${params}`, options)
    .then(response => response.json());
  // TODO: Handle not success
  let movieIds = movieResult.results.map((movie) => movie.id);

  const fetchTrailerPromises = movieIds.map(movieId => {
    return fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos`, options)
      .then(response => response.json())
  });
  const trailers = await Promise.all(fetchTrailerPromises)

  console.log(trailers);
}

fetchMoviesAndTrailers(nowShowingParams);
fetchMoviesAndTrailers(upcomingParams)
