export const DEFAULT_PW_TITLE = "Password block";

interface SourceSection {
  text: string;
  lineStart: number;
}

export function parsePwTitle(section: SourceSection | null): string {
  // The processor's source contains only the body, so read the opening fence
  // from its exact section rather than searching for another block in the note.
  const openingLine = section?.text.split(/\r?\n/)[section.lineStart];
  const match = openingLine?.match(/^(?:[ \t]*>[ \t]?)*[ \t]*(?:`{3,}|~{3,})[ \t]*pw(?:[ \t]+(.*))?[ \t]*$/);
  return match?.[1]?.trim() || DEFAULT_PW_TITLE;
}