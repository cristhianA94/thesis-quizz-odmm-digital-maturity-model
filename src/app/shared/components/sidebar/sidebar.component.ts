import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth/service/auth.service';
import { Usuario } from 'app/shared/models/usuario';
import { Subject, Observable, Subscription } from 'rxjs';
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
  private _unsubscribeAll: Subject<any>;
  subscripcion: Subscription;

  usuario: Usuario;
  userAuth: boolean = false;
  userAdmin: boolean = false;

  constructor(
    public authService: AuthService,
    public userService: UsuarioService,
    public auth: AngularFireAuth

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
    let idUser = localStorage.getItem("uidUser");
    // Comprueba si el usuario es admin
    this.userService.getUser(idUser);
    this.subscripcion = this.userService.onUsuarioChanged.subscribe(usuario => {
      // TODO Admin deslogueo
      //this.usuario = usuario;
      if (usuario.rol == "ADMIN_ROLE") {
        this.userAdmin = true;
      } else {
        this.userAdmin = false;
      }
    });
    // Comprueba si el usuario esta logueado y el email verificado
    this.authService.isAuth().subscribe((authUser) => {
      if (authUser && authUser.emailVerified) {
        this.userAuth = true;
      } else {
        this.userAuth = false;
      }
    });
  }

  // Metodo para salir de la cuenta
  onLogout() {
    this.authService.logout();
    this.subscripcion.unsubscribe();
    this.userAdmin = false;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
