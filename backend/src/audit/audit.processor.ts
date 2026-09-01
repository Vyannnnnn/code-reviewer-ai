import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AIService } from '../ai/ai.service';

@Processor('audit-queue')
@Injectable()
export class AuditProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditProcessor.name);

  constructor(private prisma: PrismaService, private aiService: AIService) {
    super();
  }

    async process(job: Job<{ code: string; language: string; auditId: string }>): Promise<any> {
        const { code, language, auditId } = job.data;

        await this.prisma.auditRequest.update({
            where: { id: auditId },
            data: { status: 'PROCESSING' },
        });

        try {
            const aiResult = await this.aiService.analyzeCode(code, language);

            await this.prisma.auditRequest.update({
                where: { id: auditId },
                data: {
                    status: 'COMPLETED',
                    score: aiResult.score,
                    summary: aiResult.summary,
                    issues: {
                        create: aiResult.issues.map((issue) => ({
                            type: issue.type,
                            severity: issue.severity,
                            lineNumber: issue.lineNumber,
                            title: issue.title,
                            description: issue.description,
                            suggestedFix: issue.suggestedFix,
                        }))
                    }
                }
            });
            this.logger.log(`Audit request ${auditId} processed successfully.`);
        } catch (error) {
            this.logger.error(`Failed to process audit request ${auditId}`, error);
            await this.prisma.auditRequest.update({
                where: { id: auditId },
                data: { status: 'FAILED' }
            });
        }
    }
}