import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuditResult } from '../../types/audit.types';


@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/audits';

  submitAudit(sourceCode: string, filename: string, language: string): Observable<{ auditId: string }> {
    const payload = { sourceCode, filename, language };
    return this.http.post<{ auditId: string }>(this.apiUrl, payload);
  }

  getAuditById(id: string): Observable<AuditResult> {
    return this.http.get<AuditResult>(`${this.apiUrl}/${id}`);
  }

  getAllAudits(): Observable<AuditResult[]> {
    return this.http.get<AuditResult[]>(this.apiUrl);
  }
}