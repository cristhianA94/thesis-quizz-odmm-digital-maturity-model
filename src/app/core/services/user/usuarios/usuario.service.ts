import { Injectable } from "@angular/core";
import { Resolve, Router } from "@angular/router";
import { Observable, BehaviorSubject, combineLatest, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";

import { Usuario } from "app/shared/models/usuario";

/* Firestores */
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";

/* Services */
import { AlertsService } from "../../notificaciones/alerts.service";
import Swal from "sweetalert2";
import { chain, groupBy, uniq } from "lodash";
import { User } from "firebase";
import { Empresa } from "app/shared/models/empresa";
import * as _ from "lodash";

@Injectable({
  providedIn: "root",
})
export class UsuarioService implements Resolve<any> {
  // Firestore
  usuarioCollection: AngularFirestoreCollection<Usuario>;
  usuarioDoc: AngularFirestoreDocument<Usuario>;

  idUser: string;
  usuario: Usuario;
  onUsuarioChanged: BehaviorSubject<any>;

  adminCheck: BehaviorSubject<boolean>;
  adminUser: Observable<boolean>;
  usuarios: any;
  onUsuariosChanged: BehaviorSubject<any>;

  constructor(
    private authFire: AngularFireAuth,
    private dbFire: AngularFirestore,
    private alertaService: AlertsService,
    private router: Router
  ) {
    this.idUser = localStorage.getItem("uidUser");
    this.onUsuarioChanged = new BehaviorSubject({});
    this.onUsuariosChanged = new BehaviorSubject([]);
    this.adminCheck = new BehaviorSubject<boolean>(false);
    this.adminUser = this.adminCheck.asObservable();
  }

  resolve(): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getUser(this.idUser)]).then(() => {
        resolve();
      }, reject);
    });
  }

  // Comprueba el estado del usuario admin
  public get currentUserValue(): boolean {
    return this.adminCheck.value;
  }

  getUsersDB(): Observable<Usuario[]> {
    this.usuarioCollection = this.dbFire.collection("usuarios");
    return this.usuarioCollection.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as Usuario;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }

  getUsersEmpresas(idUser): Promise<any> {
    const usuarioRef = this.dbFire
      .collection<Usuario>("usuarios")
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as Usuario;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      )
      .pipe(
        switchMap((usuarios) => {
          const usersIds = uniq(usuarios.map((bp) => bp.id));
          if (usuarios.length === 0) {
            return [[], []];
          } else {
            return combineLatest(
              of(usuarios),
              combineLatest(
                usersIds.map((userId) =>
                  this.dbFire
                    .collection<Empresa>(`empresas`, (ref) =>
                      ref
                        .where("idUser", "==", userId)
                        .orderBy("fechaCreacion")
                        .limit(1)
                    )
                    .snapshotChanges()
                    .pipe(
                      map((actions) =>
                        actions.map((res) => {
                          const data = res.payload.doc.data() as Empresa;
                          if (idUser === userId) data.usuario = true;
                          const id = res.payload.doc.id;
                          return { id, ...data };
                        })
                      )
                    )
                )
              )
            );
          }
        }),
        map(([usuarios, empresas]) => {
          if (!usuarios) {
            return [];
          } else {
            return usuarios.map((usuario, index) => {
              return {
                ...usuario,
                empresas: empresas[index],
                // empresas,
              };
            });
          }
        })
      );
    return new Promise((resolve, reject) => {
      usuarioRef.subscribe((response: any) => {
        const empresas = [];
        response.map((usuario) => {
          usuario.empresas.forEach((empresa) => {
            empresas.push(empresa);
          });
        });
        const sectores = groupBy(empresas, "idSectorInd");
        let sectoresUser = [];
        for (const key in sectores) {
          if (Object.prototype.hasOwnProperty.call(sectores, key)) {
            const empresas = sectores[key];
            empresas.forEach((empresa) => {
              if (empresa.usuario) {
                sectoresUser = empresas;
              }
            });
          }
        }
        this.usuarios = sectoresUser;
        console.log("🚀 ~ sectoresUser", sectoresUser);
        this.onUsuariosChanged.next(this.usuarios);
        resolve(this.usuarios);
      }, reject);
    });
  }

  //Obtiene un usuario
  getUser(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.usuarioDoc = this.dbFire.doc<Usuario>(`usuarios/${id}`);
      this.usuarioDoc
        .snapshotChanges()
        .pipe(
          map((res) => {
            const data = res.payload.data() as Usuario;
            const id = res.payload.id;
            return { id, ...data };
          })
        )
        .subscribe((response) => {
          this.usuario = response;
          this.onUsuarioChanged.next(this.usuario);
          resolve(this.usuario);
        }, reject);
    });
  }

  // Valida si el usuario es tiene el rol de ADMIN_ROLE o USER_ROLE
  validateRolUser() {
    let idUser = localStorage.getItem("uidUser");
    // Comprueba si el usuario es admin
    this.getUser(idUser);
    this.onUsuarioChanged.subscribe((usuario) => {
      if (usuario.rol == "ADMIN_ROLE") {
        this.adminCheck.next(true);
      } else {
        this.adminCheck.next(false);
      }
    });
  }

  // Registra al usuario con sus datos de red social y el mismo ID de AUTH y lo guarda en firestore/usuario
  createUserSocial(user: any) {
    this.usuarioDoc = this.dbFire.doc(`usuarios/${user.id}`);
    const data: Usuario = {
      nombres: user.displayName,
      photoURL: user.photoURL,
      correo: user.email,
      telefono: user.phoneNumber,
      rol: "USER_ROLE",
    };
    return this.usuarioDoc.set(data, { merge: true });
  }

  // Registra un usuario en firestore/usuario
  async createUserDB(user: any, formulario) {
    this.usuarioDoc = this.dbFire.doc(`usuarios/${user.uid}`);
    let data: Usuario = {
      nombres: formulario.nombres,
      apellidos: formulario.apellidos,
      photoURL:
        "https://cdn.pixabay.com/photo/2015/03/04/22/35/head-659651_960_720.png",
      cedula: formulario.cedula,
      correo: user.email,
      telefono: formulario.telefono,
      sexo: formulario.sexo,
      cargo: formulario.cargo,
      rol: "USER_ROLE",
    };

    try {
      await this.usuarioDoc.set(data, { merge: true });
      this.alertaService.mensajeExito(
        "¡Éxito!",
        "Usuario registrado correctamente"
      );
    } catch (error) {
      return this.alertaService.mensajeError("Error", error);
    }
  }

  // Actualizar email usuario
  async updateEmail(email: string) {
    try {
      await this.authFire.auth.currentUser.updateEmail(email);
    } catch (error) {
      console.log(error);
      //return this.alertaService.mensajeError("¡Error al actualizar email!", error);
    }
  }

  // Actualizar contraseña usuario
  updatePassword(pass: string) {
    this.authFire.auth.currentUser
      .updatePassword(pass)
      .then(function () {
        // Update successful.
        this.alertaService.mensajeExito(
          "¡Éxito!",
          "Contraseña actualizado correctamente. Debe volver a loguearse"
        );
      })
      .catch(function (error) {
        return this.alertaService.mensajeError(
          "¡Error al actualizar contraseña!",
          error
        );
      });
  }

  // Actualiza usuario
  updateUsuario(usuario: Usuario) {
    // Actualiza el email del AUTH
    this.updateEmail(usuario.correo);
    // Si modifica la clave se cambia y se desloguea
    if (usuario.clave) {
      this.updatePassword(usuario.clave);
      // Cierra la sesion
      this.authFire.auth.signOut();
      localStorage.removeItem("uidUser");
      localStorage.removeItem("token");
      this.router.navigate(["/login"]);
      this.alertaService.mensajeExito(
        "¡Contraseña cambiada!",
        "Por seguridad tienes que volver a loguearte."
      );
    } else {
      this.usuarioDoc = this.dbFire.doc(`usuarios/${usuario.id}`);
      delete usuario.id;
      delete usuario.clave;
      setTimeout(() => {
        this.usuarioDoc.update(usuario);
        this.alertaService.mensajeExito(
          "¡Éxito!",
          "Datos actualizados correctamente"
        );
      }, 2000);
    }
  }

  // Borra usuario
  deleteUsuario(user: Usuario) {
    this.usuarioDoc = this.dbFire.doc(`usuarios/${user.id}`);
    this.usuarioDoc.delete();
    /* admin.auth().deleteUser(id)
      .then(function () {
        console.log('Successfully deleted user');
      })
      .catch(function (error) {
        console.log('Error deleting user:', error);
      }); */
  }
}
