import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoggingService } from '../../services/logging.service';

export interface LoggingAddDialogData {
  level?: string;
  message?: string;
}

@Component({
  selector: 'app-logging-add-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './logging-add-dialog.component.html',
  styleUrl: './logging-add-dialog.component.scss'
})
export class LoggingAddDialogComponent {
  logLevel: string = 'INFO';
  logMessage: string = '';
  isLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<LoggingAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LoggingAddDialogData | null,
    private loggingService: LoggingService,
    private snackBar: MatSnackBar
  ) {
    if (data) {
      this.logLevel = data.level || 'INFO';
      this.logMessage = data.message || '';
    }
  }

  onCancel(): void {
    if (!this.isLoading) {
      this.dialogRef.close();
    }
  }

  async onSave(): Promise<void> {
    if (this.logMessage.trim() && !this.isLoading) {
      this.isLoading = true;
      try {
        await this.loggingService.log(this.logLevel, this.logMessage.trim());
        this.dialogRef.close({
          level: this.logLevel,
          message: this.logMessage.trim()
        });
      } catch (error) {
        console.error('Error adding log:', error);
        this.isLoading = false;
        const errorMessage = error instanceof Error ? error.message : 'Failed to add audit entry. Please try again.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });
      }
    }
  }
}
