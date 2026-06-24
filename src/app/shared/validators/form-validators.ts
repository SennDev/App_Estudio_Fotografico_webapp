import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import {
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
  MEXICAN_PHONE_LENGTH,
  MIN_PRODUCT_DESCRIPTION_LENGTH,
  MIN_PRODUCT_NAME_LENGTH,
  ORDER_MAX_DAYS_AHEAD,
} from './validation.constants';

const SPANISH_LETTERS =
  'A-Za-z\\u00C1\\u00C9\\u00CD\\u00D3\\u00DA\\u00E1\\u00E9\\u00ED\\u00F3\\u00FA\\u00D1\\u00F1';
const PERSON_NAME_PATTERN = new RegExp(`^[${SPANISH_LETTERS}]+(?: [${SPANISH_LETTERS}]+)*$`);
const PRODUCT_NAME_PATTERN = new RegExp(`^[${SPANISH_LETTERS}0-9\\s\\-/'."&()]+$`);
const HAS_PRODUCT_CONTENT_PATTERN = new RegExp(`[${SPANISH_LETTERS}0-9]`);
const PHONE_INPUT_PATTERN = /^[0-9\s\-()]+$/;
const DANGEROUS_TEXT_PATTERN = /<|>|`|\{|\}|\[|\]|script|javascript:/i;
const IMAGE_URL_PATTERN =
  /^(assets\/img\/productos\/[\w\u00F1\u00D1\u00E1\u00E9\u00ED\u00F3\u00FA\u00C1\u00C9\u00CD\u00D3\u00DA./-]+\.(jpg|jpeg|png|webp)|https?:\/\/[^\s<>`{}[\]]+)$/i;

export function normalizeSpaces(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizePhone(value: string): string {
  return value.replace(/[\s\-()]/g, '');
}

export function localDateInputValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addLocalDays(days: number, start = new Date()): Date {
  const result = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  result.setDate(result.getDate() + days);
  return result;
}

export function personNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');

    if (!value) {
      return null;
    }

    const normalized = normalizeSpaces(value);
    return PERSON_NAME_PATTERN.test(normalized) ? null : { personName: true };
  };
}

export function productNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');

    if (!value) {
      return null;
    }

    const normalized = normalizeSpaces(value);
    const valid =
      PRODUCT_NAME_PATTERN.test(normalized) && HAS_PRODUCT_CONTENT_PATTERN.test(normalized);

    return valid ? null : { productName: true };
  };
}

export function mexicanPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');

    if (!value) {
      return null;
    }

    if (!PHONE_INPUT_PATTERN.test(value)) {
      return { mexicanPhone: true };
    }

    const normalized = normalizePhone(value);

    if (!/^\d+$/.test(normalized) || normalized.length !== MEXICAN_PHONE_LENGTH) {
      return { mexicanPhone: true };
    }

    if (/^(\d)\1{9}$/.test(normalized)) {
      return { repeatedPhone: true };
    }

    return null;
  };
}

export function finiteNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value === null || value === undefined || value === '') {
      return null;
    }

    return Number.isFinite(Number(value)) ? null : { number: true };
  };
}

export function integerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value === null || value === undefined || value === '') {
      return null;
    }

    return Number.isInteger(Number(value)) ? null : { integer: true };
  };
}

export function selectedIdValidator(getAllowedIds: () => number[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = Number(control.value);

    if (!Number.isInteger(value) || value <= 0) {
      return null;
    }

    return getAllowedIds().includes(value) ? null : { selectedId: true };
  };
}

export function maxAvailableStockValidator(getStock: () => number | undefined): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = Number(control.value);
    const stock = getStock();

    if (!Number.isFinite(value) || stock === undefined) {
      return null;
    }

    return value <= stock ? null : { maxStock: { stock } };
  };
}

export function futureDateRangeValidator(maxDaysAhead = ORDER_MAX_DAYS_AHEAD): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');

    if (!value) {
      return null;
    }

    const selected = parseLocalDateInput(value);
    if (!selected) {
      return { dateInvalid: true };
    }

    const today = parseLocalDateInput(localDateInputValue());
    const maxDate = parseLocalDateInput(localDateInputValue(addLocalDays(maxDaysAhead)));

    if (!today || !maxDate) {
      return null;
    }

    if (selected < today) {
      return { datePast: true };
    }

    if (selected > maxDate) {
      return { dateTooFar: { maxDaysAhead } };
    }

    return null;
  };
}

export function safeDescriptionValidator(): ValidatorFn {
  return safeTextValidator(
    MIN_PRODUCT_DESCRIPTION_LENGTH,
    MAX_PRODUCT_DESCRIPTION_LENGTH,
    'safeDescription',
  );
}

export function safeTextValidator(
  minLength: number,
  maxLength: number,
  errorKey = 'safeText',
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');

    if (!value) {
      return null;
    }

    const normalized = normalizeSpaces(value);

    if (normalized.length < minLength) {
      return { minlength: { requiredLength: minLength, actualLength: normalized.length } };
    }

    if (normalized.length > maxLength) {
      return { maxlength: { requiredLength: maxLength, actualLength: normalized.length } };
    }

    return DANGEROUS_TEXT_PATTERN.test(normalized) ? { [errorKey]: true } : null;
  };
}

export function optionalImageUrlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = normalizeSpaces(String(control.value ?? ''));

    if (!value) {
      return null;
    }

    if (DANGEROUS_TEXT_PATTERN.test(value)) {
      return { imageUrl: true };
    }

    return IMAGE_URL_PATTERN.test(value) ? null : { imageUrl: true };
  };
}

export function productNameLengthValidators(): ValidatorFn[] {
  return [safeTextValidator(MIN_PRODUCT_NAME_LENGTH, MAX_PRODUCT_NAME_LENGTH, 'productNameSafe')];
}

function parseLocalDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  return new Date(year, month, day);
}
