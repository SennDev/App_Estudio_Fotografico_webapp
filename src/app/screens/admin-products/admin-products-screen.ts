import { Component, OnInit } from '@angular/core';

import { ConfirmDeleteModal } from '../../modals/confirm-delete-modal/confirm-delete-modal';
import { Producto } from '../../models/producto.model';
import { AdminNav } from '../../partials/admin-nav/admin-nav';
import { ProductoService } from '../../services/producto.service';
import { SHARED_IMPORTS } from '../../shared/shared_imports';

@Component({
  selector: 'app-admin-products-screen',
  imports: [...SHARED_IMPORTS, ConfirmDeleteModal, AdminNav],
  templateUrl: './admin-products-screen.html',
  styleUrl: './admin-products-screen.scss',
})
export class AdminProductsScreen implements OnInit {
  productos: Producto[] = [];
  loading = false;
  deleting = false;
  loadError = false;
  errorMessage = '';
  actionError = '';
  successMessage = '';
  productoSeleccionado?: Producto;
  readonly skeletonCards = [1, 2, 3, 4, 5, 6];

  constructor(private readonly productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  get productosActivos(): number {
    return this.productos.filter((producto) => producto.activo).length;
  }

  get productosInactivos(): number {
    return this.productos.filter((producto) => !producto.activo).length;
  }

  cargarProductos(): void {
    this.loading = true;
    this.loadError = false;
    this.errorMessage = '';

    this.productoService.getProductos(true).subscribe({
      next: (productos) => {
        this.productos = productos;
        this.loading = false;
      },
      error: () => {
        this.errorMessage =
          'No se pudo conectar con el servidor. Verifica que FastAPI este corriendo en http://localhost:8000.';
        this.loadError = true;
        this.loading = false;
      },
    });
  }

  abrirConfirmacion(producto: Producto): void {
    if (this.deleting || !producto.activo) {
      return;
    }

    this.productoSeleccionado = producto;
    this.successMessage = '';
    this.actionError = '';
  }

  cerrarConfirmacion(): void {
    if (!this.deleting) {
      this.productoSeleccionado = undefined;
    }
  }

  eliminarConfirmado(): void {
    if (!this.productoSeleccionado || this.deleting) {
      return;
    }

    this.deleting = true;
    this.productoService.deleteProducto(this.productoSeleccionado.id).subscribe({
      next: () => {
        this.successMessage = 'Producto desactivado correctamente.';
        this.deleting = false;
        this.productoSeleccionado = undefined;
        this.cargarProductos();
      },
      error: () => {
        this.actionError = 'No se pudo desactivar el producto.';
        this.deleting = false;
      },
    });
  }
}
