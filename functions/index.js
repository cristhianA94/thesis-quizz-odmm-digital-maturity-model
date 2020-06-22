const functions = require("firebase-functions");
const admin = require("firebase-admin");
var serviceAccount = require("./keys/serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fir-auth-web-75274.firebaseio.com",
});

const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.obtenerCuestionarios = functions.https.onRequest((req, res) => {
    let categoria = {};
    return db
        .doc(`categorias/5OVQbaauPmEA7Jt7HiSK`)
        .get()
        .then((categoriaSnap) => {
            const categoriaRef = categoriaSnap.ref;
            // Guarda el objeto C   ategoria
            categoria = categoriaSnap.data();
            return db
                .collection("subcategorias")
                .where("idCategoria", "==", categoriaRef)
                .get();
        })
        .then((subcategoriasSnap) => {
            const subcategorias = [];
            const capacidades = [];
            subcategoriasSnap.forEach((doc) => {
                const sub = doc.data();
                sub.capacidades = [];
                delete sub.idCategoria;
                sub.id = doc.id;
                subcategorias.push(sub);
                capacidades.push(
                    db
                    .collection(`capacidades`)
                    .where("idSubcategoria", "==", doc.ref)
                    .get()
                );
            });
            categoria.subcategorias = subcategorias;
            return Promise.all(capacidades);
        })
        .then((capacidadesSnap) => {
            const metricas = [];
            capacidadesSnap.forEach((capacidades) => {
                capacidades.forEach((capacidad) => {
                    const capacidadUid = capacidad.id;
                    const capacidadObj = capacidad.data();
                    capacidadObj.id = capacidadUid;
                    capacidadObj.metricas = [];
                    const idSubcategoria = capacidadObj.idSubcategoria.id;
                    var elementPos = categoria.subcategorias
                        .map((x) => {
                            return x.id;
                        })
                        .indexOf(idSubcategoria);
                    categoria.subcategorias[elementPos].capacidades.push(capacidadObj);
                    metricas.push(
                        db
                        .collection(`metricas`)
                        .where("idCapacidad", "==", capacidad.ref)
                        .get()
                    );
                });
            });
            return Promise.all(metricas);
        })
        .then((metricasSnap) => {
            const metricasArr = [];
            // hasta aqui ya obtienes las metricas solo te falta agregarlas al objeto de categoria
            metricasSnap.forEach((metricas) => {
                metricas.forEach((metrica) => {
                    const metricaUid = metrica.id;
                    const metricaObj = metrica.data();
                    metricaObj.id = metricaUid;
                    // const idSubcategoria = metricaObj.idSubcategoria.id
                    // var elementPos = categoria.subcategorias.map((x) => { return x.id; }).indexOf(idSubcategoria);
                    // categoria.subcategorias[elementPos].capacidad.metricas.push(metricaObj);
                    metricasArr.push(metricaObj);
                });
            });
            return res.send({ categoria, metricasArr });
        });
});