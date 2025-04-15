import { db } from "./firebaseConfig";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

export const getCollection = async (colName) => {
  const colRef = collection(db, colName);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getCollectionRealtime = (colName, callback) => {
  const colRef = collection(db, colName);

  // Configura onSnapshot para escuchar los cambios en tiempo real
  const unsubscribe = onSnapshot(colRef, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(data); // Pasa los datos al callback
  });

  // Retorna la función unsubscribe para poder desuscribirse
  return unsubscribe;
};

export const addEventFunction = async (event) => {
  try {
    const docRef = await addDoc(collection(db, "events"), event);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};

export const deleteEventFunction = async (eventId) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error("Error al eliminar el evento: ", error);
  }
};

/**
 * Obté tots els documents d'una col·lecció.
 * @param {string} colName Nom de la col·lecció.
 * @returns {Array} Llista de documents.
 */
export const obtenirDocuments = async (colName) => {
  const colRef = collection(db, colName);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Obté un document per ID.
 * @param {string} colName Nom de la col·lecció.
 * @param {string} id ID del document.
 * @returns {Object} Dades del document.
 */
export const obtenirDocumentPerId = async (colName, id) => {
  const docRef = doc(db, colName, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error("El document no existeix.");
  }
};

/**
 * Afegeix un document a una col·lecció.
 * @param {string} colName Nom de la col·lecció.
 * @param {Object} dades Dades del document.
 * @returns {string} ID del document afegit.
 */
export const afegirDocument = async (colName, dades) => {
  const colRef = collection(db, colName);
  const docRef = await addDoc(colRef, dades);
  return docRef.id;
};

/**
 * Actualitza un document existent.
 * @param {string} colName Nom de la col·lecció.
 * @param {string} id ID del document.
 * @param {Object} dades Noves dades per actualitzar.
 */
export const actualitzarDocument = async (colName, id, dades) => {
  const docRef = doc(db, colName, id);
  await updateDoc(docRef, dades);
};

/**
 * Esborra un document per ID.
 * @param {string} colName Nom de la col·lecció.
 * @param {string} id ID del document.
 */
export const esborrarDocument = async (colName, id) => {
  const docRef = doc(db, colName, id);
  await deleteDoc(docRef);
};

/**
 * Obté documents que compleixen una condició.
 * @param {string} colName Nom de la col·lecció.
 * @param {string} camp Nom del camp.
 * @param {string} operador Operador de condició (==, >, <, etc.).
 * @param {any} valor Valor a comparar.
 * @returns {Array} Llista de documents que compleixen la condició.
 */
export const obtenirDocumentsPerCondicio = async (
  colName,
  camp,
  operador,
  valor
) => {
  const colRef = collection(db, colName);
  const q = query(colRef, where(camp, operador, valor));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const checkReservation = async (classroom, day, hour) => {
  const colRef = collection(db, "reservas");

  // Crear una consulta con las condiciones necesarias
  const q = query(
    colRef,
    where("classroom", "==", classroom),
    where("day", "==", day),
    where("hour", "==", hour)
  );

  // Obtener los documentos que coinciden con la consulta
  const snapshot = await getDocs(q);

  // Si hay algún documento que coincida con la consulta, significa que ya está reservado
  if (!snapshot.empty) {
    return true; // Ya está reservado
  } else {
    return false; // No está reservado
  }
};
