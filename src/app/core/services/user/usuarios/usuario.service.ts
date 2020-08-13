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

@Injectable({
  providedIn: 'root'
})
export class UsuarioService implements Resolve<any> {


  public idUser: string;
  // Firestore
  usuarioCollection: AngularFirestoreCollection<Usuario>;
  usuarioDoc: AngularFirestoreDocument<Usuario>;
  usuario: Usuario;
  onUsuarioChanged: BehaviorSubject<any>;


  constructor(
    private authFire: AngularFireAuth,
    private dbFire: AngularFirestore,
    private alertaService: AlertsService,
    private router: Router,
  ) {
    this.idUser = localStorage.getItem("uidUser");
    this.onUsuarioChanged = new BehaviorSubject({});
  }


  resolve(): Observable<any> | Promise<any> | any {
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


  //Obtiene un usuario
  getUser(uid: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.usuarioDoc = this.dbFire.doc<Usuario>(`usuarios/${uid}`);
      this.usuarioDoc.snapshotChanges()
        .pipe(
          map(res => {
            const data = res.payload.data() as Usuario;
            const uid = res.payload.id;
            return { uid, ...data }
          })
        ).subscribe(response => {
          this.usuario = response;
          this.onUsuarioChanged.next(this.usuario);
          resolve(this.usuario);
        }, reject)
    })

  }


  // Registra al usuario con sus datos de red social y el mismo ID de AUTH y lo guarda en firestore/usuario
  createUserSocial(user: any) {
    this.usuarioDoc = this.dbFire.doc(`usuarios/${user.uid}`);
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
    this.usuarioDoc = this.dbFire.doc(`usuarios/${user.uid}`);
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
    }
    catch (error) {
      return this.alertaService.mensajeError("Error al cambiar email", error);
    }
  }

  // Actualizar contraseña usuario
  async updatePassword(pass: string) {
    try {
      await this.authFire.auth.currentUser.updatePassword(pass);
      this.alertaService.mensajeExito('¡Éxito!', 'Contraseña actualizado correctamente. Debe volver a loguearse');
    }
    catch (error) {
      return this.alertaService.mensajeError("Error al cambiar contraseña", error);
    }
  }

  // Actualiza usuario
  updateUsuario(user: Usuario) {
    this.updateEmail(user.correo);
    // Si modifica la clave se cambia y se desloguea
    if (user.clave) {
      this.updatePassword(user.clave);
      this.router.navigate(['/login']);
    }
    this.usuarioDoc = this.dbFire.doc(`usuarios/${user.uid}`);
    delete user.uid;
    delete user.clave;
    this.usuarioDoc.update(user);
    this.alertaService.mensajeExito('¡Éxito!', 'Datos actualizados correctamente');
  }


  // Borra usuario
  deleteUsuario(user: Usuario) {
    this.usuarioDoc = this.dbFire.doc(`usuarios/${user.uid}`);
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
