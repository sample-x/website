import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav>
      <Link to="/map-test">Map Test</Link>
    </nav>
  );
};

export default Navbar; 