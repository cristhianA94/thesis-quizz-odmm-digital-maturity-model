import { Injectable } from '@angular/core';
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

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  usuario: Observable<Usuario>;

  empresaCollection: AngularFirestoreCollection<Empresa>;
  empresaDoc: AngularFirestoreDocument<Empresa>
  empresas: Observable<Empresa[]>;
  empresa: Observable<Empresa>

  sectorICollection: AngularFirestoreCollection<Sector_Industrial>;
  sectorIDoc: AngularFirestoreDocument<Sector_Industrial>
  sectoresI: Observable<Sector_Industrial[]>;
  sector_industrial: Observable<Sector_Industrial>

  paisCollection: AngularFirestoreCollection<Pais>;
  paisDoc: AngularFirestoreDocument<Pais>
  paises: Observable<Pais[]>;
  pais: Observable<Pais>

  provinciaCollection: AngularFirestoreCollection<Provincia>;
  provinciaDoc: AngularFirestoreDocument<Provincia>
  provincias: Observable<Provincia[]>;
  provincia: Observable<Provincia>

  cantonCollection: AngularFirestoreCollection<Canton>;
  cantonDoc: AngularFirestoreDocument<Canton>
  cantones: Observable<Canton[]>;
  canton: Observable<Canton>


  public isLogged: any = false;

  constructor(
    private router: Router,
    private auth: AngularFireAuth,
    private dbFire: AngularFirestore,
    private alerta: AlertsService,
  ) {
    // Obtiene las empresas
    this.empresaCollection = this.dbFire.collection('empresa');
    this.empresas = this.empresaCollection.snapshotChanges().pipe(map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as Empresa;
        data._id = a.payload.doc.id;
        return data;
      })
    }));


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
    return this.usuario = this.usuarioDoc.snapshotChanges().pipe(
      map(action => {
        if (action.payload.exists === false) {
          return null;
        } else {
          const data = action.payload.data() as Usuario;
          data.uid = action.payload.id;
          return data;
        }
      }));
  }

  registerUser(formulario) {
    // Asigna valor del formulario a variable

    return new Promise((resolve, reject) => {
      // Registra al usuario en Authentication
      this.auth.auth.createUserWithEmailAndPassword(formulario.correo, formulario.clave)
        .then(userData => {
          resolve(userData);
          // Registra al usuario en Firestore
          this.createUserDB(userData.user, formulario);
        })
        .catch(err => {
          console.log(reject(err))
          this.alerta.mensajeError('Error', err);
        })
    });
  }


  // Registra un usuario en firestore/usuario
  createUserDB(user, formulario) {
    this.usuarioDoc = this.dbFire.doc(`usuario/${user.uid}`);
    const data: Usuario = {
      uid: user.uid,
      nombres: formulario.nombres,
      apellidos: formulario.apellidos,
      cedula: formulario.cedula,
      correo: user.email,
      telefono: formulario.telefono,
      sexo: formulario.sexo,
      cargo: formulario.cargo,
      rol: {
        subscriptor: true
      }
    }
    this.usuarioDoc.set(data, { merge: true }).then(() => {
      this.alerta.mensajeExito('Exito!', 'Usuario registrado correctamente');
      // Crea la coleccion Empresa despues del registro de Usuario
      this.createEmpresaDB(user, formulario);
    });
  }

  // Actualiza usuario
  updateUsuario(user: Usuario) {
    this.usuarioDoc = this.dbFire.doc(`usuario/${user.uid}`);
    this.usuarioDoc.update(user);
    this.alerta.mensajeExito('Exito!', 'Datos actualizados correctamente');
    this.router.navigate(['/home']);
  }

  /*
  // Borra usuario
    deleteUsuario(user: Usuario) {
    this.usuarioDoc = this.dbFire.doc(`usuario/${user.uid}`);
    this.usuarioDoc.delete();
  } */

  /* ----------------------Empresa CRUD----------------------- */

  // Obtiene las empresas
  getEmpresas() {
    return this.empresas;
  }

  //Obtiene una empresa
  getEmpresa() {
    /* this.empresaCollection = this.dbFire.collection('empresa', ref => ref
    .where('idUser', '==', idUser));
    this.empresas = this.empresaCollection.snapshotChanges().pipe(map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as Empresa;
        data._id = a.payload.doc.id;
        return data;
      })
    })); */

    this.usuarioDoc = this.dbFire.doc<Usuario>('usuario');
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

  createEmpresaDB(user: any, formulario) {
    const data: Empresa = {
      razon_social: formulario.razon_social,
      anio_creacion: formulario.anio_creacion,
      area_alcance: formulario.area_alcance,
      franquicias: formulario.franquicias,
      direccion: formulario.direccion,
      tamanio_empresa: formulario.tamanio_empresa,
      idUser: user.uid,
      idCanton: formulario.canton,
      idSectorInd: formulario.sector_industrial
    }
    this.empresaCollection = this.dbFire.collection('empresa');
    this.empresaCollection.add(data).then(() => {
      this.alerta.mensajeExito('Exito!', 'Empresa registrada correctamente');
      // Crea la coleccion Pais/Provincia/Canton despues del registro de Empresa
      this.createPaisDB(formulario)
      this.createSectorIndustrialDB(formulario)
    }).catch(err => {
      this.alerta.mensajeError('Error', err);
    });
  }

  updateEmpresa(business: Empresa) {
    this.empresaDoc = this.dbFire.doc(`empresa/${business._id}`);
    this.empresaDoc.update(business);
    this.alerta.mensajeExito('Exito!', 'Datos actualizados correctamente');
    this.router.navigate(['/home']);
  }

  deleteEmpresa(business: Empresa) {
    this.empresaDoc = this.dbFire.doc(`empresa/${business._id}`);
    this.empresaDoc.delete();
    console.log("Empresa borrada");
  }


  /* --------------------Sector Industrial CRUD------------------------ */
  //Obtiene los Sectores_industriales
  getSectorIndustrial() {
    return this.sectoresI;
  }

  getSectorInd(nombre) {
    this.sectorIDoc = this.dbFire.doc<Sector_Industrial>(`sector_industrial/${nombre}`);
    return this.sector_industrial = this.sectorIDoc.snapshotChanges().pipe(map(action => {
      if (action.payload.exists === false) {
        return null;
      } else {
        const data = action.payload.data() as Sector_Industrial;
        data.nombre = action.payload.id;
        return data;
      }
    }));
  }

  createSectorIndustrialDB(formulario) {
    const data: Sector_Industrial = {
      nombre: formulario.sector_industrial,
    }
    this.sectorIDoc = this.dbFire.doc(`sector_Industrial/${data.nombre}`);
    return this.sectorIDoc.set(data, { merge: true }).then(() => {
      console.log("Sector creado");
    });
  }

  // Actualiza Sector Industrial
  updateSectorIndustrial(sector: Sector_Industrial) {
    this.sectorIDoc = this.dbFire.doc(`sector_Industrial/${sector.nombre}`);
    this.sectorIDoc.update(sector);
    this.alerta.mensajeExito('Exito!', 'Sector actualizados correctamente');
    this.router.navigate(['/home']);
  }


  // pais/Ecuador
  createPaisDB(formulario) {
    const data: Pais = {
      nombre: formulario.pais,
    }
    this.paisDoc = this.dbFire.doc(`pais/${data.nombre}`);
    return this.paisDoc.set(data, { merge: true }).then(() => {
      this.createProvinciaDB(formulario)
    });
  }

  // provincia/Loja
  createProvinciaDB(formulario) {
    const data: Provincia = {
      nombre: formulario.provincia,
      idPais: formulario.pais
    }
    this.provinciaDoc = this.dbFire.doc(`provincia/${data.nombre}`);
    return this.provinciaDoc.set(data, { merge: true }).then(() => {
      this.createCantonDB(formulario)
    });
  }

  // canton/Catamayo
  createCantonDB(formulario) {
    const data: Canton = {
      nombre: formulario.canton,
      idProvincia: formulario.provincia
    }
    this.cantonDoc = this.dbFire.doc(`canton/${data.nombre}`);
    return this.cantonDoc.set(data, { merge: true }).then(() => {
      this.router.navigate(['/home']);
    });
  }

}
