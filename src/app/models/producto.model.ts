import { Categoria } from './categoria.model';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen_url?: string | null;
  categoria_id: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  categoria?: Categoria | null;
}

export interface ProductoCreate {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen_url?: string | null;
  categoria_id: number;
}

export interface ProductoUpdate {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  imagen_url?: string | null;
  categoria_id?: number;
  activo?: boolean;
}
