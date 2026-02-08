import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LoggingService } from '../../services/logging.service';
import type { LogEntry } from '../../../../../declarations/backend/backend.did';
import { LoggingTableComponent } from '../logging-table/logging-table.component';
import { LoggingDetailDialogComponent } from '../logging-detail-dialog/logging-detail-dialog.component';

@Component({
  selector: 'app-logging',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    LoggingTableComponent
  ],
  templateUrl: './logging.component.html',
  styleUrl: './logging.component.scss'
})
export class LoggingComponent implements OnInit {
  logs = signal<LogEntry[]>([]);

  constructor(
    private loggingService: LoggingService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    await this.loadLogs();
    this.checkDeepLink();
  }

  async onLogAdded(data: { level: string; message: string }) {
    // Dialog now handles the saving, just refresh the logs
    await this.loadLogs();
  }

  async loadLogs() {
    try {
      const entries = await this.loggingService.getLogs();
      this.logs.set(entries);
    } catch (error) {
      console.error('Error loading logs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load logs. Please try again.';
      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      });
    }
  }

  private async checkDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const entryParam = params.get('entry');
    if (!entryParam) return;

    const entryId = parseInt(entryParam, 10);
    if (isNaN(entryId) || entryId < 0) return;

    try {
      const log = await this.loggingService.getLog(BigInt(entryId));
      if (!log) return;

      const isMobile = window.innerWidth <= 768;
      const dialogRef = this.dialog.open(LoggingDetailDialogComponent, {
        width: isMobile ? '100vw' : '600px',
        maxWidth: isMobile ? '100vw' : '90vw',
        height: isMobile ? '100vh' : 'auto',
        maxHeight: isMobile ? '100vh' : '90vh',
        panelClass: isMobile ? 'mobile-dialog' : '',
        data: log
      });

      dialogRef.afterClosed().subscribe(() => {
        this.cleanDeepLinkParam();
      });
    } catch (error) {
      console.error('Error loading deep-linked entry:', error);
    }
  }

  private cleanDeepLinkParam() {
    const url = new URL(window.location.href);
    url.searchParams.delete('entry');
    window.history.replaceState({}, '', url.pathname + url.search);
  }
}
