import { FormBuilder, FormGroup } from '@angular/forms';
import { Injectable, DoBootstrap } from '@angular/core';
import { Router } from '@angular/router';

// Firebase
import { AlertsService } from './alerts.service';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

//Model
import { Usuario } from './../models/usuario';
import { Empresa } from '../models/empresa';
import { Sector_Industrial } from '../models/sector_industrial';
import { Pais, Provincia, Canton } from './../models/lugar';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  // Firestore
  usuarioCollection: AngularFirestoreCollection<Usuario>;
  usuarioDoc: AngularFirestoreDocument<Usuario>;
  usuarios: Observable<Usuario[]>;
  public usuario: Observable<Usuario>;

  empresaCollection: AngularFirestoreCollection<Empresa>;
  empresaDoc: AngularFirestoreDocument<Empresa>
  empresas: Observable<Empresa[]>;
  public empresa: Observable<Empresa>

  sectorICollection: AngularFirestoreCollection<Sector_Industrial>;
  sectorIDoc: AngularFirestoreDocument<Sector_Industrial>
  sectoresI: Observable<Sector_Industrial[]>;
  public sector_industrial: Observable<Sector_Industrial>

  paisCollection: AngularFirestoreCollection<Pais>;
  paisDoc: AngularFirestoreDocument<Pais>
  paises: Observable<Pais[]>;
  public pais: Observable<Pais>

  provinciaCollection: AngularFirestoreCollection<Provincia>;
  provinciaDoc: AngularFirestoreDocument<Provincia>
  provincias: Observable<Provincia[]>;
  public provincia: Observable<Provincia>

  cantonCollection: AngularFirestoreCollection<Canton>;
  cantonDoc: AngularFirestoreDocument<Canton>
  cantones: Observable<Canton[]>;
  public canton: Observable<Canton>


  public isLogged: any = false;

  constructor(
    private router: Router,
    private auth: AngularFireAuth,
    private dbFire: AngularFirestore,
    private alerta: AlertsService,
  ) {
    this.usuarioCollection = this.dbFire.collection('usuario');
    this.usuarios = this.usuarioCollection.snapshotChanges().pipe(map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as Usuario;
        data.uid = a.payload.doc.id;
        return data;
      })
    }));

    this.empresaCollection = this.dbFire.collection('empresa');
    this.empresas = this.empresaCollection.snapshotChanges().pipe(map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as Empresa;
        data._id = a.payload.doc.id;
        return data;
      })
    }))

    /* //Comprueba si el usuario existe en Firestore
    this.usuario = this.auth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.dbFire.doc<Usuario>(`usuario/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    ) */
  }

  /* Metodo que comprueba si esta autenticado */
  isAuth() {
    return this.auth.authState.pipe(map(auth => auth));
  }

  getAuth() {
    return this.auth.authState;
  }

  /* Autentication Google */
  loginGoogleUser() {
    return this.auth.auth.signInWithPopup(new auth.GoogleAuthProvider())
      .then((credential) => this.createUserSocial(credential.user))
  }

  /*
  // Autentication Facebook
  loginFacebookUser() {
    return this.auth.auth.signInWithPopup(new auth.FacebookAuthProvider()
    ).then(credential => this.createUserSocial(credential.user))
  }
 */

  loginCorreo(data) {
    return new Promise((resolve, reject) => {
      this.auth.auth.signInWithEmailAndPassword(data.correo, data.clave).
        then(userData => resolve(userData),
          err => reject(err));
    });
  }


  // Registra al usuario con sus datos de red social y el mismo ID de AUTH y lo guarda en firestore/usuario
  private createUserSocial(user) {
    this.usuarioDoc = this.dbFire.doc(`usuario/${user.uid}`);
    const data: Usuario = {
      uid: user.uid,
      nombres: user.displayName,
      photoURL: user.photoURL,
      correo: user.email,
      telefono: user.phoneNumber,
      rol: {
        //Cambiar para hacer admin a alguien especial
        subscriptor: true
      }
    }
    return this.usuarioDoc.set(data, { merge: true })
  }

  /* Metodo para salir de la cuenta */
  logout() {
    return this.auth.auth.signOut().then(() => {
      console.log('sign out')
      this.router.navigate(['/register']);
    });
  }

  /* Metodo para resetear contraseña de usuario */
  resetPassword(email: string) {
    return this.auth.auth.sendPasswordResetEmail(email)
      .then(() => console.log("email reset enviado"))
      .catch((error) => console.log(error))
  }
  /* -----------------------CRUDS----------------------- */

  /* Usuario */
  getUsuarios() {
    return this.usuarios;
  }

  //Obtiene un usuario
  getUser(uid) {
    this.usuarioDoc = this.dbFire.doc<Usuario>(`usuario/${uid}`);
    return this.usuario = this.usuarioDoc.snapshotChanges().pipe(map(action => {
      if (action.payload.exists === false) {
        return null;
      } else {
        const data = action.payload.data() as Usuario;
        data.uid = action.payload.id;
        return data;
      }
    }));
  }

  updateUsuario(user: Usuario) {
    console.log("user: ", user);
    
    this.usuarioDoc = this.dbFire.doc(`usuario/${user.uid}`);
    this.usuarioDoc.update(user);
    console.log('Actualizado')
  }

  deleteUsuario(user: Usuario) {
    this.usuarioDoc = this.dbFire.doc(`usuario/${user.uid}`);
    this.usuarioDoc.delete();
  }

  registerUser(userForm) {
    // Asigna valor del formulario a variable
    const usuarioForm = userForm;

    return new Promise((resolve, reject) => {
      // Registra al usuario en Authentication
      this.auth.auth.createUserWithEmailAndPassword(usuarioForm.correo, usuarioForm.clave)
        .then(userData => {
          resolve(userData),
            // Registra al usuario en Firestore
            this.createUserDB(userData.user, usuarioForm);
        })
        .catch(err => {
          console.log(reject(err))
          this.alerta.mensajeError('Error', err);
        })
    });
  }


  // Registra un usuario en firestore/usuario
  private createUserDB(user, userForm) {
    const usuarioForm = userForm;
    //const formulario = (usuarioForm) ? usuarioForm : undefined;
    this.usuarioDoc = this.dbFire.doc(`usuario/${user.uid}`);
    const data: Usuario = {
      uid: user.uid,
      nombres: usuarioForm.nombres,
      apellidos: usuarioForm.apellidos,
      cedula: usuarioForm.cedula,
      correo: user.email,
      telefono: usuarioForm.telefono,
      sexo: usuarioForm.sexo,
      cargo: usuarioForm.cargo,
      rol: {
        subscriptor: true
      }
    }
    this.usuarioDoc.set(data, { merge: true }).then(() => {
      this.alerta.mensajeExito('Exito!', 'Usuario registrado correctamente');
      // Crea la coleccion Empresa despues del registro de Usuario
      this.createEmpresaDB(user, usuarioForm)
    });
  }


  /* ----------------------Empresa CRUD----------------------- */
  // Obtiene las empresas
  getEmpresas() {
    return this.empresas;
    //return this.dbFire.collection('/usuario').snapshotChanges();
  }

  //Obtiene una empresa
  getEmpresa(uid) {
    this.empresaDoc = this.dbFire.doc<Empresa>(`empresa/${uid}`);
    return this.empresa = this.empresaDoc.snapshotChanges().pipe(map(action => {
      if (action.payload.exists === false) {
        return null;
      } else {
        const data = action.payload.data() as Empresa;
        data._id = action.payload.id;
        return data;
      }
    }));
  }

  updateEmpresa(business: Empresa) {
    console.log("user: ", business);
    this.empresaDoc = this.dbFire.doc(`empresa/${business._id}`);
    this.empresaDoc.update(business);
    console.log('Empresa actualizada')
  }

  deleteEmpresa(business: Empresa) {
    this.empresaDoc = this.dbFire.doc(`empresa/${business._id}`);
    this.empresaDoc.delete();
    console.log("Empresa borrada");
  }

  private createEmpresaDB(user, formulario) {
    const empresaForm = formulario;
    const data: Empresa = {
      razon_social: empresaForm.razon_social,
      sector_industrial: empresaForm.sector_industrial,
      anio_creacion: empresaForm.anio_creacion,
      area_alcance: empresaForm.area_alcance,
      franquicias: empresaForm.franquicias,
      direccion: empresaForm.direccion,
      tamanio_empresa: empresaForm.tamanio_empresa,
      idUser: user.uid
    }
    this.empresaDoc = this.dbFire.doc(`empresa/${data.razon_social}`);
    return this.empresaDoc.set(data, { merge: true }).then(() => {
      this.alerta.mensajeExito('Exito!', 'Empresa registrada correctamente');
      // Crea la coleccion Pais/Provincia/Canton despues del registro de Empresa
      this.createSectorIndustrialDB(empresaForm)
      this.createPaisDB(empresaForm)
    });
  }

  /* --------------------Sector Industrial CRUD------------------------ */
  //Obtiene los Sectores_industriales
  getSectorIndustrial() {
    return this.sectoresI;
  }

  getSectorInd(uid) {
    this.sectorIDoc = this.dbFire.doc<Sector_Industrial>(`sector_industrial/${uid}`);
    return this.sector_industrial = this.sectorIDoc.snapshotChanges().pipe(map(action => {
      if (action.payload.exists === false) {
        return null;
      } else {
        const data = action.payload.data() as Sector_Industrial;
        data._id = action.payload.id;
        return data;
      }
    }));
  }

  updateSectorIndustrial(sector: Sector_Industrial) {
    return this.sectorICollection.doc(`sector_industrial/${sector._id}`).update(sector);
  }

  deleteSectorIndustrial(sector: Sector_Industrial) {
    return this.sectorICollection.doc(`sector_industrial/${sector._id}`).delete;
  }

  private createSectorIndustrialDB(formulario) {
    const sectorForm = formulario;
    const data: Sector_Industrial = {
      _id: sectorForm.sector_industrial,
      nombre: sectorForm.sector_industrial,
      idEmpresa: sectorForm.razon_social
    }
    this.sectorIDoc = this.dbFire.doc(`sector_industrial`);
    return this.sectorIDoc.set(data, { merge: true }).then(() => {

    });
  }

  private createPaisDB(formulario) {
    const paisForm = formulario;
    const data: Pais = {
      idPais: paisForm.pais,
      nombre: paisForm.pais,
      idEmpresa: paisForm.razon_social
    }
    this.paisDoc = this.dbFire.doc(`pais/${data.nombre}`);

    return this.paisDoc.set(data, { merge: true }).then(() => {
      this.alerta.mensajeExito('Exito!', 'Pais registrada correctamente');
      // Crea la coleccion Pais/Provincia/Canton despues del registro de Empresa
      this.createProvinciaDB(paisForm)
    });
  }

  private createProvinciaDB(formulario) {
    const provinciaForm = formulario;
    const data: Provincia = {
      _id: provinciaForm.provincia,
      nombre: provinciaForm.provincia,
      idPais: provinciaForm.pais
    }
    this.provinciaDoc = this.dbFire.doc(`provincia/${data.nombre}`);
    return this.provinciaDoc.set(data, { merge: true }).then(() => {
      this.alerta.mensajeExito('Exito!', 'Provincia registrada correctamente');
      // Crea la coleccion Pais/Provincia/Canton despues del registro de Empresa
      this.createCantonDB(provinciaForm)
    });
  }
  private createCantonDB(formulario) {
    const cantonForm = formulario;
    const data: Canton = {
      _id: cantonForm.canton,
      nombre: cantonForm.canton,
      idProvincia: cantonForm.provincia
    }
    this.cantonDoc = this.dbFire.doc(`canton/${data.nombre}`);
    return this.cantonDoc.set(data, { merge: true }).then(() => {
      this.alerta.mensajeExito('Exito!', 'Canton registrada correctamente');
      // Crea la coleccion Pais/Provincia/Canton despues del registro de Empresa
      this.router.navigate(['/home']);
    });
  }

}
