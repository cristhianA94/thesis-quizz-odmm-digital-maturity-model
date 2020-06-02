import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  AngularFirestore
} from '@angular/fire/firestore';

import { Empresa } from 'app/shared/models/empresa';
import { Router } from '@angular/router';
import { UsuarioService } from '../usuarios/usuario.service';
import { AlertsService } from '../../notificaciones/alerts.service';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  idUser: string;

  empresaCollection: AngularFirestoreCollection<Empresa>;
  empresaDoc: AngularFirestoreDocument<Empresa>

  constructor(
    private afs: AngularFirestore,
    private alertaService: AlertsService,
  ) {
    this.idUser = localStorage.getItem("uidUser");

  }

  getEmpresasDB(): Observable<Empresa[]> {
    this.empresaCollection = this.afs.collection("empresa", ref => {
      return ref.orderBy('razon_social')
    });
    return this.empresaCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Empresa;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
    );
  }

  // Obtiene las empresas
  getEmpresasUserDB(): Observable<Empresa[]> {
    this.empresaCollection = this.afs.collection("empresa", ref => {
      return ref.orderBy('razon_social').where('idUser', '==', this.idUser)
    });
    return this.empresaCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Empresa;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
    );
  }

  async createEmpresaDB(user: any, formulario) {

    const data: Empresa = {
      razon_social: formulario.razon_social,
      anio_creacion: formulario.anio_creacion,
      area_alcance: formulario.area_alcance,
      franquicias: formulario.franquicias,
      direccion: formulario.direccion,
      tamanio_empresa: formulario.tamanio_empresa,
      idUser: user.uid,
      idCanton: formulario.idCanton,
      idSectorInd: formulario.idSectorIndustrial
    }

    this.empresaCollection = this.afs.collection('empresa');
    try {
      await this.empresaCollection.add(data);
      this.alertaService.mensajeExito('¡Éxito!', 'Empresa registrada correctamente');
    }
    catch (err) {
      return this.alertaService.mensajeError('Error', err);
    }
  }

  updateEmpresa(empresa: Empresa) {
    this.empresaDoc = this.afs.doc(`empresa/${empresa._id}`);
    this.empresaDoc.update(empresa);
    this.alertaService.mensajeExito('¡Éxito!', 'Datos actualizados correctamente');
  }

  deleteEmpresa(business: Empresa) {
    this.empresaDoc = this.afs.doc(`empresa/${business._id}`);
    this.empresaDoc.delete();
    this.alertaService.mensajeExito('¡Éxito!', 'Empresa eliminada correctamente');
  }

}
