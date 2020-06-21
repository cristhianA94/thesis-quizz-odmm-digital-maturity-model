import { Injectable } from '@angular/core';
import { Respuesta } from '../../../../shared/models/cuestionario';
import { map } from 'rxjs/operators';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RespuestasService {

  respuestasCollection: AngularFirestoreCollection<Respuesta>;
  respuestaDoc: AngularFirestoreDocument<Respuesta>;

  constructor(
    private afs: AngularFirestore,
  ) {
  }

  getRespuestasDB(): Observable<Respuesta[]> {
    this.respuestasCollection = this.afs.collection("respuestas");
    return this.respuestasCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Respuesta;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
    );
  }

  getRespuestas_MetricasDB(idMetrica: string): Observable<Respuesta[]> {
    this.respuestasCollection = this.afs.collection("respuestas", ref => {
      return ref.orderBy('opcion').where('idMetrica', '==', idMetrica)
    });
    return this.respuestasCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Respuesta;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
    );
  }

  getRespuestaDB(id: string): Observable<Respuesta> {
    this.respuestaDoc = this.afs.doc(`respuestas/${id}`);
    return this.respuestaDoc.valueChanges();
  }

  createRespuestaDB(respuesta: Respuesta) {
    respuesta = {
      opcion: respuesta.opcion,
      peso: respuesta.peso,
      // Asigna el objeto relacionado
      idMetrica: this.afs.collection("metricas").doc(respuesta.idMetrica).ref,
    }
    this.respuestasCollection = this.afs.collection('respuestas');
    this.respuestasCollection.add(respuesta);
  }

  updateRespuestaDB(respuesta: Respuesta) {
    this.respuestaDoc = this.afs.doc(`respuestas/${respuesta.id}`);
    delete respuesta.id;
    this.respuestaDoc.update(respuesta);
  }

  deleteRespuestaDB(id: string) {
    this.respuestaDoc = this.afs.doc(`respuestas/${id}`);
    this.respuestaDoc.delete();
  }
}