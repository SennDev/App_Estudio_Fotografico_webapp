import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { Categoria } from '../../models/categoria.model';
import { Producto } from '../../models/producto.model';
import { CategoriaService } from '../../services/categoria.service';
import { ProductoService } from '../../services/producto.service';
import { SHARED_IMPORTS } from '../../shared/shared_imports';

@Component({
  selector: 'app-catalog-screen',
  imports: [...SHARED_IMPORTS],
  templateUrl: './catalog-screen.html',
  styleUrl: './catalog-screen.scss',
})
export class CatalogScreen implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  categoriaSeleccionada = 0;
  loading = false;
  errorMessage = '';
  imagenesConError = new Set<number>();

  constructor(
    private readonly productoService: ProductoService,
    private readonly categoriaService: CategoriaService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      productos: this.productoService.getProductos(),
      categorias: this.categoriaService.getCategorias(),
    }).subscribe({
      next: ({ productos, categorias }) => {
        this.productos = productos;
        this.categorias = categorias;
        this.loading = false;
      },
      error: () => {
        this.errorMessage =
          'No se pudo conectar con el servidor. Verifica que FastAPI este corriendo en http://localhost:8000.';
        this.loading = false;
      },
    });
  }

  filtrarPorCategoria(): void {
    this.loading = true;
    this.errorMessage = '';
    const categoriaId = this.categoriaSeleccionada || undefined;

    this.productoService.getProductos(false, categoriaId).subscribe({
      next: (productos) => {
        this.productos = productos;
        this.loading = false;
      },
      error: () => {
        this.errorMessage =
          'No se pudo cargar el catalogo. Verifica que el backend este activo.';
        this.loading = false;
      },
    });
  }

  marcarImagenError(productoId: number): void {
    this.imagenesConError.add(productoId);
  }

  imagenDisponible(producto: Producto): boolean {
    return Boolean(producto.imagen_url) && !this.imagenesConError.has(producto.id);
  }

  imagenSrc(producto: Producto): string {
    const url = producto.imagen_url ?? '';
    return url.startsWith('http') || url.startsWith('/') ? url : `/${url}`;
  }

  trackProducto(_: number, producto: Producto): number {
    return producto.id;
  }
}
