import { Injectable } from '@angular/core';

/* Firebase */
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import * as firebase from 'firebase';

//import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
// import { UserInterface, Rol } from '../../clases/usuario';
import { AlertsService } from './alerts.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private router: Router,
    public fAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private alerta: AlertsService,
  ) { }

  /* Metodo que comprueba si esta autenticado */
  isAuth() {
    return this.fAuth.authState.pipe(map(auth => auth));
  }

  /* Autentication Google */
  loginGoogleUser() {
    return this.fAuth.auth.signInWithPopup(new auth.GoogleAuthProvider()).then(credential => this.createUserBD(credential.user))
  }

  /* Autentication Google */
  loginFacebookUser() {
    return this.fAuth.auth.signInWithPopup(new auth.FacebookAuthProvider()).then(credential => this.createUserBD(credential.user))
  }

  loginCorreo(data) {
    return new Promise((resolve, reject) => {
      this.fAuth.auth.signInWithEmailAndPassword(data.correo, data.clave).
        then(userData => resolve(userData),
          err => reject(err));
    });
  }
  /* Metodo para salir de la cuenta */
  logout() {
    return this.fAuth.auth.signOut().then(() => {
      console.log('sign out')
      this.router.navigate(['/login']);
    });
  }

  /* Metodo para resetear contraseña de usuario */
  resetPassword(email: string) {
    var auth = firebase.auth();

    return auth.sendPasswordResetEmail(email)
      .then(() => console.log("email reset enviado"))
      .catch((error) => console.log(error))
  }


  registerUser(user) {
    // Asigna valor del formulario a variable
    const usuarioForm = user;

    return new Promise((resolve, reject) => {
      this.fAuth.auth.createUserWithEmailAndPassword(user.correo, user.clave).then(userData => { 
        resolve(userData),
        console.log('¡Usuario creado!');
        this.createUserBD(userData.user, usuarioForm);
        }).catch(err => {
          console.log(reject(err))
          this.alerta.mensajeError('Error', err);
        })
    });
  }

  // Metodo que crea usuario regisrado en firestore
  // usuarioForm? es una variable opcional que puede recibir
  private createUserBD(user, usuarioForm?) {
    // si se registra por el formulario de registro asign valor a la variable formulario,
    // si el login es por fb, google etc. solo se agregan valores como id, email y rol que esta quemado
    const formulario = (usuarioForm) ? usuarioForm : undefined;
    const userRef: AngularFirestoreDocument<any> = this.firestore.doc(`usuarios/${user.uid}`);
    const data = {
      id: user.uid,
      email: user.email,
      /* roles: {
        editor: false
      } */
    };
    if (formulario) {
      // Se elimina el correo del formulario para que no se duplique en firestore
      delete formulario.correo;
      // agregas valores del formulario de registro
      Object.assign(data, formulario);
      console.log('TCL: AuthService -> createUserBD -> formulario', data);
    }
    userRef.set(data, { merge: true }).then(() => {
      this.alerta.mensajeExito('Exito!', 'Usuario creado correctamente');
      this.router.navigate(['/home']);
    });
  }
}
