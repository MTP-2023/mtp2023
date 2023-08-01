import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar" id="navbar">
      <ul className="navbar__items">
        <Link to="/">
          <div className="logo">SNOWSLIDER</div>
        </Link>

        <Link to="/test">
          <div className="logo2">Project Timeline</div>
        </Link>
        <Link to="/gallery">
          <div className="logo2">Gallery</div>
        </Link>

        <li className="navbar__item">
          <Link to="/game" className="navbar__link">
            Game
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;

//____ DO NOT DELETE______
/*
  <li className="navbar__item">
          <Link to="/#aboutAvalanche" className="navbar__link">
            About Avalanche
          </Link>
        </li>
        <li className="navbar__item">
          <a href="#aboutProject" className="navbar__link">
            About Game
          </a>
        </li>
        <li className="navbar__item">
          <a href="#instructions" className="navbar__link">
            Instructions
          </a>
        </li>
*/

/*  <li className="navbar__item">
<Link to="/sandbox" className="navbar__link">
Sandbox
</Link>
</li>
 <li className="navbar__item">
          <Link to="/challenge" className="navbar__link">
            Challenge
          </Link>
        </li>

 <li className="navbar__item">
          <Link to="/ai" className="navbar__link">
            AI
          </Link>
        </li>
*/
