import express from 'express';
import { query } from '../services/database.js';

const router = express.Router();

// Get all alerts
router.get('/', async (req, res) => {
  try {
    const alerts = [];

    // 1. Trials ending soon
    const trialsEnding = await query(`
      SELECT 
        id,
        name,
        trial_end,
        EXTRACT(EPOCH FROM (trial_end - NOW()))/3600 as hours_remaining
      FROM users
      WHERE subscription = 'trial'
      AND trial_end IS NOT NULL
      AND trial_end > NOW()
      AND trial_end < NOW() + INTERVAL '7 days'
      ORDER BY trial_end ASC
    `);

    trialsEnding.rows.forEach(user => {
      const hours = Math.round(user.hours_remaining);
      let priority = 'medium';
      let message = `Trial de ${user.name} acaba em ${Math.round(hours/24)} dias`;
      
      if (hours < 24) {
        priority = 'high';
        message = `🚨 Trial de ${user.name} acaba em ${hours} horas!`;
      } else if (hours < 48) {
        priority = 'high';
        message = `⚠️ Trial de ${user.name} acaba amanhã`;
      }

      alerts.push({
        type: 'trial_ending',
        priority,
        message,
        user_id: user.id,
        user_name: user.name,
        data: { hours_remaining: hours }
      });
    });

    // 2. Inactive users (churn risk)
    const inactiveUsers = await query(`
      SELECT 
        id,
        name,
        subscription,
        last_interaction,
        EXTRACT(EPOCH FROM (NOW() - last_interaction))/3600 as hours_inactive
      FROM users
      WHERE last_interaction < NOW() - INTERVAL '2 days'
      AND subscription IN ('trial', 'premium')
      ORDER BY last_interaction ASC
    `);

    inactiveUsers.rows.forEach(user => {
      const days = Math.round(user.hours_inactive / 24);
      let priority = 'low';
      let message = `${user.name} inativo há ${days} dias`;
      
      if (days >= 7) {
        priority = 'high';
        message = `🔴 ${user.name} inativo há ${days} dias - Alto risco de churn`;
      } else if (days >= 3) {
        priority = 'medium';
        message = `⚠️ ${user.name} inativo há ${days} dias`;
      }

      alerts.push({
        type: 'inactive_user',
        priority,
        message,
        user_id: user.id,
        user_name: user.name,
        data: { days_inactive: days }
      });
    });

    // 3. Users hitting free limit (conversion opportunity)
    const limitReached = await query(`
      SELECT 
        u.id,
        u.name,
        u.daily_analyses,
        COUNT(fa.id) as analyses_today
      FROM users u
      LEFT JOIN food_analyses fa ON u.id = fa.user_id 
        AND fa.analyzed_at > NOW() - INTERVAL '24 hours'
      WHERE u.subscription = 'gratuito'
      GROUP BY u.id, u.name, u.daily_analyses
      HAVING COUNT(fa.id) >= 3
      ORDER BY COUNT(fa.id) DESC
    `);

    limitReached.rows.forEach(user => {
      alerts.push({
        type: 'limit_reached',
        priority: 'high',
        message: `💰 ${user.name} atingiu limite gratuito (${user.analyses_today} análises) - Oportunidade de conversão!`,
        user_id: user.id,
        user_name: user.name,
        data: { analyses_today: user.analyses_today }
      });
    });

    // 4. Milestones achieved
    const milestones = await query(`
      SELECT 
        id,
        name,
        consecutive_days
      FROM users
      WHERE consecutive_days IN (7, 14, 30, 60, 90)
      AND last_interaction > NOW() - INTERVAL '24 hours'
    `);

    milestones.rows.forEach(user => {
      alerts.push({
        type: 'milestone',
        priority: 'low',
        message: `🎉 ${user.name} completou ${user.consecutive_days} dias consecutivos!`,
        user_id: user.id,
        user_name: user.name,
        data: { consecutive_days: user.consecutive_days }
      });
    });

    // 5. High engagement users (conversion ready)
    const highEngagement = await query(`
      SELECT 
        u.id,
        u.name,
        u.subscription,
        u.consecutive_days,
        COUNT(fa.id) as total_analyses
      FROM users u
      LEFT JOIN food_analyses fa ON u.id = fa.user_id
      WHERE u.subscription = 'trial'
      AND u.consecutive_days >= 3
      GROUP BY u.id, u.name, u.subscription, u.consecutive_days
      HAVING COUNT(fa.id) >= 5
    `);

    highEngagement.rows.forEach(user => {
      alerts.push({
        type: 'high_engagement',
        priority: 'high',
        message: `🔥 ${user.name} está super engajado (${user.consecutive_days} dias, ${user.total_analyses} análises) - Pronto para converter!`,
        user_id: user.id,
        user_name: user.name,
        data: { 
          consecutive_days: user.consecutive_days,
          total_analyses: user.total_analyses
        }
      });
    });

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get alerts count by type
router.get('/count', async (req, res) => {
  try {
    const alerts = await query(`
      SELECT 
        COUNT(CASE WHEN trial_end < NOW() + INTERVAL '24 hours' THEN 1 END) as trials_ending_24h,
        COUNT(CASE WHEN trial_end < NOW() + INTERVAL '7 days' THEN 1 END) as trials_ending_7d,
        COUNT(CASE WHEN last_interaction < NOW() - INTERVAL '3 days' AND subscription IN ('trial', 'premium') THEN 1 END) as inactive_users,
        COUNT(CASE WHEN consecutive_days IN (7, 14, 30) AND last_interaction > NOW() - INTERVAL '24 hours' THEN 1 END) as milestones
      FROM users
      WHERE subscription = 'trial'
    `);

    res.json(alerts.rows[0]);
  } catch (error) {
    console.error('Error fetching alert counts:', error);
    res.status(500).json({ error: 'Failed to fetch alert counts' });
  }
});

export default router;
