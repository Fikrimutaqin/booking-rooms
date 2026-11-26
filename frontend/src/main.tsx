import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

/**
 * Name Function: renderApp
 * Description: Main entry point of the React application that mounts the root <App /> component into the HTML DOM (#root element).
 * Reason: Uses React 18+ createRoot with StrictMode to enable concurrent features and detect early side effects during development.
 **/
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
