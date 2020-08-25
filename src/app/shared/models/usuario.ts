export interface Usuario {
    //Atributos para redes sociales
    id?: string;
    correo: string;
    photoURL?: string;
    nombres: string;
    //Resto atributos
    apellidos?: string;
    cedula?: string;
    telefono: number;
    sexo?: string;
    clave?: string;
    cargo?: string;
    rol?: string;
}
