import { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import LiveActivity from '../components/LiveActivity';
import AlertsPanel from '../components/AlertsPanel';
import ActivityChart from '../components/ActivityChart';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Overview() {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [metricsRes, usersRes, alertsRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/metrics`),
        fetch(`${API_URL}/api/users`),
        fetch(`${API_URL}/api/alerts`)
      ]);

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
        setActivityData(data.activity_24h || []);
      }
      if (usersRes.ok) setUsers(await usersRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Usuários"
          value={metrics?.total_users || 0}
          subtitle={`${metrics?.trial_users || 0} trials • ${metrics?.premium_users || 0} premium`}
          icon="👥"
        />
        <MetricCard
          title="Ativos Hoje"
          value={metrics?.active_today || 0}
          subtitle="Últimas 24 horas"
          icon="🔥"
        />
        <MetricCard
          title="Análises Hoje"
          value={metrics?.analyses_today || 0}
          subtitle={`${metrics?.total_analyses || 0} total`}
          icon="📊"
        />
        <MetricCard
          title="Taxa de Conversão"
          value={`${metrics?.conversion_rate || 0}%`}
          subtitle="Trial → Premium"
          icon="💰"
        />
      </div>

      {/* Activity Chart */}
      <ActivityChart data={activityData} />

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveActivity users={users} />
        <AlertsPanel alerts={alerts} />
      </div>
    </div>
  );
}
