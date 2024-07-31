import { Firestore } from "firebase/firestore";

export class FirestoreRepository {
  protected db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }
}
