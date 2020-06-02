import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/auth/service/auth.service';

declare const $: any;
declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  { path: '/home', title: 'Home', icon: 'house', class: '' },
  { path: '/acerca-de', title: 'Acerca De', icon: 'info', class: '' },
  { path: '/dashboard', title: 'Dashboard', icon: 'dashboard', class: '' },
  { path: '/user-profile', title: 'Perfil Usuario', icon: 'person', class: '' },
  { path: '/login', title: 'Login', icon: 'vpn_key', class: '' },
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styles: [
    `
    .btnAdmin{
      width: 225px;
    }
    `
  ]
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor(
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  };


  /* Metodo para salir de la cuenta */
  onLogout() {
    this.authService.logout();
  }
}
