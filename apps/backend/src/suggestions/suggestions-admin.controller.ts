import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Logger,
} from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';

@Controller('admin/suggestions')
export class SuggestionsAdminController {
  private readonly logger = new Logger(SuggestionsAdminController.name);

  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Get()
  async findAll(@Query('status') status?: string) {
    return this.suggestionsService.findAll(status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.suggestionsService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.suggestionsService.updateStatus(id, body.status);
  }
}