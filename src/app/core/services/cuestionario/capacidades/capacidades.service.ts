import { Injectable } from '@angular/core';
import { Capacidad } from '../../../../shared/models/cuestionario';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CapacidadesService {

  capacidadesCollection: AngularFirestoreCollection<Capacidad>;
  capacidadesDoc: AngularFirestoreDocument<Capacidad>;

  constructor(
    private afs: AngularFirestore,
  ) {
  }

  getCapacidadesDB(): Observable<Capacidad[]> {
    this.capacidadesCollection = this.afs.collection("capacidades", ref => {
      return ref.orderBy('nombre')
    });
    return this.capacidadesCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Capacidad;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
    );
  }

  getCapacidades_SubcategoriaDB(idSubcategoria: string): Observable<Capacidad[]> {
    let urlID = '/subcategorias/' + idSubcategoria;
    console.log(urlID);
    
    this.capacidadesCollection = this.afs.collection("capacidades", ref => {
      return ref.orderBy('nombre').where('idSubcategoria', '==', urlID)
    });
    return this.capacidadesCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Capacidad;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
    );
  }

  getCapacidadDB(id: string): Observable<Capacidad> {
    this.capacidadesDoc = this.afs.doc(`capacidades/${id}`);
    return this.capacidadesDoc.valueChanges();
  }

  createCapacidadDB(capacidad: Capacidad) {
    capacidad = {
      nombre: capacidad.nombre,
      descripcion: capacidad.descripcion,
      peso: capacidad.peso,
      // Asigna el objeto relacionado
      idSubcategoria: this.afs.collection("subcategorias").doc(capacidad.idSubcategoria).ref,
    }
    this.capacidadesCollection = this.afs.collection('capacidades');
    this.capacidadesCollection.add(capacidad);
  }

  updateCapacidadDB(capacidad: Capacidad) {
    this.capacidadesDoc = this.afs.doc(`capacidades/${capacidad.id}`);
    delete capacidad.id;
    this.capacidadesDoc.update(capacidad);
  }

  deleteCapacidadDB(id: string) {
    this.capacidadesDoc = this.afs.doc(`capacidades/${id}`);
    this.capacidadesDoc.delete();
  }
}