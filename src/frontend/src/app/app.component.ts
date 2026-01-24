import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoggingComponent } from './components/logging/logging.component';
import { InfoDialogComponent } from './components/info-dialog/info-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    LoggingComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'IC Logging Demo';

  constructor(private dialog: MatDialog) {}

  openInfoDialog(): void {
    this.dialog.open(InfoDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
  }
}
