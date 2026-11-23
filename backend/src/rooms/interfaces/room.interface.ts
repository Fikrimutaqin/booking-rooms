import { Booking } from "@prisma/client";

export interface Room {
    name: string;
    location: string;
    capacity: number;
    facilities: string[];
    isAvailable: boolean;
    booking: Booking[];
}