import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Sector_Industrial } from '../../../../shared/models/sector_industrial';


@Injectable({
  providedIn: 'root'
})
export class SectorIndustrialService {
  sectorICollection: AngularFirestoreCollection<Sector_Industrial>;
  sectorIDoc: AngularFirestoreDocument<Sector_Industrial>;

  constructor(
    private afs: AngularFirestore,
  ) {
  }

  // Obtiene todos los Sectores Industriales
  getSectoresIndustrialesDB(): Observable<Sector_Industrial[]> {
    this.sectorICollection = this.afs.collection("sectorIndustrial", ref => {
      return ref.orderBy('nombre')
    });
    return this.sectorICollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Sector_Industrial;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
    );
  }

  // Obtiene un sectorIndustrial especifico
  getSectorIndustrialDB(id: string): Observable<Sector_Industrial> {
    this.sectorIDoc = this.afs.doc(`sectorIndustrial/${id}`);
    return this.sectorIDoc.valueChanges();
  }

  // Crear sectorIndustrial
  crearSectorIndustrialDB(sectorI: Sector_Industrial) {
    this.sectorICollection = this.afs.collection('sectorIndustrial');
    this.sectorICollection.add(sectorI)
  }

  // Actualizar sectorIndustrial
  updateSectorIndustrialDB(sectorI: Sector_Industrial) {
    this.sectorIDoc = this.afs.doc(`sectorIndustrial/${sectorI.id}`);
    delete sectorI.id;
    this.sectorIDoc.update(sectorI);
  }

  //Borrar sectorIndustrial
  deletePaisDB(sectorI: Sector_Industrial) {
    this.sectorIDoc = this.afs.doc(`sectorIndustrial/${sectorI.id}`);
    this.sectorIDoc.delete();
  }
}
