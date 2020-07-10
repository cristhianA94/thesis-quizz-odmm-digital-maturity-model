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

    // Comprueba si el usuario esta logeado
    this.auth.isAuth().subscribe((authUser) => {
      if (authUser) {
        this.auth.isLogged = true;
      } else {
        this.auth.isLogged = false;
      }
    });

    if (this.auth.isLogged) {
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
