export interface Cuestionario {
  id?: string;
  idUser: string
}

export interface RespuestasUsuario {
  id?: string;
  intento: number;
  metricas: any[];
  puntuacionCategoria: number;
}