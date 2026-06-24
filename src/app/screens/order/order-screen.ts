import { Component, OnInit, inject } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { PedidoCreate } from '../../models/pedido.model';
import { Producto } from '../../models/producto.model';
import { PedidoService } from '../../services/pedido.service';
import { ProductoService } from '../../services/producto.service';
import { SHARED_IMPORTS } from '../../shared/shared_imports';
import {
  addLocalDays,
  futureDateRangeValidator,
  integerValidator,
  localDateInputValue,
  maxAvailableStockValidator,
  mexicanPhoneValidator,
  normalizePhone,
  normalizeSpaces,
  personNameValidator,
  safeTextValidator,
  selectedIdValidator,
} from '../../shared/validators/form-validators';
import {
  MAX_CUSTOMER_NAME_LENGTH,
  MEXICAN_PHONE_LENGTH,
  MIN_CUSTOMER_NAME_LENGTH,
  ORDER_MAX_DAYS_AHEAD,
} from '../../shared/validators/validation.constants';

interface OrderSuccessSummary {
  pedidoId: number;
  cliente: string;
  producto: string;
  cantidad: number;
  total: number;
  fechaEvento?: string | null;
}

@Component({
  selector: 'app-order-screen',
  imports: [...SHARED_IMPORTS],
  templateUrl: './order-screen.html',
  styleUrl: './order-screen.scss',
})
export class OrderScreen implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly pedidoService = inject(PedidoService);
  private readonly route = inject(ActivatedRoute);

  productos: Producto[] = [];
  loadingProductos = false;
  loadError = false;
  sending = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  orderSuccess?: OrderSuccessSummary;
  private stockSeleccionado?: number;
  readonly minEventDate = localDateInputValue();
  readonly maxEventDate = localDateInputValue(addLocalDays(ORDER_MAX_DAYS_AHEAD));
  readonly maxCustomerNameLength = MAX_CUSTOMER_NAME_LENGTH;
  readonly mexicanPhoneLength = MEXICAN_PHONE_LENGTH;

  form = this.fb.group({
    nombre_cliente: [
      '',
      [
        Validators.required,
        Validators.minLength(MIN_CUSTOMER_NAME_LENGTH),
        Validators.maxLength(MAX_CUSTOMER_NAME_LENGTH),
        personNameValidator(),
      ],
    ],
    telefono_cliente: ['', [Validators.required, mexicanPhoneValidator()]],
    correo_cliente: ['', [Validators.email]],
    producto_id: [
      0,
      [
        Validators.required,
        Validators.min(1),
        selectedIdValidator(() => this.productos.map((producto) => producto.id)),
      ],
    ],
    cantidad: [
      1,
      [
        Validators.required,
        Validators.min(1),
        integerValidator(),
        maxAvailableStockValidator(() => this.stockSeleccionado),
      ],
    ],
    fecha_evento: ['', [futureDateRangeValidator()]],
    observaciones: ['', [safeTextValidator(0, 500, 'safeObservaciones')]],
  });

  ngOnInit(): void {
    this.cargarProductos();

    this.route.queryParamMap.subscribe((params) => {
      const productoId = Number(params.get('producto_id'));
      if (productoId) {
        this.form.patchValue({ producto_id: productoId });
        this.actualizarStockSeleccionado();
        this.form.controls.cantidad.updateValueAndValidity();
      }
    });

    this.form.controls.producto_id.valueChanges.subscribe(() => {
      this.actualizarStockSeleccionado();
      this.form.controls.cantidad.updateValueAndValidity();
    });
  }

  get productoSeleccionado(): Producto | undefined {
    const productoId = Number(this.form.controls.producto_id.value);
    return this.productos.find((producto) => producto.id === productoId);
  }

  get totalEstimado(): number {
    const cantidad = Number(this.form.controls.cantidad.value) || 0;
    return (this.productoSeleccionado?.precio ?? 0) * cantidad;
  }

  cargarProductos(): void {
    this.loadingProductos = true;
    this.loadError = false;
    this.errorMessage = '';

    this.productoService.getProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.actualizarStockSeleccionado();
        this.form.controls.producto_id.updateValueAndValidity();
        this.form.controls.cantidad.updateValueAndValidity();
        this.loadingProductos = false;
      },
      error: () => {
        this.errorMessage =
          'No se pudo conectar con el servidor. Verifica que FastAPI este corriendo en http://localhost:8000.';
        this.loadError = true;
        this.loadingProductos = false;
      },
    });
  }

  enviarPedido(): void {
    if (this.sending) {
      return;
    }

    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.loadError = false;

    if (this.loadingProductos || this.form.invalid) {
      this.markFormAsTouched();
      return;
    }

    const payload = this.buildPayload();
    const producto = this.productoSeleccionado;
    this.sending = true;
    this.pedidoService.createPedido(payload).subscribe({
      next: (pedido) => {
        this.orderSuccess = {
          pedidoId: pedido.id,
          cliente: payload.nombre_cliente,
          producto: producto?.nombre ?? 'Producto seleccionado',
          cantidad: payload.cantidad,
          total: pedido.total_estimado,
          fechaEvento: payload.fecha_evento,
        };
        this.successMessage = `Pedido #${pedido.id} creado correctamente. Total estimado: ${pedido.total_estimado.toLocaleString('es-MX', {
          style: 'currency',
          currency: 'MXN',
        })}.`;
        this.sending = false;
        this.submitted = false;
        this.form.reset({
          nombre_cliente: '',
          telefono_cliente: '',
          correo_cliente: '',
          producto_id: 0,
          cantidad: 1,
          fecha_evento: '',
          observaciones: '',
        });
      },
      error: () => {
        this.errorMessage = 'No se pudo crear el pedido. Revisa los datos e intenta nuevamente.';
        this.sending = false;
      },
    });
  }

  crearOtroPedido(): void {
    this.orderSuccess = undefined;
    this.successMessage = '';
    this.errorMessage = '';
    this.submitted = false;
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

    if (control.hasError('personName')) {
      return 'Usa solo letras, acentos, \u00F1 y espacios. No uses numeros ni simbolos.';
    }

    if (control.hasError('mexicanPhone')) {
      return `Ingresa un telefono mexicano de ${this.mexicanPhoneLength} digitos. Puedes separar con espacios.`;
    }

    if (control.hasError('personName')) {
      return 'Usa solo letras, acentos, ñ y espacios. No uses numeros ni simbolos.';
    }

    if (control.hasError('mexicanPhone')) {
      return `Ingresa un telefono mexicano de ${MEXICAN_PHONE_LENGTH} digitos. Puedes separar con espacios.`;
    }

    if (control.hasError('repeatedPhone')) {
      return 'El telefono no puede estar formado por el mismo digito repetido.';
    }

    if (control.hasError('email')) {
      return 'Ingresa un correo valido o deja el campo vacio.';
    }

    if (control.hasError('min')) {
      return 'El valor debe ser mayor o igual a 1.';
    }

    if (control.hasError('selectedId')) {
      return 'Selecciona un producto disponible del catalogo.';
    }

    if (control.hasError('integer')) {
      return 'La cantidad debe ser un numero entero.';
    }

    if (control.hasError('maxStock')) {
      return `La cantidad no puede superar el stock disponible (${control.errors['maxStock'].stock}).`;
    }

    if (control.hasError('datePast')) {
      return 'La fecha no puede ser anterior a hoy.';
    }

    if (control.hasError('dateTooFar')) {
      return `La fecha no puede ser mayor a ${ORDER_MAX_DAYS_AHEAD} dias a partir de hoy.`;
    }

    if (control.hasError('dateInvalid')) {
      return 'Selecciona una fecha valida.';
    }

    if (control.hasError('safeObservaciones')) {
      return 'Evita caracteres o texto tipo script en las observaciones.';
    }

    return 'Revisa este campo.';
  }

  markFormAsTouched(): void {
    this.form.markAllAsTouched();
  }

  buildPayload(): PedidoCreate {
    const raw = this.form.getRawValue();
    const correo = normalizeSpaces(raw.correo_cliente).toLowerCase();
    const observaciones = normalizeSpaces(raw.observaciones);

    return {
      nombre_cliente: normalizeSpaces(raw.nombre_cliente),
      telefono_cliente: normalizePhone(raw.telefono_cliente),
      correo_cliente: correo || null,
      producto_id: Number(raw.producto_id),
      cantidad: Number(raw.cantidad),
      fecha_evento: raw.fecha_evento || null,
      observaciones: observaciones || null,
    };
  }

  private actualizarStockSeleccionado(): void {
    this.stockSeleccionado = this.productoSeleccionado?.stock;
  }
}
