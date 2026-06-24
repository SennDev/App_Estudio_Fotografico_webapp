import { Injectable } from '@angular/core';

import { ProductoLocalResumen } from '../models/local-product.model';
import { Producto } from '../models/producto.model';

const FAVORITES_KEY = 'lumiere_favorite_product_ids';
const RECENT_KEY = 'lumiere_recent_products';
const RECENT_LIMIT = 5;

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  getFavoriteIds(): number[] {
    return this.readNumberArray(FAVORITES_KEY);
  }

  isFavorite(productoId: number): boolean {
    return this.getFavoriteIds().includes(productoId);
  }

  toggleFavorite(productoId: number): boolean {
    const favorites = new Set(this.getFavoriteIds());

    if (favorites.has(productoId)) {
      favorites.delete(productoId);
      this.write(FAVORITES_KEY, [...favorites]);
      return false;
    }

    favorites.add(productoId);
    this.write(FAVORITES_KEY, [...favorites]);
    return true;
  }

  getRecentProducts(): ProductoLocalResumen[] {
    const recientes = this.read<Partial<ProductoLocalResumen>[]>(RECENT_KEY, []);
    const seen = new Set<number>();

    return recientes
      .filter((item): item is ProductoLocalResumen => {
        const id = Number(item?.id);
        return Number.isInteger(id) && id > 0 && typeof item?.nombre === 'string';
      })
      .map((item) => ({
        id: Number(item.id),
        nombre: item.nombre.trim(),
        precio: Number(item.precio) || 0,
        stock: Number(item.stock) || 0,
        imagen_url: item.imagen_url ?? null,
        categoria_nombre: item.categoria_nombre ?? null,
      }))
      .filter((item) => {
        if (!item.nombre || seen.has(item.id)) {
          return false;
        }

        seen.add(item.id);
        return true;
      })
      .slice(0, RECENT_LIMIT);
  }

  addRecentProduct(producto: Producto): void {
    const resumen: ProductoLocalResumen = {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
      imagen_url: producto.imagen_url ?? null,
      categoria_nombre: producto.categoria?.nombre ?? null,
    };
    const recientes = this.getRecentProducts().filter((item) => item.id !== producto.id);
    this.write(RECENT_KEY, [resumen, ...recientes].slice(0, RECENT_LIMIT));
  }

  private readNumberArray(key: string): number[] {
    const values = this.read<unknown[]>(key, [])
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0);

    return [...new Set(values)];
  }

  private read<T>(key: string, fallback: T): T {
    try {
      const storage = this.getStorage();
      const raw = storage?.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private write<T>(key: string, value: T): void {
    try {
      this.getStorage()?.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage may be unavailable in restricted browser contexts.
    }
  }

  private getStorage(): Storage | null {
    return typeof localStorage === 'undefined' ? null : localStorage;
  }
}
