import { supabase } from "./supabase";
import { newId } from "./id";
import { recordAgreement } from "./stats";

export async function createAgreement(input: {
  partyA: string;
  partyB: string;
  clauses: string[];
  signatureA: string;
}): Promise<string> {
  const id = newId();

  const { error } = await supabase.from("agreements").insert({
    id,
    party_a: input.partyA.trim(),
    party_b: input.partyB.trim(),
    clauses: input.clauses.map((c) => c.trim()).filter(Boolean),
    signature_a: input.signatureA,
    signature_b: null,
  });

  if (error) {
    throw new Error(
      /relation .* does not exist|policy|row-level security/i.test(error.message)
        ? "The database is not set up yet. Run supabase-setup.sql in the Supabase SQL editor."
        : `Could not save the agreement: ${error.message}`,
    );
  }

  void recordAgreement();
  return id;
}

/**
 * The counter-signature.
 *
 * Runs as a Postgres function that only writes where `signature_b is null`,
 * so a forwarded link cannot be used to sign over someone who already has.
 * Returns false when it was already signed.
 */
export async function signAgreement(id: string, signatureB: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("sign_agreement", {
    p_id: id,
    p_signature: signatureB,
  });

  if (error) throw new Error(`Could not save your signature: ${error.message}`);
  return data === true;
}
