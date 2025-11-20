import { useState, useEffect } from 'react';
import UsersList from '../components/UsersList';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`);
      if (res.ok) {
        setUsers(await res.json());
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
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

  return <UsersList users={users} />;
}
