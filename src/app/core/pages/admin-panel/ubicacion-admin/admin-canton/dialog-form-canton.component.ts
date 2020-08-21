import { Component, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Provincia } from 'app/shared/models/provincia';
import { ProvinciaService } from 'app/core/services/user/provincia/provincia.service';

@Component({
  selector: 'app-dialog-form-provincia',
  templateUrl: './dialog-form-canton.component.html',
  styles: [
    `
    .dialog-actions button{
      margin: 7px;
      display: flex;
    }
    `
  ]
})
export class DialogFormCantonComponent {

  provincias: Provincia[] = [];
  dataForm: FormGroup;
  action: string;
  local_data: any;

  constructor(
    public dialogRef: MatDialogRef<DialogFormCantonComponent>,
    public provinciaService: ProvinciaService,
    public _formBuilder: FormBuilder,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    // Carga los provincias
    this.provinciaService.getProvinciasDB().subscribe(provincias => {
      this.provincias = provincias;
    });

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
      idProvincia: [this.local_data.idProvincia]
    });
  }
}
