import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ProductComponent } from './app/product-component/product-component';
import { ScannerComponent } from './app/scanner-component/scanner-component'; 

export const routes: Routes = [
  {
    // Pagina iniziale: Mostra la profilazione allergie e attiva la webcam
    path: '',
    component: ScannerComponent,
  },
  {
    // Livello 1: Solo Prodotto (Raggiunto dopo lo scan o tramite link diretto)
    path: '01/:gtin',
    component: ProductComponent,
  },
  {
    // Livello 2: Prodotto + Lotto
    path: '01/:gtin/10/:batch',
    component: ProductComponent,
  },
  {
    // Livello 3: Prodotto + Lotto + Scadenza
    path: '01/:gtin/10/:batch/17/:bestBefore',
    component: ProductComponent,
  },
  {
    // Se l'URL è errato, rimanda alla schermata dello scanner per riprovare
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class App {}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient() // <--- Abilita le chiamate HTTP necessarie per i componenti
  ],
});