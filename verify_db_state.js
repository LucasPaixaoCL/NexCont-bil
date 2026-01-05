import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'NexContabil',
    password: 'Limonada01?',
    port: 5432,
});

async function checkDb() {
    const client = await pool.connect();
    try {
        console.log('Connected to database...');

        // List Tables
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        console.log('Tables found:', tables.rows.map(r => r.table_name));

        if (tables.rows.length === 0) {
            console.log('NO TABLES FOUND.');
        } else {
            for (const table of tables.rows) {
                const count = await client.query(`SELECT COUNT(*) FROM ${table.table_name}`);
                console.log(`Table ${table.table_name}: ${count.rows[0].count} rows`);
            }
        }

    } catch (err) {
        console.error('Error connecting or querying:', err);
    } finally {
        client.release();
        pool.end();
    }
}

checkDb();
