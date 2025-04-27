export abstract class Placeholder {
  protected key: string;
  protected openTag: string;
  protected closeTag: string;
  protected openNode: Node;
  protected closeNode: Node;
  protected parent?: Placeholder;

  protected children: Placeholder[] = [];

  constructor(
    openTag: string,
    closeTag: string,
    openNode: Node,
    closeNode: Node,
  ) {
    this.key = this.getKeyFromTag(openTag);
    this.openTag = openTag;
    this.closeTag = closeTag;
    this.openNode = openNode;
    this.closeNode = closeNode;
  }

  protected abstract getChildren(): Placeholder[];
  protected abstract handleArray(data: any[]): void;
  protected abstract handleString(data: string): void;

  protected isOpenTag(tag: string): boolean {
    return !!tag.match(/^{#/);
  }

  protected isCloseTag(tag: string): boolean {
    return !!tag.match(/^{\//);
  }

  protected getKeyFromTag(tag: string): string {
    const isOpenTag = this.isOpenTag(tag);
    const isCloseTag = this.isCloseTag(tag);

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

  protected appendChild(child: Placeholder): void {
    child.parent = this;

    this.children.push(child);
  }

  public clean(): void {
    const openTag = this.openTag;
    const openNode = this.openNode;
    const initialOpenTextContent = openNode.textContent;
    if (initialOpenTextContent) {
      openNode.textContent = initialOpenTextContent.replace(openTag, "");
    }

    const closeTag = this.closeTag;
    const closeNode = this.closeNode;
    const initialCloseTextContent = closeNode.textContent;
    if (initialCloseTextContent) {
      closeNode.textContent = initialCloseTextContent.replace(closeTag, "");
    }
  }

  public render(data: any): void {
    if (Array.isArray(data)) {
      this.handleArray(data);
    } else if (typeof data == "string") {
      this.handleString(data);
    } else if (typeof data == "number") {
      this.handleString(data.toString());
    }
  }
}
