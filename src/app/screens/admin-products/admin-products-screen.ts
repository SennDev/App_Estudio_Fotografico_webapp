import { Component, OnInit } from '@angular/core';

import { ConfirmDeleteModal } from '../../modals/confirm-delete-modal/confirm-delete-modal';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto.service';
import { SHARED_IMPORTS } from '../../shared/shared_imports';

@Component({
  selector: 'app-admin-products-screen',
  imports: [...SHARED_IMPORTS, ConfirmDeleteModal],
  templateUrl: './admin-products-screen.html',
  styleUrl: './admin-products-screen.scss',
})
export class AdminProductsScreen implements OnInit {
  productos: Producto[] = [];
  loading = false;
  deleting = false;
  errorMessage = '';
  successMessage = '';
  productoSeleccionado?: Producto;

  constructor(private readonly productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.productoService.getProductos(true).subscribe({
      next: (productos) => {
        this.productos = productos;
        this.loading = false;
      },
      error: () => {
        this.errorMessage =
          'No se pudo conectar con el servidor. Verifica que FastAPI este corriendo en http://localhost:8000.';
        this.loading = false;
      },
    });
  }

  abrirConfirmacion(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cerrarConfirmacion(): void {
    if (!this.deleting) {
      this.productoSeleccionado = undefined;
    }
  }

  eliminarConfirmado(): void {
    if (!this.productoSeleccionado) {
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
        this.errorMessage = 'No se pudo desactivar el producto.';
        this.deleting = false;
      },
    });
  }
}
