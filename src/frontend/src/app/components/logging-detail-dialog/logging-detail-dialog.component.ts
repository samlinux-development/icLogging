import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import type { LogEntry } from '../../../../../declarations/backend/backend.did';
import { LogLevelService } from '../../services/log-level.service';

@Component({
  selector: 'app-logging-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './logging-detail-dialog.component.html',
  styleUrl: './logging-detail-dialog.component.scss'
})
export class LoggingDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LoggingDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LogEntry,
    public logLevelService: LogLevelService
  ) {
    if (!data) {
      console.error('LoggingDetailDialogComponent: No data provided');
      this.dialogRef.close();
    }
  }

  formatDate(timestamp: bigint): string {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(timestamp: bigint): string {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
