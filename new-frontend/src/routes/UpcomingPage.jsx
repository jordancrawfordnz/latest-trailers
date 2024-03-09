import { useEffect } from 'react'

function UpcomingPage() {
  useEffect(() => {
    document.title = "Latest Trailers - Upcoming"
  })

  return (
    <>
      This is the upcoming component
    </>
  )
}

export default UpcomingPage
