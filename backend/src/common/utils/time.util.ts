/** For Handling WIB timezone */
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000; // 7 hours in milliseconds

/** Date (YYYY-MM-DD) and minutes-since-midnight in WIB */
export function wibParts(d: Date) {
    const w = new Date(d.getTime() + WIB_OFFSET_MS);
    return {
        date: w.toISOString().slice(0, 10),
        minutes: w.getUTCHours() * 60 + w.getUTCMinutes(),
    };
}

/** Start of day (00:00 WIB) from YYYY-MM-DD string */
export function startOfDayWib(date: string): Date {
    return new Date(`${date}T00:00:00+07:00`);
}