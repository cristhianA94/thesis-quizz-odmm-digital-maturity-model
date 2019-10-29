export interface Roles {
    admin?: boolean;
    subscriptor?: boolean;
}

export interface Usuario {
    //Atributos para redes sociales
    uid: string;
    correo: string;
    photoURL?: string;
    nombres: string;
    //Resto atributos
    apellidos?: string;
    cedula?: string;
    telefono: number;
    sexo?: string;
    cargo?: string;
    clave?: string;
    rol: Roles;
}
