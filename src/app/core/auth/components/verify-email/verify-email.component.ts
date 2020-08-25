import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth/service/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {

  usuario: any;

  constructor(
    public authService: AuthService,
    public router: Router
  ) { }

  ngOnInit(): void {
    // Comprueba si el usuario esta logueado y el email verificado
    this.authService.isAuth().subscribe((authUser) => {
      this.usuario = authUser;
    });
  }

  reenviarEmail() {
    this.authService.emailVerification();
  }

  regresarLogin() {
    this.authService.logout();
  }

}
