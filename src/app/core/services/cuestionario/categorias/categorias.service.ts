import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Categoria } from '../../../../shared/models/cuestionario';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService{

  categoria: Categoria;
  categoriaCollection: AngularFirestoreCollection<Categoria>;
  categoriaDoc: AngularFirestoreDocument<Categoria>;

  constructor(
    private afs: AngularFirestore,
  ) {
  }

  getCategoriasDB(): Observable<Categoria[]> {
    this.categoriaCollection = this.afs.collection("categorias", ref => {
      return ref.orderBy('nombre')
    });
    return this.categoriaCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Categoria;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
    );
  }

  // Obtiene una categoria en especifico
  getCategoriaDB(id: string): Observable<Categoria> {
    this.categoriaDoc = this.afs.doc(`categorias/${id}`);
    return this.categoriaDoc.valueChanges();
  }

  // Crear categoria
  createCategoriaDB(categoria: Categoria) {
    this.categoriaCollection = this.afs.collection('categorias');
    this.categoriaCollection.add(categoria)
  }

  // Actualizar categoria
  updateCategoriaDB(categoria: Categoria) {
    this.categoriaDoc = this.afs.doc(`categorias/${categoria.id}`);
    delete categoria.id;
    this.categoriaDoc.update(categoria);
  }

  //Borrar categoria
  deleteCategoriaDB(categoria: Categoria) {
    this.categoriaDoc = this.afs.doc(`categorias/${categoria.id}`);
    this.categoriaDoc.delete();
  }
}
