export interface Issue {
  id: string;
  type: 'SECURITY' | 'PERFORMANCE' | 'STYLE' | 'BUG';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lineNumber: number;
  title: string;
  description: string;
  originalCode?: string;
  suggestedFix: string;
}

export interface AuditResult {
  id: string;
  filename: string;
  language: string;
  sourceCode: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  score?: number;
  summary?: string;
  issues: Issue[];
  createdAt: string;

}