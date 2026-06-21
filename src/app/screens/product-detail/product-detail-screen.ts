import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto.service';
import { SHARED_IMPORTS } from '../../shared/shared_imports';

@Component({
  selector: 'app-product-detail-screen',
  imports: [...SHARED_IMPORTS],
  templateUrl: './product-detail-screen.html',
  styleUrl: './product-detail-screen.scss',
})
export class ProductDetailScreen implements OnInit {
  producto?: Producto;
  loading = true;
  errorMessage = '';
  imageError = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly productoService: ProductoService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage = 'Producto no valido.';
      this.loading = false;
      return;
    }

    this.productoService.getProductoById(id).subscribe({
      next: (producto) => {
        this.producto = producto;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el producto solicitado.';
        this.loading = false;
      },
    });
  }

  get imagenDisponible(): boolean {
    return Boolean(this.producto?.imagen_url) && !this.imageError;
  }

  get imagenSrc(): string {
    const url = this.producto?.imagen_url ?? '';
    return url.startsWith('http') || url.startsWith('/') ? url : `/${url}`;
  }
}
