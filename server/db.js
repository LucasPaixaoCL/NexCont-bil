import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

export const initializeSchema = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Clients Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS clients (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                cnpj VARCHAR(20),
                status VARCHAR(50) DEFAULT 'Ativo', -- Ativo, Pendente, Inativo
                regime VARCHAR(50), -- Simples Nacional, Lucro Presumido, Real
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Tasks Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                client_id INTEGER REFERENCES clients(id),
                due_date DATE,
                status VARCHAR(50) DEFAULT 'Pendente', -- Pendente, Em Andamento, Concluído
                sector VARCHAR(50), -- Fiscal, Contábil, Pessoal
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Folders Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS folders (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                color VARCHAR(50) DEFAULT 'blue',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS reminders (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                due_date DATE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Documents Table (Modified to include folder_id)
        await client.query(`
            CREATE TABLE IF NOT EXISTS documents (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(50), 
                size VARCHAR(50),
                folder_id INTEGER REFERENCES folders(id),
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Check column existence for folder_id in case table already exists
        const checkFolderId = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='documents' AND column_name='folder_id'");
        if (checkFolderId.rows.length === 0) {
            await client.query('ALTER TABLE documents ADD COLUMN folder_id INTEGER REFERENCES folders(id)');
        }

        // Check column existence for file_path
        const checkFilePath = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='documents' AND column_name='file_path'");
        if (checkFilePath.rows.length === 0) {
            await client.query('ALTER TABLE documents ADD COLUMN file_path VARCHAR(500)');
        }

        // Transactions (for Dashboard stats)
        await client.query(`
            CREATE TABLE IF NOT EXISTS transactions(
            id SERIAL PRIMARY KEY,
            description VARCHAR(255),
            amount DECIMAL(10, 2),
            type VARCHAR(50), --Receita, Despesa
                date DATE,
            status VARCHAR(50) DEFAULT 'Concluído'
        );
        `);

        // Seed Initial Data if tables are empty
        const clientsCheck = await client.query('SELECT COUNT(*) FROM clients');
        if (parseInt(clientsCheck.rows[0].count) === 0) {
            await client.query(`
                INSERT INTO clients(name, email, cnpj, status, regime) VALUES
            ('TechSolutions LTDA', 'contato@tech.com', '12.345.678/0001-90', 'Ativo', 'Simples Nacional'),
            ('Padaria Central', 'financeiro@padaria.com', '98.765.432/0001-12', 'Pendente', 'Lucro Presumido'),
            ('João Silva', 'joao@email.com', '111.222.333-44', 'Inativo', 'Autônomo');
        `);
            console.log('Seeded Clients');
        }

        const tasksCheck = await client.query('SELECT COUNT(*) FROM tasks');
        if (parseInt(tasksCheck.rows[0].count) === 0) {
            await client.query(`
                INSERT INTO tasks(title, status, due_date, sector) VALUES
            ('Entrega DAS - Padaria Central', 'Pendente', CURRENT_DATE, 'Fiscal'),
            ('Fechamento Folha - TechSolutions', 'Em Andamento', CURRENT_DATE + 2, 'Pessoal'),
            ('Importar XMLs - João Silva', 'Pendente', CURRENT_DATE + 5, 'Contábil');
        `);
            console.log('Seeded Tasks');
        }

        const foldersCheck = await client.query('SELECT COUNT(*) FROM folders');
        if (parseInt(foldersCheck.rows[0].count) === 0) {
            await client.query(`
                INSERT INTO folders(name, color) VALUES
            ('Impostos', 'blue'),
            ('Contratos', 'emerald'),
            ('Pessoal', 'amber'),
            ('Balanços', 'purple');
        `);
            console.log('Seeded Folders');
        }

        // Ensure "Downloads" folder exists (Inbox)
        const downloadsCheck = await client.query("SELECT * FROM folders WHERE name = 'Downloads'");
        if (downloadsCheck.rows.length === 0) {
            await client.query("INSERT INTO folders(name, color) VALUES ('Downloads', 'slate')");
            console.log('Created Downloads Folder');
        }

        const transactionsCheck = await client.query('SELECT COUNT(*) FROM transactions');
        if (parseInt(transactionsCheck.rows[0].count) === 0) {
            await client.query(`
                INSERT INTO transactions(description, amount, type, date) VALUES
                ('Honorários TechSolutions', 1500.00, 'Receita', CURRENT_DATE - 2),
                ('Consultoria João Silva', 450.00, 'Receita', CURRENT_DATE - 5),
                ('Licença Software', 299.90, 'Despesa', CURRENT_DATE - 1),
                ('Material de Escritório', 120.50, 'Despesa', CURRENT_DATE - 10);
            `);
            console.log('Seeded Transactions');
        }

        await client.query('COMMIT');
        console.log('Database Schema Initialized');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error initializing schema:', e);
    } finally {
        client.release();
    }
};

export { pool };
