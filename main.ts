/**
 * The Funniest Excuse for Skipping a Meeting — make.fun bounty entry.
 *
 * A single razor-sharp line (at most 200 characters) that excuses the
 * speaker from a pointless work meeting. The program writes exactly that
 * line to /output/entry.txt.
 *
 * Node 22, standard library only. Fully deterministic: no input, no
 * network, no randomness. The entry text is a constant; before writing,
 * validateEntry() enforces the bounty gate (one line, 1-200 characters,
 * not only white space, no trailing white space), and after writing,
 * verifyEntry() reads the file back and compares it textually and at
 * the byte level.
 */
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I have to skip — my laptop overheated just reading the invite: 'Quick 15-minute sync,' 47 attendees, no agenda.";

const OUTPUT_DIR = "/output";
const OUTPUT_FILE = join(OUTPUT_DIR, "entry.txt");

// Bounty gate, verified against the bounty page on 2026-11-26:
// one line, at most 200 characters, excusing the speaker from a
// pointless work meeting or Zoom call. The chosen line (111 chars)
// attacks the invite itself: the laptop overheats just reading it,
// and the three concrete details — a "Quick 15-minute sync" with
// 47 attendees and no agenda — land the joke, with "no agenda" as
// the final twist. Revised 2026-11-26: replaced the earlier
// calendar/will entry after a 3-candidate scoring round.
const MIN_LENGTH = 1;
const MAX_LENGTH = 200;

function validateEntry(text: string): void {
  if (text.length < MIN_LENGTH || text.length > MAX_LENGTH) {
    throw new Error(
      `Entry must be ${MIN_LENGTH}-${MAX_LENGTH} characters, got ${text.length}: ${JSON.stringify(text)}`,
    );
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error(`Entry must be exactly one line: ${JSON.stringify(text)}`);
  }
  if (text.trim().length === 0) {
    throw new Error("Entry must not be only white space");
  }
  if (text !== text.trim()) {
    throw new Error(
      `Entry must not start or end with white space: ${JSON.stringify(text)}`,
    );
  }
}

function writeEntry(text: string): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_FILE, text, "utf8");
}

function verifyEntry(expected: string): void {
  const readBack = readFileSync(OUTPUT_FILE, "utf8");
  if (readBack !== expected) {
    throw new Error(
      `Read-back mismatch: expected ${JSON.stringify(expected)}, got ${JSON.stringify(readBack)}`,
    );
  }
  const expectedBytes = Buffer.from(expected, "utf8");
  const actualBytes = readFileSync(OUTPUT_FILE);
  if (!actualBytes.equals(expectedBytes)) {
    throw new Error(
      `Byte mismatch: expected ${expectedBytes.length} UTF-8 bytes, got ${actualBytes.length}`,
    );
  }
  if (readBack.length !== expected.length) {
    throw new Error(
      `Length mismatch after read-back: expected ${expected.length}, got ${readBack.length}`,
    );
  }
  // File-size check: the on-disk size must equal the entry's UTF-8 byte
  // length, so a stray newline or trailing byte cannot hide behind the
  // text comparison.
  const fileSize = statSync(OUTPUT_FILE).size;
  if (fileSize !== expectedBytes.length) {
    throw new Error(
      `File size mismatch: expected ${expectedBytes.length} bytes, got ${fileSize}`,
    );
  }
}

validateEntry(ENTRY);
writeEntry(ENTRY);
verifyEntry(ENTRY);

console.log(`Wrote ${ENTRY.length} characters to ${OUTPUT_FILE}`);
console.log(`Entry: ${ENTRY}`);
