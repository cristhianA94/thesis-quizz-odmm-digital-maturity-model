import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import {
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  AngularFirestore,
} from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Metrica } from "app/shared/models/metrica";

@Injectable({
  providedIn: "root",
})
export class MetricasService {
  metricasCollection: AngularFirestoreCollection<Metrica>;
  metricasDoc: AngularFirestoreDocument<Metrica>;

  constructor(private afs: AngularFirestore) { }

  getMetricasDB(): Observable<Metrica[]> {
    this.metricasCollection = this.afs.collection("metricas", (ref) => {
      return ref.orderBy("nombre");
    });
    return this.metricasCollection.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as Metrica;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }

  getMetricas_CapacidadesDB(idCapacidad: string): Observable<Metrica[]> {
    this.metricasCollection = this.afs.collection("metricas", (ref) => {
      return ref.orderBy("nombre").where("idCapacidad", "==", idCapacidad);
    });
    return this.metricasCollection.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as Metrica;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }

  getMetricaDB(id: string): Observable<Metrica> {
    this.metricasDoc = this.afs.doc(`metricas/${id}`);
    return this.metricasDoc.valueChanges();
  }

  crearMetricaDB(metrica: Metrica) {
    metrica.idCapacidad = this.afs.collection("capacidades").doc(metrica.idCapacidad).ref;
    
    this.metricasDoc = this.afs.collection('metricas').doc(metrica.idCapacidad.id);
    //return this.metricasCollection.add(metrica);
    return this.metricasDoc.set(metrica);
  }

  actualizarMetricaDB(metrica: Metrica) {
    metrica.idCapacidad = this.afs.collection("capacidades").doc(metrica.idCapacidad).ref;
    this.metricasDoc = this.afs.doc(`metricas/${metrica.id}`);
    delete metrica.id;
    this.metricasDoc.update(metrica);
  }

  borrarMetricaDB(id: string) {
    this.metricasDoc = this.afs.doc(`metricas/${id}`);
    this.metricasDoc.delete();
  }
}
