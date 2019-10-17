import { Component, OnInit} from '@angular/core';
/* Firebase */
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from '../../../services/auth.service';



@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {

  isCollapsed = true;
  public isLogged: boolean = false;

  constructor(
    /* Inicializa objeto Firebase */
    private authService: AuthService,
    private afsAuth: AngularFireAuth,
  ) { }

  ngOnInit() {
    this.getCurrentUser();

  }

  /* Metodo que comprueba si el usuario esta logeado */
  getCurrentUser() {
    this.authService.isAuth().subscribe(auth => {
      if (auth) {
        console.log('user logged');
        this.isLogged = true;
      } else {
        console.log('NOT user logged');
        this.isLogged = false;
      }
    });
  }

  /* Metodo para salir de la cuenta */
  onLogout() {
    this.afsAuth.auth.signOut();
  }

}
