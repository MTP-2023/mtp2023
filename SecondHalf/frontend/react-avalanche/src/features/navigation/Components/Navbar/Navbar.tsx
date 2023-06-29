import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar" id="navbar">
      <ul className="navbar__items">
        <Link to="/">
          <div className="logo">AVALANCHE</div>
        </Link>
        <li className="navbar__item">
          <Link to="/game" className="navbar__link">
            Game
          </Link>
        </li>
        <li className="navbar__item">
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
      </ul>
    </nav>
  );
};

export default Navbar;
