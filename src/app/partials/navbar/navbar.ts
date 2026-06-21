import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { SHARED_IMPORTS } from '../../shared/shared_imports';

@Component({
  selector: 'app-navbar',
  imports: [...SHARED_IMPORTS],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private readonly router = inject(Router);

  currentUrl = this.router.url;

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl = event.urlAfterRedirects;
      });
  }

  get subtitle(): string {
    if (this.currentUrl.startsWith('/catalogo')) {
      return 'Catalogo de productos y servicios';
    }

    if (this.currentUrl.startsWith('/pedido')) {
      return 'Crear pedido';
    }

    if (this.currentUrl.startsWith('/admin')) {
      return 'Administracion de productos';
    }

    if (this.currentUrl.startsWith('/producto')) {
      return 'Detalle del producto';
    }

    return 'Estudio fotografico';
  }
}
