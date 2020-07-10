import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Cuestionario, RespuestasUsuario } from 'app/shared/models/cuestionario';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class CuestionarioService implements Resolve<any>{

  // URL dev and production
  URL_LOCAL: string = "http://localhost:5001/fir-auth-web-75274/us-central1";
  URL_API: string = "https://us-central1-fir-auth-web-75274.cloudfunctions.net";
  cuestionarioCollection: AngularFirestoreCollection<Cuestionario>;
  cuestionarioDoc: AngularFirestoreDocument<Cuestionario>;

  cuestionario: Cuestionario;
  onCuestionarioChanged: BehaviorSubject<any>;

  constructor(
    private http: HttpClient,
    private afs: AngularFirestore
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



  getCuestionariosDB(): Observable<Cuestionario[]> {
    this.cuestionarioCollection = this.afs.collection("cuestionario", ref => {
      return ref.orderBy('fecha')
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

  // TODO Si existe cuestionario con idUser guardar con .set, sino con add.
  createCuestionarioDB(cuestionario: Cuestionario, respuestaUser: any) {
    let id = this.afs.createId();
    let idUser = cuestionario.idUser;

    this.getCuestionarioUserLogedDB().subscribe((cuestionarioDB: any) => {
      console.log(cuestionarioDB);

      cuestionarioDB.forEach(cuestionario => {
        console.log(cuestionario);
        if (cuestionario.categoria === cuestionario.categoria) {
          console.log("Coincide categoria");
        }

      });
      if (cuestionarioDB.categoria === cuestionario.categoria) {
        console.log("Coincide categoria");
        /* this.cuestionarioDoc.set(cuestionario, { merge: true })
          .then(() => {
            this.afs.collection('cuestionarios/' + idUser + '/respuestas').add(respuestaUser);
          }) */
      } else {
        console.log("NO coincide");
        /* this.cuestionarioCollection = this.afs.collection('cuestionarios');
        this.cuestionarioCollection.add(cuestionario)
          .then((docCuestionario) => {
            this.afs.collection('cuestionarios/' + docCuestionario.id + '/respuestas').add(respuestaUser);
          }); */
      }

    });


    /* this.cuestionarioDoc = this.afs.doc(`cuestionarios/${idUser}`);

    this.cuestionarioDoc.set(cuestionario)
      .then(() => {
        this.afs.collection('cuestionarios/' + idUser + '/respuestas').add(respuestaUser);
      }) */
  };
  /*     
      this.cuestionarioCollection = this.afs.collection('cuestionarios');
      this.cuestionarioCollection.add(cuestionario).then((docCuestionario) => {
        this.afs.collection('cuestionarios/' + docCuestionario.id + '/respuestas').add(respuestaUser);
        let timerInterval
        Swal.fire({
          title: '¡Categoria registrada!',
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
        })
      });
    } */

  deleteCuestionarioDB(id: string) {
    this.cuestionarioDoc = this.afs.doc(`cuestionarios/${id}`);
    this.cuestionarioDoc.delete();
  }

}

