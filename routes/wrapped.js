import express from 'express';
import { query } from '../services/database.js';

const router = express.Router();

// GET /api/wrapped/:token/:year/:month - Relatório mensal do usuário
router.get('/:token/:year/:month', async (req, res) => {
  try {
    const { token, year, month } = req.params;
    
    // Buscar usuário pelo token
    const userResult = await query(`
      SELECT id as user_id, name, subscription, created_at
      FROM users
      WHERE MD5(CONCAT(id, '-nutria-secret')) = $1
      LIMIT 1
    `, [token]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = userResult.rows[0];
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;

    // 1. Estatísticas do mês
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_analyses,
        AVG(score) as avg_score,
        MIN(score) as worst_score,
        MAX(score) as best_score,
        COUNT(DISTINCT DATE(created_at)) as active_days
      FROM food_analyses
      WHERE user_id = $1
        AND created_at >= $2
        AND created_at <= $3
    `, [user.user_id, startDate, endDate]);

    const stats = statsResult.rows[0];

    // 2. Produto com melhor score
    const bestProductResult = await query(`
      SELECT product_name, score, created_at
      FROM food_analyses
      WHERE user_id = $1
        AND created_at >= $2
        AND created_at <= $3
      ORDER BY score DESC
      LIMIT 1
    `, [user.user_id, startDate, endDate]);

    // 3. Produto com pior score
    const worstProductResult = await query(`
      SELECT product_name, score, created_at
      FROM food_analyses
      WHERE user_id = $1
        AND created_at >= $2
        AND created_at <= $3
      ORDER BY score ASC
      LIMIT 1
    `, [user.user_id, startDate, endDate]);

    // 4. Categorias mais analisadas (baseado em palavras-chave)
    const categoriesResult = await query(`
      SELECT 
        CASE 
          WHEN LOWER(product_name) LIKE '%whey%' OR LOWER(product_name) LIKE '%protein%' THEN 'Proteínas'
          WHEN LOWER(product_name) LIKE '%creatina%' THEN 'Suplementos'
          WHEN LOWER(product_name) LIKE '%barra%' THEN 'Snacks'
          WHEN LOWER(product_name) LIKE '%iogurte%' OR LOWER(product_name) LIKE '%leite%' THEN 'Laticínios'
          ELSE 'Outros'
        END as category,
        COUNT(*) as count
      FROM food_analyses
      WHERE user_id = $1
        AND created_at >= $2
        AND created_at <= $3
      GROUP BY category
      ORDER BY count DESC
      LIMIT 3
    `, [user.user_id, startDate, endDate]);

    // 5. Alertas mais comuns
    const alertsResult = await query(`
      SELECT 
        UNNEST(alerts) as alert,
        COUNT(*) as count
      FROM food_analyses
      WHERE user_id = $1
        AND created_at >= $2
        AND created_at <= $3
        AND alerts IS NOT NULL
        AND array_length(alerts, 1) > 0
      GROUP BY alert
      ORDER BY count DESC
      LIMIT 3
    `, [user.user_id, startDate, endDate]);

    // 6. Dia mais ativo
    const mostActiveDayResult = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM food_analyses
      WHERE user_id = $1
        AND created_at >= $2
        AND created_at <= $3
      GROUP BY DATE(created_at)
      ORDER BY count DESC
      LIMIT 1
    `, [user.user_id, startDate, endDate]);

    // 7. Comparação com mês anterior
    const prevMonth = parseInt(month) - 1;
    const prevYear = prevMonth === 0 ? parseInt(year) - 1 : year;
    const prevMonthNum = prevMonth === 0 ? 12 : prevMonth;
    const prevStartDate = `${prevYear}-${prevMonthNum.toString().padStart(2, '0')}-01`;
    const prevEndDate = `${prevYear}-${prevMonthNum.toString().padStart(2, '0')}-31`;

    const prevStatsResult = await query(`
      SELECT COUNT(*) as total_analyses
      FROM food_analyses
      WHERE user_id = $1
        AND created_at >= $2
        AND created_at <= $3
    `, [user.user_id, prevStartDate, prevEndDate]);

    const prevStats = prevStatsResult.rows[0];
    const growth = prevStats.total_analyses > 0 
      ? Math.round(((stats.total_analyses - prevStats.total_analyses) / prevStats.total_analyses) * 100)
      : 0;

    // 8. Conquistas do mês
    const achievements = [];
    
    if (stats.total_analyses >= 30) {
      achievements.push({
        icon: '🏆',
        title: 'Análise Diária',
        description: 'Analisou produtos todos os dias!'
      });
    }
    
    if (stats.avg_score >= 7) {
      achievements.push({
        icon: '✅',
        title: 'Escolhas Saudáveis',
        description: 'Score médio excelente!'
      });
    }
    
    if (stats.total_analyses >= 50) {
      achievements.push({
        icon: '🔥',
        title: 'Super Ativo',
        description: '50+ análises no mês!'
      });
    }

    if (stats.active_days >= 20) {
      achievements.push({
        icon: '💪',
        title: 'Consistência',
        description: '20+ dias ativos!'
      });
    }

    // 9. Frase motivacional personalizada
    let motivationalPhrase = '';
    if (stats.avg_score >= 7) {
      motivationalPhrase = 'Você está fazendo escolhas incríveis! Continue assim! 🌟';
    } else if (stats.avg_score >= 5) {
      motivationalPhrase = 'Bom trabalho! Suas escolhas estão melhorando! 💪';
    } else {
      motivationalPhrase = 'Vamos juntos melhorar suas escolhas! Você consegue! 🚀';
    }

    // 10. Ranking (percentil)
    const rankingResult = await query(`
      WITH user_analyses AS (
        SELECT 
          user_id,
          COUNT(*) as total
        FROM food_analyses
        WHERE created_at >= $1 AND created_at <= $2
        GROUP BY user_id
      )
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN total < $3 THEN 1 ELSE 0 END) as users_below
      FROM user_analyses
    `, [startDate, endDate, stats.total_analyses]);

    const ranking = rankingResult.rows[0];
    const percentile = ranking.total_users > 0
      ? Math.round((ranking.users_below / ranking.total_users) * 100)
      : 50;

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    res.json({
      user: {
        name: user.name || 'Usuário',
        subscription: user.subscription
      },
      period: {
        month: monthNames[parseInt(month) - 1],
        year: parseInt(year)
      },
      stats: {
        totalAnalyses: parseInt(stats.total_analyses),
        avgScore: stats.avg_score ? parseFloat(stats.avg_score).toFixed(1) : null,
        bestScore: stats.best_score,
        worstScore: stats.worst_score,
        activeDays: parseInt(stats.active_days),
        growth: growth,
        percentile: percentile
      },
      highlights: {
        bestProduct: bestProductResult.rows[0] || null,
        worstProduct: worstProductResult.rows[0] || null,
        topCategories: categoriesResult.rows,
        commonAlerts: alertsResult.rows,
        mostActiveDay: mostActiveDayResult.rows[0] || null
      },
      achievements,
      motivationalPhrase
    });

  } catch (error) {
    console.error('Error fetching wrapped data:', error);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

// GET /api/wrapped/generate/:userId/:year/:month - Gerar wrapped para usuário (uso interno/N8N)
router.get('/generate/:userId/:year/:month', async (req, res) => {
  try {
    const { userId, year, month } = req.params;
    
    // Gerar token
    const tokenResult = await query(`
      SELECT MD5(CONCAT(id, '-nutria-secret')) as token
      FROM users
      WHERE id = $1
    `, [userId]);

    if (tokenResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const token = tokenResult.rows[0].token;
    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '') || '';
    const wrappedUrl = `${frontendUrl}/wrapped/${token}/${year}/${month}`;

    res.json({
      userId,
      token,
      wrappedUrl,
      year: parseInt(year),
      month: parseInt(month)
    });

  } catch (error) {
    console.error('Error generating wrapped:', error);
    res.status(500).json({ error: 'Erro ao gerar wrapped' });
  }
});

export default router;
