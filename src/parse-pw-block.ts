export interface PwEntry {
  username?: string;
  password?: string;
}

export function parsePwBlock(source: string): PwEntry[] {
  const entries: PwEntry[] = [];

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = line.indexOf(":");
    if (separator === -1) {
      entries.push({ username: trimmed });
      continue;
    }

    const username = line.slice(0, separator).trim();
    // Passwords are literal: whitespace and additional colons are significant.
    const password = line.slice(separator + 1);
    const entry: PwEntry = {};
    if (username) entry.username = username;
    if (password) entry.password = password;
    if (entry.username || entry.password) entries.push(entry);
  }

  return entries;
}