import { customAlphabet } from "nanoid";

// No look-alike characters (0/O, 1/l/I) — these ids get read aloud and
// retyped off WhatsApp messages.
const ALPHABET = "23456789abcdefghijkmnpqrstuvwxyz";

/**
 * 12 chars over a 32-char alphabet is 60 bits. Guessing a valid id is
 * not feasible, which is what stops anyone walking through strangers'
 * family photos.
 */
export const newId = customAlphabet(ALPHABET, 12);
