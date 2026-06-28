import { Injectable, Logger } from '@nestjs/common';
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

  async findAll(status?: string) {
    const where = status ? { status } : {};
    return this.prisma.suggestion.findMany({
      where,
      include: { farm: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.suggestion.findUniqueOrThrow({
      where: { id },
      include: { farm: { select: { id: true, name: true } } },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.suggestion.update({
      where: { id },
      data: { status },
    });
  }
}