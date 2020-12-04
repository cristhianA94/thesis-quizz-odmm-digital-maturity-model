import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from 'app/core/auth/service/auth.service';
import { AlertsService } from 'app/core/services/notificaciones/alerts.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: []
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
  loginGoogle(): void {
    this.authService.loginGoogleUser().then(() => {
      // Guarda solo fecha de ingreso
      let fecha = new Date(Date.now()).toLocaleString().split(' ')[0];
      localStorage.setItem('fechaIngreso', fecha);
      
      let timerInterval
      Swal.fire({
        title: '¡Acceso correcto!',
        text: 'Bienvenido',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        onBeforeOpen: () => {
          Swal.showLoading()
          timerInterval = setInterval(() => {
            Swal.getContent()
          }, 1000)
        },
        onClose: () => {
          clearInterval(timerInterval)
        }
      }).then((result) => {
        //Read more about handling dismissals below
        if (result.dismiss === Swal.DismissReason.timer) {
        }
      });
      //this.alertaService.mensajeExito('¡Éxito!', 'Acceso correcto al sistema.');
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
    this.authService.loginCorreo(this.loginForm.value);
    // Guarda la fecha de ingreso
    let fecha = new Date().toLocaleString();
    localStorage.setItem('fechaIngreso', fecha);
  }



  /* Metodo para resetear contraseña usuario */
  resetPassword(emailReset: string) {
    this.authService.resetPassword(emailReset)
      .then(() => this.passReset = true)
  }

}
