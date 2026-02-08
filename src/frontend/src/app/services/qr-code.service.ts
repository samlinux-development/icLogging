import { Injectable } from '@angular/core';
import QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class QrCodeService {
  buildEntryUrl(entryId: bigint): string {
    return `${window.location.origin}/?entry=${entryId}`;
  }

  async generateQrCodeDataUrl(text: string): Promise<string> {
    return QRCode.toDataURL(text, {
      width: 200,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#c62828',
        light: '#ffffff'
      }
    });
  }
}
