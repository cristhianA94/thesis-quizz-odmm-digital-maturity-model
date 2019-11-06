import {
  Component, OnInit, OnDestroy, HostListener,
  ChangeDetectionStrategy, ViewEncapsulation
} from "@angular/core";
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

/* Firebase */
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { AuthService } from 'src/app/services/auth.service';
import { AlertsService } from 'src/app/services/alerts.service';

/* Interfaces */
import { Empresa } from '../../../models/empresa';
import { Usuario } from '../../../models/usuario';
import { Sector_Industrial } from './../../../models/sector_industrial';


/* Interfaces */
export interface Tamanio_Empresa {
  tipo_empresa: string;
  view: string;
}


@Component({
  selector: "app-registerpage",
  templateUrl: "registerpage.component.html",
  /* Password-strength */
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterpageComponent implements OnInit, OnDestroy {

  constructor(
    public afAuth: AngularFireAuth,
    private router: Router,
    // servicio creado donde esta la logia de autenticacion
    private authService: AuthService,
    private formbuild: FormBuilder,
    //Alertas tras login
    private alerta: AlertsService,
  ) { }

  isCollapsed = true;
  passReset: boolean = false;
  correoReset: string;
  showDetails: boolean;

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  /* Forms */
  loginForm: FormGroup;
  registroForm: FormGroup;

  /* Formulario sexo */
  required: boolean;
  sexo: string;
  genero: string[] = [
    'Hombre',
    'Mujer'
  ];


  sector_industrial: string;
  sectores: Sector_Industrial[] = [
    { nombre: 'Actividades financieras y de seguros' },
    { nombre: 'Actividades inmobiliarias' },
    { nombre: 'Actividades profesionales, científicas y técnicas' },
    { nombre: 'Actividades administrativas y servicios auxliares' },
    { nombre: 'Actividades sanitarias y de servicios sociales' },
    { nombre: 'Actividades artísticas, recreativas y de entretenimiento' },
    { nombre: 'Actividades de los hogares como empleadores de personal doméstico' },
    { nombre: 'Actividades de los hogares como productores de bienes y servicios para uso propio' },
    { nombre: 'Actividades de organizaciones y organismos extraterritoriales' },
    { nombre: 'Administración Pública y defensa' },
    { nombre: 'Agricultura, ganadería, silvicultura y pesca' },
    { nombre: 'Comercio al por mayor y al por menor' },
    { nombre: 'Construcción' },
    { nombre: 'Educación' },
    { nombre: 'Hostelería' },
    { nombre: 'Industrias extractivas' },
    { nombre: 'Industria manufacturera' },
    { nombre: 'Información y comunicaciones' },
    { nombre: 'Otros servicios' },
    { nombre: 'Reparación de vehículos de motor y motocicletas' },
    { nombre: 'Seguridad Social obligatoria' },
    { nombre: 'Suministro de energía eléctrica, gas, vapor y aire acondicionado' },
    { nombre: 'Suministro de agua, actividades de saneamiento, gestión de residuos y descontaminación' },
    { nombre: 'Transporte y almacenamiento' }
  ];

  area_alcance: string;
  areas: string[] = [
    'Local',
    'Nacional',
    'Internacional'
  ];

  tamanio_empresa: string;
  empresas: string[] = [
    'Microempresa (menos de 10 personas)',
    'Pequeña empresa (entre 10 y 50 personas)',
    'Mediana empresa (entre 50 y 250)',
    'Gran empresa (más de 250 personas)'
  ];

  provincia: string;
  provincias: string[] = [
    'Azuay',
    'Antártida Ecuatoriana',
    'Bolívar',
    'Cañar',
    'Carchi',
    'Chimborazo',
    'Cotopaxi',
    'El Oro',
    'Esmeraldas',
    'Galápagos',
    'Guayas',
    'Imbabura',
    'Loja',
    'Los Ríos',
    'Manabí',
    'Morona Santiago',
    'Napo',
    'Orellana',
    'Pastaza',
    'Pichincha',
    'Santa Elena',
    'Sto. Domingo de los Tsachilas',
    'Sucumbíos',
    'Tungurahua',
    'Zamora Chinchipe'
  ];

  canton: string;
  cantones: string[] = [
    'Calvas',
    'Catamayo',
    'Celica',
    'Chaguarpamba',
    'Espíndola',
    'Gonzanamá',
    'Loja',
    'Macará',
    'Olmedo',
    'Paltas',
    'Pindal',
    'Puyango',
    'Quilanga',
    'Saraguro',
    'Sozoranga',
    'Zapotillo'
  ];

  pais: string;
  paises: string[] = [
    'Afganistán',
    'Albania',
    'Alemania',
    'Andorra',
    'Angola',
    'Antigua y Barbuda',
    'Arabia Saudita',
    'Argelia',
    'Argentina',
    'Armenia',
    'Australia',
    'Austria',
    'Azerbaiyán',
    'Bahamas',
    'Bangladés',
    'Barbados',
    'Baréin',
    'Bélgica',
    'Belice',
    'Benín',
    'Bielorrusia',
    'Birmania',
    'Bolivia',
    'Bosnia y Herzegovina',
    'Botsuana',
    'Brasil',
    'Brunéi',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Bután',
    'Cabo Verde',
    'Camboya',
    'Camerún',
    'Canadá',
    'Catar',
    'Chad',
    'Chile',
    'China',
    'Chipre',
    'Ciudad del Vaticano',
    'Colombia',
    'Comoras',
    'Corea del Norte',
    'Corea del Sur',
    'Costa de Marfil',
    'Costa Rica',
    'Croacia',
    'Cuba',
    'Dinamarca',
    'Dominica',
    'Ecuador',
    'Egipto',
    'El Salvador',
    'Emiratos Árabes Unidos',
    'Eritrea',
    'Eslovaquia',
    'Eslovenia',
    'España',
    'Estados Unidos',
    'Estonia',
    'Etiopía',
    'Filipinas',
    'Finlandia',
    'Fiyi',
    'Francia',
    'Gabón',
    'Gambia',
    'Georgia',
    'Ghana',
    'Granada',
    'Grecia',
    'Guatemala',
    'Guyana',
    'Guinea',
    'Guinea ecuatorial',
    'Guinea-Bisáu',
    'Haití',
    'Honduras',
    'Hungría',
    'India',
    'Indonesia',
    'Irak',
    'Irán',
    'Irlanda',
    'Islandia',
    'Islas Marshall',
    'Islas Salomón',
    'Israel',
    'Italia',
    'Jamaica',
    'Japón',
    'Jordania',
    'Kazajistán',
    'Kenia',
    'Kirguistán',
    'Kiribati',
    'Kuwait',
    'Laos',
    'Lesoto',
    'Letonia',
    'Líbano',
    'Liberia',
    'Libia',
    'Liechtenstein',
    'Lituania',
    'Luxemburgo',
    'Macedonia del Norte',
    'Madagascar',
    'Malasia',
    'Malaui',
    'Maldivas',
    'Malí',
    'Malta',
    'Marruecos',
    'Mauricio',
    'Mauritania',
    'México',
    'Micronesia',
    'Moldavia',
    'Mónaco',
    'Mongolia',
    'Montenegro',
    'Mozambique',
    'Namibia',
    'Nauru',
    'Nepal',
    'Nicaragua',
    'Níger',
    'Nigeria',
    'Noruega',
    'Nueva Zelanda',
    'Omán',
    'Países Bajos',
    'Pakistán',
    'Palaos',
    'Panamá',
    'Papúa Nueva Guinea',
    'Paraguay',
    'Perú',
    'Polonia',
    'Portugal',
    'Reino Unido',
    'República Centroafricana',
    'República Checa',
    'República del Congo',
    'República Democrática del Congo',
    'República Dominicana',
    'República Sudafricana',
    'Ruanda',
    'Rumanía',
    'Rusia',
    'Samoa',
    'San Cristóbal y Nieves',
    'San Marino',
    'San Vicente y las Granadinas',
    'Santa Lucía',
    'Santo Tomé y Príncipe',
    'Senegal',
    'Serbia',
    'Seychelles',
    'Sierra Leona',
    'Singapur',
    'Siria',
    'Somalia',
    'Sri Lanka',
    'Suazilandia',
    'Sudán',
    'Sudán del Sur',
    'Suecia',
    'Suiza',
    'Surinam',
    'Tailandia',
    'Tanzania',
    'Tayikistán',
    'Timor Oriental',
    'Togo',
    'Tonga',
    'Trinidad y Tobago',
    'Túnez',
    'Turkmenistán',
    'Turquía',
    'Tuvalu',
    'Ucrania',
    'Uganda',
    'Uruguay',
    'Uzbekistán',
    'Vanuatu',
    'Venezuela',
    'Vietnam',
    'Yemen',
    'Yibuti',
    'Zambia',
    'Zimbabue'
  ];


  @HostListener("document:mousemove", ["$event"]) onMouseMove(e) {

    var squares1 = document.getElementById("square1");
    var squares2 = document.getElementById("square2");
    var squares3 = document.getElementById("square3");
    var squares4 = document.getElementById("square4");
    var squares5 = document.getElementById("square5");
    var squares6 = document.getElementById("square6");
    var squares7 = document.getElementById("square7");
    var squares8 = document.getElementById("square8");

    //Movimiento bolas fondo
    var posX = e.clientX - window.innerWidth / 2;
    var posY = e.clientY - window.innerWidth / 6;

    squares1.style.transform =
      "perspective(500px) rotateY(" +
      posX * 0.05 +
      "deg) rotateX(" +
      posY * -0.05 +
      "deg)";
    squares2.style.transform =
      "perspective(500px) rotateY(" +
      posX * 0.05 +
      "deg) rotateX(" +
      posY * -0.05 +
      "deg)";
    squares3.style.transform =
      "perspective(500px) rotateY(" +
      posX * 0.05 +
      "deg) rotateX(" +
      posY * -0.05 +
      "deg)";
    squares4.style.transform =
      "perspective(500px) rotateY(" +
      posX * 0.05 +
      "deg) rotateX(" +
      posY * -0.05 +
      "deg)";
    squares5.style.transform =
      "perspective(500px) rotateY(" +
      posX * 0.05 +
      "deg) rotateX(" +
      posY * -0.05 +
      "deg)";
    squares6.style.transform =
      "perspective(500px) rotateY(" +
      posX * 0.05 +
      "deg) rotateX(" +
      posY * -0.05 +
      "deg)";
    squares7.style.transform =
      "perspective(500px) rotateY(" +
      posX * 0.02 +
      "deg) rotateX(" +
      posY * -0.02 +
      "deg)";
    squares8.style.transform =
      "perspective(500px) rotateY(" +
      posX * 0.02 +
      "deg) rotateX(" +
      posY * -0.02 +
      "deg)";
  }

  ngOnInit() {
    var body = document.getElementsByTagName("body")[0];
    body.classList.add("register-page");
    //this.onMouseMove(event);
    this.buildForm();
  }
  ngOnDestroy() {
    var body = document.getElementsByTagName("body")[0];
    body.classList.remove("register-page");
  }

  /* Validador de formulario */
  buildForm(): void {
    /*
    Validators.pattern:
    ^ - inicio de cadena (implícito en el patrón de expresión regular de cadena)
    (?=\D*\d) - debe haber 1 dígito
    (?=[^a-z]*[a-z]) - debe haber 1 letra minúscula ASCII
    (?=[^A-Z]*[A-Z]) - debe haber 1 letra ASCII mayúscula
    .{8,30} - 8 a 30 caracteres distintos de los caracteres de salto de línea
    $ - fin de cadena (implícito en el patrón de expresión regular de cadena).
     */

    this.loginForm = this.formbuild.group({
      correo: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      clave: ['', Validators.required],
    });

    this.registroForm = this.formbuild.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      cedula: ['', Validators.required],
      telefono: new FormControl('', Validators.required),
      sexo: ['',],
      correo: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      clave: ['', Validators.required,
        //Validators.minLength(6), Validators.pattern(/^(?=\D*\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}$/)
      ],
      cargo: ['Gerente', Validators.required],
      razon_social: ['', Validators.required],
      sector_industrial: ['', Validators.required],
      tamanio_empresa: ['', Validators.required],
      anio_creacion: ['', Validators.required],
      franquicias: ['', Validators.required],
      direccion: ['', Validators.required],
      area_alcance: ['', Validators.required],
      pais: ['', Validators.required],
      provincia: ['', Validators.required],
      canton: ['', Validators.required]
    });
  }

  // Mensajes de validacion de inputs en tiempo real.
  account_validation_messages = {
    'username': [
      { type: 'required', message: 'Username is required' },
      { type: 'minlength', message: 'Username must be at least 5 characters long' },
      { type: 'maxlength', message: 'Username cannot be more than 25 characters long' },
      { type: 'pattern', message: 'Your username must contain only numbers and letters' },
      { type: 'validUsername', message: 'Your username has already been taken' }
    ],
    'correo': [
      { type: 'required', message: 'El email es requerido' },
      { type: 'pattern', message: 'Ingrese un email válido' }
    ],
    'confirm_password': [
      { type: 'required', message: 'Confirm password is required' },
      { type: 'areEqual', message: 'Password mismatch' }
    ],
    'clave': [
      { type: 'required', message: 'La contraseña es requerida' },
      { type: 'minlength', message: 'Password must be at least 5 characters long' },
      { type: 'pattern', message: 'Your password must contain at least one uppercase, one lowercase, and one number' }
    ],
    'terms': [
      { type: 'pattern', message: 'You must accept terms and conditions' }
    ]
  }

  /* Login Google */
  onLoginGoogle(): void {
    this.authService.loginGoogleUser().then((res) => {
      this.alerta.mensajeExito('¡Éxito!', 'Acceso al sistema.');
      this.onLoginRedirect();
    }).catch(err => {
      this.alerta.mensajeError('Error', err.message);
      console.log('Algo salio mal :/ :', err.message);
    });
  }

  /* Login Facebook */
  /* onLoginFacebook(): void {
    this.authService.loginFacebookUser().then((res) => {
      console.log('resUser', res);
      this.alerta.mensajeExito('¡Éxito!', 'Acceso al sistema.');
      this.onLoginRedirect();
    }).catch(err => {
      this.alerta.mensajeError('¡Error!', err.message);
      console.log('Algo salio mal :/ :', err.message);
    });
  } */

  /* Login Correo electronico */
  login() {
    this.authService.loginCorreo(this.loginForm.value).then((res) => {
      console.log('resUser', res);
      this.alerta.mensajeExito('¡Éxito!', 'Acceso al sistema.');
      this.onLoginRedirect();
    }).catch(err => {
      this.alerta.mensajeError('¡Error!', '¡Los campos ingresados son incorrectos o no existe una cuenta registrada!');
      console.log('Algo salio mal :/ :', err.message);
    });

  }
  /* Registro usuario */
  registro() {
    this.authService.registerUser(this.registroForm.value);
  }

  /* Metodo para redirigir ruta tras logeo */
  onLoginRedirect(): void {
    this.router.navigate(['home']);
  }
  /* Metodo para resetear contraseña usuario */
  resetPassword(emailReset: string) {
    this.authService.resetPassword(emailReset)
      .then(() => this.passReset = true)
  }

}
