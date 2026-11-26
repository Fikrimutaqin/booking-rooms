import { Users, ShieldCheck, CheckCircle2, MoreHorizontal, Loader2, Trash2 } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUsers } from '@/hooks/useUsers';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/dashboard/TablePagination';
import { getUserRoleVariant } from '@/utils/status';
import { formatDate } from '@/utils/date';

/**
 * Name Function: UsersView
 * Description: User directory component displaying administrator vs employee metrics, account tables with initials avatars, and account deletion actions with client-side pagination.
 * Reason: Enables real-time user management via useUsers with visual role badges and formatted registration timestamps.
 **/
export function UsersView() {
  const { users, loading, error, deleteUser } = useUsers();

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedItems: paginatedUsers,
  } = usePagination(users, 10);

  const totalUsers = users.length;
  const adminUsers = users.filter((u) => u.role === 'ADMIN').length;
  const employeeUsers = users.filter((u) => u.role === 'EMPLOYEE').length;

  return (
    <div className="space-y-6">
      {/* Dynamic Statistics Cards */}
      <section aria-label="Users Statistics" className="grid gap-4 sm:grid-cols-3 mt-3">
        <StatCard
          title="Total Users"
          value={loading ? '...' : totalUsers}
          description="All registered user accounts"
          icon={Users}
          className="border-border bg-card"
        />
        <StatCard
          title="Administrators"
          value={loading ? '...' : adminUsers}
          description="Full system management access"
          icon={ShieldCheck}
          className="border-border bg-card"
        />
        <StatCard
          title="Employees"
          value={loading ? '...' : employeeUsers}
          description="Standard room booking access"
          icon={CheckCircle2}
          className="border-border bg-card"
        />
      </section>

      {/* Users Table Card */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="px-4 py-4 border-b border-border">
          <CardTitle className="text-base font-semibold">Users Directory</CardTitle>
          <CardDescription>
            Registered user accounts and system access roles
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <caption className="sr-only">Organization users directory list</caption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">User</TableHead>
                <TableHead scope="col">ID</TableHead>
                <TableHead scope="col">Role</TableHead>
                <TableHead scope="col">Joined</TableHead>
                <TableHead scope="col" className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span>Loading users data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <p className="font-medium text-foreground">No users registered</p>
                      <p className="text-xs text-muted-foreground">
                        Registered users will appear in this table automatically.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-border">
                          <AvatarFallback className="text-xs font-semibold">
                            {user.name
                              ? user.name
                                .split(' ')
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('')
                              : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {user.id.length > 8 ? `${user.id.slice(0, 8)}...` : user.id}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getUserRoleVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            aria-label={`Options for ${user.name}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => deleteUser(user.id)}
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Table Pagination */}
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default UsersView;
