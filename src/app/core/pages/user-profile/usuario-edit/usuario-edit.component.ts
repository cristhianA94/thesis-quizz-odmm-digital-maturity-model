import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

import { Usuario } from 'app/shared/models/usuario';
import { UsuarioService } from 'app/core/services/user/usuarios/usuario.service';

@Component({
  selector: 'app-usuario-edit',
  templateUrl: './usuario-edit.component.html',
  styles: ['']
})
export class UsuarioEditComponent implements OnInit {

  load: Boolean = false;
  usuario: Usuario;
  usuarioForm: FormGroup;

  hide = true;
  passReset: boolean = false;
  correoReset: string;

  sexo: string[] = [
    'Hombre',
    'Mujer'
  ];

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


  //Form
  constructor(
    public userService: UsuarioService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    // Carga los datos del usuario
    this.userService.onUsuarioChanged.subscribe(usuario => {
      this.usuario = usuario
    });
    this.usuarioForm = this.userbuildForm();
    this.load = true;
  }

  resetear(){
    this.usuarioForm = this.userbuildForm();
  }

  /* Validador de formulario */
  userbuildForm() {

    return this.fb.group({
      nombres: [this.usuario.nombres, [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,100}")]],
      apellidos: [this.usuario.apellidos, [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,100}")]],
      cedula: [this.usuario.cedula, [Validators.required, this.validarCedula()]],
      telefono: [this.usuario.telefono, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(10)]],
      sexo: [this.usuario.sexo],
      cargo: [this.usuario.cargo],
      correo: [this.usuario.correo, [Validators.required, Validators.email]],
      clave: ['', [ Validators.minLength(8), Validators.maxLength(15)]],
    });
  }

  actualizarUsuario(usuario: Usuario) {

    usuario.id = this.usuario.id;
    usuario.rol = this.usuario.rol;

    this.userService.updateUsuario(usuario);
  }

  // TODO Algoritmo validador de cedulas de Ecuador
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
