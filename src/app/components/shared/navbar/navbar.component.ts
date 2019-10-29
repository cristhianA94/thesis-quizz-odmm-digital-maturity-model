import { Component, OnInit } from '@angular/core';
/* Firebase */
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {

  isCollapsed = true;

  constructor(
    public authService: AuthService,
  ) { }

  ngOnInit() {
    this.getCurrentUser();

  }

  /* Metodo que comprueba si el usuario esta logeado */
  getCurrentUser() {
    this.authService.isAuth().subscribe(auth => {
      if (auth) {
        console.log('User logged');
        this.authService.isLogged = true;
      } else {
        console.log('NOT user logged');
        this.authService.isLogged = false;
      }
    });
  }

  /* Metodo para salir de la cuenta */
  onLogout() {
    this.authService.logout();
  }

}
