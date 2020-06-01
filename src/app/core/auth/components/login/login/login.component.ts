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
    'username': [
      { type: 'required', message: 'Username is required' },
      { type: 'minlength', message: 'Username must be at least 5 characters long' },
      { type: 'maxlength', message: 'Username cannot be more than 25 characters long' },
      { type: 'pattern', message: 'Your username must contain only numbers and letters' },
      { type: 'validUsername', message: 'Your username has already been taken' }
    ],
    'correo': [
      { type: 'required', message: 'El email es requerido' },
      { type: 'pattern', message: 'Ingrese un email válido' }
    ],
    'confirm_password': [
      { type: 'required', message: 'Confirm password is required' },
      { type: 'areEqual', message: 'Password mismatch' }
    ],
    'clave': [
      { type: 'required', message: 'La contraseña es requerida' },
      { type: 'minlength', message: 'Password must be at least 5 characters long' },
      { type: 'pattern', message: 'Your password must contain at least one uppercase, one lowercase, and one number' }
    ],
    'terms': [
      { type: 'pattern', message: 'You must accept terms and conditions' }
    ]
  }


  constructor(
    private router: Router,
    private _authService: AuthService,
    private formbuild: FormBuilder,
    //Alertas tras login
    private alerta: AlertsService,
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
    this._authService.loginGoogleUser().then((res) => {
      this.alerta.mensajeExito('¡Éxito!', 'Acceso al sistema.');
      this.onLoginRedirect();
    }).catch(err => {
      this.alerta.mensajeError('Error', err.message);
      console.log('Algo salio mal :/ :', err.message);
    });
  }


  /* Login Facebook */
  /* onLoginFacebook(): void {
    this._authService.loginFacebookUser().then((res) => {
      console.log('resUser', res);
      this.alerta.mensajeExito('¡Éxito!', 'Acceso al sistema.');
      this.onLoginRedirect();
    }).catch(err => {
      this.alerta.mensajeError('¡Error!', err.message);
      console.log('Algo salio mal :/ :', err.message);
    });
  } */

  /* Login Correo electronico */
  login() {
    this._authService.loginCorreo(this.loginForm.value).then((res) => {
      this.alerta.mensajeExito('¡Éxito!', 'Acceso al sistema.');
      this.onLoginRedirect();
    }).catch(err => {
      this.alerta.mensajeError('¡Error!', '¡Los campos ingresados son incorrectos o no existe una cuenta registrada!');
    });
  }

  /* Metodo para redirigir ruta tras logeo */
  onLoginRedirect(): void {
    this.router.navigate(['home']);
    // TODO Cambiar hasta encontrar solucion
    setInterval(() => {
      window.location.reload();
    }, 1000)
  }


  /* Metodo para resetear contraseña usuario */
  resetPassword(emailReset: string) {
    this._authService.resetPassword(emailReset)
      .then(() => this.passReset = true)
  }

}
