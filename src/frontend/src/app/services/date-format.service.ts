import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateFormatService {
  /**
   * Formats a timestamp (nanoseconds) as a date string
   * @param timestamp - BigInt timestamp in nanoseconds
   * @returns Formatted date string (e.g., "January 24, 2026")
   */
  formatDate(timestamp: bigint): string {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formats a timestamp (nanoseconds) as a time string
   * @param timestamp - BigInt timestamp in nanoseconds
   * @returns Formatted time string (e.g., "02:30:45 PM")
   */
  formatTime(timestamp: bigint): string {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  /**
   * Formats a timestamp (nanoseconds) as a combined date and time string
   * @param timestamp - BigInt timestamp in nanoseconds
   * @returns Formatted date and time string (e.g., "1/24/2026, 2:30:45 PM")
   */
  formatTimestamp(timestamp: bigint): string {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  }
}
