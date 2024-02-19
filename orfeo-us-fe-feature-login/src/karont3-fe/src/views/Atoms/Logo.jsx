import React from 'react';

const Logo = ({ico}) => {
  return <div className="logo">
    {ico ? <img src={ico} className='logoImg'></img> : "..."}
  </div>;
};

export default Logo;