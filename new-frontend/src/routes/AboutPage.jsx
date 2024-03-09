import { useEffect } from 'react'

function AboutPage() {
  useEffect(() => {
    document.title = "Latest Trailers - About"
  })

  return (
    <div class="container">
      <h3>About</h3>
      <h5>What is this?</h5>
      <p>
        I wanted to build something that is as close to the experience of watching movie trailers before a movie starts.
        Just like in the cinemas, you don't even know what the movie is called until the title is revealed at the end!
      </p>
      <p>
        Your browser keeps track of which trailers you've seen, so if you come back another time, rest assured you'll see something new!
      </p>
      <p>
        <a target="_blank" href="https://jc.kiwi/latest-trailers/">Read more about how it works on my blog</a><br />
        <a target="_blank" href="https://github.com/jordancrawfordnz/latest-trailers">See the source code on GitHub</a>
      </p>

      <h5>How does it know which trailers I've watched?</h5>
      <p>
        Information about which trailers you've watched is stored in your browsers local storage.
        No information about what you watched is available to the owner of this website.
      </p>

      <h5>Where is content sourced from?</h5>
      <p>
        Movie information is sourced from <a target="_blank" href="https://www.themoviedb.org/">TMDb's</a> API.
        They have information about the trailers available for a movie.
      </p>
      <p>Trailers play direct from YouTube.</p>

      <h5>Who made this?</h5>
      <p>
        This site was made by <a target="_blank" href="https://jc.kiwi">Jordan Crawford</a>.
      </p>
    </div>
  )
}

export default AboutPage
