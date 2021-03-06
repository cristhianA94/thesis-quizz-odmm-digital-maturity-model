import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// For social providers
import { auth } from 'firebase/app';
// Auth
import { AngularFireAuth } from '@angular/fire/auth';

import { EmpresaService } from 'app/core/services/user/empresas/empresa.service';
import { UsuarioService } from 'app/core/services/user/usuarios/usuario.service';
import { AlertsService } from 'app/core/services/notificaciones/alerts.service';
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
    if (this.usuarioService.usuario == null) {
      //console.log("No existe usuario");
      // Si no existe se crea en Firestore
      this.usuarioService.createUserSocial(credential.user);
    } else {
      this.usuarioService.validateRolUser();
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
        // Verifica si el usuario ya confirmo su email
        if (userAuth.user.emailVerified == false) {
          this.emailVerification();
          this.alertaService.mensajeError("Error", "Por favor, valide su dirección de correo electrónico. Por favor, compruebe su bandeja de entrada.");
        } else {
          this.guardarStorage(userAuth.user.uid);
          this.alertaService.mensajeExito('¡Éxito!', 'Acceso correcto al sistema.');
          this.router.navigate(['/home']);
          this.usuarioService.validateRolUser();
        }
      })
      .catch((err) => {
        return this.alertaService.mensajeError(err, "¡Error con su correo electrónico y/o contraseña!");
      });
  }


  // Registra al usuario en Authentication
  registrarCuenta(formulario: any) {
    this.afs.auth.createUserWithEmailAndPassword(formulario.correo, formulario.clave)
      .then(userData => {
        // Registra al usuario en Firestore
        this.usuarioService.createUserDB(userData.user, formulario);
        // Registra la Empresa en Firestore
        this.empresaService.createEmpresaDB(userData.user.uid, formulario);

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
        this.guardarStorage(userData.user.uid);
      })
      .catch(error => this.alertaService.mensajeError("Error", error));
  }

  // Comprueba si hay un usuario logueado
  isAuth() {
    return this.afs.authState;
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
  emailVerification() {
    try {
      this.afs.auth.currentUser.sendEmailVerification();
      this.alertaService.mensajeExito("Email enviado", "Revisa tu correo electrónico para verificar tu cuenta. Gracias");
      this.router.navigate(['/verify-email']);
    }
    catch (error) {
      return this.alertaService.mensajeError("Error", error);
    }
  }

  // Actualizar email usuario
  async updateEmail(email: string) {
    try {
      await this.afs.auth.currentUser.updateEmail(email);
    }
    catch (error) {
      return this.alertaService.mensajeError("Error al cambiar email", error);
    }
  }

  // Actualizar contraseña usuario
  updatePassword(pass: string) {
    this.afs.auth.currentUser.updatePassword(pass).then(function () {
      // Update successful.
      this.alertaService.mensajeExito('¡Éxito!', 'Contraseña actualizado correctamente. Debe volver a loguearse');
    }).catch(function (error) {
      return this.alertaService.mensajeError("Error al cambiar contraseña", error);
    });
  }

  // Reautentica cuando email o contraseña se cambian
  async updateSession(user: any) {
    try {
      await this.afs.auth.currentUser.reauthenticateWithCredential(user);
      //this.router.navigate(['/login']);
      return console.log("Password changed");
    }
    catch (error) {
      return this.alertaService.mensajeError('Error', error);
    }
  }


  /* Metodo para salir de la cuenta */
  async logout() {
    await this.afs.auth.signOut().then(() => {
      // Elimina los datos del usuario en el local storage
      localStorage.removeItem("uidUser");
      localStorage.removeItem("token");
      localStorage.removeItem("fechaIngreso");
      this.alertaService.mensajeExito('Adiós', '¡Hasta pronto!');
      this.router.navigate(['/login']);
    })

  }

  async getToken() {
    await this.afs.auth.currentUser.getIdToken(true).then((token) => {
      localStorage.setItem('token', token);
    }).catch(function (error) {
      //console.log("User no authenticated: ", error);
    });
  }

}
