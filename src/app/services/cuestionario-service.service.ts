import { Injectable } from '@angular/core';
// Firebase
import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { AlertsService } from './alerts.service';

import { Observable, of } from 'rxjs';

//Model
import {
  Cuestionario,
  Recomendacion,
  Respuesta,
  Categoria,
  Metrica
} from './../models/cuestionario';
import { Reporte } from './../models/reporte';


@Injectable({
  providedIn: 'root'
})
export class CuestionarioServiceService {

  public cuestionario: Observable<Cuestionario>;
  public recomendacion: Observable<Recomendacion>;
  public respuesta: Observable<Respuesta>;
  public categoria: Observable<Categoria>;
  public metrica: Observable<Metrica>;
  public reporte: Observable<Reporte>;


  constructor(
    private fFirestore: AngularFirestore,
    private alerta: AlertsService,
  ) { }
}
