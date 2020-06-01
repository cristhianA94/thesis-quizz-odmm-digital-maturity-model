import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

/*  Firebase */
import { AlertsService } from '../../services/notificaciones/alerts.service';
// For social providers
import { auth } from 'firebase/app';
// Auth
import { AngularFireAuth } from '@angular/fire/auth';
import { UsuarioService } from 'app/core/services/user/usuarios/usuario.service';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userData: any; // Save logged in user data
  isLogged: any = false;

  constructor(
    private router: Router,
    private authFire: AngularFireAuth,
    private alertaService: AlertsService,
    private usuarioService: UsuarioService,
  ) { }

  // Permite guardar en el storage los datos del user
  guardarStorage(id: string) {
    localStorage.setItem('uidUser', id);
  }

  // Autentication Google
  async loginGoogleUser() {
    const credential = await this.authFire.auth.signInWithPopup(new auth.GoogleAuthProvider());
    this.guardarStorage(credential.user.uid)
    this.usuarioService.createUserSocial(credential.user);
  }

  /*
  // Autentication Facebook
  loginFacebookUser() {
    return this.auth.auth.signInWithPopup(new auth.FacebookAuthProvider()
    ).then(credential => this.createUserSocial(credential.user))
  }
 */

  async loginCorreo(user) {
    await this.authFire.auth
      .signInWithEmailAndPassword(user.correo, user.clave)
      .then((data) => {
        this.guardarStorage(data.user.uid);
      })
      .catch((err) => {
        this.alertaService.mensajeError(err, "Error");
        console.log("TCL: UsuarioService -> login -> err", err);
      });
  }

  registerUser(formulario: any) {
    // Asigna valor del formulario a variable
    return new Promise((_resolve, reject) => {
      // Registra al usuario en Authentication
      this.authFire.auth.createUserWithEmailAndPassword(formulario.correo, formulario.clave)
        .then(userData => {
          // Envia correo de verificacion
          this.emailVerification();
          // Registra al usuario en Firestore
          this.usuarioService.createUserDB(userData.user, formulario);
        })
        .catch(err => {
          console.log(reject(err))
        })
    });
  }

  // Comprueba si hay un usuario logueado
  isAuth() {
    return this.authFire.authState;
  }


  // Actualizar contraseña usuario
  async updateSession(user: any) {
    try {
      await this.authFire.auth.currentUser.reauthenticateWithCredential(user);
      return console.log("Password changed");
    }
    catch (error) {
      return console.log(error);
    }
  }

  // Metodo para resetear contraseña de usuario
  async resetPassword(passwordReset: string) {
    try {
      await this.authFire.auth.sendPasswordResetEmail(passwordReset);
      this.alertaService.mensajeExito('¡Éxito!', 'Se ha enviado un email, su contraseña ha sido reseteada, revise su bandeja de entrada.');
    }
    catch (error) {
      this.alertaService.mensajeError('Error', error);
    }
  }

  // Metodo para mandar un email de verificacion al usuario
  async emailVerification() {
    await this.authFire.auth.currentUser.sendEmailVerification();
    this.router.navigate(['verify-email']);
  }

  /* Metodo para salir de la cuenta */
  async logout() {
    await this.authFire.auth.signOut().then(() => {
      // Elimina los datos del usuario en el local storage
      localStorage.removeItem("uidUser");
      localStorage.removeItem("usuario");
      this.alertaService.mensajeExito('Adiós', 'Hasta pronto.');
      this.router.navigate(['/login']);
    })

  }

}
