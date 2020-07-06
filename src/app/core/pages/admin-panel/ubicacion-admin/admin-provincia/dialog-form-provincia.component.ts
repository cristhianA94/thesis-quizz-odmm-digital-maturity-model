import { Component, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Pais } from 'app/shared/models/pais';
import { PaisService } from 'app/core/services/user/pais/pais.service';

@Component({
  selector: 'app-dialog-form-provincia',
  templateUrl: './dialog-form-provincia.component.html',
  styles: [
    `
    .dialog-actions button{
      margin: 7px;
      display: flex;
    }
    `
  ]
})
export class DialogFormProvinciaComponent {

  paises: Pais[] = [];
  dataForm: FormGroup;
  action: string;
  local_data: any;

  constructor(
    public dialogRef: MatDialogRef<DialogFormProvinciaComponent>,
    public paisService: PaisService,
    public _formBuilder: FormBuilder,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    // Carga los paises
    this.paisService.getPaisesDB().subscribe(paises => {
      this.paises = paises;
    });
    // Agrega el objeto a un objeto local
    this.local_data = data.obj;
    // Separa la accion del objeto (Agregar, actualizar o borrar)
    this.action = data.action;

    this.dataForm = this.buildForm();
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
    this.dialogRef.close({ event: 'Cancelar' });
  }

  buildForm(): FormGroup {
    return this._formBuilder.group({
      nombre: [this.local_data.nombre, Validators.required],
      idPais: [null]
    });
  }
}
