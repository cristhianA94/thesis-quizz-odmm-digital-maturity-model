import { Injectable } from "@angular/core";
import {
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  AngularFirestore,
  AngularFirestoreCollectionGroup,
} from "@angular/fire/firestore";
import { Observable, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { Subcategoria } from 'app/shared/models/subcategoria';

@Injectable({
  providedIn: "root",
})
export class SubcategoriasService {
  subcategoriaCollection: AngularFirestoreCollection<Subcategoria>;
  subcategoriaCollectionGroup: AngularFirestoreCollectionGroup<Subcategoria>;
  subcategoriaDoc: AngularFirestoreDocument<Subcategoria>;
  onSubcategoriaChanged: BehaviorSubject<any>;
  subcategoria: Subcategoria;

  constructor(private afs: AngularFirestore) {
    this.onSubcategoriaChanged = new BehaviorSubject([]);
  }

  getSubcategoriasDB(): Observable<Subcategoria[]> {
    this.subcategoriaCollection = this.afs.collection("subcategorias");
    return this.subcategoriaCollection.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as Subcategoria;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }

  getSubcategorias_CategoriaDB(idCategoria: string): Promise<Subcategoria[]> {

    return new Promise((resolve, reject) => {
      // Crea la referencia de la categoria a la que pertenecen las subcategorias
      const categoriaRef = this.afs.collection("categorias").doc(idCategoria).ref;

      this.afs
        .collection("subcategorias", (ref) => {
          return ref.where("idCategoria", "==", categoriaRef);
        })
        .snapshotChanges()
        .pipe(
          map((actions) =>
            actions.map((a) => {
              const data = a.payload.doc.data() as Subcategoria;
              const id = a.payload.doc.id;
              return { id, ...data };
            })
          )
        )
        .subscribe((response: any) => {
          this.subcategoria = response;
          console.log(response);
          this.onSubcategoriaChanged.next(this.subcategoria);
          resolve(response);
        }, reject);
    });
  }

  getSubcategoriaDB(id: string): Observable<Subcategoria> {
    this.subcategoriaDoc = this.afs.doc(`subcategorias/${id}`);
    return this.subcategoriaDoc.valueChanges();
  }

  createSubcategoriaDB(subcategoria: Subcategoria) {
    subcategoria.idCategoria = this.afs.collection("categorias").doc(subcategoria.idCategoria).ref;
    this.subcategoriaCollection = this.afs.collection("subcategorias");
    //this.subcategoriaDoc.set(subcategoria, { merge: true })
    this.subcategoriaCollection.add(subcategoria);
  }

  updateSubcategoriaDB(subcategoria: Subcategoria) {
    this.subcategoriaDoc = this.afs.doc(`subcategorias/${subcategoria.id}`);
    delete subcategoria.id;
    this.subcategoriaDoc.update(subcategoria);
  }

  deleteSubcategoriaDB(id: string) {
    this.subcategoriaDoc = this.afs.doc(`subcategorias/${id}`);
    this.subcategoriaDoc.delete();
  }
}
