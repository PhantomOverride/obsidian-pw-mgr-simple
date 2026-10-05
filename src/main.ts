import { Plugin } from "obsidian";
import { parsePwTitle } from "./parse-pw-title";
import { PwBlock } from "./ui/pw-block";

export default class PwMgrPlugin extends Plugin {
  onload(): void {
    const blocks = new Set<PwBlock>();

    // Render contexts handle note removal; also clean up when the plugin stops.
    this.register(() => {
      for (const block of blocks) block.unload();
      blocks.clear();
    });

    this.registerMarkdownCodeBlockProcessor("pw", (source, el, ctx) => {
      const title = parsePwTitle(ctx.getSectionInfo(el));
      const block = new PwBlock(el, source, title);
      blocks.add(block);
      block.register(() => blocks.delete(block));
      ctx.addChild(block);
    });
  }
}