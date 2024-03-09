const { MovieDb } = require('moviedb-promise');
// https://github.com/grantholle/moviedb-promise

export function onRequest(context) {
  const moviedb = new MovieDb(context.env.FETCHER_TMDB_KEY);

  console.log('heyyyy')

  console.log(context.env.FETCHER_TMDB_KEY)

  moviedb
    .searchMovie({ query: 'Alien' })
    .then((res) => {
      console.log(res)
      return new Response(res)
      
    })
    .catch((err) => {
      console.log(err)
      return new Response("Oops")
    });

  // moviedb.discoverMovie(
  //   {
  //     'sort_by': 'popularity.desc',
  //     'include_adult': false,
  //   });
  // return new Response("Hello, world!")
}
