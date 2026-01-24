import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogLevelService {
  /**
   * Get the Material Design color theme name for a log level
   * @param level - The log level (ERROR, WARN, INFO)
   * @returns Material theme color name
   */
  getLevelColor(level: string): string {
    switch (level) {
      case 'ERROR': return 'warn';
      case 'WARN': return 'accent';
      case 'INFO': return 'primary';
      default: return '';
    }
  }

  /**
   * Get the Material icon name for a log level
   * @param level - The log level (ERROR, WARN, INFO)
   * @returns Material icon name
   */
  getLevelIcon(level: string): string {
    switch (level) {
      case 'ERROR': return 'error';
      case 'WARN': return 'warning';
      case 'INFO': return 'info';
      default: return 'circle';
    }
  }
}
