import * as React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { CreateRoomPayload } from '@/types/room';

export interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateRoomPayload) => Promise<void | unknown>;
  isLoading?: boolean;
}

/**
 * Name Function: AddRoomDialog
 * Description: Modal dialog component for administrators to create a new meeting room with form validation and comma-separated facilities parsing.
 * Reason: Implements backend CreateRoomDto constraints (@MaxLength, @Min, @ArrayUnique) and provides instant badge feedback for comma-separated facility entries.
 **/
export function AddRoomDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: AddRoomDialogProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [capacity, setCapacity] = React.useState('10');
  const [facilitiesInput, setFacilitiesInput] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Parse comma-separated facilities into unique non-empty string tags
  const parsedFacilities = React.useMemo(() => {
    if (!facilitiesInput.trim()) return [];
    const items = facilitiesInput
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return Array.from(new Set(items));
  }, [facilitiesInput]);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setCapacity('10');
      setFacilitiesInput('');
      setLocation('');
      setFormError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  /**
   * Name Function: handleSubmit
   * Description: Validates all room form fields against backend DTO requirements and invokes onSubmit.
   * Reason: Catches invalid capacity integers, string overflow (>100 or >500 chars), and empty names before dispatching network request.
   **/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError('Room name is required.');
      return;
    }
    if (trimmedName.length > 100) {
      setFormError('Room name cannot exceed 100 characters.');
      return;
    }

    const numCapacity = Number(capacity);
    if (!capacity || isNaN(numCapacity) || !Number.isInteger(numCapacity) || numCapacity < 1) {
      setFormError('Capacity must be a positive whole number (at least 1 person).');
      return;
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length > 500) {
      setFormError('Description cannot exceed 500 characters.');
      return;
    }

    const trimmedLocation = location.trim();
    if (trimmedLocation.length > 100) {
      setFormError('Location cannot exceed 100 characters.');
      return;
    }

    const payload: CreateRoomPayload = {
      name: trimmedName,
      capacity: numCapacity,
      ...(trimmedDescription ? { description: trimmedDescription } : {}),
      ...(trimmedLocation ? { location: trimmedLocation } : {}),
      ...(parsedFacilities.length > 0 ? { facilities: parsedFacilities } : {}),
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create room. Please try again.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = isLoading || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Meeting Room</DialogTitle>
            <DialogDescription>
              Fill in the room specifications below to add a new meeting room to the organization directory.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div
              className="mt-3 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-4 py-4">
            {/* Room Name Field */}
            <div className="space-y-1.5">
              <Label htmlFor="room-name">
                Room Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="room-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                placeholder="e.g., Executive Boardroom"
                disabled={busy}
                required
              />
            </div>

            {/* Capacity & Location Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="room-capacity">
                  Capacity (people) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="room-capacity"
                  type="number"
                  min={1}
                  step={1}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="e.g., 10"
                  disabled={busy}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="room-location">Location</Label>
                <Input
                  id="room-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={100}
                  placeholder="e.g., Floor 3, West Wing"
                  disabled={busy}
                />
              </div>
            </div>

            {/* Facilities Field (Comma-separated) */}
            <div className="space-y-1.5">
              <Label htmlFor="room-facilities">Facilities</Label>
              <Input
                id="room-facilities"
                value={facilitiesInput}
                onChange={(e) => setFacilitiesInput(e.target.value)}
                placeholder="e.g., Projector, Whiteboard, TV 4K, Video Conference"
                disabled={busy}
              />
              <p className="text-[11px] text-muted-foreground">
                Separate multiple facilities with commas (e.g., Projector, Whiteboard, WiFi).
              </p>

              {/* Live Preview of Tagged Facilities */}
              {parsedFacilities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {parsedFacilities.map((facility, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs px-2 py-0.5 font-normal"
                    >
                      {facility}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="room-description">Description</Label>
                <span className="text-[11px] text-muted-foreground">
                  {description.length}/500
                </span>
              </div>
              <Textarea
                id="room-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Optional notes or details about the room equipment..."
                disabled={busy}
              />
            </div>
          </div>

          <DialogFooter className="flex sm:justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Room...
                </>
              ) : (
                'Save Room'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddRoomDialog;
