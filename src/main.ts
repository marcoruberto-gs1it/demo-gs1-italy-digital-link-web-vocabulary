import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet, Routes } from '@angular/router'; // Rimosso withHashLocation
import { ProductComponent } from './app/product-component/product-component';

const routes: Routes = [
  {
    path: '01/:gtin',
    component: ProductComponent,
  },
  {
    path: '**',
    redirectTo: '01/08032089000147',
    pathMatch: 'full',
  },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `,
})
export class App {}

bootstrapApplication(App, {
  providers: [provideRouter(routes)],
});