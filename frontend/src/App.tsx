import { useState, useEffect } from 'react';
import './App.css';

interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

interface Room {
  id: string;
  name: string;
  capacity: number;
  location?: string;
  description?: string;
}

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  prismaReady: boolean;
}

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomCapacity, setRoomCapacity] = useState('6');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (err: any) {
      console.warn('Backend not yet reachable:', err.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data.warning) {
          setErrorMsg(data.warning);
        }
      }
    } catch (err: any) {
      console.warn('Failed to fetch users:', err.message);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setRooms(data);
        }
      }
    } catch (err: any) {
      console.warn('Failed to fetch rooms:', err.message);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchUsers();
    fetchRooms();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || undefined, email }),
      });

      if (res.ok) {
        setName('');
        setEmail('');
        await fetchUsers();
      } else {
        const err = await res.json();
        setErrorMsg(err.message || 'Gagal membuat user');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghubungi server');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName, capacity: parseInt(roomCapacity) || 4 }),
      });

      if (res.ok) {
        setRoomName('');
        await fetchRooms();
      } else {
        const err = await res.json();
        setErrorMsg(err.message || 'Gagal menambahkan ruangan');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghubungi server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Room Bookings System</h1>
        <p>NestJS (v11) + Prisma (PostgreSQL Serverless) + React (Vite) + Docker</p>
        <div className="badges">
          <span className="badge active">NestJS v11</span>
          <span className="badge active">Prisma ORM</span>
          <span className="badge active">PostgreSQL Serverless</span>
          <span className="badge active">React 19 + Vite</span>
          <span className="badge active">ESLint Flat Config</span>
          <span className="badge active">Docker Compose</span>
        </div>
      </header>

      <section className="card">
        <h2>
          <span>Backend & Database Status</span>
          <button onClick={() => { fetchHealth(); fetchUsers(); fetchRooms(); }} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            Refresh
          </button>
        </h2>
        {health ? (
          <div className="status-box">
            Status: {health.status} ({health.service})&#10;
            Server Time: {new Date(health.timestamp).toLocaleString()}&#10;
            Prisma Ready: {health.prismaReady ? 'Yes' : 'No'}
          </div>
        ) : (
          <div className="status-box" style={{ color: '#fbbf24' }}>
            Backend belum terhubung. Jalankan backend atau gunakan Docker Compose!
          </div>
        )}
      </section>

      {errorMsg && (
        <div style={{ color: '#f87171', background: '#450a0a', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #7f1d1d' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <section className="card">
          <h2>Tambah User</h2>
          <form onSubmit={handleCreateUser}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email (cth: user@company.com)"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan User'}
            </button>
          </form>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1rem', color: '#94a3b8' }}>Daftar User</h3>
          {users.length === 0 ? (
            <p className="empty-state">Belum ada user tersimpan.</p>
          ) : (
            <ul className="user-list">
              {users.map((u) => (
                <li key={u.id} className="user-item">
                  <div>
                    <div className="user-name">{u.name || 'Anonymous'}</div>
                    <div className="user-email">{u.email}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2>Tambah Room</h2>
          <form onSubmit={handleCreateRoom}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Nama Ruangan (cth: Meeting Room Alpha)"
                value={roomName}
                required
                onChange={(e) => setRoomName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Kapasitas (Orang)"
                value={roomCapacity}
                min="1"
                onChange={(e) => setRoomCapacity(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Room'}
            </button>
          </form>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1rem', color: '#94a3b8' }}>Daftar Ruangan</h3>
          {rooms.length === 0 ? (
            <p className="empty-state">Belum ada ruangan terdaftar.</p>
          ) : (
            <ul className="user-list">
              {rooms.map((r) => (
                <li key={r.id} className="user-item">
                  <div>
                    <div className="user-name">{r.name}</div>
                    <div className="user-email">Kapasitas: {r.capacity} orang</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
