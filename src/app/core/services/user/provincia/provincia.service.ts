import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Provincia } from 'app/shared/models/ubicacion';

@Injectable({
  providedIn: 'root'
})
export class ProvinciaService {

  provinciaCollection: AngularFirestoreCollection<Provincia>;
  provinciaDoc: AngularFirestoreDocument<Provincia>

  constructor(
    private afs: AngularFirestore,
  ) {
  }

  getProvinciasDB(): Observable<Provincia[]> {
    this.provinciaCollection = this.afs.collection("provincia")
    return this.provinciaCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Provincia;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
    );
  }

  getProvincias_PaisDB(idPais: string): Observable<Provincia[]> {
    this.provinciaCollection = this.afs.collection("provincia", ref => {
      return ref.orderBy('nombre').where('idPais', '==', idPais)
    });
    return this.provinciaCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Provincia;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
    );
  }

  getProvinciaDB(id: string): Observable<Provincia> {
    this.provinciaDoc = this.afs.doc(`provincia/${id}`);
    return this.provinciaDoc.valueChanges();
  }

  createProvinciaDB(provincia: Provincia) {
    this.provinciaCollection = this.afs.collection('provincia');
    this.provinciaCollection.add(provincia);
  }

  updateProvinciaDB(provincia: Provincia) {
    this.provinciaDoc = this.afs.doc(`provincia/${provincia.id}`);
    delete provincia.id;
    this.provinciaDoc.update(provincia);
  }

  deleteProvinciaDB(provincia: Provincia) {
    this.provinciaDoc = this.afs.doc(`provincia/${provincia.id}`);
    this.provinciaDoc.delete();
  }
}
