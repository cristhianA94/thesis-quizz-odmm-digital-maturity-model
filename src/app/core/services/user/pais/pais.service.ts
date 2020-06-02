import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Pais } from 'app/shared/models/ubicacion';


@Injectable({
  providedIn: 'root'
})
export class PaisService {

  paisCollection: AngularFirestoreCollection<Pais>;
  paisDoc: AngularFirestoreDocument<Pais>;

  constructor(
    private afs: AngularFirestore,
  ) {
  }

  getPaisesDB(): Observable<Pais[]> {
    this.paisCollection = this.afs.collection("pais", ref => {
      return ref.orderBy('nombre')
    });
    return this.paisCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Pais;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
    );
  }

  // Obtiene un pais especifico
  getPaisDB(id: string): Observable<Pais> {
    this.paisDoc = this.afs.doc(`pais/${id}`);
    return this.paisDoc.valueChanges();
  }

  // Crear pais
  createPaisDB(pais: Pais) {
    this.paisCollection = this.afs.collection('pais');
    this.paisCollection.add(pais)
    // Genera un id automatico
    //const id = this.afs.createId();
    //this.paisCollection.doc(id).set(pais.nombre, { merge: true });
  }

  // Actualizar pais
  updatePaisDB(pais: Pais) {
    this.paisDoc = this.afs.doc(`pais/${pais.id}`);
    delete pais.id;
    this.paisDoc.update(pais);
  }

  //Borrar pais
  deletePaisDB(pais: Pais) {
    this.paisDoc = this.afs.doc(`pais/${pais.id}`);
    this.paisDoc.delete();
  }
}