export interface Cuestionario {
  id?: string;
  idUser?: string,
  categoria?: string
  respuestasUsuario?: RespuestasUsuario[]
}

export interface RespuestasUsuario {
  id?: string;
  intento?: number;
  fecha?: string,
  metricas: any[];
  puntuacionCategoria?: number;
}