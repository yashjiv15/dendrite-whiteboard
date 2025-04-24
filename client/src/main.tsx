// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import keycloak from './keycloak';
import 'bootstrap/dist/css/bootstrap.min.css';


keycloak.init({ onLoad: 'login-required' }).then((authenticated) => {
  if (authenticated) {
    const root = document.getElementById('root')!;
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode> 
    );
  } else {
    window.location.reload();
  }
});
