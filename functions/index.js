const functions = require('firebase-functions');
const admin = require("firebase-admin");
var serviceAccount = require("./keys/serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fir-auth-web-75274.firebaseio.com"
});

const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.obtenerCuestionarios = functions.https.onRequest((req, res) => {
    let categoria = {}
    const capacidadesArr = []
    return db.doc(`categorias/5OVQbaauPmEA7Jt7HiSK`).get().then(categoriaSnap => {
        const categoriaRef = categoriaSnap.ref;
        categoria = categoriaSnap.data();
        return db.collection("subcategorias").where("idCategoria", "==", categoriaRef).get();
    }).then((subcategoriasSnap) => {
        const subcategorias = []
        const capacidades = []
        subcategoriasSnap.forEach((doc) => {
            const sub = doc.data();
            sub.capacidades = [];
            delete sub.idCategoria;
            sub.id = doc.id
            subcategorias.push(sub)
            capacidades.push(db.collection(`capacidades`).where("idSubcategoria", "==", doc.ref).get())
        });
        categoria.subcategorias = subcategorias;
        return Promise.all(capacidades)
    }).then((capacidadesSnap) => {
        // esto tienes que hacer en metriecas
        capacidadesSnap.forEach((capacidades) => {
            capacidades.forEach(capacidad => {
                const capacidadUid = capacidad.id;
                const capacidadObj = capacidad.data();
                capacidadObj.id = capacidadUid;
                const idSubcategoria = capacidadObj.idSubcategoria.id
                capacidadObj.idSubcategoria = idSubcategoria
                capacidadesArr.push(capacidadObj)
            })
        });
        capacidadesArr.forEach(capacidad => {
            const idSubcategoria = capacidad.idSubcategoria;
            var elementPos = categoria.subcategorias.map((x) => { return x.id; }).indexOf(idSubcategoria);
            delete capacidad.idSubcategoria;
            categoria.subcategorias[elementPos].capacidades.push(capacidad);
        });

        return res.send(categoria)
    })
});
