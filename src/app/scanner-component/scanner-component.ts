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
  
  // Array dinamico degli allergeni selezionati dall'utente nel diario alimentare
  selectedAllergens: string[] = [];
  triggeredAllergens: string[] = []; // Tiene traccia di quali allergeni hanno bloccato il prodotto
  
  scannedUrl: string = '';
  allergyAlertTriggered = false;

  // L'elenco completo degli allergeni di legge configurabile nella dieta
  allergensGrid = [
    { name: 'Latte', icon: '🥛' },
    { name: 'Glutine', icon: '🌾' },
    { name: 'Frutta a guscio', icon: '🌰' },
    { name: 'Arachidi', icon: '🥜' },
    { name: 'Pesce', icon: '🐟' },
    { name: 'Crostacei', icon: '🦀' },
    { name: 'Uova', icon: '🥚' },
    { name: 'Soia', icon: '🫛' },
    { name: 'Sesamo', icon: '🫘' },
    { name: 'Senape', icon: '🏺' },
    { name: 'Lupini', icon: '🟡' },
    { name: 'Molluschi', icon: '🐚' }
  ];

  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | undefined = undefined;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  // Attiva/Disattiva l'allergene al click sulla card
  toggleAllergen(allergenName: string) {
    const index = this.selectedAllergens.indexOf(allergenName);
    if (index > -1) {
      this.selectedAllergens.splice(index, 1); // Rimuove se già presente
    } else {
      this.selectedAllergens.push(allergenName); // Aggiunge se non presente
    }
  }

  // Verifica se l'allergene è correntemente selezionato per applicare le classi CSS
  isAllergenSelected(allergenName: string): boolean {
    return this.selectedAllergens.includes(allergenName);
  }

  // Conferma la dieta e passa alla fotocamera
  saveDietProfile() {
    this.currentStep = 'scanning';
  }

  onCamerasFound(devices: MediaDeviceInfo[]) {
    this.availableDevices = devices;
    if (devices && devices.length > 0) {
      const backCam = devices.find(d => 
        (d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('posteriore')) &&
        !d.label.toLowerCase().includes('tele') && 
        !d.label.toLowerCase().includes('ultra')
      );
      this.currentDevice = backCam || devices[0];
    }
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
    
    // Lista reale di fabbrica del prodotto ("Le Conserve della Nonna")
    const productAllergens = ['Sedano', 'Pesce', 'Latte', 'Molluschi', 'Soia', 'Frutta a guscio'];

    // Intersezione: verifichiamo se l'utente ha selezionato almeno uno degli allergeni a rischio del prodotto
    this.triggeredAllergens = productAllergens.filter(allergen => this.selectedAllergens.includes(allergen));

    if (this.triggeredAllergens.length > 0) {
      // Trovata corrispondenza di pericolo! Blocca l'utente sulla schermata rossa
      this.currentStep = 'result';
      this.allergyAlertTriggered = true;
    } else {
      // Nessun pericolo: redirect immediato alle rotte del prodotto
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
    this.scannedUrl = '';
    this.allergyAlertTriggered = false;
    this.triggeredAllergens = [];
    // Lasciamo memorizzati gli allergeni per consentire modifiche rapide senza resettare tutto
  }
}