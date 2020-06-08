import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Metrica } from '../../../../../shared/models/cuestionario';
import { Component, Inject, Optional } from '@angular/core';
import { MetricasService } from '../../../../services/cuestionario/metricas/metricas.service';

@Component({
  selector: 'app-dialog-form-respuesta',
  templateUrl: './dialog-form-respuesta.component.html',
  styles: [
    `
    .dialog-actions button{
      margin: 7px;
      display: flex;
    }
    `
  ]
})
export class DialogFormRespuestaComponent {

  metricas: Metrica[] = [];
  dataForm: FormGroup;
  action: string;
  local_data: any;

  constructor(
    public dialogRef: MatDialogRef<DialogFormRespuestaComponent>,
    public metricasService: MetricasService,
    public _formBuilder: FormBuilder,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    // Carga los metricas
    this.metricasService.getMetricasDB().subscribe(metricas => {
      this.metricas = metricas;
    });
    // Agrega el objeto a un objeto local
    this.local_data = data.obj;

    // Separa la accion del objeto (Agregar, actualizar o borrar)
    this.action = data.action;

    this.dataForm = this.buildForm();
  }


  doAction() {
    // Manda el tipo de accion que se hizo (Agregar, Actualizar o Borrar) y los datos del formulario y el id
    this.dialogRef.close({ event: this.action, data: this.dataForm.value, id: this.local_data.id });
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancelar' });
  }

  buildForm(): FormGroup {
    return this._formBuilder.group({
      idMetrica: [' ', Validators.required],
      opcion: [this.local_data.opcion, Validators.required],
      peso: [this.local_data.peso, Validators.required],
    });
  }
}
