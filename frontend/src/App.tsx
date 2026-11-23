import { useState, useEffect } from 'react';
import {
  Server,
  Users,
  DoorOpen,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  createdAt?: string;
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
  database?: string;
  timestamp: string;
  uptime?: string;
}

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomCapacity, setRoomCapacity] = useState('6');
  const [roomLocation, setRoomLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/v1/health');
      if (res.ok) {
        const json = await res.json();
        setHealth(json.data ?? json);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Backend not yet reachable:', msg);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/v1/users');
      if (res.ok) {
        const json = await res.json();
        const list = json.data ?? json;
        if (Array.isArray(list)) {
          setUsers(list);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Failed to fetch users:', msg);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch('/v1/rooms');
      if (res.ok) {
        const json = await res.json();
        const list = json.data ?? json;
        if (Array.isArray(list)) {
          setRooms(list);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Failed to fetch rooms:', msg);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchUsers();
    fetchRooms();
  }, []);

  const refreshAll = () => {
    fetchHealth();
    fetchUsers();
    fetchRooms();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || undefined,
          email,
          password: password || 'Password123!',
          role: 'EMPLOYEE',
        }),
      });

      if (res.ok) {
        setName('');
        setEmail('');
        setPassword('');
        await fetchUsers();
      } else {
        const err = await res.json();
        setErrorMsg(err.message || 'Gagal membuat user');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungi server';
      setErrorMsg(msg);
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
      const res = await fetch('/v1/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName,
          capacity: parseInt(roomCapacity, 10) || 4,
          location: roomLocation || undefined,
        }),
      });

      if (res.ok) {
        setRoomName('');
        setRoomLocation('');
        await fetchRooms();
      } else {
        const err = await res.json();
        setErrorMsg(err.message || 'Gagal menambahkan ruangan');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungi server';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center py-10 px-4">
      <div className="w-full max-w-5xl space-y-8">
        {/* Header */}
        <header className="rounded-xl border border-border bg-card p-6 shadow-sm text-center space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">
            Room Bookings System
          </h1>
          <p className="text-sm text-muted-foreground">
            NestJS (v11) + Prisma (PostgreSQL) + React 19 + Tailwind CSS + shadcn/ui
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['NestJS v11', 'Prisma ORM', 'PostgreSQL', 'React 19 + Vite', 'Tailwind CSS', 'shadcn/ui'].map(
              (badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center rounded-full bg-emerald-950/60 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-800"
                >
                  <CheckCircle2 className="mr-1.5 h-3 w-3" />
                  {badge}
                </span>
              ),
            )}
          </div>
        </header>

        {/* Status Card */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Backend & Database Status</h2>
            </div>
            <Button variant="outline" size="sm" onClick={refreshAll}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>

          {health ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-lg bg-muted/40 border border-border text-sm">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                <span>
                  Status: <strong>{health.status}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-primary" />
                <span>
                  Database: <strong>{health.database ?? 'Connected'}</strong>
                </span>
              </div>
              <div className="text-muted-foreground">
                Uptime: <strong>{health.uptime ?? 'Active'}</strong>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 p-4 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-sm">
              <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <span>Backend belum terhubung. Pastikan server NestJS berjalan di port 3000!</span>
            </div>
          )}
        </section>

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-center space-x-2 p-4 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Section */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Tambah User</h2>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <input
                type="email"
                placeholder="Email (cth: user@company.com)"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <Button type="submit" disabled={loading} className="w-full">
                <Plus className="mr-1.5 h-4 w-4" />
                {loading ? 'Menyimpan...' : 'Simpan User'}
              </Button>
            </form>

            <div className="pt-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Daftar User</h3>
              {users.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Belum ada user tersimpan.</p>
              ) : (
                <ul className="divide-y divide-border rounded-md border border-border overflow-hidden">
                  {users.map((u) => (
                    <li key={u.id} className="p-3 text-sm bg-muted/20 hover:bg-muted/40 transition">
                      <div className="font-medium">{u.name || 'Anonymous'}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Room Section */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center space-x-2">
              <DoorOpen className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Tambah Room</h2>
            </div>
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <input
                type="text"
                placeholder="Nama Ruangan (cth: Meeting Room Alpha)"
                value={roomName}
                required
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Kapasitas (Orang)"
                  value={roomCapacity}
                  min="1"
                  onChange={(e) => setRoomCapacity(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <input
                  type="text"
                  placeholder="Lokasi (Lantai 2)"
                  value={roomLocation}
                  onChange={(e) => setRoomLocation(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                <Plus className="mr-1.5 h-4 w-4" />
                {loading ? 'Menyimpan...' : 'Simpan Room'}
              </Button>
            </form>

            <div className="pt-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Daftar Ruangan</h3>
              {rooms.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Belum ada ruangan terdaftar.</p>
              ) : (
                <ul className="divide-y divide-border rounded-md border border-border overflow-hidden">
                  {rooms.map((r) => (
                    <li key={r.id} className="p-3 text-sm bg-muted/20 hover:bg-muted/40 transition">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Kapasitas: {r.capacity} orang {r.location ? `• ${r.location}` : ''}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
