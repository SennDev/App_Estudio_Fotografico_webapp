import { Component, EventEmitter, Input, Output } from '@angular/core';

import { SHARED_IMPORTS } from '../../shared/shared_imports';

@Component({
  selector: 'app-confirm-delete-modal',
  imports: [...SHARED_IMPORTS],
  templateUrl: './confirm-delete-modal.html',
  styleUrl: './confirm-delete-modal.scss',
})
export class ConfirmDeleteModal {
  @Input() visible = false;
  @Input() itemName = '';
  @Input() loading = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}
