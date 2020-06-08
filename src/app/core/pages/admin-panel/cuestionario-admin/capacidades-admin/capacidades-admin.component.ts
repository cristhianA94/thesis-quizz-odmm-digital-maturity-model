import { Component, OnInit, ViewChild } from "@angular/core";
import { MatAccordion } from "@angular/material/expansion";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";

import { Capacidad } from "../../../../../shared/models/cuestionario";
import { CapacidadesService } from "../../../../services/cuestionario/capacidades/capacidades.service";
import { DialogFormLoadDataComponent } from "../dialog-form/dialog-form-loadData.component";
import { SubcategoriasService } from "app/core/services/cuestionario/subcategorias/subcategorias.service";

@Component({
  selector: "app-capacidades-admin",
  templateUrl: "./capacidades-admin.component.html",
  styleUrls: ["./capacidades-admin.component.css"],
})
export class CapacidadesAdminComponent implements OnInit {
  @ViewChild(MatAccordion) capacidadesItems: MatAccordion;

  capacidades: Capacidad[] = [];
  capacidad: Capacidad;

  displayedColumns: string[] = ["Nombre", "Descripción", "Peso", "Subcategoría", " "];

  dataSource = new MatTableDataSource<Capacidad>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public capacidadesService: CapacidadesService,
    public subcategoriasService: SubcategoriasService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.capacidadesService.getCapacidadesDB().subscribe((capacidades) => {
      // Recorre cada subcategoria
      capacidades.forEach((element) => {
        // Busca la categoria segun el idCategoria
        this.subcategoriasService
          .getSubcategoriaDB(element.idSubcategoria)
          .subscribe((subcategoria) => {
            const capacidadObj: Capacidad = {
              id: element.id,
              nombre: element.nombre,
              descripcion: element.descripcion,
              peso: element.peso,
              idSubcategoria: element.idSubcategoria,
              nombreSubcategoria: subcategoria.nombre,
            };

            this.capacidades.push(capacidadObj);
            this.dataSource.data = this.capacidades;
          });
        // Agrega los datos a la tabla
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
      
    });

  }

  // Table
  buscarCapacidad(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  onRowClicked(row: any) {
    //this.capacidad = row;
    //console.log('Row clicked: ', this.capacidades);
  }

  openDialog(action: string, obj: any, tipo: string) {
    // Agregar la accion al objeto para mostrarla en el dialog
    const dialogRef = this.dialog.open(DialogFormLoadDataComponent, {
      width: "450px",
      data: {
        obj,
        action: action,
        tipo: tipo,
      },
    });

    // Despues de cerrar el dialog
    dialogRef.afterClosed().subscribe((result) => {
      // Si esta vacion no retorna nada
      if (!result) {
        return;
      }

      this.capacidad = result.data;
      // Si NO es nuevo se le agrega el id
      if (result.id) {
        this.capacidad.id = result.id;
      }

      if (result.event == "Agregar") {
        this.createCapacidad(this.capacidad);
      } else if (result.event == "Actualizar") {
        this.updateCapacidad(this.capacidad);
      } else if (result.event == "Borrar") {
        this.deleteCapacidad(this.capacidad);
      }

      this.capacidades = [];
    });
  }

  createCapacidad(obj: any) {
    const CapacidadNew: Capacidad = {
      nombre: obj.nombre,
      descripcion: obj.descripcion,
      peso: obj.peso,
      idSubcategoria: obj.idRelacion,
    };
    this.capacidadesService.createCapacidadDB(CapacidadNew);
  }

  updateCapacidad(obj: any) {
    const CapacidadEdit: Capacidad = {
      id: obj.id,
      nombre: obj.nombre,
      descripcion: obj.descripcion,
      peso: obj.peso,
      idSubcategoria: obj.idRelacion,
    };
    this.capacidadesService.updateCapacidadDB(CapacidadEdit);
  }

  deleteCapacidad(capacidad: any) {
    this.capacidadesService.deleteCapacidadDB(capacidad.id);
  }
}
