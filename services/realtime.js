import { query } from './database.js';

let updateInterval;

export function startRealtimeUpdates(wss) {
  // Broadcast updates every 5 seconds
  updateInterval = setInterval(async () => {
    try {
      const data = await getRealtimeData();
      
      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify({
            type: 'realtime_update',
            data,
            timestamp: new Date().toISOString()
          }));
        }
      });
    } catch (error) {
      console.error('Error in realtime updates:', error);
    }
  }, 5000);
}

async function getRealtimeData() {
  // Active users (last 5 minutes)
  const activeUsers = await query(`
    SELECT 
      u.id,
      u.name,
      u.last_interaction,
      EXTRACT(EPOCH FROM (NOW() - u.last_interaction)) as seconds_ago,
      (
        SELECT COUNT(*) 
        FROM n8n_chat c 
        WHERE c.session_id = u.id 
        AND c.created_at > NOW() - INTERVAL '5 minutes'
      ) as recent_messages
    FROM users u
    WHERE u.last_interaction > NOW() - INTERVAL '5 minutes'
    ORDER BY u.last_interaction DESC
  `);

  // Recent activity (last 5 minutes)
  const recentActivity = await query(`
    SELECT 
      'message' as type,
      session_id as user_id,
      created_at,
      message->>'type' as message_type
    FROM n8n_chat
    WHERE created_at > NOW() - INTERVAL '5 minutes'
    
    UNION ALL
    
    SELECT 
      'analysis' as type,
      user_id,
      analyzed_at as created_at,
      product_name as message_type
    FROM food_analyses
    WHERE analyzed_at > NOW() - INTERVAL '5 minutes'
    
    ORDER BY created_at DESC
    LIMIT 20
  `);

  // Messages per minute (last hour)
  const messagesPerMinute = await query(`
    SELECT 
      DATE_TRUNC('minute', created_at) as minute,
      COUNT(*) as count
    FROM n8n_chat
    WHERE created_at > NOW() - INTERVAL '1 hour'
    GROUP BY DATE_TRUNC('minute', created_at)
    ORDER BY minute DESC
    LIMIT 60
  `);

  return {
    activeUsers: activeUsers.rows,
    recentActivity: recentActivity.rows,
    messagesPerMinute: messagesPerMinute.rows
  };
}

export function stopRealtimeUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
}
