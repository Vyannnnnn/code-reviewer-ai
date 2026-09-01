import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { AIService } from './ai/ai.service';
import { AuditController } from './audit/audit.controller';
import { AuditProcessor } from './audit/audit.processor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        }
      }),
      inject: [ConfigService],
    }),

    BullModule.registerQueue({
      name: 'audit-queue',
    }),
  ],


  controllers: [AppController, AuditController],
  providers: [AppService, AIService, AuditProcessor],
})
export class AppModule {}
