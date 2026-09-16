import { Component, signal, inject, OnDestroy, PLATFORM_ID, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import * as monaco from 'monaco-editor';
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
  imports: [CommonModule, FormsModule, BaseChartDirective, MonacoEditorModule],
  templateUrl: './audit-editor.component.html',
  styleUrls: ['../../../styles.scss'],
})
export class AuditEditorComponent implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private auditService = inject(AuditService);

  isBrowser = isPlatformBrowser(this.platformId);
  filename = signal<string>('app.ts');
  language = signal<string>('typescript');
  code = signal<string>(`// Tempelkan kode Anda di sini untuk dianalisis`);

  monacoOptions : monaco.editor.IStandaloneEditorConstructionOptions = {
    theme: 'vs-dark',
    language: 'typescript',
    automaticLayout: true, // Responsif saat panel di-resize
    minimap: { enabled: false }, // Dimatikan agar tampilan tetap clean di panel 45%
    fontSize: 13,
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
  };

  onLanguageChange(newLang: string) {
    this.language.set(newLang);
    // Update bahasa di Monaco Editor secara dinamis
    this.monacoOptions = {
      ...this.monacoOptions,
      language: newLang
    };
  }

  isSubmitting = signal<boolean>(false);

  auditResult = signal<AuditResult | null>(null);

  // CHART CONFIGURATION
  public pieChartType: 'pie' = 'pie';

  // Computed Signal untuk mengalkulasi data Severity secara dinamis
  public pieChartData = computed<ChartData<'pie'>>(() => {
    const issues = this.auditResult()?.issues || [];
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };

    issues.forEach((issue) => {
      if (counts[issue.severity] !== undefined) {
        counts[issue.severity]++;
      }
    });

    return {
      labels: ['Critical', 'High', 'Medium', 'Low'],
      datasets: [
        {
          data: [counts.CRITICAL, counts.HIGH, counts.MEDIUM, counts.LOW],
          backgroundColor: ['#ef4444', '#f97316', '#f59e0b', '#38bdf8'], // Red, Orange, Amber, Sky
          borderColor: '#0f172a', // Slate-900 border
          borderWidth: 2,
        },
      ],
    };
  });

  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8', // Slate-400
          font: { size: 11, family: 'monospace' },
          boxWidth: 12,
        },
      },
    },
  };

  // --- HIGHLIGHT.JS HELPER ---
  highlightCode(codeStr: string, lang: string = 'typescript'): string {
    if (!codeStr) return '';
    try {
      const validLang = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(codeStr, { language: validLang }).value;
    } catch {
      return codeStr;
    }
  }

  // HELPER STYLING SEVERITY BADGE
  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'LOW':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  }

  private pollSubscription?: Subscription;

  startAudit() {
    if (!this.code().trim()) return;

    this.pollSubscription?.unsubscribe();
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
      .subscribe({
        next: (data) => {
          this.auditResult.set(data);
          if (data.status === 'COMPLETED' || data.status === 'FAILED') {
            this.isSubmitting.set(false);
          }
        },
        error: (err) => {
          console.error('Error fetching audit status:', err);
          this.isSubmitting.set(false);
          alert('Error fetching audit status. Please try again later.');
        },
      });
  }

  ngOnDestroy() {
    this.pollSubscription?.unsubscribe();
  }
}
