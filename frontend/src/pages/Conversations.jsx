import { useState, useEffect } from 'react';
import ConversationsMonitor from '../components/ConversationsMonitor';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/conversations/recent`);
      if (res.ok) {
        setConversations(await res.json());
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
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

  return <ConversationsMonitor conversations={conversations} />;
}
