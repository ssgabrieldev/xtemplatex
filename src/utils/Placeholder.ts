export class UtilsPlaceholder {
  static isOpenTag(tag: string): boolean {
    return !!tag.match(/^{#/);
  }

  static isCloseTag(tag: string): boolean {
    return !!tag.match(/^{\//);
  }

  static extractTags(text: string): RegExpStringIterator<RegExpExecArray> {
    const matchs = text.matchAll(/{.*?}/g);

    return matchs;
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
