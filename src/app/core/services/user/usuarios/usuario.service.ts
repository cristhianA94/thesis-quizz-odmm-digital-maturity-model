import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Usuario } from 'app/shared/models/usuario';

/* Firestores */
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

/* Services */
import { AlertsService } from '../../notificaciones/alerts.service';
import Swal from 'sweetalert2';
import { EmpresaService } from '../empresas/empresa.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService implements Resolve<any> {


  public idUser: string;
  // Firestore
  usuarioCollection: AngularFirestoreCollection<Usuario>;
  usuarioDoc: AngularFirestoreDocument<Usuario>;
  public usuario: Usuario;
  onUsuarioChanged: BehaviorSubject<any>;


  constructor(
    private authFire: AngularFireAuth,
    private dbFire: AngularFirestore,
    private alertaService: AlertsService,
    private empresaService: EmpresaService,
  ) {
    this.idUser = localStorage.getItem("uidUser");
    this.onUsuarioChanged = new BehaviorSubject(Usuario);
  }


  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Usuario> | Promise<any> | any {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getUser(this.idUser)
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  /* // Resuelve los datos de la BD y los prepara para usarlo en un componente
  const doc = this.getUser(this.idUser).pipe(first()).toPromise();
  return doc.then(user => {
    // Guarda al usuario en el local storage
    localStorage.setItem("usuario", JSON.stringify(user));
    return user;
  }); */


  //Obtiene un usuario
  getUser(uid: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.usuarioDoc = this.dbFire.doc<Usuario>(`usuario/${uid}`)
      this.usuarioDoc.snapshotChanges().pipe(
        map(a => {
          const data = a.payload.data() as Usuario;
          const uid = a.payload.id;
          return { uid, ...data }
        })
      ).subscribe(response => {
        this.usuario = response;
        this.onUsuarioChanged.next(this.usuario);
        resolve(this.usuario);
      },
        reject)
    })

  }


  // Registra al usuario con sus datos de red social y el mismo ID de AUTH y lo guarda en firestore/usuario
  createUserSocial(user: any) {
    this.usuarioDoc = this.dbFire.doc(`usuario/${user.uid}`);
    const data: Usuario = {
      nombres: user.displayName,
      photoURL: user.photoURL,
      correo: user.email,
      telefono: user.phoneNumber,
      rol: 'USER_ROLE',
    }
    return this.usuarioDoc.set(data, { merge: true })
  }


  // Registra un usuario en firestore/usuario
  async createUserDB(user: any, formulario) {
    this.usuarioDoc = this.dbFire.doc(`usuario/${user.uid}`);
    const data: Usuario = {
      nombres: formulario.nombres,
      apellidos: formulario.apellidos,
      photoURL: "https://firebasestorage.googleapis.com/v0/b/fir-auth-web-75274.appspot.com/o/user-img-profile-default.jpg?alt=media&token=6c90096b-6275-4497-8630-8ce52b1fbe68",
      cedula: formulario.cedula,
      correo: user.email,
      telefono: formulario.telefono,
      sexo: formulario.sexo,
      cargo: formulario.cargo,
      rol: 'USER_ROLE'
    }
    this.usuario = data;

    try {
      await this.usuarioDoc.set(data, { merge: true });
      this.alertaService.mensajeExito('¡Éxito!', 'Usuario registrado correctamente');
    }
    catch (error) {
      return this.alertaService.mensajeError("Error", error);
    }
  }

  // Actualizar contraseña usuario
  async updateEmail(email: string) {
    try {
      await this.authFire.auth.currentUser.updateEmail(email);
      return console.log("Email changed");
    }
    catch (error) {
      return console.log(error);
    }
  }

  // Actualizar contraseña usuario
  async updatePassword(pass: string) {
    try {
      await this.authFire.auth.currentUser.updatePassword(pass);
      return this.alertaService.mensajeExito('¡Éxito!', 'Contraseña actualizado correctamente');
    }
    catch (error) {
      return console.log(error);
    }
  }

  // Actualiza usuario
  updateUsuario(user: Usuario) {
    this.usuarioDoc = this.dbFire.doc(`usuario/${user.uid}`);
    this.usuarioDoc.update(user);
    this.alertaService.mensajeExito('¡Éxito!', 'Datos actualizados correctamente');
    //this.router.navigate(['/dashboard']);
  }


  // Borra usuario
  deleteUsuario(user: Usuario) {
    this.usuarioDoc = this.dbFire.doc(`usuario/${user.uid}`);
    this.usuarioDoc.delete();
    /* admin.auth().deleteUser(uid)
      .then(function () {
        console.log('Successfully deleted user');
      })
      .catch(function (error) {
        console.log('Error deleting user:', error);
      }); */
  }
}