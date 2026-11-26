import { DoorOpen, CheckCircle2, AlertCircle, MoreHorizontal, Loader2, Trash2 } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRooms } from '@/hooks/useRooms';
import { getRoomStatusVariant } from '@/utils/status';

/**
 * Name Function: RoomsView
 * Description: Meeting room directory component rendering capacity metrics, room specification tables, and deletion actions.
 * Reason: Presents real-time room inventory from the API via useRooms with responsive table layout and styled action menus.
 **/
export function RoomsView() {
  const { rooms, loading, error, deleteRoom } = useRooms();

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.isAvailable).length;
  const maintenanceRooms = rooms.filter((r) => !r.isAvailable).length;

  return (
    <div className="space-y-6">
      {/* Dynamic Statistics Cards */}
      <section aria-label="Rooms Statistics" className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Rooms"
          value={loading ? '...' : totalRooms}
          description="All registered meeting rooms"
          icon={DoorOpen}
          className="border-border bg-card"
        />
        <StatCard
          title="Available"
          value={loading ? '...' : availableRooms}
          description="Ready for booking"
          icon={CheckCircle2}
          className="border-border bg-card"
        />
        <StatCard
          title="Maintenance"
          value={loading ? '...' : maintenanceRooms}
          description="Currently out of service"
          icon={AlertCircle}
          className="border-border bg-card"
        />
      </section>

      {/* Rooms Table Card */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="px-6 py-4 border-b border-border">
          <CardTitle className="text-base font-semibold">Meeting Rooms Directory</CardTitle>
          <CardDescription>
            Room facilities, seating capacities, and operational status
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <caption className="sr-only">Meeting rooms directory list</caption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Room Name</TableHead>
                <TableHead scope="col">Capacity</TableHead>
                <TableHead scope="col">Location</TableHead>
                <TableHead scope="col">Facilities</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col" className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span>Loading rooms data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              ) : rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <p className="font-medium text-foreground">No meeting rooms registered</p>
                      <p className="text-xs text-muted-foreground">
                        Add new rooms using the action button in the top right.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room) => {
                  const statusLabel = room.isAvailable ? 'Available' : 'Maintenance';
                  const facilitiesStr = Array.isArray(room.facilities)
                    ? room.facilities.join(', ')
                    : room.facilities || '-';

                  return (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>{room.capacity} People</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {room.location}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {facilitiesStr}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoomStatusVariant(statusLabel)}>
                          {statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              aria-label={`Options for ${room.name}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => deleteRoom(room.id)}
                              className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" /> Delete Room
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default RoomsView;
