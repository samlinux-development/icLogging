import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoggingService } from '../../services/logging.service';
import type { LogEntry } from '../../../../../declarations/backend/backend.did';
import { LoggingTableComponent } from '../logging-table/logging-table.component';

@Component({
  selector: 'app-logging',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    LoggingTableComponent
  ],
  templateUrl: './logging.component.html',
  styleUrl: './logging.component.scss'
})
export class LoggingComponent implements OnInit {
  logs = signal<LogEntry[]>([]);

  constructor(
    private loggingService: LoggingService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    await this.loadLogs();
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

}
