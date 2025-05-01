import { UtilsPlaceholder } from "../utils/Placeholder";

export abstract class Placeholder {
  public key: string;

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
    this.key = UtilsPlaceholder.getKeyFromTag(openTag);
    this.openTag = openTag;
    this.closeTag = closeTag;
    this.openNode = openNode;
    this.closeNode = closeNode;
  }

  protected abstract getChildren(): Placeholder[];
  protected abstract handleArray(data: any[]): void;
  protected abstract handleString(data: string): void;

  protected abstract clean(): void;


  protected appendChild(child: Placeholder): void {
    child.parent = this;

    this.children.push(child);
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
