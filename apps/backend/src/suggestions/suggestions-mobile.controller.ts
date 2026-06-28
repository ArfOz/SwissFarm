import {
  Controller,
  Post,
  Body,
  Param,
  Logger,
} from '@nestjs/common';
import { Public } from '../libs/decorators/public.decorator';
import { SuggestionsService, CreateSuggestionDto } from './suggestions.service';

@Controller('mobile/farms')
export class SuggestionsMobileController {
  private readonly logger = new Logger(SuggestionsMobileController.name);

  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Public()
  @Post(':farmId/suggestions')
  async create(
    @Param('farmId') farmId: string,
    @Body() body: { author?: string; email?: string; message: string; photo?: string },
  ) {
    const dto: CreateSuggestionDto = {
      farmId,
      author: body.author,
      email: body.email,
      message: body.message,
      photo: body.photo,
    };
    return this.suggestionsService.create(dto);
  }
}