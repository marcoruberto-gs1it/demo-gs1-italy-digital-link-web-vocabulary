import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule, HttpClientModule],
  templateUrl: './scanner-component.html'
})
export class ScannerComponent implements OnInit {
  currentStep: 'profile' | 'scanning' | 'result' = 'profile';
  isAllergicUser: boolean | null = null;
  
  scannedUrl: string = '';
  allergyAlertTriggered = false;
  allergenToWatch = 'Frutta a guscio';

  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | undefined = undefined;

  // ChangeDetectorRef ci assicura che l'HTML si aggiorni appena diamo il permesso su iOS
  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  setAllergyProfile(isAllergic: boolean) {
    this.isAllergicUser = isAllergic;
    this.currentStep = 'scanning';
  }

  // Si attiva non appena l'utente clicca "Consenti" per la fotocamera
  onCamerasFound(devices: MediaDeviceInfo[]) {
    this.availableDevices = devices;
    
    if (devices && devices.length > 0) {
      // Tenta di auto-selezionare una fotocamera posteriore standard di default
      const backCam = devices.find(d => 
        (d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('posteriore')) &&
        !d.label.toLowerCase().includes('tele') && 
        !d.label.toLowerCase().includes('ultra')
      );
      
      this.currentDevice = backCam || devices[0];
    }
    
    // FORZA l'aggiornamento della pagina per far apparire il menu a tendina!
    this.cdr.detectChanges();
  }

  onDeviceSelectChange(event: Event) {
    const selectedDeviceId = (event.target as HTMLSelectElement).value;
    const device = this.availableDevices.find(d => d.deviceId === selectedDeviceId);
    if (device) {
      this.currentDevice = device;
    }
  }

  onCodeResult(resultString: string) {
    this.scannedUrl = resultString;
    const productAllergens = ['Sedano', 'Pesce', 'Latte', 'Molluschi', 'Soia', 'Frutta a guscio'];

    if (this.isAllergicUser && productAllergens.includes(this.allergenToWatch)) {
      this.currentStep = 'result';
      this.allergyAlertTriggered = true;
    } else {
      this.allergyAlertTriggered = false;
      this.navigateToProductRoute(resultString);
    }
  }

  private navigateToProductRoute(url: string) {
    const gtinMatch = url.match(/\/01\/(\d{13,14})/);
    const batchMatch = url.match(/\/10\/([^\/]+)/);
    const bestBeforeMatch = url.match(/\/17\/(\d{6})/);

    const gtin = gtinMatch ? gtinMatch[1] : '8005360007746';
    const batch = batchMatch ? batchMatch[1] : null;
    const bestBefore = bestBeforeMatch ? bestBeforeMatch[1] : null;

    if (gtin && batch && bestBefore) {
      this.router.navigate(['/01', gtin, '10', batch, '17', bestBefore]);
    } else if (gtin && batch) {
      this.router.navigate(['/01', gtin, '10', batch]);
    } else {
      this.router.navigate(['/01', gtin]);
    }
  }

  resetDemo() {
    this.currentStep = 'profile';
    this.isAllergicUser = null;
    this.scannedUrl = '';
    this.allergyAlertTriggered = false;
  }
}