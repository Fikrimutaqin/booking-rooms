import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";
import { MAX_DURATION_MIN, MIN_DURATION_MIN, WIB_OFFSET_MS, WORK_END_MIN, WORK_START_MIN } from "../constants/booking.constants";

// function for validate date and time from ISO string
const isValidDate = (d: unknown): d is Date => {
    return d instanceof Date && !isNaN(d.getTime());
}

// function convert date to WIB and return minutes
function toWib(d: Date) {
    const w = new Date(d.getTime() + WIB_OFFSET_MS);
    return {
        date: w.toISOString().slice(0, 10), // YYYY-MM-DD
        minutes: w.getUTCHours() * 60 + w.getUTCMinutes(), // 0-1439 minutes
    }
}

// decorator generator helper function for booking time validators
function make(
    name: string,
    defaultMessage: string,
    check: (value: Date, obj: any) => boolean,
) {
    return (options?: ValidationOptions) =>
        (object: object, propertyName: string) =>
            registerDecorator({
                name,
                target: object.constructor,
                propertyName,
                options: { message: defaultMessage, ...options },
                validator: {
                    validate: (value: unknown, args: ValidationArguments) => {
                        // Date not valid already handled by IsDate, don't double error
                        if (!isValidDate(value)) return true;
                        return check(value, args.object);
                    },
                },
            });
}

/**
 * @description Booking time must not be in the past
 */
export const IsNotInPast = make(
    'isNotInPast',
    'Can\'t order for past time',
    (v) => v.getTime() >= Date.now(),
);

/**
 * @description End time must be after start time
 */
export const IsAfterStart = make(
    'isAfterStart',
    'endAt must be after startAt',
    (end, obj) => !isValidDate(obj.startAt) || end > obj.startAt,
);

/**
 * @description Booking duration must be between 30 minutes to 4 hours
 */
export const HasValidDuration = make(
    'hasValidDuration',
    'Booking duration must be between 30 minutes to 4 hours',
    (end, obj) => {
        if (!isValidDate(obj.startAt)) return true;
        const min = (end.getTime() - obj.startAt.getTime()) / 60000;
        // jika end <= start, errornya sudah ditangani IsAfterStart
        return min <= 0 || (min >= MIN_DURATION_MIN && min <= MAX_DURATION_MIN);
    },
);

/**
 * @description Booking must be within working hours 08.00-18.00 WIB on the same day
 */
export const IsWithinWorkingHours = make(
    'isWithinWorkingHours',
    'Booking must be within working hours 08.00-18.00 WIB on the same day',
    (end, obj) => {
        if (!isValidDate(obj.startAt)) return true;
        const s = toWib(obj.startAt);
        const e = toWib(end);
        return s.date === e.date && s.minutes >= WORK_START_MIN && e.minutes <= WORK_END_MIN;
    },
);
