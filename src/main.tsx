// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
// import './index.css'

fetch('/version.json', { method: 'GET' })
  .then((res) => res.json())
  .then((data) => {
    console.info('>>> version >>>', data);
  });

createRoot(document.getElementById('root')!).render(
  <App />
  // <StrictMode>
  // </StrictMode>,
);
