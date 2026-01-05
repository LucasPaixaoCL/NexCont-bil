import { initializeSchema, pool } from './server/db.js';

console.log('Starting manual database initialization...');

initializeSchema()
    .then(() => {
        console.log('Manual initialization completed successfully.');
        pool.end();
    })
    .catch((err) => {
        console.error('Manual initialization failed:', err);
        pool.end();
    });
