import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, OnDestroy, ViewChild, computed, effect, ChangeDetectorRef, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import type { LogEntry } from '../../../../../declarations/backend/backend.did';
import { LoggingDetailDialogComponent } from '../logging-detail-dialog/logging-detail-dialog.component';
import { LoggingAddDialogComponent } from '../logging-add-dialog/logging-add-dialog.component';
import { LogLevelService } from '../../services/log-level.service';

@Component({
  selector: 'app-logging-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './logging-table.component.html',
  styleUrl: './logging-table.component.scss'
})
export class LoggingTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() logs = signal<LogEntry[]>([]);
  @Output() logAdded = new EventEmitter<{ level: string; message: string }>();
  @Output() refresh = new EventEmitter<void>();
  
  @ViewChild(MatSort, { static: false }) 
  set sort(sort: MatSort) {
    if (sort) {
      this._sort = sort;
      this.dataSource.sort = sort;
      this.sortConnected = true;
      // Set default sort to ID descending if not already set
      if (!sort.active) {
        sort.active = 'id';
        sort.direction = 'desc';
        this.dataSource.sort = sort;
      }
    }
  }
  get sort(): MatSort {
    return this._sort!;
  }
  private _sort?: MatSort;
  
  displayedColumns: string[] = ['id', 'date', 'level'];
  dataSource = new MatTableDataSource<LogEntry>([]);
  
  // Use computed signal for count to avoid change detection issues
  logCount = computed(() => this.logs().length);
  
  private sortConnected = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    public logLevelService: LogLevelService
  ) {
    // Set up custom sorting first
    this.setupSorting();
    
    // Update dataSource when logs signal changes
    effect(() => {
      const logEntries = this.logs();
      // Preserve current sort state
      const currentSortActive = this.dataSource.sort?.active;
      const currentSortDirection = this.dataSource.sort?.direction;
      
      this.dataSource.data = logEntries;
      
      // Reconnect sort if it was previously connected
      if (this.sortConnected && this._sort) {
        this.dataSource.sort = this._sort;
        // Restore sort state if it was set
        if (currentSortActive && currentSortDirection) {
          this._sort.active = currentSortActive;
          this._sort.direction = currentSortDirection;
          this.dataSource.sort = this._sort;
        } else if (!currentSortActive) {
          // Set default sort to ID descending if no sort was active
          this._sort.active = 'id';
          this._sort.direction = 'desc';
          this.dataSource.sort = this._sort;
        }
      }
      // Mark for check to update the view in the next change detection cycle
      this.cdr.markForCheck();
    });
  }

  ngOnInit() {
    this.dataSource.data = this.logs();
  }

  ngAfterViewInit() {
    // Sort connection is handled by the ViewChild setter
    // Ensure default sort is set if sort is already connected
    if (this._sort && this.sortConnected && !this._sort.active) {
      this._sort.active = 'id';
      this._sort.direction = 'desc';
      this.dataSource.sort = this._sort;
    }
  }

  private setupSorting() {
    // Custom sort accessor for ID (numeric)
    this.dataSource.sortingDataAccessor = (item: LogEntry, property: string): string | number => {
      switch (property) {
        case 'id':
          return Number(item.id);
        case 'date':
          // Sort by timestamp (bigint)
          return Number(item.timestamp);
        case 'level':
          // Sort by level text
          return item.level;
        default:
          // Fallback for any other properties (should not occur with current columns)
          const value = (item as unknown as Record<string, unknown>)[property];
          return typeof value === 'string' || typeof value === 'number' ? value : '';
      }
    };
  }

  formatTimestamp(timestamp: bigint): string {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  }

  openDetailDialog(log: LogEntry): void {
    if (!log) {
      console.error('Cannot open detail dialog: log entry is null or undefined');
      return;
    }
    const isMobile = window.innerWidth <= 768;
    this.dialog.open(LoggingDetailDialogComponent, {
      width: isMobile ? '100vw' : '600px',
      maxWidth: isMobile ? '100vw' : '90vw',
      height: isMobile ? '100vh' : 'auto',
      maxHeight: isMobile ? '100vh' : '90vh',
      panelClass: isMobile ? 'mobile-dialog' : '',
      data: log
    });
  }

  openAddDialog(): void {
    const isMobile = window.innerWidth <= 768;
    const dialogRef = this.dialog.open(LoggingAddDialogComponent, {
      width: isMobile ? '100vw' : '500px',
      maxWidth: isMobile ? '100vw' : '90vw',
      height: isMobile ? '100vh' : 'auto',
      maxHeight: isMobile ? '100vh' : '90vh',
      panelClass: isMobile ? 'mobile-dialog' : ''
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.logAdded.emit(result);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
