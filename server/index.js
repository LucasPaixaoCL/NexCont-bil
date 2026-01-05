import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { pool, initializeSchema } from './db.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize Database
initializeSchema();

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'server/uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// --- API Endpoints ---

// Dashboard Stats
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const clientsCount = await pool.query('SELECT COUNT(*) FROM clients WHERE status = $1', ['Ativo']);
        const pendingTasks = await pool.query('SELECT COUNT(*) FROM tasks WHERE status = $1', ['Pendente']);

        // Calculate Net Revenue (Receita - Despesa)
        const revenueResult = await pool.query(`
            SELECT SUM(
                CASE 
                    WHEN type = 'Receita' THEN amount 
                    WHEN type = 'Despesa' THEN -amount 
                    ELSE 0 
                END
            ) as total FROM transactions
        `);
        const totalRevenue = revenueResult.rows[0].total || 0;
        console.log('Revenue Calculation:', {
            activeClients: parseInt(clientsCount.rows[0].count),
            pendingTasks: parseInt(pendingTasks.rows[0].count),
            revenue: totalRevenue
        });

        res.json({
            activeClients: parseInt(clientsCount.rows[0].count),
            pendingTasks: parseInt(pendingTasks.rows[0].count),
            revenue: parseFloat(totalRevenue),
            // dasTime removed as per request, but keeping key if frontend needs it temporarily or just remove it.
            // User asked to remove the card, so backend sending it doesn't hurt, but let's clean it up.
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Clients API
app.get('/api/clients', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clients ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/clients', async (req, res) => {
    const { name, email, cnpj, regime } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO clients (name, email, cnpj, regime) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, cnpj, regime]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Tasks API
app.get('/api/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY due_date ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tasks/:id', async (req, res) => {
    const { status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tasks', async (req, res) => {
    const { title, client_id, due_date, sector } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tasks (title, client_id, due_date, sector) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, client_id, due_date, sector]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Transactions API (for Dashboard)
app.get('/api/transactions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM transactions ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/transactions', async (req, res) => {
    const { description, amount, type, date } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO transactions (description, amount, type, date) VALUES ($1, $2, $3, $4) RETURNING *',
            [description, amount, type, date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Generic Delete Endpoints ---

app.delete('/api/clients/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/tasks/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/transactions/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM transactions WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/documents/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM documents WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Folders API ---

app.get('/api/folders', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM folders ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/folders', async (req, res) => {
    const { name, color } = req.body;
    try {
        const result = await pool.query('INSERT INTO folders (name, color) VALUES ($1, $2) RETURNING *', [name, color]);
        res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/folders/:id', async (req, res) => {
    const { name, color } = req.body;
    try {
        const result = await pool.query('UPDATE folders SET name = $1, color = $2 WHERE id = $3 RETURNING *', [name, color, req.params.id]);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/folders/:id', async (req, res) => {
    try {
        // Unlink documents first (set folder_id to NULL) or cascade delete? Let's unlink for safety.
        await pool.query('UPDATE documents SET folder_id = NULL WHERE folder_id = $1', [req.params.id]);
        await pool.query('DELETE FROM folders WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Move Document (Update Folder ID)
app.put('/api/documents/:id/move', async (req, res) => {
    const { folder_id } = req.body;
    try {
        const result = await pool.query('UPDATE documents SET folder_id = $1 WHERE id = $2 RETURNING *', [folder_id, req.params.id]);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Documents API (Updated)
app.get('/api/documents', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM documents ORDER BY upload_date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/documents', upload.single('file'), async (req, res) => {
    // Multer adds 'file' to req
    const { name, type, size, folder_id } = req.body; // Multer also processes body
    const filePath = req.file ? req.file.path : null;

    try {
        const result = await pool.query(
            'INSERT INTO documents (name, type, size, file_path, folder_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, type, size, filePath, folder_id || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/documents/:id/download', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).send('Not Found');

        const doc = result.rows[0];
        if (!doc.file_path || !fs.existsSync(doc.file_path)) {
            return res.status(404).json({ error: 'File not found on server' });
        }

        // Resolve absolute path
        res.download(path.resolve(doc.file_path), doc.name);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Reminders API ---
app.get('/api/reminders', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM reminders ORDER BY due_date ASC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/reminders', async (req, res) => {
    const { title, due_date, description } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO reminders (title, due_date, description) VALUES ($1, $2, $3) RETURNING *',
            [title, due_date, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/reminders/:id', async (req, res) => {
    const { title, due_date, description } = req.body;
    try {
        const result = await pool.query(
            'UPDATE reminders SET title = $1, due_date = $2, description = $3 WHERE id = $4 RETURNING *',
            [title, due_date, description, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/reminders/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM reminders WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
