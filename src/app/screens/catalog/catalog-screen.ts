import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { Categoria } from '../../models/categoria.model';
import { Producto } from '../../models/producto.model';
import { CategoriaService } from '../../services/categoria.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { ProductoService } from '../../services/producto.service';
import { SHARED_IMPORTS } from '../../shared/shared_imports';

type CatalogSort = 'nombre' | 'precio_asc' | 'precio_desc' | 'stock_desc';

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
  searchTerm = '';
  sortOption: CatalogSort = 'nombre';
  soloFavoritos = false;
  loading = false;
  errorMessage = '';
  imagenesConError = new Set<number>();
  favoriteIds = new Set<number>();
  readonly skeletonCards = [1, 2, 3, 4, 5, 6];

  constructor(
    private readonly productoService: ProductoService,
    private readonly categoriaService: CategoriaService,
    private readonly localStorageService: LocalStorageService,
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.errorMessage = '';
    this.categoriaSeleccionada = 0;
    this.searchTerm = '';
    this.sortOption = 'nombre';
    this.soloFavoritos = false;
    this.favoriteIds = new Set(this.localStorageService.getFavoriteIds());

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
    // El filtrado se calcula localmente para evitar llamadas repetidas al backend.
  }

  marcarImagenError(productoId: number): void {
    this.imagenesConError.add(productoId);
  }

  imagenDisponible(producto: Producto): boolean {
    return Boolean(producto.imagen_url) && !this.imagenesConError.has(producto.id);
  }

  imagenSrc(producto: Producto): string {
    return producto.imagen_url?.trim() ?? '';
  }

  trackProducto(_: number, producto: Producto): number {
    return producto.id;
  }

  get productosFiltrados(): Producto[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.productos
      .filter((producto) => {
        const coincideBusqueda =
          !term ||
          producto.nombre.toLowerCase().includes(term) ||
          producto.descripcion.toLowerCase().includes(term);
        const coincideCategoria =
          !this.categoriaSeleccionada || producto.categoria_id === this.categoriaSeleccionada;
        const coincideFavorito = !this.soloFavoritos || this.favoriteIds.has(producto.id);
        return coincideBusqueda && coincideCategoria && coincideFavorito;
      })
      .sort((a, b) => this.compararProductos(a, b));
  }

  get categoriaActivaNombre(): string {
    return (
      this.categorias.find((categoria) => categoria.id === this.categoriaSeleccionada)?.nombre ?? ''
    );
  }

  get filtrosActivos(): number {
    return Number(Boolean(this.searchTerm.trim())) + Number(Boolean(this.categoriaSeleccionada)) + Number(this.soloFavoritos);
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.categoriaSeleccionada = 0;
    this.sortOption = 'nombre';
    this.soloFavoritos = false;
  }

  toggleFavorite(producto: Producto): void {
    const isFavorite = this.localStorageService.toggleFavorite(producto.id);

    if (isFavorite) {
      this.favoriteIds.add(producto.id);
    } else {
      this.favoriteIds.delete(producto.id);
    }
  }

  isFavorite(productoId: number): boolean {
    return this.favoriteIds.has(productoId);
  }

  private compararProductos(a: Producto, b: Producto): number {
    if (this.sortOption === 'precio_asc') {
      return a.precio - b.precio;
    }

    if (this.sortOption === 'precio_desc') {
      return b.precio - a.precio;
    }

    if (this.sortOption === 'stock_desc') {
      return b.stock - a.stock;
    }

    return a.nombre.localeCompare(b.nombre, 'es');
  }
}
