import { Component, OnInit } from '@angular/core';
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

  // Gestione dinamica della lente corretta 1x
  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | undefined = undefined;

  // Riduciamo i vincoli generici per lasciare che la libreria usi il device ID specifico che sceglieremo
  videoConstraints: MediaTrackConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 }
  };

  constructor(private router: Router) {}

  ngOnInit(): void {}

  setAllergyProfile(isAllergic: boolean) {
    this.isAllergicUser = isAllergic;
    this.currentStep = 'scanning';
  }

  // FUNZIONE CHIAVE: Viene chiamata automaticamente quando la libreria rileva le fotocamere dell'iPhone
  onCamerasFound(devices: MediaDeviceInfo[]) {
    this.availableDevices = devices;
    
    // Log di debug visibile in console per mappare i nomi delle lenti su iOS
    console.log('Fotocamere rilevate su questo dispositivo:', devices);

    if (devices.length > 0) {
      // Cerchiamo la lente posteriore principale (1x)
      // Su iOS la camera principale si chiama spesso "Fotocamera posteriore" o contiene "Back Camera"
      // Evitiamo le lenti Ultra-Wide (grandangolo) o Telephoto (3x/5x) se il sistema le isola
      const backCameras = devices.filter(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('posteriore')
      );

      if (backCameras.length > 0) {
        // Di solito, la prima della lista delle posteriori è la principale 1x.
        // Se ci sono lenti specifiche "tele" o "zoom" nelle posizioni successive, le scartiamo.
        const primaryLens = backCameras.find(cam => 
          !cam.label.toLowerCase().includes('tele') && 
          !cam.label.toLowerCase().includes('zoom') &&
          !cam.label.toLowerCase().includes('ultra')
        );

        this.currentDevice = primaryLens || backCameras[0];
      } else {
        // Fallback se i nomi delle etichette sono vuoti (es. per motivi di privacy prima del permesso)
        this.currentDevice = devices[0];
      }
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
    this.currentDevice = undefined;
  }
}