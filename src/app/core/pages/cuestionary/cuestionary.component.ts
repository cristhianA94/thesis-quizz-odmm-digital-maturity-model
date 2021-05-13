import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { Categoria } from 'app/shared/models/categoria';

// Services
import { CategoriasService } from 'app/core/services/cuestionario/categorias/categorias.service';
import { CuestionarioService } from 'app/core/services/cuestionario/cuestionario.service';

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
      // Obtiene los cuestionarios que no contesta aun
      this.cuestionarioServices.getCuestionarioDiaUserLogedDB().subscribe(cuestionarios => {
        // Agrupa por ids los cuestionarios obtenidos del mismo dia
        var idsCategorias = keyBy(cuestionarios, (o) => { return o.categoria.id });
        // Elimina del array las categorias que ya ha evaluado hoy
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

  realizarCuestionario(categoria: Categoria) {
    this.select = true;
    this.router.navigate(['categoria/', categoria.id]);
  }


}
