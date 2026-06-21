import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../core/api.config';
import { Categoria, CategoriaCreate, CategoriaUpdate } from '../models/categoria.model';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private readonly endpoint = `${API_BASE_URL}/categorias`;

  constructor(private readonly http: HttpClient) {}

  getCategorias(incluirInactivas = false): Observable<Categoria[]> {
    const params = new HttpParams().set('incluir_inactivas', incluirInactivas);
    return this.http.get<Categoria[]>(this.endpoint, { params });
  }

  getCategoriaById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.endpoint}/${id}`);
  }

  createCategoria(payload: CategoriaCreate): Observable<Categoria> {
    return this.http.post<Categoria>(this.endpoint, payload);
  }

  updateCategoria(id: number, payload: CategoriaUpdate): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.endpoint}/${id}`, payload);
  }
}
