import { RouterOutlet } from '@angular/router';
import { Component } from '@angular/core';

import { BottomNav } from './partials/bottom-nav/bottom-nav';
import { Footer } from './partials/footer/footer';
import { Navbar } from './partials/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, BottomNav, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
}
