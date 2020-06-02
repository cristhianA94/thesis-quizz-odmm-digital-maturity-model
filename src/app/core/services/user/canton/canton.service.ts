import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Canton } from 'app/shared/models/ubicacion';

@Injectable({
  providedIn: 'root'
})
export class CantonService {

  cantonCollection: AngularFirestoreCollection<Canton>;
  cantonDoc: AngularFirestoreDocument<Canton>

  constructor(
    private afs: AngularFirestore,
  ) {
  }

  getCantonesDB(): Observable<Canton[]> {
    this.cantonCollection = this.afs.collection("canton", ref => {
      return ref.orderBy('nombre')
    });
    return this.cantonCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Canton;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
    );
  }

  getCantones_ProvinciasDB(idProvincia: string): Observable<Canton[]> {
    this.cantonCollection = this.afs.collection("canton", ref => {
      return ref.orderBy('nombre').where('idProvincia', '==', idProvincia)
    });
    return this.cantonCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Canton;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
    );
  }

  getCantonDB(id: string): Observable<Canton> {
    this.cantonDoc = this.afs.doc(`canton/${id}`);
    return this.cantonDoc.valueChanges();
  }

  createCantonDB(canton: Canton) {
    this.cantonCollection = this.afs.collection('canton');
    this.cantonCollection.add(canton);
  }

  updateCantonDB(canton: Canton) {
    this.cantonDoc = this.afs.doc(`canton/${canton.id}`);
    delete canton.id;
    this.cantonDoc.update(canton);
  }

  deleteCantonaDB(canton: Canton) {
    this.cantonDoc = this.afs.doc(`canton/${canton.id}`);
    this.cantonDoc.delete();
  }

}
