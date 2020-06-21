import { Injectable } from "@angular/core";
import {
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  AngularFirestore,
} from "@angular/fire/firestore";
import { Observable, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { Categoria } from "../../../../shared/models/cuestionario";
import { Resolve, ActivatedRouteSnapshot } from "@angular/router";
import { SubcategoriasService } from "../subcategorias/subcategorias.service";

@Injectable({
  providedIn: "root",
})
export class CategoriasService implements Resolve<any> {
  categoria: Categoria;
  categoriaCollection: AngularFirestoreCollection<Categoria>;
  categoriaDoc: AngularFirestoreDocument<Categoria>;
  categoryUid: string;
  onCategoriaChanged: BehaviorSubject<any>;

  constructor(
    private afs: AngularFirestore,
    private subcategoriasService: SubcategoriasService
  ) {
    this.onCategoriaChanged = new BehaviorSubject({});
  }
  resolve(route: ActivatedRouteSnapshot): Observable<any> | Promise<any> | any {
    this.categoryUid = route.params.id;
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getCategoriaDB(this.categoryUid),
        this.subcategoriasService.getSubcategorias_CategoriaDB(
          this.categoryUid
        ),
      ])
        .then(([categorias, subcategorias]) => {
          subcategorias.forEach((subcategoria) => {
            console.log(subcategoria.id);
          });
        })
        .then(() => {
          resolve();
        }, reject);
    });
  }

  getCategoriasDB(): Observable<Categoria[]> {
    this.categoriaCollection = this.afs.collection("categorias", (ref) => {
      return ref.orderBy("nombre");
    });
    return this.categoriaCollection.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as Categoria;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }

  // Obtiene una categoria en especifico
  getCategoriaDB(id: string): Promise<Categoria> {
    return new Promise((resolve, reject) => {
      const expoDoc = this.afs.doc<Categoria>(`categorias/${id}`);
      expoDoc.valueChanges().subscribe((response: any) => {
        this.categoria = response;
        console.log(response);
        this.onCategoriaChanged.next(this.categoria);
        resolve(response);
      }, reject);
    });
  }

  // Crear categoria
  createCategoriaDB(categoria: Categoria) {
    this.categoriaCollection = this.afs.collection("categorias");
    this.categoriaCollection.add(categoria);
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
