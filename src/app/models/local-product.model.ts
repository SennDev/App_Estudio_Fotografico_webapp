export interface ProductoLocalResumen {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  imagen_url?: string | null;
  categoria_nombre?: string | null;
}
