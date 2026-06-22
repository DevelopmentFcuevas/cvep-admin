// 📦 Librerías externas
import React from 'react';

const ErrorMessage = ({ message }) => (
  <div className="bg-red-100 text-red-800 px-4 py-3 rounded mb-4">
    <strong>Error:</strong> {message}
  </div>
);

export default ErrorMessage;
