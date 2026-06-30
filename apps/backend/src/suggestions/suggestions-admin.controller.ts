import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Logger,
} from '@nestjs/common';
import { AdminOnly } from '../libs/decorators/admin-only.decorator';
import { SuggestionsService } from './suggestions.service';

@Controller('admin/suggestions')
export class SuggestionsAdminController {
  private readonly logger = new Logger(SuggestionsAdminController.name);

  constructor(private readonly suggestionsService: SuggestionsService) {}

  @AdminOnly()
  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('isRead') isRead?: string,
  ) {
    const filters: { status?: string; isRead?: boolean } = {};
    if (status) filters.status = status;
    if (isRead === 'true') filters.isRead = true;
    else if (isRead === 'false') filters.isRead = false;
    return this.suggestionsService.findAll(filters);
  }

  @AdminOnly()
  @Get('unread-count')
  async getUnreadCount() {
    return this.suggestionsService.getUnreadCount();
  }

  @AdminOnly()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.suggestionsService.findOne(id);
  }

  @AdminOnly()
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.suggestionsService.updateStatus(id, body.status);
  }

  @AdminOnly()
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.suggestionsService.markAsRead(id);
  }

  @AdminOnly()
  @Patch(':id/unread')
  async markAsUnread(@Param('id') id: string) {
    return this.suggestionsService.markAsUnread(id);
  }
}