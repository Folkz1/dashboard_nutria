import express from 'express';
import { query } from '../services/database.js';

const router = express.Router();

// Get metrics (alias for overview - usado pelo frontend)
router.get('/metrics', async (req, res) => {
  try {
    const usersResult = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN subscription = 'premium' THEN 1 END) as premium_users,
        COUNT(CASE WHEN subscription = 'trial' THEN 1 END) as trial_users,
        COUNT(CASE WHEN last_interaction > NOW() - INTERVAL '24 hours' THEN 1 END) as active_today
      FROM users
    `);

    const analysesResult = await query(`
      SELECT 
        COUNT(*) as total_analyses,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as analyses_today
      FROM food_analyses
    `);

    // Activity by hour (last 24h)
    const activityResult = await query(`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM n8n_chat
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour
    `);

    // Conversion rate
    const conversionResult = await query(`
      SELECT 
        COUNT(CASE WHEN subscription = 'trial' THEN 1 END) as trials,
        COUNT(CASE WHEN subscription = 'premium' THEN 1 END) as premiums
      FROM users
    `);

    const trials = parseInt(conversionResult.rows[0].trials) || 0;
    const premiums = parseInt(conversionResult.rows[0].premiums) || 0;
    const conversion_rate = trials > 0 ? Math.round((premiums / (trials + premiums)) * 100) : 0;

    res.json({
      total_users: parseInt(usersResult.rows[0].total_users),
      premium_users: parseInt(usersResult.rows[0].premium_users),
      trial_users: parseInt(usersResult.rows[0].trial_users),
      active_today: parseInt(usersResult.rows[0].active_today),
      total_analyses: parseInt(analysesResult.rows[0].total_analyses),
      analyses_today: parseInt(analysesResult.rows[0].analyses_today),
      conversion_rate,
      activity_24h: activityResult.rows
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get overview metrics
router.get('/overview', async (req, res) => {
  try {
    const metrics = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN subscription = 'premium' THEN 1 END) as premium_users,
        COUNT(CASE WHEN subscription = 'trial' THEN 1 END) as trial_users,
        COUNT(CASE WHEN subscription = 'gratuito' THEN 1 END) as free_users,
        COUNT(CASE WHEN state = 'ativo' THEN 1 END) as active_users,
        COUNT(CASE WHEN last_interaction > NOW() - INTERVAL '1 hour' THEN 1 END) as active_last_hour,
        COUNT(CASE WHEN last_interaction > NOW() - INTERVAL '24 hours' THEN 1 END) as active_last_24h,
        COUNT(CASE WHEN last_interaction > NOW() - INTERVAL '7 days' THEN 1 END) as active_last_7d
      FROM users
    `);

    const analyses = await query(`
      SELECT 
        COUNT(*) as total_analyses,
        COUNT(CASE WHEN analyzed_at > NOW() - INTERVAL '24 hours' THEN 1 END) as analyses_today,
        COUNT(CASE WHEN analyzed_at > NOW() - INTERVAL '7 days' THEN 1 END) as analyses_week,
        AVG(score) as avg_score
      FROM food_analyses
    `);

    const conversations = await query(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(DISTINCT session_id) as unique_sessions,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as messages_today
      FROM n8n_chat
    `);

    res.json({
      users: metrics.rows[0],
      analyses: analyses.rows[0],
      conversations: conversations.rows[0]
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Failed to fetch overview metrics' });
  }
});

// Get activity chart data (last 24 hours)
router.get('/activity-chart', async (req, res) => {
  try {
    const data = await query(`
      SELECT 
        DATE_TRUNC('hour', created_at) as hour,
        COUNT(*) as message_count,
        COUNT(DISTINCT session_id) as active_users
      FROM n8n_chat
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY DATE_TRUNC('hour', created_at)
      ORDER BY hour ASC
    `);

    res.json(data.rows);
  } catch (error) {
    console.error('Error fetching activity chart:', error);
    res.status(500).json({ error: 'Failed to fetch activity chart' });
  }
});

// Get heatmap data (hour x day of week)
router.get('/heatmap', async (req, res) => {
  try {
    const data = await query(`
      SELECT 
        EXTRACT(DOW FROM created_at) as day_of_week,
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM n8n_chat
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY day_of_week, hour
      ORDER BY day_of_week, hour
    `);

    res.json(data.rows);
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

// Get top products analyzed
router.get('/top-products', async (req, res) => {
  try {
    const data = await query(`
      SELECT 
        product_name,
        COUNT(*) as count,
        AVG(score) as avg_score,
        COUNT(CASE WHEN feedback = 'thumbs_up' THEN 1 END) as positive_feedback,
        COUNT(CASE WHEN feedback = 'thumbs_down' THEN 1 END) as negative_feedback
      FROM food_analyses
      WHERE product_name IS NOT NULL
      GROUP BY product_name
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json(data.rows);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

// Get conversion funnel
router.get('/funnel', async (req, res) => {
  try {
    const data = await query(`
      SELECT 
        subscription,
        COUNT(*) as count,
        AVG(consecutive_days) as avg_consecutive_days,
        AVG(daily_analyses) as avg_daily_analyses
      FROM users
      GROUP BY subscription
      ORDER BY 
        CASE subscription
          WHEN 'trial' THEN 1
          WHEN 'gratuito' THEN 2
          WHEN 'premium' THEN 3
        END
    `);

    res.json(data.rows);
  } catch (error) {
    console.error('Error fetching funnel:', error);
    res.status(500).json({ error: 'Failed to fetch funnel data' });
  }
});

export default router;
