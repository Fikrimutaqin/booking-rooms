export const toDate = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? new Date(value) : value;
