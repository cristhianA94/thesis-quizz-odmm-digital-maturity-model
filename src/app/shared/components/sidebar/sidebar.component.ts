import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth/service/auth.service';
import { Usuario } from 'app/shared/models/usuario';
import { Subject, Observable, Subscription, BehaviorSubject } from 'rxjs';
import { UsuarioService } from 'app/core/services/user/usuarios/usuario.service';
import { AngularFireAuth } from '@angular/fire/auth';

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
  { path: '/cuestionario', title: 'Cuestionario', icon: 'vertical_split', class: '' },
  { path: '/user-profile', title: 'Perfil Usuario', icon: 'person', class: '' },
  { path: '/reportes', title: 'Reportes', icon: 'assessment', class: '' },
  { path: '/login', title: 'Login', icon: 'vpn_key', class: '' },
];

//{ path: '/dashboard', title: 'Dashboard', icon: 'dashboard', class: '' },
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

  constructor(
    public authService: AuthService,
    public userService: UsuarioService,
    public auth: AngularFireAuth
  ) {}

  ngOnInit() {
  }

  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  };

  // Metodo para salir de la cuenta
  onLogout() {
    this.userService.adminCheck.next(false);
    this.authService.logout();
  }

}
