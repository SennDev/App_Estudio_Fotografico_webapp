import { Component } from '@angular/core';

import { SHARED_IMPORTS } from '../../shared/shared_imports';

@Component({
  selector: 'app-bottom-nav',
  imports: [...SHARED_IMPORTS],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss',
})
export class BottomNav {
}
