import { Component, OnInit, inject } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Categoria } from '../../../models/categoria.model';
import { ProductoCreate } from '../../../models/producto.model';
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
  selector: 'app-product-form-screen',
  imports: [...SHARED_IMPORTS],
  templateUrl: './product-form-screen.html',
  styleUrl: './product-form-screen.scss',
})
export class ProductFormScreen implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly categoriaService = inject(CategoriaService);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);

  categorias: Categoria[] = [];
  loadingCategorias = false;
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
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.loadingCategorias = true;
    this.categoriaService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.loadingCategorias = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las categorias.';
        this.loadingCategorias = false;
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
    this.productoService.createProducto(payload).subscribe({
      next: () => {
        this.successMessage = 'Producto creado correctamente.';
        this.saving = false;
        this.submitted = false;
        this.form.reset({
          nombre: '',
          descripcion: '',
          precio: 0,
          stock: 0,
          imagen_url: '',
          categoria_id: 0,
        });
      },
      error: () => {
        this.errorMessage = 'No se pudo crear el producto. Revisa la categoria y los datos.';
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

  buildPayload(): ProductoCreate {
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
