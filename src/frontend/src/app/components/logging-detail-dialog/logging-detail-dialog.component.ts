import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import type { LogEntry } from '../../../../../declarations/backend/backend.did';
import { LogLevelService } from '../../services/log-level.service';
import { DateFormatService } from '../../services/date-format.service';

@Component({
  selector: 'app-logging-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
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
    public logLevelService: LogLevelService,
    public dateFormatService: DateFormatService
  ) {
    if (!data) {
      console.error('LoggingDetailDialogComponent: No data provided');
      this.dialogRef.close();
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
