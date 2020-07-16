import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../service/auth.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthUserGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Valida uidUser logueado y token
    let idUser: string = localStorage.getItem("uidUser");
    let token: string = localStorage.getItem("token");

    // Si existe en el storage permite acceso
    if (idUser && token) {
      return true;
    } else {
      Swal.fire({
        icon: 'error',
        title: '¡Accesso denegado!',
        text: '¡Necesitas estar logueado!',
      })
      this.router.navigate(['/login']);
      return false;
    }

  }

}
