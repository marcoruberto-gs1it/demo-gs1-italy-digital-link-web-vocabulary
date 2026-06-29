import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet, Routes } from '@angular/router';
import { ProductComponent } from './app/product-component/product-component';

export const routes: Routes = [
  { path: '01/:gtin', component: ProductComponent },
  { path: '01/:gtin/10/:batch', component: ProductComponent },
  { path: '01/:gtin/10/:batch/17/:bestBefore', component: ProductComponent },


  { path: 'demo-gs1-italy-digital-link-web-vocabulary/01/:gtin', component: ProductComponent },
  { path: 'demo-gs1-italy-digital-link-web-vocabulary/01/:gtin/10/:batch', component: ProductComponent },
  { path: 'demo-gs1-italy-digital-link-web-vocabulary/01/:gtin/10/:batch/17/:bestBefore', component: ProductComponent },

  // Fallback
  { path: '**', redirectTo: '01/08032089000147', pathMatch: 'full' },
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