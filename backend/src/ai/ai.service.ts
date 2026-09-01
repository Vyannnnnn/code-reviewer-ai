import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

import { AuditAIResponse, AuditIssueResult } from '../types/AIServices.types';

@Injectable()
export class AIService {
  private groq: Groq;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('GROQ_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException(
        'GROQ_API_KEY is not set. Please configure your API key in environment variables.',
      );
    }
    this.groq = new Groq({ apiKey });
    console.log('Loaded key prefix:', apiKey?.substring(0, 10));
  }

  async analyzeCode(code: string, language: string): Promise<AuditAIResponse> {
    const prompt = `
You are an expert Senior Security Engineer and Code Reviewer. 
Analyze the following ${language} code for security vulnerabilities, bugs, performance issues, and style violations.

Respond ONLY in valid JSON format. Do not add markdown formatting, quotes, or conversational intro/outro text.

JSON Structure:
{
  "score": <number 0-100 indicating code quality/security score>,
  "summary": "<short overall assessment summary>",
  "issues": [
    {
      "type": "SECURITY" | "PERFORMANCE" | "STYLE" | "BUG",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "lineNumber": <number line where issue occurs, 1 if general>,
      "title": "<short issue title>",
      "description": "<detailed description of the vulnerability/issue>",
      "suggestedFix": "<corrected code snippet or exact fix instructions>"
    }
  ]
}

Source Code to Analyze:
\`\`\`${language}
${code}
\`\`\`
`;

    try {
      const response = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'openai/gpt-oss-120b',
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });
      const rawContent = response.choices[0]?.message?.content || '{}';
      return JSON.parse(rawContent.trim()) as AuditAIResponse;
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to analyze code with AI. ${error.message}`,
      );
    }
  }
}
