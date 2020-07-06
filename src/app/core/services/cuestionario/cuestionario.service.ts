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
      let url = this.URL_LOCAL + "/cuestionario?id=" + id;

      this.http.get(url, header).subscribe((response: any) => {
        console.log("res", response);
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

  getCuestionarioUserLogedDB(id: string): Observable<Cuestionario> {
    this.cuestionarioDoc = this.afs.doc(`cuestionarios/${id}`);
    return this.cuestionarioDoc.valueChanges();
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

  createCuestionarioDB(cuestionario: Cuestionario, respuestaUser:RespuestasUsuario) {
    // TODO crear doc unico
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
          /* Read more about handling dismissals below */
          if (result.dismiss === Swal.DismissReason.timer) {
          }
        })
    });
  }

  deleteCuestionarioDB(id: string) {
    this.cuestionarioDoc = this.afs.doc(`cuestionarios/${id}`);
    this.cuestionarioDoc.delete();
  }
}

