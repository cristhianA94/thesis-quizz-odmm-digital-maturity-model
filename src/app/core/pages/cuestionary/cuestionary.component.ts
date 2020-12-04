import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

// Services
import { CategoriasService } from 'app/core/services/cuestionario/categorias/categorias.service';
import { Categoria } from 'app/shared/models/categoria';
import { CuestionarioService } from '../../services/cuestionario/cuestionario.service';
import { Cuestionario } from '../../../shared/models/cuestionario';

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

      this.categorias = categorias;
      categorias.forEach((cate: Categoria) => {
        // Comprueba si ya evaluo alguna categoria
        this.categoriasEvaluadas = this.comprobarCatEvaluada(cate);
        //console.log(this.categorias);

      });
      console.log(this.categoriasEvaluadas);
      console.log(this.categorias);
    });
  }

  comprobarCatEvaluada(categoria: Categoria):any {
    this.cuestionarioServices.getCuestionarioUserLogedDB().subscribe((respuestasUser: Cuestionario[]) => {

      respuestasUser.forEach((cuestionario: Cuestionario) => {
        let fechaIngreso = localStorage.getItem('fechaIngreso');
        // Extrae el dia ingreso
        let diaIngreso = fechaIngreso.split('/')[0];
        let diaCatEvaluada = cuestionario.fecha.split('/')[0] || 1;

        if (categoria.nombre == cuestionario.categoria) {
          //this.categorias.push(categoria);
          //console.log(this.categorias);
          return this.categoriasEvaluadas;
          /* // Sino coincide no las muestra
          if (diaIngreso != diaCatEvaluada) {
            //this.categorias.push(categoria);
            return null;
          } else {
            return categoria;
          } */
        }
        /* else{
          this.categorias.push(categoria);
          var arrTem: any = [...new Set(this.categorias)];
          return arrTem;
          
        } */
        // console.log(`Dia ingreso: ${diaIngreso} / Dia Categoria: ${diaCatEvaluada}`);
      });

    });

    this.load = true;
  }


  realizarEncuesta(categoria: Categoria) {
    this.select = true;
    this.router.navigate(['dimension/', categoria.id]);
  }


}
