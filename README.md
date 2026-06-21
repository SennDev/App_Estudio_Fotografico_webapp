# Lumiere Studios - Frontend Angular

Frontend mobile-first para el proyecto escolar `App_Estudio_Fotografico`. La aplicacion permite consultar productos y servicios de un estudio fotografico, crear pedidos y administrar productos mediante operaciones CRUD conectadas a una API FastAPI.

## Tecnologias

- Angular 20 con componentes standalone.
- Reactive Forms.
- HttpClient.
- Bootstrap 5.
- Bootstrap Icons.
- SCSS con tema claro/oscuro automatico.

## Backend requerido

El frontend consume la API en:

```ts
http://localhost:8000/api
```

La URL se configura en:

```text
src/app/core/api.config.ts
```

Antes de usar el catalogo, pedidos o administracion, ejecuta el backend FastAPI por separado desde:

```text
C:\Users\Gerso\OneDrive\Documentos\App_Estudio_Fotografico\App_Estudio_Fotografico_api
```

Comando esperado del backend:

```bash
uvicorn app.main:app --reload
```

Swagger del backend:

```text
http://localhost:8000/docs
```

## Ejecutar Angular

Desde esta carpeta:

```bash
npm start
```

O directamente:

```bash
ng serve
```

Abrir en el navegador:

```text
http://localhost:4200
```

## Compilar

```bash
ng build
```

## Pantallas principales

- `/home`: presentacion de Lumiere Studios.
- `/catalogo`: consulta de productos desde FastAPI.
- `/producto/:id`: detalle de producto.
- `/pedido`: formulario para crear pedidos.
- `/admin/productos`: administracion y baja logica de productos.
- `/admin/productos/nuevo`: alta de producto.
- `/admin/productos/editar/:id`: edicion de producto.

## Conexion con FastAPI

Los servicios en `src/app/services` usan `HttpClient` y consumen:

- `GET /api/productos`
- `GET /api/categorias`
- `POST /api/pedidos`
- `POST /api/productos`
- `PUT /api/productos/{id}`
- `DELETE /api/productos/{id}`

La eliminacion de productos es logica: el backend marca el producto como inactivo.

## Nota para Cordova y Android

En desarrollo web se usa:

```text
http://localhost:8000/api
```

Cuando la app se empaquete con Cordova y se pruebe en el emulador de Android Studio, puede ser necesario cambiar la URL a:

```text
http://10.0.2.2:8000/api
```

En un dispositivo fisico se debe usar la IP local de la computadora donde corre FastAPI.
