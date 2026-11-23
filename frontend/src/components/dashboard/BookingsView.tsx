import { CalendarDays, Clock, AlertCircle, MoreHorizontal } from 'lucide-react';
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
import { BookingItem } from '@/types/dashboard';

const MOCK_BOOKINGS: BookingItem[] = [
  {
    id: 'BKG-001',
    room: 'Conference Room Alpha',
    user: 'John Doe',
    date: 'Today, 09:00 - 11:00',
    status: 'CONFIRMED',
  },
  {
    id: 'BKG-002',
    room: 'Meeting Room Beta',
    user: 'Sarah Smith',
    date: 'Today, 13:00 - 14:30',
    status: 'CONFIRMED',
  },
  {
    id: 'BKG-003',
    room: 'Executive Boardroom',
    user: 'Michael Scott',
    date: 'Tomorrow, 10:00 - 12:00',
    status: 'PENDING',
  },
  {
    id: 'BKG-004',
    room: 'Creative Studio',
    user: 'Dwight Schrute',
    date: '25 Nov 2026, 15:00 - 16:00',
    status: 'CANCELLED',
  },
  {
    id: 'BKG-005',
    room: 'Focus Room Gamma',
    user: 'Jim Halpert',
    date: '26 Nov 2026, 11:00 - 12:00',
    status: 'CONFIRMED',
  },
];

export function BookingsView() {
  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <section aria-label="Bookings Statistics" className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Bookings"
          value="128"
          description="All recorded reservations"
          icon={CalendarDays}
          className="border-border bg-card"
        />
        <StatCard
          title="Active Today"
          value="8"
          description="Scheduled for today"
          icon={Clock}
          className="border-border bg-card"
        />
        <StatCard
          title="Pending Approval"
          value="3"
          description="Awaiting administrator review"
          icon={AlertCircle}
          className="border-border bg-card"
        />
      </section>

      {/* Bookings Table Card */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="px-6 py-4 border-b border-border">
          <CardTitle className="text-base font-semibold">Recent Bookings</CardTitle>
          <CardDescription>
            List of current and upcoming room bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <caption className="sr-only">Recent room booking reservations</caption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Booking ID</TableHead>
                <TableHead scope="col">Room</TableHead>
                <TableHead scope="col">Reserved By</TableHead>
                <TableHead scope="col">Schedule</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col" className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_BOOKINGS.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                  <TableCell className="font-medium">{booking.room}</TableCell>
                  <TableCell className="text-muted-foreground">{booking.user}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{booking.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        booking.status === 'CONFIRMED'
                          ? 'default'
                          : booking.status === 'PENDING'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      aria-label={`Options for ${booking.id}`}
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
