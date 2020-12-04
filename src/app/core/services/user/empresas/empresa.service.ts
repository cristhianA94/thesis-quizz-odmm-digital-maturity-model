import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  AngularFirestore
} from '@angular/fire/firestore';

import { Empresa } from 'app/shared/models/empresa';
import { AlertsService } from '../../notificaciones/alerts.service';
import { UsuarioService } from '../usuarios/usuario.service';
import { Resolve } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService implements Resolve<any>{

  public idUser: string;

  empresaCollection: AngularFirestoreCollection<Empresa>;
  empresaDoc: AngularFirestoreDocument<Empresa>;
  empresas: Empresa[];
  onEmpresaChanged: BehaviorSubject<any>;

  constructor(
    private afs: AngularFirestore,
    private alertaService: AlertsService,
    private usuarioService: UsuarioService,
  ) {
    this.idUser = usuarioService.idUser;
    this.onEmpresaChanged = new BehaviorSubject({});
  }

  resolve(): Observable<any> | Promise<any> | any {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getEmpresasUserDB()
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  // Obtiene las empresas del usuario logeado
  getEmpresasUserDB() {
    return new Promise((resolve, reject) => {
      this.empresaCollection = this.afs.collection("empresas", ref => {
        return ref.orderBy('razon_social').where('idUser', '==', this.idUser)
      });
      return this.empresaCollection.snapshotChanges()
        .pipe(
          map(actions =>
            actions.map(res => {
              const data = res.payload.doc.data() as Empresa;
              const id = res.payload.doc.id;
              return { id, ...data };
            })
          )
        ).subscribe(response => {
          this.empresas = response;
          this.onEmpresaChanged.next(this.empresas);
          resolve(this.empresas);
        },
          reject
        )
    })
  }

  // Obtiene todas las empresas
  getEmpresasUserID(idUser: string): Observable<Empresa[]> {
    this.empresaCollection = this.afs.collection("empresas", ref => {
      return ref.orderBy('razon_social').where('idUser', '==', idUser)
    });
    return this.empresaCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(res => {
          const data = res.payload.doc.data() as Empresa;
          const id = res.payload.doc.id;
          return { id, ...data };
        }))
    );
  }

  // Obtiene todas las empresas
  getEmpresasDB(): Observable<Empresa[]> {
    this.empresaCollection = this.afs.collection("empresas", ref => {
      return ref.orderBy('razon_social')
    });
    return this.empresaCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(res => {
          const data = res.payload.doc.data() as Empresa;
          const id = res.payload.doc.id;
          return { id, ...data };
        }))
    );
  }

  // Registro nueva empresa
  createEmpresaDB(uidUser: string, formulario: any) {

    const data: Empresa = {
      razon_social: formulario.razon_social,
      anio_creacion: formulario.anio_creacion,
      area_alcance: formulario.area_alcance,
      franquicias: formulario.franquicias,
      direccion: formulario.direccion,
      tamanio_empresa: formulario.tamanio_empresa,
      idUser: uidUser,
      idCanton: formulario.idCanton,
      idSectorInd: formulario.idSectorInd
    }

    this.empresaCollection = this.afs.collection('empresas');
    this.empresaCollection.add(data)
      .then(() => this.alertaService.mensajeExito('¡Éxito!', 'Empresa registrada correctamente'))
      .catch((error) => this.alertaService.mensajeError('Error', error))
  }

  updateEmpresa(empresa: Empresa) {
    this.empresaDoc = this.afs.doc(`empresas/${empresa.id}`);
    delete empresa.id;
    this.empresaDoc.update(empresa);
    this.alertaService.mensajeExito('¡Éxito!', 'Datos actualizados correctamente');
  }

  deleteEmpresa(empresa: Empresa) {

    this.empresaDoc = this.afs.doc(`empresas/${empresa.id}`);
    this.empresaDoc.delete();
    this.alertaService.mensajeExito('¡Éxito!', 'Empresa eliminada correctamente');
  }


}
