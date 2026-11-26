import * as React from 'react';
import { DoorOpen, MoreHorizontal, Loader2, Trash2, Plus } from 'lucide-react';
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
import { useAuth } from '@/hooks/useAuth';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/dashboard/TablePagination';
import { AddRoomDialog } from '@/components/dashboard/AddRoomDialog';

export interface RoomsViewProps {
  isAddOpen?: boolean;
  onAddOpenChange?: (open: boolean) => void;
}

/**
 * Name Function: RoomsView
 * Description: Meeting room directory component rendering capacity metrics, room specification tables, creation dialog, and deletion actions with role-based restrictions.
 * Reason: Presents real-time room inventory from the API via useRooms with responsive table layout and styled action menus restricted to admin users.
 **/
export function RoomsView({ isAddOpen, onAddOpenChange }: RoomsViewProps = {}) {
  const { rooms, loading, error, isMutating, deleteRoom, createRoom } = useRooms();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [internalAddOpen, setInternalAddOpen] = React.useState(false);
  const addDialogOpen = isAddOpen !== undefined ? isAddOpen : internalAddOpen;
  const setAddDialogOpen = onAddOpenChange || setInternalAddOpen;

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedItems: paginatedRooms,
  } = usePagination(rooms, 10);

  const totalRooms = rooms.length;

  return (
    <div className="space-y-6">
      {/* Dynamic Statistics Cards */}
      <section aria-label="Rooms Statistics" className="grid gap-4 sm:grid-cols-3 mt-3">
        <StatCard
          title="Total Rooms"
          value={loading ? '...' : totalRooms}
          description="All registered meeting rooms"
          icon={DoorOpen}
          className="border-border bg-card"
        />
      </section>

      {/* Rooms Table Card */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="px-4 py-4 border-b border-border flex flex-row items-center justify-between">
          <div className="flex flex-col gap-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">Meeting Rooms Directory</CardTitle>
              {!isAdmin && (
                <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                  Read Only
                </Badge>
              )}
            </div>
            <CardDescription>
              Room facilities, seating capacities, and operational status
            </CardDescription>
          </div>
          {isAdmin && (
            <Button
              size="sm"
              onClick={() => setAddDialogOpen(true)}
              className="gap-1.5 h-8 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Room
            </Button>
          )}
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
                {isAdmin && <TableHead scope="col" className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span>Loading rooms data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} className="h-24 text-center text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              ) : rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="font-medium text-foreground">No meeting rooms registered</p>
                      <p className="text-xs text-muted-foreground">
                        {isAdmin
                          ? 'Add new rooms using the action button in the top right.'
                          : 'No meeting rooms currently available.'}
                      </p>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAddDialogOpen(true)}
                          className="gap-1.5 mt-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Room
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRooms.map((room) => {
                  const facilitiesStr = Array.isArray(room.facilities)
                    ? room.facilities.join(', ')
                    : room.facilities || '-';

                  return (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>{room.capacity} People</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {room.location || '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {facilitiesStr}
                      </TableCell>
                      {isAdmin && (
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
                      )}
                    </TableRow>
                  );
                })
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

      {/* Admin Add Room Dialog */}
      {isAdmin && (
        <AddRoomDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSubmit={createRoom}
          isLoading={isMutating}
        />
      )}
    </div>
  );
}

export default RoomsView;
