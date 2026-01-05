import { initRouter } from './router.js';
import { initDropdowns } from './utils/Dropdowns.js';
import './style.css';

// Initialize Global Utilities
initDropdowns();

initRouter(document.querySelector('#app'));
