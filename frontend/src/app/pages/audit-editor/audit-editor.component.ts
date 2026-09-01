import { Component, signal, inject, OnDestroy, PLATFORM_ID, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { AuditService } from '../../services/audit.service';
import { AuditResult } from '../../../types/audit.types';
import { Subscription, interval, switchMap, takeWhile } from 'rxjs';

import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartData, ChartOptions, ChartType, registerables } from 'chart.js';
import hljs from 'highlight.js';

// Registrasi modul bawaan Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-audit-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './audit-editor.component.html',
  // styleUrls: ['./audit-editor.component.scss']
})

export class AuditEditorComponent implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private auditService = inject(AuditService);
  
  isBrowser = isPlatformBrowser(this.platformId);
  filename = signal<string>('app.ts');
  language = signal<string>('typescript');
  code = signal<string>('// Write your code here')
  isSubmitting = signal<boolean>(false);

  
  auditResult = signal<AuditResult | null>(null);
  
  monacoOptions = {
    theme: 'vs-dark',
    language: this.language(),
    automaticLayout: true,
  };

  private pollSubscription?: Subscription;

  onLanguageChange(newLang: string) {
    this.language.set(newLang);
    this.monacoOptions = {
      ...this.monacoOptions,
      language: newLang,
    };
  }

  startAudit() {
    if (!this.code().trim()) return;
    this.isSubmitting.set(true);
    this.auditResult.set(null);

    this.auditService.submitAudit(this.code(), this.filename(), this.language()).subscribe({
      next: (res) => {
        this.pollAuditStatus(res.auditId);
      },
      error: (err) => {
        alert('Error submitting audit.' + err.message);
        this.isSubmitting.set(false);
      },
    });
  }

  private pollAuditStatus(auditId: string) {
    this.pollSubscription = interval(2000)
      .pipe(
        switchMap(() => this.auditService.getAuditById(auditId)),
        takeWhile((data) => data.status === 'PENDING' || data.status === 'PROCESSING', true),
      )
      .subscribe((data) => {
        this.auditResult.set(data);
        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          this.isSubmitting.set(false);
        }
      });
  }

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-600 text-white';
      case 'HIGH':
        return 'bg-orange-500 text-white';
      case 'MEDIUM':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-blue-500 text-white';
    }
  }

  ngOnDestroy() {
    this.pollSubscription?.unsubscribe();
  }
}
