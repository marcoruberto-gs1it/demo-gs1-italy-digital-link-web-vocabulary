import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { provideRouter } from '@angular/router';
import { App, routes } from './main';

const bootstrap = () => bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideServerRendering()
  ]
});

export default bootstrap;