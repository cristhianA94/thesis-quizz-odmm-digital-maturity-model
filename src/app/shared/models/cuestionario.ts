export interface Cuestionario {
  id?: string;
  idUser?: string,
  categoria?: string;
  peso?: number;
  descripcion?: string;
  respuestasUsuario?: RespuestasUsuario[];
  intento?: number;
  fecha?: string;
  puntuacionCategoria?:number
}

export interface RespuestasUsuario {
  id?: string;
  intento?: number;
  fecha?: string,
  metricas: any[];
  puntuacionCategoria?: number;
  peso?: number;
}