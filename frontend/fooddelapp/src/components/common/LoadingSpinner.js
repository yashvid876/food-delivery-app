import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ size = 'lg', text = 'Loading...' }) => {
  return (
    <div className="loading-spinner">
      <Spinner animation="border" role="status" size={size} className="me-3">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <span>{text}</span>
    </div>
  );
};

export default LoadingSpinner;