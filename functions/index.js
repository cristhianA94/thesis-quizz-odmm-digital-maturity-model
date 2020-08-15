const functions = require("firebase-functions");
const admin = require("firebase-admin");

var serviceAccount = require("./keys/serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fir-auth-web-75274.firebaseio.com",
});

const db = admin.firestore();

// Express and CORS
const express = require("express");
const cors = require("cors");
//({ origin: true });
const app = express();

/* CORS */
app.use(cors());

/* Authorizacion for users with token AUTH */
async function getFirebaseUser(req, res, next) {
    //console.log(req.headers.authorization.split("Bearer ")[1]);

    console.log("Check if request is authorized with Firebase ID token");

    if (!req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer ")
    ) {
        console.error(
            "No Firebase ID token was passed as a Bearer token in the Authorization header.",
            "Make sure you authorize your request by providing the following HTTP header:",
            "Authorization: Bearer <Firebase ID Token>"
        );
        return res.sendStatus(403);
    }

    let idToken;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        console.log("Found 'Authorization' header");
        idToken = req.headers.authorization.split("Bearer ")[1];
    }

    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        console.log("ID Token correctly decoded"); //, decodedIdToken);
        req.user = decodedIdToken;
        return next();
    } catch (error) {
        console.error("Error while verifying Firebase ID token:", error);
        return res.status(403).send("Unauthorized");
    }
}
// [END get_firebase_user]

//app.use(getFirebaseUser);

// ===============================================================

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

app.get("/", cors(), (req, res) => {
    var id = req.query.id;
    var categoria = {};

    return (
        db
        .doc(`categorias/${id}`)
        //.doc(`categorias/5OVQbaauPmEA7Jt7HiSK`)
        .get()
        .then((categoriaSnap) => {
            const categoriaRef = categoriaSnap.ref;
            // Guarda el objeto Categoria
            categoria = categoriaSnap.data();
            return db
                .collection("subcategorias")
                .where("idCategoria", "==", categoriaRef)
                .get();
        })
        // Trae las subcategorias pertenecientes a la categoria
        .then((subcategoriasSnap) => {
            var subcategorias = [];
            var capacidades = [];
            // Recorre cada subcategoria
            subcategoriasSnap.forEach((subcategoriaDoc) => {
                // Objeto de cada subcategoria
                const subcategoria = subcategoriaDoc.data();
                // Crea un array para agregar las capacidades de esa subcategoria
                subcategoria.capacidades = [];
                // Borra atributo no usado
                delete subcategoria.idCategoria;
                subcategoria.id = subcategoriaDoc.id;
                // Agrega las subcategorias asociadas
                subcategorias.push(subcategoria);
                capacidades.push(
                    db
                    .collection(`capacidades`)
                    .where("idSubcategoria", "==", subcategoriaDoc.ref)
                    .get()
                );
            });
            // Agrega el array de  subcategorias de esa categoria
            categoria.subcategorias = subcategorias;
            return Promise.all(capacidades);
        })
        // Obtiene las capacidades de cada subcategoria
        .then((capacidadesSnap) => {
            var metricas = [];
            // Capacidades de cada subcategoria
            capacidadesSnap.forEach((capacidades) => {
                capacidades.forEach((capacidad) => {
                    // Guarda el id de cada capacidad
                    const capacidadUid = capacidad.id;
                    // Objeto de cada capacidad
                    const capacidadObj = capacidad.data();

                    // Agrega el id al obj
                    capacidadObj.id = capacidadUid;
                    const idSubcategoria = capacidadObj.idSubcategoria.id;
                    var elementPos = categoria.subcategorias
                        .map((x) => {
                            return x.id;
                        })
                        .indexOf(idSubcategoria);
                    capacidadObj.metrica = [];
                    // Borra atributo innecesario ya
                    delete capacidadObj.idSubcategoria;
                    // Agrega las capacidades a la subcategoria perteneciente
                    categoria.subcategorias[elementPos].capacidades.push(capacidadObj);
                    metricas.push(capacidadUid);
                });
            });
            metricas = metricas.filter(onlyUnique);
            const promesas = [];
            metricas.forEach((metrica) => {
                promesas.push(db.doc(`metricas/${metrica}`).get());
            });
            return Promise.all(promesas);
        })
        .then((metricasSnap) => {
            const metricasArr = [];
            metricasSnap.forEach((metrica) => {
                if (metrica.exists) {
                    const metricaUid = metrica.id;
                    const metricaObj = metrica.data();
                    metricaObj.id = metricaUid;
                    delete metricaObj.idCapacidad;
                    metricasArr.push(metricaObj);
                }
            });
            categoria.subcategorias.forEach((subcategoria) => {
                subcategoria.capacidades.forEach((capacidad) => {
                    const metrica = metricasArr.find((x) => x.id === capacidad.id);
                    capacidad.metrica = metrica;
                });
            });
            return res.send(categoria);
        })
    );
});

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}


// Actualiza los intentoss de cada categoria evaluada
exports.actualizarIntento = functions.firestore
    .document("cuestionarios/{cuestionarioId}/respuestas/{respuestaId}")
    .onCreate((snap, context) => {
        // context.params.userId
        const cuestionarioId = context.params.cuestionarioId;
        let cuestionarioRef = db.collection("cuestionarios").doc(cuestionarioId);
        return cuestionarioRef
            .get()
            .then((doc) => {
                var cuestionario = doc.data();
                var intento = cuestionario.intento + 1;
                return Promise.all([
                    snap.ref.update({ intento }),
                    cuestionarioRef.update({ intento }),
                ]);
            })
            .catch((err) => {
                return err;
            });
    });

exports.cuestionario = functions.https.onRequest(app);