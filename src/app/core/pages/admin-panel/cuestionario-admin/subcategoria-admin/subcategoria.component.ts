import { Component, OnInit, ViewChild } from "@angular/core";
import { MatAccordion } from "@angular/material/expansion";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";

import { MatDialog } from "@angular/material/dialog";
import { DialogFormLoadDataComponent } from '../dialog-form/dialog-form-loadData.component';

import { CategoriasService } from 'app/core/services/cuestionario/categorias/categorias.service';
import { SubcategoriasService } from 'app/core/services/cuestionario/subcategorias/subcategorias.service';
import { Subcategoria } from 'app/shared/models/subcategoria';



@Component({
  selector: "app-subcategoria",
  templateUrl: "./subcategoria.component.html",
  styleUrls: ["./subcategoria.component.css"],
})
export class SubcategoriaComponent implements OnInit {

  @ViewChild(MatAccordion) subcategoriasItems: MatAccordion;

  subcategorias: Subcategoria[] = [];
  subcategoria: Subcategoria;

  displayedColumns: string[] = [
    "Nombre",
    "Descripción",
    "Peso",
    "Categoría",
    " ",
  ];

  dataSource = new MatTableDataSource<Subcategoria>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public categoriaService: CategoriasService,
    public subcategoriasService: SubcategoriasService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.cargarData();
  }

  cargarData() {
    this.subcategoriasService.getSubcategoriasDB().subscribe((subcategorias) => {
      this.dataSource.data = subcategorias;
    });
  }

  // Table
  buscarSubcategoria(event: Event) {
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
    //this.subcategoria = row;
    console.log("Row clicked: ", row);
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

      this.subcategoria = result.data;
      // Si NO es nuevo se le agrega el id
      if (result.id) {
        this.subcategoria.id = result.id;
      }

      if (result.event == "Agregar") {
        this.createSubcategoria(this.subcategoria);
      } else if (result.event == "Actualizar") {
        this.updateSubcategoria(this.subcategoria);
      } else if (result.event == "Borrar") {
        this.deleteSubcategoria(this.subcategoria);
      }

      this.subcategorias = [];
    });
  }

  createSubcategoria(obj: any) {

    const subCategoriaNew: Subcategoria = {
      nombre: obj.nombre,
      descripcion: obj.descripcion,
      peso: obj.peso,
      idCategoria: obj.idRelacion,
    };
    this.subcategoriasService.createSubcategoriaDB(subCategoriaNew);
  }

  updateSubcategoria(obj: any) {
    const subCategoriaEdit: Subcategoria = {
      id: obj.id,
      nombre: obj.nombre,
      descripcion: obj.descripcion,
      peso: obj.peso,
      idCategoria: obj.idRelacion,
    };
    this.subcategoriasService.updateSubcategoriaDB(subCategoriaEdit);
  }

  deleteSubcategoria(subcategoria: any) {
    this.subcategoriasService.deleteSubcategoriaDB(subcategoria.id);
  }

}
