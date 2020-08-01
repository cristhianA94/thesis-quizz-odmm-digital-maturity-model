export interface Cuestionario {
  id?: string;
  idUser?: string,
  categoria?: string;
  respuestasUsuario?: RespuestasUsuario[];
  intento?: number;
}

export interface RespuestasUsuario {
  id?: string;
  intento?: number;
  fecha?: string,
  metricas: any[];
  puntuacionCategoria?: number;
}