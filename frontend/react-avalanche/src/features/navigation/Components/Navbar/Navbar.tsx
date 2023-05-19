import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="navbar__items">
        <li>
          <Link to="/sandbox">Sandbox</Link>
        </li>
        <li>
          <Link to="/challenge">Challenge</Link>
        </li>
        <li>
          <Link to="/ai">AI</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
