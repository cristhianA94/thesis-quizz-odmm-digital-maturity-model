import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatAccordion } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';

import { DialogFormCategoriaComponent } from './dialog-form-categoria.component';
import { Categoria } from 'app/shared/models/categoria';
import { CategoriasService } from 'app/core/services/cuestionario/categorias/categorias.service';
import { SubcategoriasService } from 'app/core/services/cuestionario/subcategorias/subcategorias.service';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css'],
})
export class CategoriaComponent implements OnInit {

  @ViewChild(MatAccordion) paisesItems: MatAccordion;

  categorias: Categoria[] = [];
  categoria: Categoria;

  contieneSubcategorias: boolean = false;

  displayedColumns: string[] = ['Nombre', 'Descripción', 'Peso', ' '];

  dataSource = new MatTableDataSource<Categoria>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(
    public categoriaService: CategoriasService,
    public subcategoriaService: SubcategoriasService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.categoriaService.getCategoriasDB().subscribe(categorias => {
      this.categorias = categorias;
      this.dataSource.data = categorias as Categoria[];
    })

  }

  // Table
  buscarCategoria(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onRowClicked(row: any) {
    //this.categoria = row;
    //console.log('Row clicked: ', this.categoria);
  }

  openDialog(action: string, obj: any) {
    // Agregar la accion al objeto para mostrarla en el dialog
    const dialogRef = this.dialog.open(DialogFormCategoriaComponent, {
      width: '450px',
      data: {
        obj,
        action: action
      }
    });

    // Despues de cerrar el dialog
    dialogRef.afterClosed().subscribe(result => {
      // Si esta vacion no retorna nada
      if (!result) {
        return;
      }

      this.categoria = result.data;
      if (result.id) {
        this.categoria.id = result.id;
      }

      if (result.event == "Agregar") {
        this.crearCategoria(this.categoria);
      } else if (result.event == "Actualizar") {
        this.actualizarCategoria(this.categoria);
      } else if (result.event == "Eliminar") {
        this.comprobarSubcategorias(this.categoria);
        // this.borrarCategoria(this.categoria);
      }

    });
  }

  crearCategoria(categoria: Categoria) {
    this.categoriaService.crearCategoriaDB(categoria);
  }

  actualizarCategoria(categoria: Categoria) {
    this.categoriaService.actualizarCategoriaDB(categoria);
  }

  comprobarSubcategorias(categoria: Categoria) {

    this.subcategoriaService.checkSubcategorias(categoria.id).subscribe((res) => {
      if (res.length != 0) {
        this.contieneSubcategorias = true;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'La categoría que desea eliminar cuenta con subcategorías asociadas.',
        });
      } else {
        this.borrarCategoria(categoria);
      }
    });
  }

  borrarCategoria(categoria: Categoria) {
    this.categoriaService.deleteCategoriaDB(categoria);
  }

}
