import express from 'express';
import { query } from '../services/database.js';
import crypto from 'crypto';

const router = express.Router();

// Gerar token único para usuário (você pode rodar isso uma vez para cada usuário)
function generateUserToken(userId) {
  return crypto.createHash('sha256').update(`${userId}-nutria-secret`).digest('hex').substring(0, 16);
}

// GET /api/public/user/:token - Dados públicos do usuário
router.get('/user/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Buscar usuário pelo token
    // Nota: Você precisa adicionar coluna 'public_token' na tabela users
    // Ou usar hash do user_id como token
    const userResult = await query(`
      SELECT 
        id as user_id,
        name,
        subscription,
        created_at,
        last_interaction,
        consecutive_days,
        trial_start,
        trial_end
      FROM users
      WHERE MD5(CONCAT(id, '-nutria-secret')) = $1
      LIMIT 1
    `, [token]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = userResult.rows[0];

    // Buscar estatísticas
    const [analysesResult, conversationsResult, milestonesResult] = await Promise.all([
      // Total de análises
      query(`
        SELECT COUNT(*) as total
        FROM food_analyses
        WHERE user_id = $1
      `, [user.user_id]),
      
      // Total de conversas
      query(`
        SELECT COUNT(DISTINCT session_id) as total
        FROM n8n_chat
        WHERE session_id = $1
      `, [user.user_id]),
      
      // Conquistas/Milestones
      query(`
        SELECT 
          consecutive_days,
          (SELECT COUNT(*) FROM food_analyses WHERE user_id = $1) as total_analyses,
          (SELECT AVG(score) FROM food_analyses WHERE user_id = $1) as avg_score
        FROM users
        WHERE id = $1
      `, [user.user_id])
    ]);

    // Análises recentes (últimas 10)
    const recentAnalyses = await query(`
      SELECT 
        product_name,
        score,
        created_at,
        ARRAY_TO_STRING(alerts, ', ') as main_alerts
      FROM food_analyses
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `, [user.user_id]);

    // Atividade por dia (últimos 30 dias)
    const activityData = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM food_analyses
      WHERE user_id = $1
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [user.user_id]);

    // Calcular conquistas
    const stats = milestonesResult.rows[0];
    const achievements = [];

    if (stats.consecutive_days >= 7) {
      achievements.push({
        icon: '🔥',
        title: 'Streak Master',
        description: `${stats.consecutive_days} dias consecutivos!`
      });
    }

    if (stats.total_analyses >= 10) {
      achievements.push({
        icon: '🔍',
        title: 'Detetive Nutricional',
        description: `${stats.total_analyses} produtos analisados`
      });
    }

    if (stats.total_analyses >= 50) {
      achievements.push({
        icon: '🏆',
        title: 'Expert em Rótulos',
        description: '50+ análises realizadas'
      });
    }

    if (stats.avg_score && stats.avg_score < 5) {
      achievements.push({
        icon: '⚠️',
        title: 'Alerta Vermelho',
        description: 'Produtos com score baixo'
      });
    }

    if (stats.avg_score && stats.avg_score >= 7) {
      achievements.push({
        icon: '✅',
        title: 'Escolhas Saudáveis',
        description: 'Produtos com score alto'
      });
    }

    // Calcular dias restantes do trial
    let trialDaysLeft = null;
    if (user.subscription === 'trial' && user.trial_end) {
      const daysLeft = Math.ceil((new Date(user.trial_end) - new Date()) / (1000 * 60 * 60 * 24));
      trialDaysLeft = Math.max(0, daysLeft);
    }

    res.json({
      user: {
        name: user.name || 'Usuário',
        subscription: user.subscription,
        memberSince: user.created_at,
        consecutiveDays: user.consecutive_days || 0,
        trialDaysLeft
      },
      stats: {
        totalAnalyses: parseInt(analysesResult.rows[0].total),
        totalConversations: parseInt(conversationsResult.rows[0].total),
        avgScore: stats.avg_score ? parseFloat(stats.avg_score).toFixed(1) : null
      },
      achievements,
      recentAnalyses: recentAnalyses.rows,
      activityData: activityData.rows
    });

  } catch (error) {
    console.error('Error fetching public user data:', error);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

// GET /api/public/generate-token/:userId - Gerar token para usuário (uso interno)
router.get('/generate-token/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar se usuário existe
    const userResult = await query('SELECT id FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Gerar token (MD5 do id + secret)
    const tokenResult = await query(`
      SELECT MD5(CONCAT(id, '-nutria-secret')) as token
      FROM users
      WHERE id = $1
    `, [userId]);

    const token = tokenResult.rows[0].token;
    const publicUrl = `${process.env.FRONTEND_URL}/u/${token}`;

    res.json({
      userId,
      token,
      publicUrl
    });

  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Erro ao gerar token' });
  }
});

export default router;
