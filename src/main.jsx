import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { Buffer } from 'buffer';
import process from 'process';
import { initObservability } from './utilities/observability';

window.Buffer = Buffer;
window.process = process;

initObservability();

createRoot(document.getElementById('root')).render(
    <App />,
)
