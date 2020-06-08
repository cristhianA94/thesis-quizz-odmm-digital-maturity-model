import { Component, OnInit, ViewChild } from "@angular/core";
import { Subcategoria } from "../../../../../shared/models/cuestionario";
import { MatAccordion } from "@angular/material/expansion";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";

import { CategoriasService } from "../../../../services/cuestionario/categorias/categorias.service";
import { SubcategoriasService } from "../../../../services/cuestionario/subcategorias/subcategorias.service";
import { DialogFormLoadDataComponent } from "../dialog-form/dialog-form-loadData.component";

//Libreria para leer CSV
import { NgxCsvParser } from 'ngx-csv-parser';
import { NgxCSVParserError } from 'ngx-csv-parser';

@Component({
  selector: "app-subcategoria",
  templateUrl: "./subcategoria.component.html",
  styleUrls: ["./subcategoria.component.css"],
})
export class SubcategoriaComponent implements OnInit {

  csvRecords: any[] = [];
  header = true;

  @ViewChild(MatAccordion) subcategoriasItems: MatAccordion;

  subcategorias: Subcategoria[] = [];
  subcategorias2: Subcategoria[] = [];
  subcategoria: Subcategoria;

  displayedColumns: string[] = [
    "Nombre",
    "Descripción",
    "Peso",
    "Categoría",
    " ",
  ];

  dataSource = new MatTableDataSource<Subcategoria>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public categoriaService: CategoriasService,
    public subcategoriasService: SubcategoriasService,
    public dialog: MatDialog,
    private ngxCsvParser: NgxCsvParser
  ) { }

  ngOnInit(): void {
    this.cargarData();
  }

  cargarData() {
    this.subcategoriasService
      .getSubcategoriasDB()
      .subscribe((subcategorias) => {
        // Recorre cada subcategoria
        subcategorias.forEach((element) => {
          // Busca la categoria segun el idCategoria
          this.categoriaService
            .getCategoriaDB(element.idCategoria)
            .subscribe((categoria) => {
              const subCategoriaObj: Subcategoria = {
                id: element.id,
                nombre: element.nombre,
                descripcion: element.descripcion,
                peso: element.peso,
                idCategoria: element.idCategoria,
                nombreCategoria: categoria.nombre,
              };

              this.subcategorias.push(subCategoriaObj);
              this.dataSource.data = this.subcategorias;
            });
          // Agrega los datos a la tabla
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        });
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


  /* CSV */
  @ViewChild('fileImportInput', { static: false }) fileImportInput: any;

  // Your applications input change listener for the CSV File
  fileChangeListener($event: any): void {

    // Select the files from the event
    const files = $event.srcElement.files;

    // Parse the file you want to select for the operation along with the configuration
    this.ngxCsvParser.parse(files[0], { header: this.header, delimiter: ';' })
      .pipe().subscribe((result: Array<any>) => {

        //console.log('Result', result);
        this.subcategorias2 = result;
        this.pasarData(this.subcategorias2);
      }, (error: NgxCSVParserError) => {
        console.log('Error', error);
      });

  }

  pasarData(data: any) {
    this.subcategorias2.forEach(element => {
      this.subcategoriasService.createSubcategoriaDB(element as Subcategoria)
    });
    //this.subcategoriasService.inserting(this.subcategorias2);

  }
}
