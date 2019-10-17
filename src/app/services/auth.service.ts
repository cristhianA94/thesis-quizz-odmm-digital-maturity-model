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
    public afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private alerta: AlertsService,
  ) { }

  /* Metodo que comprueba si esta autenticado */
  isAuth() {
    return this.afAuth.authState.pipe(map(auth => auth));
  }

  /* Autentication Google */
  loginGoogleUser() {
    return this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider()).then(credential => this.createUserBD(credential.user))
  }

  /* Autentication Google */
  loginFacebookUser() {
    return this.afAuth.auth.signInWithPopup(new auth.FacebookAuthProvider()).then(credential => this.createUserBD(credential.user))
  }

  loginCorreo(data) {
    return new Promise((resolve, reject) => {
      this.afAuth.auth.signInWithEmailAndPassword(data.correo, data.clave).
        then(userData => resolve(userData),
          err => reject(err));
    });
  }
  /* Metodo para salir de la cuenta */
  logout() {
    return this.afAuth.auth.signOut().then(() => {
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
      this.afAuth.auth.createUserWithEmailAndPassword(user.correo, user.clave)
        .then(userData => { // una vez que guarda los datos, retrna info desde la bd y eso se envia al metodo
          resolve(userData),
            console.log('usuario creado!');
          this.createUserBD(userData.user, usuarioForm);
        }).catch(err => {
          console.log(reject(err))
          this.alerta.mensajeExito('Error', err);

        })
    });
  }

  // Metodo que crea usuario regisrado en firestore
  // El ? al final del valor (usuarioForm?) quiere decir que es una variable opcional que puede recibir la funcion
  private createUserBD(user, usuarioForm?) {
    // si se registra por el formulario de registro asign valor a la variable formulario,
    // si el login es por fb, google etc. solo se agregan valores como id, email y rol que esta quemado
    const formulario = (usuarioForm) ? usuarioForm : undefined;
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`usuarios/${user.uid}`);
    const data = {
      id: user.uid,
      email: user.email,
      /* roles: {
        editor: false
      } */
    };
    if (formulario) {
      // eliminas correo del obeto para que no se duplique
      delete formulario.correo;
      // agregas valores del formulario de resgistro
      Object.assign(data, formulario);
      console.log('TCL: AuthService -> createUserBD -> formulario', data);
    }
    userRef.set(data, { merge: true }).then(() => {
      this.alerta.mensajeExito('Exito!', 'Usuario creado correctamente');
      this.router.navigate(['/home']);
    });
  }
}
