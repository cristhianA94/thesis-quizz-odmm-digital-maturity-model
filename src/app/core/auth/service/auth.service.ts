import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

/*  Firebase */
import { AlertsService } from '../../services/notificaciones/alerts.service';
// For social providers
import { auth } from 'firebase/app';
// Auth
import { AngularFireAuth } from '@angular/fire/auth';

import { UsuarioService } from 'app/core/services/user/usuarios/usuario.service';
import { EmpresaService } from '../../services/user/empresas/empresa.service';
import Swal from 'sweetalert2';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLogged: boolean = false;
  isAdmin: boolean = false;

  constructor(
    private router: Router,
    private afs: AngularFireAuth,
    private alertaService: AlertsService,
    private usuarioService: UsuarioService,
    private empresaService: EmpresaService,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
  }

  // Permite guardar en el storage el id y token del user
  guardarStorage(id: string) {
    localStorage.setItem('uidUser', id);
    this.getToken();
  }

  // Autentication Google
  async loginGoogleUser() {
    const credential = await this.afs.auth.signInWithPopup(new auth.GoogleAuthProvider());
    this.guardarStorage(credential.user.uid);
    // Comprueba si existe el usuario
    this.usuarioService.getUser(credential.user.uid);
    if (!this.usuarioService.usuario) {
      console.log("no existe usuario");
      // Si no existe se crea
      this.usuarioService.createUserSocial(credential.user);
    }
  }

  /*
  // Autentication Facebook
  loginFacebookUser() {
    return this.auth.auth.signInWithPopup(new auth.FacebookAuthProvider()
    ).then(credential => this.createUserSocial(credential.user))
  }
 */

  async loginCorreo(user: any) {
    await this.afs.auth.signInWithEmailAndPassword(user.correo, user.clave)
      .then((userAuth) => {

        //TODO Verifica si el usuario ya confirmo por email
        if (userAuth.user.emailVerified == false) {
          this.emailVerification();
          this.alertaService.mensajeError("Error", "Por favor, valide su dirección de correo electrónico. Por favor, compruebe su bandeja de entrada.");
          this.router.navigate(['/login']);
          return;
        } else {
          this.ngZone.run(() => {
            //this.isAuth();
          });
          this.guardarStorage(userAuth.user.uid);
          this.alertaService.mensajeExito('¡Éxito!', 'Acceso correcto al sistema.');
          this.router.navigate(['/home']);
        }
      })
      .catch((err) => {
        return this.alertaService.mensajeError(err, "Error");
      });
  }


  async registrarCuenta(formulario: any) {

    // Registra al usuario en Authentication
    await this.afs.auth.createUserWithEmailAndPassword(formulario.correo, formulario.clave)
      .then(userData => {
        // Registra al usuario en Firestore
        this.usuarioService.createUserDB(userData.user, formulario);
        // Crea la coleccion Empresa despues del registro de Usuario
        this.empresaService.createEmpresaDB(userData.user, formulario);

        // Notificacion
        let timerInterval
        Swal.fire({
          title: '¡Registro correcto!',
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
        // Envia correo de verificacion
        this.emailVerification();
        //this.router.navigate(['/home']);
        this.guardarStorage(userData.user.uid);
      })
      .catch(error => this.alertaService.mensajeError("Error", error));
  }

  // Comprueba si hay un usuario logueado
  isAuth() {
    return this.afs.authState;
  }


  // Actualizar contraseña usuario
  async updateSession(user: any) {
    try {
      await this.afs.auth.currentUser.reauthenticateWithCredential(user);
      return console.log("Password changed");
    }
    catch (error) {
      return console.log(error);
    }
  }

  // Metodo para resetear contraseña de usuario
  async resetPassword(passwordReset: string) {
    try {
      await this.afs.auth.sendPasswordResetEmail(passwordReset);
      this.alertaService.mensajeExito('¡Éxito!', 'Se ha enviado un email, su contraseña ha sido reseteada, revise su bandeja de entrada.');
    }
    catch (error) {
      this.alertaService.mensajeError('Error', error);
    }
  }

  // Metodo para mandar un email de verificacion al usuario
  async emailVerification() {
    /* let user: any = this.afs.auth.currentUser;
    user.sendEmailVerification(); */
    try {
      await this.afs.auth.currentUser.sendEmailVerification();
      this.alertaService.mensajeExito("Email enviado", "Revisa tu correo electrónico para verificar tu cuenta. Gracias");
      this.router.navigate(['/verify-email']);
    }
    catch (error) {
      return this.alertaService.mensajeError("Error", error);
    }
  }

  /* Metodo para salir de la cuenta */
  async logout() {
    await this.afs.auth.signOut().then(() => {
      // Elimina los datos del usuario en el local storage
      localStorage.removeItem("uidUser");
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      this.isLogged = false;
      this.isAdmin = false;
      this.alertaService.mensajeExito('Adiós', 'Hasta pronto.');
      this.router.navigate(['/login']);
    })

  }

  async getToken() {
    await this.afs.auth.currentUser.getIdToken(true).then((token) => {
      localStorage.setItem('token', token);
    }).catch(function (error) {
      console.log("User no authenticated: ", error);
    });;
  }

}
