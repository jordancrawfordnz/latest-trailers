import { useEffect } from 'react'

function NowShowingPage() {
  useEffect(() => {
    document.title = "Latest Trailers - Now Showing"
  })

  return (
    <>
      This is the now showing component
    </>
  )
}

export default NowShowingPage
