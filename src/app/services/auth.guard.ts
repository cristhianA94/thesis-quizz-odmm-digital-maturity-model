import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';


@Injectable()
export class UsuarioGuard implements CanActivate {
  constructor(private router: Router, private auth: AuthService) { }

  canActivate() {

    return false;
  }
}
