export interface AuditIssueResult {
  type: 'SECURITY' | 'PERFORMANCE' | 'STYLE' | 'BUG';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  lineNumber: number;
  title: string;
  description: string;
  suggestedFix: string;
}

export interface AuditAIResponse {
  score: number;
  summary: string;
  issues: AuditIssueResult[];
}