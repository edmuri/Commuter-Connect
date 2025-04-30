import React from "react";
import "../../../styles.css";

const NavLinks = () => {
  return (
    <>
      <nav className="navlinks">
        <ul className="links">
          <li>
            <a href="/schedule">Schedule</a>
          </li>
          <li>
            <a href="/map">Map</a>
          </li>
          <li>
            <a href="/nearby">Events</a>
          </li>
          <li>
            <a href="/friends">Friends</a>
          </li>
          <li>
            <a href="/profile" className="profile">
              Your Profile
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default NavLinks;
