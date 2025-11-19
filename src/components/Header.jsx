import React from 'react';
import logo from '../assets/healer-logo.png';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <img src={logo} alt="Healer Logo" className="logo" />
      <h1>HEALER - An AI Powered Virtual Nutrionist</h1>
      <p className="tagline">"Healing begins with the right meal."</p>
    </header>
  );
};

export default Header;