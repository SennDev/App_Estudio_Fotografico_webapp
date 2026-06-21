import { Producto } from './producto.model';

export type EstadoPedido = 'pendiente' | 'confirmado' | 'cancelado' | 'entregado';

export interface Pedido {
  id: number;
  nombre_cliente: string;
  telefono_cliente: string;
  correo_cliente?: string | null;
  producto_id: number;
  cantidad: number;
  fecha_evento?: string | null;
  observaciones?: string | null;
  estado: EstadoPedido;
  total_estimado: number;
  fecha_pedido: string;
  producto?: Producto | null;
}

export interface PedidoCreate {
  nombre_cliente: string;
  telefono_cliente: string;
  correo_cliente?: string | null;
  producto_id: number;
  cantidad: number;
  fecha_evento?: string | null;
  observaciones?: string | null;
}

export interface EstadoPedidoUpdate {
  estado: EstadoPedido;
}
