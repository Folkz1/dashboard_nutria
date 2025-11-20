import express from 'express';
import { query } from '../services/database.js';

const router = express.Router();

// Calculate engagement score
function calculateEngagementScore(user) {
  let score = 0;
  
  // Consecutive days (max 30 points)
  score += Math.min(user.consecutive_days * 3, 30);
  
  // Usage rate (max 30 points)
  const usageRate = user.daily_analyses / 50; // Assuming 50 is max
  score += usageRate * 30;
  
  // Recent activity (20 points if active today)
  const hoursSinceLastInteraction = user.hours_since_last_interaction || 999;
  if (hoursSinceLastInteraction < 24) {
    score += 20;
  } else if (hoursSinceLastInteraction < 72) {
    score += 10;
  }
  
  // Follow-up response rate (max 20 points)
  if (user.followups_sent > 0) {
    const responseRate = user.followups_responded / user.followups_sent;
    score += responseRate * 20;
  }
  
  return Math.round(Math.min(score, 100));
}

// Get all users with engagement scores
router.get('/', async (req, res) => {
  try {
    const users = await query(`
      SELECT 
        u.id,
        u.name,
        u.subscription,
        u.state,
        u.consecutive_days,
        u.daily_analyses,
        u.last_interaction,
        EXTRACT(EPOCH FROM (NOW() - u.last_interaction))/3600 as hours_since_last_interaction,
        u.trial_end,
        COUNT(DISTINCT fa.id) as total_analyses,
        AVG(fa.score) as avg_score,
        COUNT(DISTINCT fl.id) as followups_sent,
        COUNT(DISTINCT CASE WHEN fl.user_responded THEN fl.id END) as followups_responded,
        (
          SELECT COUNT(*) 
          FROM n8n_chat c 
          WHERE c.session_id = u.id 
          AND c.created_at > NOW() - INTERVAL '24 hours'
        ) as messages_today
      FROM users u
      LEFT JOIN food_analyses fa ON u.id = fa.user_id
      LEFT JOIN followup_logs fl ON u.id = fl.user_id
      GROUP BY u.id, u.name, u.subscription, u.state, u.consecutive_days, 
               u.daily_analyses, u.last_interaction, u.trial_end
      ORDER BY u.last_interaction DESC NULLS LAST
    `);

    // Calculate engagement scores
    const usersWithScores = users.rows.map(user => ({
      ...user,
      engagement_score: calculateEngagementScore(user),
      risk_level: getRiskLevel(user)
    }));

    res.json(usersWithScores);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user details
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // User basic info
    const userInfo = await query(`
      SELECT 
        u.*,
        hp.allergies,
        hp.conditions,
        hp.goals,
        hp.restrictions
      FROM users u
      LEFT JOIN health_profiles hp ON u.id = hp.user_id
      WHERE u.id = $1
    `, [userId]);

    if (userInfo.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Recent analyses
    const analyses = await query(`
      SELECT *
      FROM food_analyses
      WHERE user_id = $1
      ORDER BY analyzed_at DESC
      LIMIT 10
    `, [userId]);

    // Recent conversations
    const conversations = await query(`
      SELECT 
        created_at,
        message
      FROM n8n_chat
      WHERE session_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    `, [userId]);

    // Follow-ups
    const followups = await query(`
      SELECT *
      FROM followup_logs
      WHERE user_id = $1
      ORDER BY sent_at DESC
      LIMIT 10
    `, [userId]);

    // Statistics
    const stats = await query(`
      SELECT 
        COUNT(DISTINCT fa.id) as total_analyses,
        AVG(fa.score) as avg_score,
        COUNT(DISTINCT fl.id) as total_followups,
        COUNT(DISTINCT CASE WHEN fl.user_responded THEN fl.id END) as followups_responded,
        COUNT(DISTINCT wl.id) as total_workouts,
        COUNT(DISTINCT CASE WHEN wl.completed THEN wl.id END) as completed_workouts
      FROM users u
      LEFT JOIN food_analyses fa ON u.id = fa.user_id
      LEFT JOIN followup_logs fl ON u.id = fl.user_id
      LEFT JOIN workout_logs wl ON u.id = wl.user_id
      WHERE u.id = $1
    `, [userId]);

    const user = userInfo.rows[0];
    
    res.json({
      user: {
        ...user,
        engagement_score: calculateEngagementScore({
          ...user,
          ...stats.rows[0]
        })
      },
      analyses: analyses.rows,
      conversations: conversations.rows,
      followups: followups.rows,
      stats: stats.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Helper function to determine risk level
function getRiskLevel(user) {
  const hoursSinceLastInteraction = user.hours_since_last_interaction || 999;
  
  if (hoursSinceLastInteraction > 168) { // 7 days
    return 'high';
  } else if (hoursSinceLastInteraction > 72) { // 3 days
    return 'medium';
  }
  return 'low';
}

export default router;
