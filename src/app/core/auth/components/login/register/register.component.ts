import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

// Models
import { Sector_Industrial } from 'app/shared/models/sector_industrial';
import { Provincia } from 'app/shared/models/provincia';
import { Canton } from 'app/shared/models/canton';
import { Pais } from 'app/shared/models/pais';

// Servicios
import { AuthService } from 'app/core/auth/service/auth.service';
import { SectorIndustrialService } from 'app/core/services/user/sectorIndustrial/sector-industrial.service';
import { PaisService } from 'app/core/services/user/pais/pais.service';
import { ProvinciaService } from 'app/core/services/user/provincia/provincia.service';
import { CantonService } from 'app/core/services/user/canton/canton.service';



@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registroForm: FormGroup;

  /* Formulario sexo */
  sexo: string[] = [
    'Hombre',
    'Mujer'
  ];

  areas: string[] = [
    'Local',
    'Nacional',
    'Internacional'
  ];

  empresas: string[] = [
    'Microempresa (menos de 10 personas)',
    'Pequeña empresa (entre 10 y 50 personas)',
    'Mediana empresa (entre 50 y 250)',
    'Gran empresa (más de 250 personas)'
  ];

  sectoresInds: Sector_Industrial[] = [];
  provincias: Provincia[] = [];
  cantones: Canton[] = [];
  paises: Pais[] = [];

  // Mensajes de validacion de inputs en tiempo real.
  account_validation_messages = {
    'correo': [
      { type: 'required', message: 'El email es requerido' },
      { type: 'email', message: 'Ingrese un email válido' }
    ],
    'confirm_password': [
      { type: 'required', message: 'Confirm password is required' },
      { type: 'areEqual', message: 'Password mismatch' }
    ],
    'clave': [
      { type: 'required', message: 'La contraseña es requerida' },
    ]
  }


  constructor(
    private formbuild: FormBuilder,
    // Services
    private authService: AuthService,
    private sectorIService: SectorIndustrialService,
    private paisService: PaisService,
    private provinciaService: ProvinciaService,
    private cantonService: CantonService,
  ) { }

  ngOnInit(): void {
    this.registroForm = this.registerBuildForm();
    this.cargarServicios();

  }

  cargarServicios() {
    // Carga sectores industriales
    this.sectorIService.getSectoresIndustrialesDB().subscribe(sectoresInds => {
      this.sectoresInds = sectoresInds;
    });
    // Carga paises
    this.paisService.getPaisesDB().subscribe(paises => {
      this.paises = paises;
    });

    // Carga provincias segun pais
    this.registroForm.get('idPais').valueChanges.subscribe(idPais => {
      this.provinciaService.getProvincias_PaisDB(idPais).subscribe(provincias => {
        this.provincias = provincias;
      });
    })

    // Carga canton segun provincia
    this.registroForm.get('idProvincia').valueChanges.subscribe(idProvincia => {
      this.cantonService.getCantones_ProvinciasDB(idProvincia).subscribe(cantones => {
        this.cantones = cantones;
      });
    });
  }

  /* Validador de formulario */
  registerBuildForm() {
    return this.formbuild.group({
      // User
      nombres: ['', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,100}")]],
      apellidos: ['', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,100}")]],
      cedula: ['', [Validators.required, this.validarCedula()]],
      telefono: ['', [Validators.pattern("^[0-9]*$"), Validators.maxLength(10)]],
      sexo: [''],
      correo: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]],
      cargo: ['', Validators.required],
      // Empresa
      razon_social: ['', Validators.required],
      anio_creacion: ['', Validators.required],
      area_alcance: ['', Validators.required],
      franquicias: [''],
      direccion: ['', Validators.required],
      tamanio_empresa: ['', Validators.required],
      idPais: ['', Validators.required],
      idProvincia: ['', Validators.required],
      idCanton: ['', Validators.required],
      idSectorInd: ['', Validators.required]
    });
  }

  /* Registro usuario */
  registrarCuenta() {
    this.authService.registrarCuenta(this.registroForm.value)
  }

  // Algoritmo validador de cedulas de Ecuador
  validarCedula(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {

      let validador;
      let cedulaCorrecta = false;
      if (control.value.trim().length == 10) {
        let tercerDigito = parseInt(control.value.trim().substring(2, 3));
        if (tercerDigito < 6) {
          // El ultimo digito se lo considera dígito verificador
          let coefValCedula = [2, 1, 2, 1, 2, 1, 2, 1, 2];
          let verificador = parseInt(control.value.trim().substring(9, 10));
          let suma: number = 0;
          let digito: number = 0;
          for (let i = 0; i < (control.value.trim().length - 1); i++) {
            digito = parseInt(control.value.trim().substring(i, i + 1)) * coefValCedula[i];
            suma += ((parseInt((digito % 10) + '') + (parseInt((digito / 10) + ''))));
          }
          suma = Math.round(suma);
          if ((Math.round(suma % 10) == 0) && (Math.round(suma % 10) == verificador)) {
            cedulaCorrecta = true;
          } else if ((10 - (Math.round(suma % 10))) == verificador) {
            cedulaCorrecta = true;
          } else {
            cedulaCorrecta = false;
          }
        } else {
          cedulaCorrecta = false;
        }
      } else {
        cedulaCorrecta = false;
      }
      validador = cedulaCorrecta;

      if (!validador) {
        return { 'CedulaValida': true };
      } else {
        return null;
      }
    }
  }



}
