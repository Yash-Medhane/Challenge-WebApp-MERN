import React, {useState} from 'react'
import {AiFillEye, AiFillEyeInvisible} from 'react-icons/ai';


const Eye = ({isVisible,toggleVisibility}) => {
  return (
    <span onClick={toggleVisibility} className='cursor-pointer'>
      {isVisible ? <AiFillEyeInvisible/> : <AiFillEye/>}
    </span>
  );
};

export default Eye
