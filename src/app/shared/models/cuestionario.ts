export interface Cuestionario {
  id?: string;
  idUser?: string,
  categoria?: any;
  categoriaNombre?: string;
  peso?: number;
  respuestasUsuario?: RespuestasUsuario[];
  intento?: number;
  fechaCreacion?: any;
  puntuacionCategoria?:number
}

export interface RespuestasUsuario {
  id?: string;
  intento?: number;
  fecha?: any,
  metricas: any[];
  puntuacionCategoria?: number;
}