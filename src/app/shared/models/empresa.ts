export class Empresa {
    _id?: string;
    razon_social: string;
    anio_creacion: string;
    area_alcance: string;
    franquicias: string;
    direccion: string;
    tamanio_empresa: string;
    idUser?: string;
    idCanton?: string;
    idSectorInd?: string;

    constructor(empresa?) {
        empresa = empresa || {};
        this._id = empresa._id || "";
        this.razon_social = empresa.razon_social || "";
        this.anio_creacion = empresa.anio_creacion || "";
        this.area_alcance = empresa.area_alcance || "";
        this.franquicias = empresa.franquicias || "";
        this.direccion = empresa.direccion || "";
        this.tamanio_empresa = empresa.tamanio_empresa || "";
        this.idUser = empresa.idUser || "";
        this.idCanton = empresa.idCanton || "";
        this.idSectorInd = empresa.idSectorInd || "";
    }
}
