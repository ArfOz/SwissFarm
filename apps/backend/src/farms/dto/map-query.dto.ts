import { IsNotEmpty, IsNumberString } from 'class-validator';

export class MapQueryDto {
  @IsNotEmpty()
  @IsNumberString()
  minLat!: string;

  @IsNotEmpty()
  @IsNumberString()
  maxLat!: string;

  @IsNotEmpty()
  @IsNumberString()
  minLng!: string;

  @IsNotEmpty()
  @IsNumberString()
  maxLng!: string;
}