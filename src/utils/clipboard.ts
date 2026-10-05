export async function copyToClipboard(text: string, doc: Document): Promise<boolean> {
  try {
    // Use the initiating element's window, including in Obsidian pop-outs.
    const clipboard = doc.defaultView?.navigator.clipboard;
    if (!clipboard) return false;

    await clipboard.writeText(text);
    return true;
  } catch {
    // Never log the credential or put it in a temporary DOM element.
    return false;
  }
}