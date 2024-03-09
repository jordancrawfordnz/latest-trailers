import { Outlet, NavLink } from 'react-router-dom'

function RootLayout() {
  return (
    <>
      <nav>
        <div className="nav-wrapper black">
          <ul className="left">
            <li>
              <NavLink to="upcoming" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="material-icons left">movie</i> Upcoming
              </NavLink>
            </li>
            <li>
              <NavLink to="now-showing">
                <i className="material-icons left">theaters</i> Now Showing
              </NavLink>
            </li>
          </ul>
          <ul className="right">
           <li>
              <NavLink to="about">
                <i className="material-icons right">info_outline</i> About
              </NavLink>
            </li>
            <li>
              <a href="#">
                <i className="material-icons right">skip_next</i> Next</a>
              </li>
            {/* TODO: Implement resetting seen movies */}
            {/* <li id="resetSeenMoviesNav" style="display: none;"><a href="#"><i className="material-icons right">loop</i>Start again</a></li> */}
          </ul>
        </div>
      </nav>

      <div id="content">
        <Outlet />
      </div>
    </>
  )
}

export default RootLayout
