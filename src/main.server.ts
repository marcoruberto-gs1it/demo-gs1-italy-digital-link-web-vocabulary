import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { provideRouter } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common'; 
import { App, routes } from './main';

const bootstrap = () => bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideServerRendering(),
    { provide: APP_BASE_HREF, useValue: '/demo-gs1-italy-digital-link-web-vocabulary/' }
  ]
});

export default bootstrap;