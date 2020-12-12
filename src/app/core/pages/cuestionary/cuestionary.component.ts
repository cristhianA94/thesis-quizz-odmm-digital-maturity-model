import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

// Services
import { CategoriasService } from 'app/core/services/cuestionario/categorias/categorias.service';
import { CuestionarioService } from 'app/core/services/cuestionario/cuestionario.service';
import { Categoria } from 'app/shared/models/categoria';
import { Cuestionario } from 'app/shared/models/cuestionario';

import { keyBy, filter } from 'lodash';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cuestionary',
  templateUrl: './cuestionary.component.html',
  styleUrls: ['./cuestionary.component.css'],
  // Permite editar estilos componente mat
  encapsulation: ViewEncapsulation.None

})
export class CuestionaryComponent implements OnInit {

  categorias: Categoria[] = [];
  categoriasEvaluadas: any[] = [];
  cuestionarios: Cuestionario[] = [];
  load: boolean = false;
  select: boolean = false;
  evaluada: boolean = false;

  constructor(
    private router: Router,
    private categoriasServices: CategoriasService,
    private cuestionarioServices: CuestionarioService,
  ) {
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriasServices.getCategoriasDB().subscribe(categorias => {
      this.cuestionarioServices.getCuestionarioDiaUserLogedDB().subscribe(cuestionarios => {
        // Ids categorias del mismo dia
        var idsCategorias = keyBy(cuestionarios, (o) => { return o.categoria.id });
        // Filtro que contiene idCategorias diferentes a categorias
        this.categorias = filter(categorias, (u) => {
          return idsCategorias[u.id] === undefined;
        });

        if (this.categorias.length === 0) {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: '¡Excelente! Ha contestado todas las categorías.',
            text: 'Vaya a la sección de "Reportes" para ver sus resultados.',
            showConfirmButton: true,
          })
        };

        this.load = true;
      });
    });
  }

  realizarEncuesta(categoria: Categoria) {
    this.select = true;
    this.router.navigate(['dimension/', categoria.id]);
  }


}
