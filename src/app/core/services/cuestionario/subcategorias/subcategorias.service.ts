 import { Injectable } from '@angular/core';
import { Subcategoria } from '../../../../shared/models/cuestionario';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore, AngularFirestoreCollectionGroup } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SubcategoriasService {

  subcategoriaCollection: AngularFirestoreCollection<Subcategoria>;
  subcategoriaCollectionGroup: AngularFirestoreCollectionGroup<Subcategoria>;
  subcategoriaDoc: AngularFirestoreDocument<Subcategoria>

  constructor(
    private afs: AngularFirestore,
  ) {
  }


  getSubcategoriasDB(): Observable<Subcategoria[]> {
    this.subcategoriaCollection = this.afs.collection("subcategorias");
    return this.subcategoriaCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Subcategoria;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
    );
  }

  getSubcategorias_CategoriaDB(idCategoria: string): Observable<Subcategoria[]> {
    // Crea la referencia de la categoria a la que pertenecen las subcategorias
    const categoriaRef = this.afs.collection('categorias').doc(idCategoria);



    let comments$ = this.afs.collectionGroup("subcategorias", ref =>
      ref.where('idCategoria', '==', categoriaRef.ref)).valueChanges();

    this.subcategoriaCollection = this.afs.collection("subcategorias", ref => {
      return ref.where('idCategoria', '==', categoriaRef.ref)
    });

    return this.subcategoriaCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          var data = a.payload.doc.data() as Subcategoria;
          const id = a.payload.doc.id;
          // Recupera la categoria perteneciente
          //data.idCategoria.get().then((categoria: any) => idCat = categoria.data())
          return { id, ...data };
        })
      )
    );


  }

  getSubcategoriaDB(id: string): Observable<Subcategoria> {
    this.subcategoriaDoc = this.afs.doc(`subcategorias/${id}`);
    return this.subcategoriaDoc.valueChanges();
  }

  createSubcategoriaDB(subcategoria: Subcategoria) {
    subcategoria = {
      nombre: subcategoria.nombre,
      descripcion: subcategoria.descripcion,
      peso: subcategoria.peso,
      // Asigna el objeto relacionado
      idCategoria: this.afs.collection("categorias").doc(subcategoria.idCategoria).ref,
    }
    //this.subcategoriaDoc.set(subcategoria, { merge: true })
    this.subcategoriaCollection = this.afs.collection('subcategorias');
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