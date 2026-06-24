import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { SHARED_IMPORTS } from '../../shared/shared_imports';

@Component({
  selector: 'app-admin-nav',
  imports: [...SHARED_IMPORTS],
  templateUrl: './admin-nav.html',
  styleUrl: './admin-nav.scss',
})
export class AdminNav {
  private readonly router = inject(Router);

  currentUrl = this.router.url;

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl = event.urlAfterRedirects;
      });
  }

  isActive(route: 'resumen' | 'productos' | 'nuevo' | 'pedidos'): boolean {
    if (route === 'resumen') {
      return this.currentUrl === '/admin/resumen';
    }

    if (route === 'nuevo') {
      return this.currentUrl === '/admin/productos/nuevo';
    }

    if (route === 'pedidos') {
      return this.currentUrl === '/admin/pedidos';
    }

    return (
      this.currentUrl === '/admin/productos' ||
      this.currentUrl.startsWith('/admin/productos/editar/')
    );
  }
}
