import {
    ArrayUnique,
    IsArray,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

export class UpdateRoomDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsInt()
    @IsOptional()
    @Min(1)
    capacity?: number;

    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    facilities?: string[];

    @IsOptional()
    @IsString()
    @MaxLength(100)
    location?: string;
}