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
            // .doc(`categorias/${id}`)
            .doc(`categorias/5OVQbaauPmEA7Jt7HiSK`)
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

                        capacidadObj.index = 0;
                        // Agrega el id al obj
                        capacidadObj.id = capacidadUid;

                        const idSubcategoria = capacidadObj.idSubcategoria.id;

                        var elementPos = categoria.subcategorias
                            .map((x) => {
                                return x.id;
                            })
                            .indexOf(idSubcategoria);

                        // Mandar index pos al obj
                        capacidadObj.index = elementPos;

                        // Borra atributo innecesario ya
                        delete capacidadObj.idSubcategoria;
                        // Agrega las capacidades a la subcategoria perteneciente
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
                metricasSnap.forEach((metricas) => {
                    metricas.forEach((metrica) => {
                        const metricaUid = metrica.id;
                        const metricaObj = metrica.data();
                        metricaObj.id = metricaUid;
                        const idCapacidad = metricaObj.idCapacidad.id;
                        metricaObj.idCapacidad = metricaObj.idCapacidad.id;
                        // var elementPos = categoria.subcategorias.map((x) => { return x.id; }).indexOf(idSubcategoria);
                        // categoria.subcategorias[elementPos].capacidad.metricas.push(metricaObj);
                        metricasArr.push(metricaObj);
                    });
                });
                return res.send({ categoria, metricasArr });

                /* 
                    var metricasArr = [];
                    var subcategoriasArr = [];
                    var capacidadesArr = [];
    
                    subcategoriasArr = categoria.subcategorias;
    
                    subcategoriasArr.forEach((subcate, i) => {
                        subcategoriasArr[i].capacidades.push(subcate.capacidades);
                    }); 
    
                        metricasSnap.forEach((metricas) => {
                            metricas.forEach((metrica) => {
                                var metricaUid = metrica.id;
                                var metricaObj = metrica.data();
                                metricaObj.id = metricaUid;
    
                                var idCapacidad = metricaObj.idCapacidad.id;
    
                                subcategoriasArr.forEach((element, i) => {
                                    var elementPosi = element.capacidades
                                        .map((x) => {
                                            return x.id;
                                        })
                                        .indexOf(idCapacidad);
                                    //console.log("este", element.capacidades[elementPosi]);
                                    //categoria.subcategorias[i].capacidades[elementPosi].metrica = metricaObj;
                                    //element.capacidades[elementPosi].metrica = metricaObj;
                                });
                                //subcategoriasArr[elementPosi].metrica = metricaObj;
                                //capacidadesArr[elementPosi].metrica.push(metricaObj);
    
                                // Borra atributo innecesario ya
                                delete metricaObj.idCapacidad;
    
                                metricasArr.push(metricaObj);
                            });
                        }); 
                    return res.send({ categoria, metricasArr });
                                */
            })
    );
});

exports.cuestionario = functions.https.onRequest(app);