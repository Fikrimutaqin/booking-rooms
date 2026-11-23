import { IsDateString, Matches } from 'class-validator';

export class AvailabilityQueryDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  @IsDateString({ strict: true }, { message: 'Date not valid' })
  date: string;
}
