import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  apiKey!: string;
}