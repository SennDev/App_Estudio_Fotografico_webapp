import { Component, OnInit } from '@angular/core';

import { Pedido, EstadoPedido } from '../../models/pedido.model';
import { AdminNav } from '../../partials/admin-nav/admin-nav';
import { PedidoService } from '../../services/pedido.service';
import { SHARED_IMPORTS } from '../../shared/shared_imports';

@Component({
  selector: 'app-admin-orders-screen',
  imports: [...SHARED_IMPORTS, AdminNav],
  templateUrl: './admin-orders-screen.html',
  styleUrl: './admin-orders-screen.scss',
})
export class AdminOrdersScreen implements OnInit {
  pedidos: Pedido[] = [];
  loading = false;
  updatingId?: number;
  errorMessage = '';
  successMessage = '';
  readonly estados: EstadoPedido[] = ['pendiente', 'confirmado', 'cancelado', 'entregado'];
  readonly skeletonCards = [1, 2, 3, 4];

  constructor(private readonly pedidoService: PedidoService) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.pedidoService.getPedidos().subscribe({
      next: (pedidos) => {
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

  actualizarEstado(pedido: Pedido, estado: EstadoPedido): void {
    if (pedido.estado === estado || this.updatingId || !this.estados.includes(estado)) {
      return;
    }

    this.updatingId = pedido.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.pedidoService.updateEstadoPedido(pedido.id, estado).subscribe({
      next: (actualizado) => {
        this.pedidos = this.pedidos.map((item) => (item.id === actualizado.id ? actualizado : item));
        this.successMessage = `Pedido #${actualizado.id} actualizado a ${actualizado.estado}.`;
        this.updatingId = undefined;
      },
      error: () => {
        this.errorMessage = 'No se pudo actualizar el estado del pedido. Intenta nuevamente.';
        this.updatingId = undefined;
      },
    });
  }

  badgeClass(estado: EstadoPedido): string {
    return `status-${estado}`;
  }
}
