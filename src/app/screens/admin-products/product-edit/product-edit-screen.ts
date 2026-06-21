import { Component, OnInit, inject } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Categoria } from '../../../models/categoria.model';
import { ProductoUpdate } from '../../../models/producto.model';
import { CategoriaService } from '../../../services/categoria.service';
import { ProductoService } from '../../../services/producto.service';
import { SHARED_IMPORTS } from '../../../shared/shared_imports';
import {
  integerValidator,
  normalizeSpaces,
  optionalImageUrlValidator,
  productNameValidator,
  safeDescriptionValidator,
} from '../../../shared/validators/form-validators';
import {
  MAX_PRODUCT_NAME_LENGTH,
  MAX_PRODUCT_PRICE,
  MAX_PRODUCT_STOCK,
  MIN_PRODUCT_NAME_LENGTH,
} from '../../../shared/validators/validation.constants';

@Component({
  selector: 'app-product-edit-screen',
  imports: [...SHARED_IMPORTS],
  templateUrl: './product-edit-screen.html',
  styleUrl: './product-edit-screen.scss',
})
export class ProductEditScreen implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoriaService = inject(CategoriaService);
  private readonly productoService = inject(ProductoService);

  productoId = 0;
  categorias: Categoria[] = [];
  loading = false;
  saving = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  form = this.fb.group({
    nombre: [
      '',
      [
        Validators.required,
        Validators.minLength(MIN_PRODUCT_NAME_LENGTH),
        Validators.maxLength(MAX_PRODUCT_NAME_LENGTH),
        productNameValidator(),
      ],
    ],
    descripcion: ['', [Validators.required, safeDescriptionValidator()]],
    precio: [0, [Validators.required, Validators.min(0), Validators.max(MAX_PRODUCT_PRICE)]],
    stock: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(MAX_PRODUCT_STOCK),
        integerValidator(),
      ],
    ],
    imagen_url: ['', [optionalImageUrlValidator()]],
    categoria_id: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.productoId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.productoId) {
      this.errorMessage = 'Producto no valido.';
      return;
    }

    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      producto: this.productoService.getProductoById(this.productoId, true),
      categorias: this.categoriaService.getCategorias(),
    }).subscribe({
      next: ({ producto, categorias }) => {
        this.categorias = categorias;
        this.form.patchValue({
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio,
          stock: producto.stock,
          imagen_url: producto.imagen_url ?? '',
          categoria_id: producto.categoria_id,
        });
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el producto para editar.';
        this.loading = false;
      },
    });
  }

  guardar(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.markFormAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.saving = true;
    this.productoService.updateProducto(this.productoId, payload).subscribe({
      next: () => {
        this.successMessage = 'Producto actualizado correctamente.';
        this.saving = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo actualizar el producto.';
        this.saving = false;
      },
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return Boolean(control && control.invalid && (control.touched || control.dirty || this.submitted));
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);

    if (!control?.errors) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (control.hasError('minlength')) {
      return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
    }

    if (control.hasError('maxlength')) {
      return `No debe exceder ${control.errors['maxlength'].requiredLength} caracteres.`;
    }

    if (control.hasError('productName')) {
      return 'Usa letras, numeros y simbolos comerciales simples. Evita emojis o caracteres peligrosos.';
    }

    if (control.hasError('safeDescription')) {
      return 'La descripcion no debe contener HTML, scripts ni caracteres peligrosos.';
    }

    if (control.hasError('min')) {
      return 'El valor no puede ser negativo.';
    }

    if (control.hasError('max')) {
      return `El valor maximo permitido es ${control.errors['max'].max}.`;
    }

    if (control.hasError('integer')) {
      return 'El stock debe ser un numero entero.';
    }

    if (control.hasError('imageUrl')) {
      return 'Usa una ruta tipo assets/img/productos/foto.jpg o una URL http/https valida.';
    }

    return 'Revisa este campo.';
  }

  markFormAsTouched(): void {
    this.form.markAllAsTouched();
  }

  buildPayload(): ProductoUpdate {
    const raw = this.form.getRawValue();
    const imagenUrl = normalizeSpaces(raw.imagen_url);

    return {
      nombre: normalizeSpaces(raw.nombre),
      descripcion: normalizeSpaces(raw.descripcion),
      precio: Number(raw.precio),
      stock: Number(raw.stock),
      imagen_url: imagenUrl || null,
      categoria_id: Number(raw.categoria_id),
    };
  }

  volver(): void {
    this.router.navigate(['/admin/productos']);
  }
}
