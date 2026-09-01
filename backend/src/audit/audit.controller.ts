import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAuditDto {
  @IsNotEmpty()
  @IsString()
  filename!: string;

  @IsNotEmpty()
  @IsString()
  language!: string;

  @IsNotEmpty()
  @IsString()
  sourceCode!: string;
}

@Controller('audits')
export class AuditController {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('audit-queue') private auditQueue: Queue,
  ) {}

  @Post()
  async submitAudit(@Body() dto: CreateAuditDto) {
    const audit = await this.prisma.auditRequest.create({
      data: {
        filename: dto.filename,
        language: dto.language,
        sourceCode: dto.sourceCode,
        status: 'PENDING',
      },
    });

    await this.auditQueue.add('process-audit', {
      auditId: audit.id,
      code: dto.sourceCode,
      language: dto.language,
    });

    return {
      message: 'Audit request submitted successfully',
      auditId: audit.id,
    };
  }

  @Get(':id')
  async getAuditResult(@Param('id') id: string) {
    return this.prisma.auditRequest.findUnique({
      where: { id },
      include: { issues: true },
    });
  }

  @Get()
  async getAllAudits() {
    return this.prisma.auditRequest.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        language: true,
        status: true,
        score: true,
        createdAt: true,
      },
    });
  }
}
