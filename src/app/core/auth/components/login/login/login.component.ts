import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from 'app/core/auth/service/auth.service';
import { AlertsService } from 'app/core/services/notificaciones/alerts.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  hide = true;
  passReset: boolean = false;
  correoReset: string;

  /* Forms */
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  loginForm: FormGroup;

  // Mensajes de validacion de inputs en tiempo real.
  account_validation_messages = {
    'correo': [
      { type: 'required', message: 'El email es requerido' },
      { type: 'email', message: 'Ingrese un email válido' }
    ],
    'confirm_password': [
      { type: 'required', message: 'Confirm password is required' },
      { type: 'areEqual', message: 'Password mismatch' }
    ],
    'clave': [
      { type: 'required', message: 'La contraseña es requerida' },
    ]
  }


  constructor(
    private router: Router,
    private authService: AuthService,
    private formbuild: FormBuilder,
    //Alertas tras login
    private alertaService: AlertsService,
  ) { }

  ngOnInit(): void {
    this.loginForm = this.loginBuildForm();
  }

  /* Validador de formulario */
  loginBuildForm(): FormGroup {
    return this.formbuild.group({
      correo: ['', [Validators.required, Validators.email]],
      clave: ['', Validators.required],
    });
  }

  /* Login Google */
  onLoginGoogle(): void {
    this.authService.loginGoogleUser().then(() => {
      this.alertaService.mensajeExito('¡Éxito!', 'Acceso correcto al sistema.');
      this.router.navigate(['/home']);
    }).catch(err => this.alertaService.mensajeError('Error', err.message));
  }


  /* Login Facebook */
  /* onLoginFacebook(): void {
    this.authService.loginFacebookUser().then((res) => {
      console.log('resUser', res);
      this.alertaService.mensajeExito('¡Éxito!', 'Acceso al sistema.');
      this.onLoginRedirect();
    }).catch(err => {
      this.alertaService.mensajeError('¡Error!', err.message);
      console.log('Algo salio mal :/ :', err.message);
    });
  } */

  /* Login Correo electronico */
  login() {
    this.authService.loginCorreo(this.loginForm.value)
      .then(() => {
        console.log("Loged");
        //this.router.navigate(['/home']);
        // TODO Cambiar hasta encontrar solucion
        /* setInterval(() => {
          window.location.reload();
        }, 1000) */
      }).catch(err => this.alertaService.mensajeError('Error', err.message));
  }



  /* Metodo para resetear contraseña usuario */
  resetPassword(emailReset: string) {
    this.authService.resetPassword(emailReset)
      .then(() => this.passReset = true)
  }

}
