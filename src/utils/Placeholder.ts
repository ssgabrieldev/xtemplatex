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
}
