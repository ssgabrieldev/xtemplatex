import { DOMParser, XMLSerializer } from "xmldom";

export class UtilsXml {
  static parser = new DOMParser();
  static serializer = new XMLSerializer();

  static getParentNodeByTag(tag: string, node: Node): Node {
    let current: Node | null = node;

    while (current) {
      if (current.nodeName == tag) {
        return current;
      }

      current = current.parentNode;
    }

    return new Node();
  }

  static getChildNodesByTag(tag: string, node: Node) {
    return (node as Document).getElementsByTagName(tag);
  }

  static string(xml: Document): string {
    return UtilsXml.serializer.serializeToString(xml);
  }
}
