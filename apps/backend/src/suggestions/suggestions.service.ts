import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateSuggestionDto {
  farmId: string;
  author?: string;
  email?: string;
  message: string;
  photo?: string;
}

@Injectable()
export class SuggestionsService {
  private readonly logger = new Logger(SuggestionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSuggestionDto) {
    this.logger.log(`Creating suggestion for farm ${dto.farmId}`);
    return this.prisma.suggestion.create({
      data: {
        farmId: dto.farmId,
        author: dto.author ?? null,
        email: dto.email ?? null,
        message: dto.message,
        photo: dto.photo ?? null,
        status: 'pending',
      },
    });
  }

  async findAll(filters?: { status?: string; isRead?: boolean }) {
    const where: Record<string, any> = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.isRead !== undefined) where.isRead = filters.isRead;

    return this.prisma.suggestion.findMany({
      where,
      include: { farm: { select: { id: true, name: true } } },
      orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const suggestion = await this.prisma.suggestion.findUnique({
      where: { id },
      include: { farm: { select: { id: true, name: true, address: true, canton: true } } },
    });
    if (!suggestion) throw new NotFoundException(`Suggestion ${id} not found`);
    return suggestion;
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.suggestion.update({
      where: { id },
      data: { status },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.suggestion.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAsUnread(id: string) {
    return this.prisma.suggestion.update({
      where: { id },
      data: { isRead: false, readAt: null },
    });
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const count = await this.prisma.suggestion.count({
      where: { isRead: false },
    });
    return { count };
  }
}