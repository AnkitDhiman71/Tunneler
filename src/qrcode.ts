import qrcode from 'qrcode-terminal';

export function printQrCode(url: string): void {
  qrcode.generate(url, { small: true });
}

