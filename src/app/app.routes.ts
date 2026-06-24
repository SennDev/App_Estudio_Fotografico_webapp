import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./screens/home/home-screen').then((component) => component.HomeScreen),
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./screens/catalog/catalog-screen').then((component) => component.CatalogScreen),
  },
  {
    path: 'producto/:id',
    loadComponent: () =>
      import('./screens/product-detail/product-detail-screen').then(
        (component) => component.ProductDetailScreen,
      ),
  },
  {
    path: 'pedido',
    loadComponent: () =>
      import('./screens/order/order-screen').then((component) => component.OrderScreen),
  },
  {
    path: 'admin/productos',
    loadComponent: () =>
      import('./screens/admin-products/admin-products-screen').then(
        (component) => component.AdminProductsScreen,
      ),
  },
  {
    path: 'admin/resumen',
    loadComponent: () =>
      import('./screens/admin-summary/admin-summary-screen').then(
        (component) => component.AdminSummaryScreen,
      ),
  },
  {
    path: 'admin/pedidos',
    loadComponent: () =>
      import('./screens/admin-orders/admin-orders-screen').then(
        (component) => component.AdminOrdersScreen,
      ),
  },
  {
    path: 'admin/productos/nuevo',
    loadComponent: () =>
      import('./screens/admin-products/product-form/product-form-screen').then(
        (component) => component.ProductFormScreen,
      ),
  },
  {
    path: 'admin/productos/editar/:id',
    loadComponent: () =>
      import('./screens/admin-products/product-edit/product-edit-screen').then(
        (component) => component.ProductEditScreen,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
