import { Component, Inject, Optional, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { CategoriasService } from 'app/core/services/cuestionario/categorias/categorias.service';
import { SubcategoriasService } from 'app/core/services/cuestionario/subcategorias/subcategorias.service';
import { CapacidadesService } from 'app/core/services/cuestionario/capacidades/capacidades.service';



@Component({
  selector: 'app-dialog-form-loadData',
  templateUrl: './dialog-form-loadData.component.html',
  styles: [
    `
    .dialog-actions button{
      margin: 7px;
      display: flex;
    }
    `
  ]
})
export class DialogFormLoadDataComponent {

  dataForm: FormGroup;
  action: string;
  tipo: string;
  local_data: any;
  local_data_load: any;
  selectedValue: any;

  constructor(
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogFormLoadDataComponent>,
    public categoriasService: CategoriasService,
    public subcategoriasService: SubcategoriasService,
    public capacidadesService: CapacidadesService,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    // Carga los categorias
    this.cargarData();
  }

  cargarData() {

    // Agrega el objeto a un objeto local
    this.local_data = this.data.obj;
    // Separa la accion del objeto (Agregar, actualizar o borrar)
    this.action = this.data.action;
    // Asigna los datos a cargar en el <select> dependiendo del componente que se lo llame
    this.tipo = this.data.tipo;

    switch (this.tipo) {
      case 'Subcategoria':
        this.categoriasService.getCategoriasDB().subscribe(categorias => {
          this.local_data_load = categorias;
        });
        // Construye el formulario
        this.dataForm = this.buildForm();
        break;
      case 'Capacidad':
        this.subcategoriasService.getSubcategoriasDB().subscribe(subcategorias => {
          this.local_data_load = subcategorias;
        });
        // Construye el formulario
        this.dataForm = this.buildForm();
        break;
      default:
        break;
    }
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
    return this.fb.group({
      idRelacion: [' ', Validators.required],
      nombre: [this.local_data.nombre, Validators.required],
      descripcion: [this.local_data.descripcion, Validators.required],
      peso: [this.local_data.peso, Validators.required],
    });
  }
}
