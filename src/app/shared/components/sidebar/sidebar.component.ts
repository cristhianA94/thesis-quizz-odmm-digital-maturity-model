import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth/service/auth.service';
import { Usuario } from 'app/shared/models/usuario';
import { Subject } from 'rxjs';
import { UsuarioService } from 'app/core/services/user/usuarios/usuario.service';

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
  private _unsubscribeAll: Subject<any>;
  usuario: Usuario;
  idUser: string;

  constructor(
    public authService: AuthService,
    public userService: UsuarioService,

  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    // Comprueba si el usuario esta logueado
    this.isUserLogged();
  }
  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  };

  isUserLogged() {
    this.idUser = localStorage.getItem("uidUser");
    // Comprueba si el usuario es admin
    this.userService.getUser(this.idUser);
    this.userService.onUsuarioChanged.subscribe(usuario => {
      this.usuario = usuario
      if (this.usuario.rol === "ADMIN_ROLE") {
        this.authService.isAdmin = true;
      }
    });
    // Comprueba si el usuario esta logueado
    this.authService.isAuth().subscribe((authUser) => {
      if (authUser) {
        this.authService.isLogged = true;
      } else {
        this.authService.isLogged = false;
      }
    });
  }

  // Metodo para salir de la cuenta
  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
