import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from 'react-router-dom';
import RootLayout from './routes/RootLayout'
import AboutPage from './routes/AboutPage'
import UpcomingPage from './routes/UpcomingPage'
import NowShowingPage from './routes/NowShowingPage'
import './style.css'

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <Navigate to="upcoming" />,
        index: true
      },
      {
        path: "*",
        element: <Navigate to="upcoming" />
      },
      {
        path: "/upcoming",
        element: <UpcomingPage />
      },
      {
        path: "/now-showing",
        element: <NowShowingPage />
      },
      {
        path: "/about",
        element: <AboutPage />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
