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
import { tap, map, take } from 'rxjs/operators';

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

    //Guard que comprueba si esta logeado
    if (this.auth.isLogged) {
      return true;
    }
    console.error('¡Accesso denegado! - ¡Necesitas estar logueado!')
    this.router.navigate(['/register']);
    /*
    //Guard production
    return this.auth.user.pipe(
      take(1),
      //map(user => user && user.rol.admin ? true : false),
      map(user => !!user),
      tap(isAdmin => {
        if (!isAdmin) {
          console.error('¡Accesso denegado! - ¡Solo admin!')
          this.router.navigate(['/register'])
        }
      })
    ); */

  }

}
