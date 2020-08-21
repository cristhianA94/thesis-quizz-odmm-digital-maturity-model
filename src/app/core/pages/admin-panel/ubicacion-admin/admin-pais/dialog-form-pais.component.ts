import { Component, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-dialog-form-pais',
  templateUrl: './dialog-form-pais.component.html',
  styles: [
    `
    .dialog-actions button{
      margin: 7px;
      display: flex;
    }
    `
  ]
})
export class DialogFormPaisComponent {

  dataForm: FormGroup;
  action: string;
  local_data: any;

  constructor(
    public dialogRef: MatDialogRef<DialogFormPaisComponent>,
    private _formBuilder: FormBuilder,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {

    // Agrega el objeto a un objeto local
    this.local_data = data.obj;
    // Separa la accion del objeto (Agregar, actualizar o borrar)
    this.action = data.action;
    // Inicializa el formulario
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
      nombre: [this.local_data.nombre, [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,100}")]],
    });
  }
}

/* 
<mat-error *ngIf="dataForm.controls['nombre'].hasError('required')">El nombre es requerido.
        </mat-error>
        <mat-error *ngIf="dataForm.controls['nombre'].hasError('pattern')">Solo se admiten caracteres.
        </mat-error>

*/
