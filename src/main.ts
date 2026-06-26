import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet, Routes } from '@angular/router';
import { ProductComponent } from './app/product-component/product-component';

// Definiamo la struttura degli URL GS1 Digital Link
const routes: Routes = [
  {
    // Mappa esattamente l'Application Identifier (01) seguito dal GTIN
    path: '01/:gtin',
    component: ProductComponent,
  },
  {
    // Redirect di default: se qualcuno visita la home vuota, lo rimandiamo alla nostra demo
    path: '**',
    redirectTo: '01/08032089000147',
    pathMatch: 'full',
  },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // Importiamo il modulo per il routing
  template: `
    <router-outlet></router-outlet>
  `,
})
export class App {}

// Avviamo l'applicazione iniettando il sistema di rotte
bootstrapApplication(App, {
  providers: [provideRouter(routes)],
});
