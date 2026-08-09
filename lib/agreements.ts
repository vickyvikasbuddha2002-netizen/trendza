import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { newId } from "./id";
import { recordAgreement } from "./stats";
import type { Agreement } from "./types";

export async function createAgreement(input: {
  partyA: string;
  partyB: string;
  clauses: string[];
  signatureA: string;
}): Promise<string> {
  const id = newId();

  const agreement: Agreement = {
    id,
    partyA: input.partyA.trim(),
    partyB: input.partyB.trim(),
    clauses: input.clauses.map((c) => c.trim()).filter(Boolean),
    signatureA: input.signatureA,
    signatureB: null,
    createdAt: Date.now(),
    signedAt: null,
  };

  await setDoc(doc(db, "agreements", id), agreement);
  void recordAgreement();

  return id;
}

/** The counter-signature. Refuses to overwrite one that already exists. */
export async function signAgreement(id: string, signatureB: string): Promise<void> {
  const ref = doc(db, "agreements", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("That agreement no longer exists");
  if ((snap.data() as Agreement).signatureB) return;

  await updateDoc(ref, { signatureB, signedAt: Date.now() });
}

export async function getAgreement(id: string): Promise<Agreement | null> {
  const snap = await getDoc(doc(db, "agreements", id));
  return snap.exists() ? (snap.data() as Agreement) : null;
}
