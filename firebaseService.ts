
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  setDoc 
} from "firebase/firestore";
import { AppState } from "./types";

/**
 * INSTRUÇÕES PARA O THIAGO:
 * 1. Vá no Console do Firebase > Configurações do Projeto.
 * 2. Copie os valores do objeto 'firebaseConfig' e cole abaixo.
 * 3. ATENÇÃO: Vá na aba 'Rules' do Firestore e mude para 'allow read, write: if true;'
 */
const firebaseConfig = {
  apiKey: "AIzaSyBTEfXs5IQLGMuDPGvDMokgOdyFF0ur4gM",
  authDomain: "nutricontrol-e1d7b.firebaseapp.com",
  projectId: "nutricontrol-e1d7b",
  storageBucket: "nutricontrol-e1d7b.firebasestorage.app",
  messagingSenderId: "807746411318",
  appId: "1:807746411318:web:d3d9b0972f7a37fd9e7197"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const STATE_DOC_ID = "main_state";
const COLLECTION_NAME = "nutricontrol";

export const syncState = (callback: (state: AppState) => void) => {
  return onSnapshot(doc(db, COLLECTION_NAME, STATE_DOC_ID), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as AppState);
    } else {
      const initialState: AppState = {
        meals: [],
        weightLogs: [],
        waterLogs: [],
        exerciseLogs: [],
        shoppingLists: []
      };
      callback(initialState);
    }
  });
};

export const saveFullState = async (state: AppState) => {
  try {
    await setDoc(doc(db, COLLECTION_NAME, STATE_DOC_ID), state);
  } catch (e) {
    console.error("Erro ao salvar no Firebase:", e);
  }
};
