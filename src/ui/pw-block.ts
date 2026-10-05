import { MarkdownRenderChild, Notice } from "obsidian";
import { parsePwBlock } from "../parse-pw-block";
import { copyToClipboard } from "../utils/clipboard";

const COPY_LABEL = "Copy";
const COPIED_LABEL = "Copied!";
const COPY_ERROR_MESSAGE = "Could not copy to clipboard";
const INVALID_BLOCK_HINT = 'Expected lines like "username:password", "username", or ":password" inside a pw code block.';

interface CopyPillOptions {
  value: string;
  displayText: string;
  ariaLabel: string;
  classes: string;
}

export class PwBlock extends MarkdownRenderChild {
  private active = false;

  constructor(
    containerEl: HTMLElement,
    private readonly source: string,
    private readonly title: string,
  ) {
    super(containerEl);
  }

  onload(): void {
    this.active = true;
    const entries = parsePwBlock(this.source);
    const el = this.containerEl;
    el.empty();

    if (entries.length === 0) {
      el.createEl("div", { cls: "pwblock-hint", text: INVALID_BLOCK_HINT });
      return;
    }

    const wrapper = el.createEl("div", { cls: "pw-wrapper" });
    wrapper.createEl("div", { cls: "pw-header", text: this.title });
    const container = wrapper.createEl("div", { cls: "pwblock" });

    for (const entry of entries) {
      const row = container.createEl("div", { cls: "pwrow" });
      if (entry.username) {
        this.createCopyPill(row, {
          value: entry.username,
          displayText: entry.username,
          ariaLabel: `Copy username ${entry.username}`,
          classes: "pwuser",
        });
      } else {
        this.createPlaceholderPill(row, "(no username)");
      }

      if (entry.password) {
        this.createCopyPill(row, {
          value: entry.password,
          displayText: "••••••••",
          ariaLabel: "Copy password",
          classes: "pwpw pwmasked",
        });
      } else {
        this.createPlaceholderPill(row, "(no password)");
      }
    }
  }

  onunload(): void {
    // An outstanding clipboard request may settle after the block is removed.
    this.active = false;
  }

  private createPlaceholderPill(row: HTMLElement, text: string): void {
    const button = row.createEl("button", { cls: "pwpill pwplaceholder", text });
    button.type = "button";
    button.disabled = true;
  }

  private createCopyPill(row: HTMLElement, options: CopyPillOptions): void {
    const button = row.createEl("button", { cls: `pwpill ${options.classes}` });
    button.type = "button";
    button.setAttr("aria-label", options.ariaLabel);
    button.createEl("span", { cls: "pwpill-text", text: options.displayText });
    const action = button.createEl("span", { cls: "pwpill-action", text: COPY_LABEL });
    action.setAttr("role", "status");
    action.setAttr("aria-live", "polite");
    action.setAttr("aria-atomic", "true");

    let resetFeedback: (() => void) | undefined;
    this.register(() => {
      resetFeedback?.();
      button.disabled = true;
    });

    const copy = async (): Promise<void> => {
      if (!this.active || button.disabled) return;
      button.disabled = true;
      resetFeedback?.();

      const ok = await copyToClipboard(options.value, button.ownerDocument);
      if (!this.active) return;
      button.disabled = false;

      if (!ok) {
        new Notice(COPY_ERROR_MESSAGE);
        return;
      }

      button.classList.add("is-copied");
      action.textContent = COPIED_LABEL;
      const win = button.ownerDocument.defaultView;
      if (!win) return;

      const timer = win.setTimeout(() => resetFeedback?.(), 1100);
      resetFeedback = () => {
        win.clearTimeout(timer);
        button.classList.remove("is-copied");
        action.textContent = COPY_LABEL;
        resetFeedback = undefined;
      };
    };

    this.registerDomEvent(button, "click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      void copy().catch(() => {
        if (!this.active) return;
        button.disabled = false;
        new Notice(COPY_ERROR_MESSAGE);
      });
    });
  }
}