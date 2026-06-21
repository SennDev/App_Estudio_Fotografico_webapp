import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../core/api.config';
import { Producto, ProductoCreate, ProductoUpdate } from '../models/producto.model';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private readonly endpoint = `${API_BASE_URL}/productos`;

  constructor(private readonly http: HttpClient) {}

  getProductos(incluirInactivos = false, categoriaId?: number): Observable<Producto[]> {
    let params = new HttpParams().set('incluir_inactivos', incluirInactivos);

    if (categoriaId) {
      params = params.set('categoria_id', categoriaId);
    }

    return this.http.get<Producto[]>(this.endpoint, { params });
  }

  getProductoById(id: number, incluirInactivos = false): Observable<Producto> {
    const params = new HttpParams().set('incluir_inactivos', incluirInactivos);
    return this.http.get<Producto>(`${this.endpoint}/${id}`, { params });
  }

  createProducto(payload: ProductoCreate): Observable<Producto> {
    return this.http.post<Producto>(this.endpoint, payload);
  }

  updateProducto(id: number, payload: ProductoUpdate): Observable<Producto> {
    return this.http.put<Producto>(`${this.endpoint}/${id}`, payload);
  }

  deleteProducto(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.endpoint}/${id}`);
  }
}
