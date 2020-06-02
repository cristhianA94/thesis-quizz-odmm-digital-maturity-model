import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../../services/user/usuarios/usuario.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {


  userLoged: any;

  constructor(
    public usuarioService: UsuarioService,
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.authService.isAuth().subscribe((user) => {
      console.log(user);
      
      this.userLoged = user;
    });

  }

  reenviarEmail() {
    this.authService.emailVerification();
  }

}
