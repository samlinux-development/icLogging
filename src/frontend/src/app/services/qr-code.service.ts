import { Injectable } from '@angular/core';
import QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class QrCodeService {
  buildEntryUrl(entryId: bigint): string {
    return `${window.location.origin}/?entry=${entryId}`;
  }

  private readonly levelColors: Record<string, string> = {
    error: '#c62828',
    warn: '#ef6c00',
    info: '#1565c0'
  };

  async generateQrCodeDataUrl(text: string, level?: string): Promise<string> {
    const dark = this.levelColors[(level ?? '').toLowerCase()] ?? '#000000';
    return QRCode.toDataURL(text, {
      width: 200,
      errorCorrectionLevel: 'M',
      color: { dark, light: '#ffffff' }
    });
  }
}
