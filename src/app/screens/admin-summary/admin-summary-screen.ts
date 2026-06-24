import { Component, OnInit } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';

import { AdminNav } from '../../partials/admin-nav/admin-nav';
import { Categoria } from '../../models/categoria.model';
import { Pedido } from '../../models/pedido.model';
import { Producto } from '../../models/producto.model';
import { CategoriaService } from '../../services/categoria.service';
import { PedidoService } from '../../services/pedido.service';
import { ProductoService } from '../../services/producto.service';
import { SHARED_IMPORTS } from '../../shared/shared_imports';

@Component({
  selector: 'app-admin-summary-screen',
  imports: [...SHARED_IMPORTS, AdminNav],
  templateUrl: './admin-summary-screen.html',
  styleUrl: './admin-summary-screen.scss',
})
export class AdminSummaryScreen implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  pedidos: Pedido[] = [];
  loading = false;
  errorMessage = '';
  pedidosNoDisponibles = false;
  readonly skeletonCards = [1, 2, 3, 4];

  constructor(
    private readonly productoService: ProductoService,
    private readonly categoriaService: CategoriaService,
    private readonly pedidoService: PedidoService,
  ) {}

  ngOnInit(): void {
    this.cargarResumen();
  }

  cargarResumen(): void {
    this.loading = true;
    this.errorMessage = '';
    this.pedidosNoDisponibles = false;

    forkJoin({
      productos: this.productoService.getProductos(true),
      categorias: this.categoriaService.getCategorias(true),
      pedidos: this.pedidoService.getPedidos().pipe(
        catchError(() => {
          this.pedidosNoDisponibles = true;
          return of([] as Pedido[]);
        }),
      ),
    }).subscribe({
      next: ({ productos, categorias, pedidos }) => {
        this.productos = productos;
        this.categorias = categorias;
        this.pedidos = pedidos;
        this.loading = false;
      },
      error: () => {
        this.errorMessage =
          'No se pudo conectar con el servidor. Verifica que FastAPI este corriendo en http://localhost:8000.';
        this.loading = false;
      },
    });
  }

  get productosActivos(): Producto[] {
    return this.productos.filter((producto) => producto.activo);
  }

  get productosInactivos(): Producto[] {
    return this.productos.filter((producto) => !producto.activo);
  }

  get pedidosPendientes(): number {
    return this.pedidos.filter((pedido) => pedido.estado === 'pendiente').length;
  }

  get valorInventario(): number {
    return this.productosActivos.reduce(
      (total, producto) => total + producto.precio * producto.stock,
      0,
    );
  }

  get bajoStock(): Producto[] {
    return this.productosActivos
      .filter((producto) => producto.stock <= 5)
      .sort((a, b) => a.stock - b.stock);
  }
}
