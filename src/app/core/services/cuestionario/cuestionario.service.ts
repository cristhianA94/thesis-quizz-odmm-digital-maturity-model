import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  AngularFirestore,
} from "@angular/fire/firestore";
import { Resolve, ActivatedRouteSnapshot, Router } from "@angular/router";
import { Observable, BehaviorSubject, Subscription } from "rxjs";
import { map } from "rxjs/operators";

import {
  Cuestionario,
  RespuestasUsuario,
} from "app/shared/models/cuestionario";
import Swal from "sweetalert2";
import { AlertsService } from "../notificaciones/alerts.service";

@Injectable({
  providedIn: "root",
})
export class CuestionarioService implements Resolve<any> {
  // URL dev and production
  URL_LOCAL: string = "http://localhost:5000/odmm-autodiagostico/us-central1";
  URL_API: string =
    "https://us-central1-odmm-autodiagostico.cloudfunctions.net";

  cuestionarioCollection: AngularFirestoreCollection<Cuestionario>;
  cuestionarioDoc: AngularFirestoreDocument<Cuestionario>;
  cuestionario_respuestasCollection: AngularFirestoreCollection<RespuestasUsuario>;
  cuestionario_respuestasDoc: AngularFirestoreDocument<RespuestasUsuario>;

  cuestionario: Cuestionario;
  respuestaUsuario: RespuestasUsuario;
  onCuestionarioChanged: BehaviorSubject<any>;

  subscripcion: Subscription;

  duplicated: boolean = false;
  idCategoria: any;

  constructor(
    private http: HttpClient,
    private afs: AngularFirestore,
    private alertaService: AlertsService,
    private router: Router
  ) {
    this.onCuestionarioChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot): Observable<any> | Promise<any> | any {
    this.idCategoria = route.params.id;

    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getCuestionarioAPI(this.idCategoria)]).then(() => {
        resolve();
      }, reject);
    });
  }

  getCuestionarioAPI(id: string) {
    let token: string;
    token = localStorage.getItem("token");
    // Manda el token de seguridad
    var header = {
      headers: new HttpHeaders().set("Authorization", `Bearer ${token}`),
    };

    return new Promise((resolve, reject) => {
      // REST del API
      let url = this.URL_API + "/cuestionario?id=" + id;

      this.http.get(url, header).subscribe((response: any) => {
        this.cuestionario = response;
        this.onCuestionarioChanged.next(this.cuestionario);
        resolve(response);
      }, reject);
    });
  }

  // Obtiene un cuestionario en especifico
  getCuestionarioID(id: string): Observable<Cuestionario> {
    this.cuestionarioDoc = this.afs.collection("cuestionarios").doc(id);
    return this.cuestionarioDoc.valueChanges();
  }

  // Obtiene todos los cuestionarios
  getCuestionariosDB(): Observable<Cuestionario[]> {
    this.cuestionarioCollection = this.afs.collection("cuestionarios", (ref) => {
      return ref.orderBy("categoria");
    });
    return this.cuestionarioCollection.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as Cuestionario;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }
  // Obtiene los cuestionarios que no contestó aun el mismo dia
  getCuestionarioDiaUserLogedDB(): Observable<Cuestionario[]> {
    let idUser = localStorage.getItem("uidUser");
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    this.cuestionarioCollection = this.afs.collection("cuestionarios", (ref) => {
      return ref
        .where("idUser", "==", idUser)
        .where("fechaCreacion", ">=", fechaActual);
    });
    return this.cuestionarioCollection.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as Cuestionario;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }
  // Obtiene los cuestionarios que ha respondido el usuario logueado
  getCuestionarioUserLogedDB(): Observable<Cuestionario[]> {
    let idUser = localStorage.getItem("uidUser");

    this.cuestionarioCollection = this.afs.collection(
      "cuestionarios",
      (ref) => {
        return ref.where("idUser", "==", idUser);
      }
    );
    return this.cuestionarioCollection.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as Cuestionario;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }

  // Valida que solo se agregue solo un documento por usuario y categoria
  validarUsuarioCategoria(categoriaId): Observable<Cuestionario[]> {
    let idUser = localStorage.getItem("uidUser");
    const categoriaRef = this.afs.doc(`categorias/${categoriaId}`).ref;

    this.cuestionarioCollection = this.afs.collection(
      "cuestionarios",
      (ref) => {
        return ref
          .where("idUser", "==", idUser)
          .where("categoria", "==", categoriaRef)
          .limit(1);
      }
    );

    return this.cuestionarioCollection.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as Cuestionario;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }

  // Obtiene los cuestionarios que ha respondido X usuario
  getCuestionarioUserDB(idUsuario: string): Observable<Cuestionario[]> {
    this.cuestionarioCollection = this.afs.collection(
      "cuestionarios",
      (ref) => {
        return ref.orderBy("categoria").where("idUser", "==", idUsuario);
      }
    );
    return this.cuestionarioCollection.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as Cuestionario;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }

  // Obtiene los cuestionarios de un usuario especifico
  getCuestionarioUserID(idUsuario: string): Observable<Cuestionario[]> {
    this.cuestionarioCollection = this.afs.collection("cuestionarios", (ref) => {
      return ref
        .orderBy("categoria")
        .where("idUser", "==", idUsuario);
    }
    );
    return this.cuestionarioCollection.valueChanges();
  }

  // Obtiene las respuestas de una categoria que ha respondido el usuario
  getCuestionarioRespuestasDB(
    idCuestionario: string
  ): Observable<RespuestasUsuario[]> {
    this.cuestionario_respuestasCollection = this.afs.collection(
      "cuestionarios/" + idCuestionario + "/respuestas",
      (ref) => {
        return ref.orderBy("intento", "desc");
      }
    );
    return this.cuestionario_respuestasCollection.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as RespuestasUsuario;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }

  // Obtiene las respuestas que ha respondido el usuario correspondientes a una categoria
  getCuestionarioRespuestaDB(
    idCuestionario: string,
    idRespuesta: string
  ): Observable<RespuestasUsuario> {
    this.cuestionario_respuestasDoc = this.afs.doc(
      "cuestionarios/" + idCuestionario + "/respuestas/" + idRespuesta
    );
    return this.cuestionario_respuestasDoc.valueChanges();
  }

  // Guarda el cuestionario de la categoria evaluada
  async createCuestionarioDB(cuestionario: Cuestionario, respuestaUser: any) {
    cuestionario.intento = 0;
    // Asigna la fecha de creacion
    cuestionario.fechaCreacion = new Date();

    // Obtiene los cuestionarios de el usuario logueado
    this.subscripcion = this.validarUsuarioCategoria(
      cuestionario.categoria
    ).subscribe((cuestionariodb: any) => {
      /// ESTE lo buelve a ejecutar
      cuestionario.categoria = this.afs.doc(
        `categorias/${cuestionario.categoria}`
      ).ref;

      // Detecta si contesto la categoria ya
      this.duplicated = cuestionariodb.length > 0 ? true : false;

      // Agrega las respuestas a una categoria ya contestada
      if (this.duplicated) {
        //await this.afs.doc(`cuestionarios/${cuestionariodb[0].id}`).update({ fechaCreacion: cuestionario.fechaCreacion });
        this.afs
          .collection("cuestionarios/" + cuestionariodb[0].id + "/respuestas")
          .add(respuestaUser)
          .then(() => {
            // Notificacion
            let timerInterval;
            Swal.fire({
              title: "¡Categoria nuevamente evaluada!",
              icon: "success",
              timer: 1000,
              timerProgressBar: true,
              onBeforeOpen: () => {
                Swal.showLoading();
                timerInterval = setInterval(() => {
                  Swal.getContent();
                }, 1000);
              },
              onClose: () => {
                clearInterval(timerInterval);
              },
            }).then((result) => {
              //Read more about handling dismissals below
              if (result.dismiss === Swal.DismissReason.timer) {
              }
            });

            this.router.navigate(["/cuestionario"]);
          })
          .catch((err) => this.alertaService.mensajeError("Error", err));

        // Si no ha contestado la categoria se agrega como nueva.
      } else {
        this.cuestionarioCollection = this.afs.collection("cuestionarios");
        this.cuestionarioCollection
          .add(cuestionario)
          .then((docCuestionario) => {
            this.afs
              .collection("cuestionarios/" + docCuestionario.id + "/respuestas")
              .add(respuestaUser);
            // Notificacion
            let timerInterval;
            Swal.fire({
              title: "¡Categoria Evaluada!",
              icon: "success",
              timer: 1000,
              timerProgressBar: true,
              onBeforeOpen: () => {
                Swal.showLoading();
                timerInterval = setInterval(() => {
                  Swal.getContent();
                }, 1000);
              },
              onClose: () => {
                clearInterval(timerInterval);
              },
            }).then((result) => {
              //Read more about handling dismissals below
              if (result.dismiss === Swal.DismissReason.timer) {
              }
            });

            this.router.navigate(["/cuestionario"]);
          });
      }
      // Se desuscribe de la consulta para evitar bucle de adds
      this.subscripcion.unsubscribe();
    });
  }

  deleteCuestionarioDB(id: string) {
    this.cuestionarioDoc = this.afs.doc(`cuestionarios/${id}`);
    this.cuestionarioDoc.delete();
  }
}
