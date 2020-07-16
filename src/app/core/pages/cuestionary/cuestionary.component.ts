import { Component, OnInit, ViewEncapsulation } from '@angular/core';

// Services
import { CategoriasService } from '../../services/cuestionario/categorias/categorias.service';

import { Router } from '@angular/router';
import { Categoria } from 'app/shared/models/categoria';

@Component({
  selector: 'app-cuestionary',
  templateUrl: './cuestionary.component.html',
  styleUrls: ['./cuestionary.component.css'],
  // Permite editar estilos componente mat
  encapsulation: ViewEncapsulation.None

})
export class CuestionaryComponent implements OnInit {

  categorias: Categoria[];
  load: boolean = false;
  select: boolean = false;

  constructor(
    private router: Router,
    private categoriasServices: CategoriasService,
  ) {
    //console.log(this.router.data);
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriasServices.getCategoriasDB().subscribe(categorias => {
      this.categorias = categorias;
      this.load = true;
    });
  }

  realizarEncuesta(categoria: Categoria) {
    this.select = true;
    this.router.navigate(['dimension/', categoria.id]);
  }



}
