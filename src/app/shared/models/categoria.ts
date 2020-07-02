import { Subcategoria } from './subcategoria';
export interface Categoria {
  id?: string;
  nombre: string;
  descripcion: string;
  peso: number;
  subcategorias?: Subcategoria[];
}
