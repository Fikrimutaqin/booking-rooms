import { DoorOpen, CheckCircle2, AlertCircle, MoreHorizontal } from 'lucide-react';
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
import { RoomItem } from '@/types/dashboard';

const MOCK_ROOMS: RoomItem[] = [
  {
    id: 'RM-101',
    name: 'Conference Room Alpha',
    capacity: '20 Orang',
    location: 'Lantai 1 - Sayap Barat',
    facilities: 'Projector, Whiteboard, Video Conference',
    status: 'Available',
  },
  {
    id: 'RM-102',
    name: 'Meeting Room Beta',
    capacity: '8 Orang',
    location: 'Lantai 2 - Sayap Timur',
    facilities: 'Smart TV, Whiteboard',
    status: 'In Use',
  },
  {
    id: 'RM-103',
    name: 'Executive Boardroom',
    capacity: '14 Orang',
    location: 'Lantai 3 - Penthouse',
    facilities: 'Conference System, Dual Display, Bar',
    status: 'Available',
  },
  {
    id: 'RM-104',
    name: 'Creative Studio',
    capacity: '10 Orang',
    location: 'Lantai 1 - Ruang Kreatif',
    facilities: 'Acoustic Panel, Smart Board',
    status: 'Maintenance',
  },
];

export function RoomsView() {
  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <section aria-label="Rooms Statistics" className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Rooms"
          value="12"
          description="Available on premises"
          icon={DoorOpen}
          className="border-border bg-card"
        />
        <StatCard
          title="Available Now"
          value="9"
          description="Ready for booking"
          icon={CheckCircle2}
          className="border-border bg-card"
        />
        <StatCard
          title="Maintenance"
          value="1"
          description="Under scheduled inspection"
          icon={AlertCircle}
          className="border-border bg-card"
        />
      </section>

      {/* Rooms Table Card */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="px-6 py-4 border-b border-border">
          <CardTitle className="text-base font-semibold">Available Rooms</CardTitle>
          <CardDescription>
            List of meeting rooms and their respective configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <caption className="sr-only">List of meeting rooms</caption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Room Name</TableHead>
                <TableHead scope="col">Capacity</TableHead>
                <TableHead scope="col">Location</TableHead>
                <TableHead scope="col">Facilities</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col" className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ROOMS.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{room.location}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{room.facilities}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        room.status === 'Available'
                          ? 'default'
                          : room.status === 'In Use'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {room.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      aria-label={`Options for ${room.name}`}
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
