import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Cuestionario, RespuestasUsuario } from 'app/shared/models/cuestionario';
import Swal from 'sweetalert2';
import { AlertsService } from '../notificaciones/alerts.service';

@Injectable({
  providedIn: 'root'
})
export class CuestionarioService implements Resolve<any>{

  // URL dev and production
  URL_LOCAL: string = "http://localhost:5001/fir-auth-web-75274/us-central1";
  URL_API: string = "https://us-central1-fir-auth-web-75274.cloudfunctions.net";

  cuestionarioCollection: AngularFirestoreCollection<Cuestionario>;
  cuestionarioDoc: AngularFirestoreDocument<Cuestionario>;
  cuestionario_respuestasCollection: AngularFirestoreCollection<RespuestasUsuario>;
  cuestionario_respuestasDoc: AngularFirestoreDocument<RespuestasUsuario>;

  cuestionario: Cuestionario;
  respuestaUsuario: RespuestasUsuario;
  onCuestionarioChanged: BehaviorSubject<any>;

  subscripcion: Subscription;

  duplicated: boolean = false;

  constructor(
    private http: HttpClient,
    private afs: AngularFirestore,
    private alertaService: AlertsService,
    private router: Router
  ) {
    this.onCuestionarioChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot): Observable<any> | Promise<any> | any {
    let idCategoria = route.params.id;

    return new Promise((resolve, reject) => {
      Promise.all([
        this.getCuestionarioAPI(idCategoria),
      ])
        .then(() => {
          resolve();
        }, reject);
    });
  }

  getCuestionarioAPI(id: string) {
    let token: string;
    token = localStorage.getItem("token");
    // Manda el token de seguridad
    var header = { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) }

    return new Promise((resolve, reject) => {
      // REST del API
      let url = this.URL_API + "/cuestionario?id=" + id;

      this.http.get(url, header).subscribe((response: any) => {
        this.cuestionario = response;
        this.onCuestionarioChanged.next(this.cuestionario);
        resolve(response);
      }, reject)
    })
  }


  // Obtiene un cuestionario en especifico
  getCuestionarioID(id: string): Observable<Cuestionario> {
    this.cuestionarioDoc = this.afs.collection("cuestionarios").doc(id);
    return this.cuestionarioDoc.valueChanges();
  }

  // Obtiene todos los cuestionarios
  getCuestionariosDB(): Observable<Cuestionario[]> {
    this.cuestionarioCollection = this.afs.collection("cuestionarios", ref => {
      return ref.orderBy('categoria')
    });
    return this.cuestionarioCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Cuestionario;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
    );
  }

  // Obtiene los cuestionarios que ha respondido el usuario logueado
  getCuestionarioUserLogedDB(): Observable<Cuestionario[]> {

    let idUser = localStorage.getItem("uidUser");

    this.cuestionarioCollection = this.afs.collection("cuestionarios", (ref) => {
      return ref.orderBy("categoria").where("idUser", "==", idUser);
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

  // Obtiene los cuestionarios que ha respondido X usuario
  getCuestionarioUserDB(idUsuario: string): Observable<Cuestionario[]> {

    this.cuestionarioCollection = this.afs.collection("cuestionarios", (ref) => {
      return ref.orderBy("categoria").where("idUser", "==", idUsuario);
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

  // Obtiene las respuestas de una categoria que ha respondido el usuario
  getCuestionarioRespuestasDB(idCuestionario: string): Observable<RespuestasUsuario[]> {

    this.cuestionario_respuestasCollection = this.afs.collection('cuestionarios/' + idCuestionario + '/respuestas', ref => {
      return ref.orderBy('intento', 'desc')
    });
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
  getCuestionarioRespuestaDB(idCuestionario: string, idRespuesta: string,): Observable<RespuestasUsuario> {
    this.cuestionario_respuestasDoc = this.afs.doc('cuestionarios/' + idCuestionario + '/respuestas/' + idRespuesta);
    return this.cuestionario_respuestasDoc.valueChanges();
  }

  /* 
  getBanks({commit},payload){
      const arrayBank =[]
      db.collection('AreaConocimiento').doc(payload.idArea).collection('Bloques').doc(payload.idBlock).collection('BancoPreguntas').get().then(snapshot => {
        snapshot.forEach(doc => {
          let bank = doc.data();
          bank.id = doc.id
          arrayBank.push(bank)
        });
      })
  */

  // Guarda el cuestionario de la categoria evaluada
  createCuestionarioDB(cuestionario: Cuestionario, respuestaUser: any) {

    cuestionario.intento = 0;
    // Obtiene los cuestionarios de el usuario logueado
    this.subscripcion = this.getCuestionarioUserLogedDB().subscribe((cuestionarioDB: any) => { /// ESTE lo buelve a ejecutar
      //console.log(cuestionarioDB);

      // Filtra el cuestionario de la categoria evaluada
      let cuestionarioEvaluado: any = cuestionarioDB.filter((cat: Cuestionario) => cat.categoria === cuestionario.categoria);

      // Control cuando sea una categoria nueva
      if (typeof cuestionarioEvaluado != "undefined") {
        let objTemp = { categoria: " " };
        cuestionarioEvaluado.push(objTemp);
      }

      // Busca entre los cuestionarios la categoria evaluada actual, para que no se agregue una duplicidad de docs
      if (cuestionario.categoria == cuestionarioEvaluado[0].categoria) {
        this.duplicated = true;
        // Agrega las metricas del nuevo intento de esa categoria.
        this.afs.collection('cuestionarios/' + cuestionarioEvaluado[0].id + '/respuestas').add(respuestaUser)
          .then(() => {
            // Notificacion
            let timerInterval
            Swal.fire({
              title: '¡Categoria nuevamente evaluada!',
              icon: 'success',
              timer: 1000,
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

            this.router.navigate(["/cuestionario"]);
          })
          .catch((err) => this.alertaService.mensajeError("Error", err));
      }

      // Registra la nueva categoria evaluada
      if (!this.duplicated) {
        this.cuestionarioCollection = this.afs.collection('cuestionarios');
        this.cuestionarioCollection.add(cuestionario)
          .then((docCuestionario) => {
            this.afs.collection('cuestionarios/' + docCuestionario.id + '/respuestas').add(respuestaUser);
            // Notificacion
            let timerInterval
            Swal.fire({
              title: '¡Categoria Evaluada!',
              icon: 'success',
              timer: 1000,
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

            this.router.navigate(["/cuestionario"]);
          });
      }
      // Se desuscribe de la consulta para evitar bucle de adds
      this.subscripcion.unsubscribe();
    });

  };


  deleteCuestionarioDB(id: string) {
    this.cuestionarioDoc = this.afs.doc(`cuestionarios/${id}`);
    this.cuestionarioDoc.delete();
  }
}

