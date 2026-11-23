import { Users, CheckCircle2, ShieldCheck, MoreHorizontal } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserItem } from '@/types/dashboard';

const MOCK_USERS: UserItem[] = [
  {
    id: 'USR-01',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'ADMIN',
    status: 'Active',
    joined: '12 Jan 2026',
  },
  {
    id: 'USR-02',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    role: 'EMPLOYEE',
    status: 'Active',
    joined: '04 Feb 2026',
  },
  {
    id: 'USR-03',
    name: 'Michael Scott',
    email: 'michael@example.com',
    role: 'EMPLOYEE',
    status: 'Active',
    joined: '19 Feb 2026',
  },
  {
    id: 'USR-04',
    name: 'Dwight Schrute',
    email: 'dwight@example.com',
    role: 'ADMIN',
    status: 'Active',
    joined: '01 Mar 2026',
  },
];

export function UsersView() {
  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <section aria-label="Users Statistics" className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Users"
          value="45"
          description="Registered active accounts"
          icon={Users}
          className="border-border bg-card"
        />
        <StatCard
          title="Administrators"
          value="4"
          description="Full system privilege"
          icon={ShieldCheck}
          className="border-border bg-card"
        />
        <StatCard
          title="Employees"
          value="41"
          description="Standard reservation rights"
          icon={CheckCircle2}
          className="border-border bg-card"
        />
      </section>

      {/* Users Table Card */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="px-6 py-4 border-b border-border">
          <CardTitle className="text-base font-semibold">User Directory</CardTitle>
          <CardDescription>
            List of registered users and access permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <caption className="sr-only">List of registered organization users</caption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">User ID</TableHead>
                <TableHead scope="col">Name</TableHead>
                <TableHead scope="col">Email</TableHead>
                <TableHead scope="col">Role</TableHead>
                <TableHead scope="col">Joined</TableHead>
                <TableHead scope="col" className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_USERS.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{user.joined}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      aria-label={`Options for ${user.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
