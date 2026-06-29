import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet, Routes } from '@angular/router';
import { ProductComponent } from './app/product-component/product-component';

export const routes: Routes = [
  {
    // Livello 1: Solo Prodotto
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
    // Default fallback se l'URL non è completo
    path: '**',
    redirectTo: '01/8005360007746',
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
  providers: [provideRouter(routes)],
});