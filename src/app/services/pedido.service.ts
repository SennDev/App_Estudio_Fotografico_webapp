import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../core/api.config';
import { EstadoPedido, EstadoPedidoUpdate, Pedido, PedidoCreate } from '../models/pedido.model';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private readonly endpoint = `${API_BASE_URL}/pedidos`;

  constructor(private readonly http: HttpClient) {}

  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.endpoint);
  }

  getPedidoById(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.endpoint}/${id}`);
  }

  createPedido(payload: PedidoCreate): Observable<Pedido> {
    return this.http.post<Pedido>(this.endpoint, payload);
  }

  updateEstadoPedido(id: number, estado: EstadoPedido): Observable<Pedido> {
    const payload: EstadoPedidoUpdate = { estado };
    return this.http.put<Pedido>(`${this.endpoint}/${id}/estado`, payload);
  }
}
