import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { SHARED_IMPORTS } from '../../shared/shared_imports';

@Component({
  selector: 'app-bottom-nav',
  imports: [...SHARED_IMPORTS],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss',
})
export class BottomNav {
  private readonly router = inject(Router);

  currentUrl = this.router.url;

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl = event.urlAfterRedirects;
      });
  }

  get isAdminActive(): boolean {
    return this.currentUrl.startsWith('/admin');
  }

  get isCatalogActive(): boolean {
    return this.currentUrl.startsWith('/catalogo') || this.currentUrl.startsWith('/producto/');
  }

  get isOrderActive(): boolean {
    return this.currentUrl.startsWith('/pedido');
  }
}
