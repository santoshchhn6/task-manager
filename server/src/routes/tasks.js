import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

const STATUSES = ['todo', 'in_progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * GET /api/tasks?status=todo&search=foo
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const where = [];
    const params = [];

    if (status && STATUSES.includes(status)) {
      where.push('status = ?');
      params.push(status);
    } else if (status) {
      throw httpError(400, `Invalid status. Use one of: ${STATUSES.join(', ')}`);
    }

    if (search) {
      where.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const sql = `SELECT * FROM tasks
                 ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                 ORDER BY FIELD(priority, 'high', 'medium', 'low'), due_date IS NULL, due_date ASC, created_at DESC`;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/tasks  { title, description?, priority?, dueDate? }
 */
router.post('/', async (req, res, next) => {
  try {
    const { title, description = null, priority = 'medium', dueDate = null } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      throw httpError(400, 'Title is required');
    }
    if (priority && !PRIORITIES.includes(priority)) {
      throw httpError(400, `Invalid priority. Use one of: ${PRIORITIES.join(', ')}`);
    }

    const [result] = await pool.execute(
      'INSERT INTO tasks (title, description, priority, due_date) VALUES (?, ?, ?, ?)',
      [title.trim(), description?.trim() || null, priority, dueDate || null],
    );

    const [[task]] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/tasks/:id  — partial update of any field
 */
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw httpError(400, 'Invalid task id');

    const body = req.body || {};
    const fields = [];
    const params = [];

    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || !body.title.trim()) throw httpError(400, 'Title cannot be empty');
      fields.push('title = ?');
      params.push(body.title.trim());
    }
    if (body.description !== undefined) {
      fields.push('description = ?');
      params.push(body.description?.trim() || null);
    }
    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) throw httpError(400, `Invalid status. Use one of: ${STATUSES.join(', ')}`);
      fields.push('status = ?');
      params.push(body.status);
    }
    if (body.priority !== undefined) {
      if (!PRIORITIES.includes(body.priority)) throw httpError(400, `Invalid priority. Use one of: ${PRIORITIES.join(', ')}`);
      fields.push('priority = ?');
      params.push(body.priority);
    }
    if (body.dueDate !== undefined) {
      fields.push('due_date = ?');
      params.push(body.dueDate || null);
    }

    if (!fields.length) throw httpError(400, 'No valid fields to update');

    const [result] = await pool.execute(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
    if (result.affectedRows === 0) throw httpError(404, `Task ${id} not found`);

    const [[task]] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(task);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/tasks/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw httpError(400, 'Invalid task id');

    const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
    if (result.affectedRows === 0) throw httpError(404, `Task ${id} not found`);
    res.json({ deleted: true, id });
  } catch (err) {
    next(err);
  }
});

export default router;
