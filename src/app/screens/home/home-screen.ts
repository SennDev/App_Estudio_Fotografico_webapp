import { Component } from '@angular/core';

import { ProductoLocalResumen } from '../../models/local-product.model';
import { LocalStorageService } from '../../services/local-storage.service';
import { SHARED_IMPORTS } from '../../shared/shared_imports';

@Component({
  selector: 'app-home-screen',
  imports: [...SHARED_IMPORTS],
  templateUrl: './home-screen.html',
  styleUrl: './home-screen.scss',
})
export class HomeScreen {
  recientes: ProductoLocalResumen[] = [];

  constructor(private readonly localStorageService: LocalStorageService) {
    this.recientes = this.localStorageService.getRecentProducts();
  }

  highlights = [
    {
      icon: 'bi-camera',
      title: 'Sesiones de estudio',
      text: 'Servicios fotograficos para personas, familias y eventos.',
    },
    {
      icon: 'bi-printer',
      title: 'Impresiones',
      text: 'Fotografias listas para entregar en formatos populares.',
    },
    {
      icon: 'bi-journal-album',
      title: 'Albumes',
      text: 'Productos personalizados para conservar recuerdos especiales.',
    },
    {
      icon: 'bi-stars',
      title: 'Retoque digital',
      text: 'Edicion profesional para mejorar cada fotografia.',
    },
  ];
}
