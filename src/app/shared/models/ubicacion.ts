export class Canton {
    id?: string;
    nombre: string;
    idProvincia: string;

    constructor(canton?) {
        canton = canton || {};
        this.nombre = canton.nombre || "";
        this.idProvincia = canton.idProvincia || "";

    }
}

export class Provincia {
    id?: string
    nombre: string;
    idPais: string;

    constructor(provincia?) {
        
        this.nombre = provincia.nombre || "";
        this.idPais = provincia.idPais || "";

    }
}

export class Pais {
    id?: string
    nombre: string;

    constructor(pais?) {
        pais = pais || {};
        this.nombre = pais.nombre || "";
    }
}



