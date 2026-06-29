import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router'; // <--- Importiamo il Router di Angular

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

  // Iniettiamo il Router nel costruttore
  constructor(private router: Router) {}

  ngOnInit(): void {}

  setAllergyProfile(isAllergic: boolean) {
    this.isAllergicUser = isAllergic;
    this.currentStep = 'scanning';
  }

  onCodeResult(resultString: string) {
    this.scannedUrl = resultString;

    // Lista reale delle potenziali contaminazioni del prodotto ("Le Conserve della Nonna")
    const productAllergens = ['Sedano', 'Pesce', 'Latte', 'Molluschi', 'Soia', 'Frutta a guscio'];

    if (this.isAllergicUser && productAllergens.includes(this.allergenToWatch)) {
      // È ALLERGICO: Blocca il flusso e mostra la schermata di avviso
      this.currentStep = 'result';
      this.allergyAlertTriggered = true;
    } else {
      // NON È ALLERGICO: Generiamo la rotta Angular corretta ed eseguiamo il redirect interno 🚀
      this.allergyAlertTriggered = false;
      this.navigateToProductRoute(resultString);
    }
  }

  // Funzione helper per analizzare la stringa del QR Code e navigare internamente
  private navigateToProductRoute(url: string) {
    // Cerchiamo i pattern standard nell'URL letto dal codice
    const gtinMatch = url.match(/\/01\/(\d{13,14})/);
    const batchMatch = url.match(/\/10\/([^\/]+)/);
    const bestBeforeMatch = url.match(/\/17\/(\d{6})/);

    const gtin = gtinMatch ? gtinMatch[1] : '8005360007746'; // fallback se non trova il GTIN
    const batch = batchMatch ? batchMatch[1] : null;
    const bestBefore = bestBeforeMatch ? bestBeforeMatch[1] : null;

    // Costruiamo l'array della rotta in base ai dati presenti nel QR
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