import { UtilsXml } from "./Xml";

export class UtilsPlaceholder {
  static isOpenTag(tag: string): boolean {
    return !!tag.match(/^{#/);
  }

  static isCloseTag(tag: string): boolean {
    return !!tag.match(/^{\//);
  }

  static extractTags(text: string): string[] {
    const matchs = text.matchAll(/{.*?}/g);
    const tags = Array.from(matchs).map((match) => {
      const [tag] = match;

      return tag;
    });

    return tags;
  }

  static getKeyFromTag(tag: string): string {
    const isOpenTag = UtilsPlaceholder.isOpenTag(tag);
    const isCloseTag = UtilsPlaceholder.isCloseTag(tag);

    if (isOpenTag) {
      return tag
        .replace(/^{#/, "")
        .replace(/}$/, "");
    }

    if (isCloseTag) {
      return tag
        .replace(/^{\//, "")
        .replace(/}$/, "");
    }

    return tag
      .replace(/^{/, "")
      .replace(/}$/, "");
  }

  static forEachNodeWithPlaceholder(
    root: Node,
    nodeTagWithPlaceholder: string,
    callback: (node: Node, tag: string) => void
  ): void {
    const textNodes = UtilsXml.getChildNodesByTag(nodeTagWithPlaceholder, root);

    for (let i = 0; i < textNodes.length; i++) {
      const textNode = textNodes[i];
      const textContent = textNode.textContent;

      if (textContent) {
        const tags = UtilsPlaceholder.extractTags(textContent);

        for (const tag of tags) {
          callback(textNode, tag);
        }
      }
    }
  }
}
