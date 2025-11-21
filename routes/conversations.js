import express from 'express';
import { query } from '../services/database.js';

const router = express.Router();

// Get recent conversations
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const conversations = await query(`
      SELECT 
        c.id,
        c.session_id as user_id,
        c.message->>'type' as role,
        c.message->>'content' as content,
        c.created_at as timestamp,
        u.name as user_name,
        CASE 
          WHEN u.last_interaction > NOW() - INTERVAL '5 minutes' THEN true
          ELSE false
        END as is_active
      FROM n8n_chat c
      LEFT JOIN users u ON c.session_id = u.id
      WHERE c.created_at IS NOT NULL
      ORDER BY c.created_at DESC
      LIMIT $1
    `, [limit]);

    res.json(conversations.rows);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get conversation by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    const conversation = await query(`
      SELECT 
        id,
        session_id,
        message,
        created_at
      FROM n8n_chat
      WHERE session_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [userId, limit]);

    res.json(conversation.rows);
  } catch (error) {
    console.error('Error fetching user conversation:', error);
    res.status(500).json({ error: 'Failed to fetch user conversation' });
  }
});

// Get conversation statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(DISTINCT session_id) as unique_users,
        COUNT(CASE WHEN message->>'type' = 'human' THEN 1 END) as user_messages,
        COUNT(CASE WHEN message->>'type' = 'ai' THEN 1 END) as bot_messages,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as messages_today,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as messages_last_hour
      FROM n8n_chat
    `);

    // Average conversation duration
    const durations = await query(`
      SELECT 
        session_id,
        EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at)))/60 as duration_minutes,
        COUNT(*) as message_count
      FROM n8n_chat
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY session_id
      HAVING COUNT(*) > 1
    `);

    const avgDuration = durations.rows.length > 0
      ? durations.rows.reduce((sum, d) => sum + parseFloat(d.duration_minutes), 0) / durations.rows.length
      : 0;

    const avgMessages = durations.rows.length > 0
      ? durations.rows.reduce((sum, d) => sum + parseInt(d.message_count), 0) / durations.rows.length
      : 0;

    res.json({
      ...stats.rows[0],
      avg_conversation_duration_minutes: Math.round(avgDuration),
      avg_messages_per_conversation: Math.round(avgMessages)
    });
  } catch (error) {
    console.error('Error fetching conversation stats:', error);
    res.status(500).json({ error: 'Failed to fetch conversation stats' });
  }
});

// Get active conversations (last 30 minutes)
router.get('/active', async (req, res) => {
  try {
    const active = await query(`
      SELECT 
        c.session_id,
        u.name as user_name,
        COUNT(*) as message_count,
        MAX(c.created_at) as last_message,
        MIN(c.created_at) as first_message,
        EXTRACT(EPOCH FROM (MAX(c.created_at) - MIN(c.created_at)))/60 as duration_minutes
      FROM n8n_chat c
      LEFT JOIN users u ON c.session_id = u.id
      WHERE c.created_at > NOW() - INTERVAL '30 minutes'
      GROUP BY c.session_id, u.name
      ORDER BY last_message DESC
    `);

    res.json(active.rows);
  } catch (error) {
    console.error('Error fetching active conversations:', error);
    res.status(500).json({ error: 'Failed to fetch active conversations' });
  }
});

export default router;
