import { useEffect } from 'react'
import TrailerPlayer from '../TrailerPlayer'

function UpcomingPage() {
  useEffect(() => {
    document.title = "Latest Trailers - Upcoming"
  })

  return (
    <TrailerPlayer />
  )
}

export default UpcomingPage
