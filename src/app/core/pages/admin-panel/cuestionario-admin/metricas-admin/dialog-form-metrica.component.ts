import { Component, Inject, Optional } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";

import { CapacidadesService } from "app/core/services/cuestionario/capacidades/capacidades.service";
import { Capacidad } from 'app/shared/models/capacidad';

@Component({
  selector: "app-dialog-form-metrica",
  templateUrl: "./dialog-form-metrica.component.html",
  styles: [
    `
      .dialog-actions button {
        margin: 7px;
        display: flex;
      }
    `,
  ],
})
export class DialogFormMetricaComponent {
  capacidades: Capacidad[] = [];
  dataForm: FormGroup;
  action: string;
  local_data: any;
  pesos = [0, 2, 4, 6, 8, 10];

  constructor(
    public dialogRef: MatDialogRef<DialogFormMetricaComponent>,
    public capacidadesService: CapacidadesService,
    public fb: FormBuilder,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Carga los capacidades
    this.capacidadesService.getCapacidadesDB().subscribe((capacidades) => {
      this.capacidades = capacidades;
    });
    // Agrega el objeto a un objeto local
    this.local_data = data.obj;

    // Separa la accion del objeto (Agregar, actualizar o borrar)
    this.action = data.action;

    this.dataForm = this.buildForm();
  }

  get respuestas() {
    return this.dataForm.get("respuestas") as FormArray;
  }

  borrarRespuesta(i: number) {
    this.respuestas.removeAt(i);
  }

  doAction() {
    // Manda el tipo de accion que se hizo (Agregar, Actualizar o Borrar) y los datos del formulario y el id
    this.dialogRef.close({
      event: this.action,
      data: this.dataForm.value,
      id: this.local_data.id
    });
  }

  closeDialog() {
    this.dialogRef.close({ event: "Cancelar" });
  }

  addRespuesta() {
    this.respuestas.push(
      this.fb.group({
        opcion: ['', Validators.required],
        pesoRespuesta: ['', Validators.required],
        recomendacion: ['', Validators.required],
      })
    );
  }

  buildForm(): FormGroup {
    return this.fb.group({
      idCapacidad: ['', Validators.required],
      nombre: [this.local_data.nombre, Validators.required],
      pregunta: [this.local_data.pregunta, Validators.required],
      pesoPregunta: [this.local_data.pesoPregunta, Validators.required],
      respuestas: this.fb.array([]),
    });
  }
}
