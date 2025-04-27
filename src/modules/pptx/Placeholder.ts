import { Placeholder } from "../../abstracts/Placeholder";
import { UtilsXml } from "../../utils/Xml";
import { PPTXSlide } from "./Slide";

export class PPTXPlaceholder extends Placeholder {
  private slide: PPTXSlide;

  constructor(
    openTag: string,
    closeTag: string,
    openNode: Node,
    closeNode: Node,
    slide: PPTXSlide
  ) {
    super(
      openTag,
      closeTag,
      openNode,
      closeNode
    );

    this.slide = slide;
  }

  private getParagraph(node: Node) {
    return UtilsXml.getParentNodeByTag("a:p", node);
  }

  private appendParagraph(paragraph: Node): void {
    const openNode = this.openNode;
    const closeNode = this.closeNode;
    const openParagraphNode = this.getParagraph(openNode);
    const closeParagraphNode = this.getParagraph(closeNode);

    if (!openParagraphNode || !closeParagraphNode) {
      return;
    }

    if (openNode == closeNode) {
      const textContent = paragraph.textContent;

      if (!textContent) {
        return;
      }

      const match = textContent.match(new RegExp(`${this.openTag}.*?${this.closeTag}`));

      if (!match) {
        return;
      }

      let [content] = match;
      content = content
        .replace(this.openTag, "");

      const openNodeTextContent = openNode.textContent;

      if (!openNodeTextContent) {
        return;
      }

      openNode.textContent = openNodeTextContent.replace(this.closeTag, content);

      return;
    }

    if (openParagraphNode == closeParagraphNode) {
      return;
    }

    const textBoxNode = UtilsXml.getParentNodeByTag("p:txBody", closeParagraphNode);
    if (!textBoxNode) {
      return;
    }

    const xmlString = UtilsXml.serializer.serializeToString(paragraph);
    const paragraphToInsert = UtilsXml.parser.parseFromString(
      xmlString
        .replace(new RegExp(`<a:t>.*?${this.openTag}`), "<a:t>")
        .replace(new RegExp(`${this.closeTag}.*?</a:t>`), "</a:t>"),
      "application/xml"
    );

    const textNodes = UtilsXml.getChildNodesByTag("a:t", paragraphToInsert);

    for (let i = 0; i < textNodes.length; i++) {
      const textNode = textNodes[i];

      if (textNode.textContent) {
        textBoxNode.insertBefore(paragraphToInsert, closeParagraphNode);

        break;
      }
    }
  }

  private forEachParagraphs(callback: (paragraph: Node) => void) {
    const openNode = this.openNode;
    const closeNode = this.closeNode;
    const openParagraphNode = this.getParagraph(openNode);
    const closeParagraphNode = this.getParagraph(closeNode);

    let currentParagraphNode = openParagraphNode;

    while (currentParagraphNode) {
      callback(currentParagraphNode);

      if (currentParagraphNode == closeParagraphNode) {
        break;
      }

      currentParagraphNode = currentParagraphNode.nextSibling;
    }
  }

  public getChildren(): Placeholder[] {
    const children = this.children;
    const openNode = this.openNode;
    const closeNode = this.closeNode;

    let currentChildOpenTag = "";
    let currentChildOpenNode: Node | null = null;

    this.forEachParagraphs((paragraph) => {
      const textNodes = UtilsXml.getChildNodesByTag("a:t", paragraph);

      for (let i = 0; i < textNodes.length; i++) {
        const textNode = textNodes[i];
        const textContent = textNode.textContent;

        if (!textContent) {
          continue;
        }

        const matchs = textContent.matchAll(/{.*?}/g);

        for (const match of matchs) {
          const [tag] = match;
          const isOpenTag = this.isOpenTag(tag);
          const isCloseTag = this.isCloseTag(tag);

          if (isOpenTag) {
            if (openNode == textNode) {
              continue;
            }

            currentChildOpenTag = tag;
            currentChildOpenNode = textNode;

            continue;
          }

          if (isCloseTag && currentChildOpenNode) {
            if (closeNode == textNode) {
              continue;
            }

            const child = new PPTXPlaceholder(
              currentChildOpenTag,
              tag,
              currentChildOpenNode,
              textNode,
              this.slide
            );
            this.appendChild(child);

            currentChildOpenTag = "";
            currentChildOpenNode = null;
            continue;
          }

          const child = new PPTXPlaceholder(
            tag,
            tag,
            textNode,
            textNode,
            this.slide
          );
          this.appendChild(child);
        }
      }
    });

    return children;
  }

  protected handleString(data: string): void {
    const openTag = this.openTag;
    const openNode = this.openNode;
    const initialOpenTextContent = openNode.textContent;

    if (initialOpenTextContent) {
      openNode.textContent = initialOpenTextContent.replace(openTag, data);
    }
  }

  protected handleArray(data: any[]): void {
    const paragraphsClones: Node[] = [];

    this.forEachParagraphs((paragraph) => {
      paragraphsClones.push(paragraph.cloneNode(true));
    });

    const lastParagraph = paragraphsClones.pop();
    if (lastParagraph) {
      paragraphsClones.unshift(lastParagraph);
    }

    data.forEach((_, index) => {
      const isLastData = index == data.length - 1;

      if (!isLastData) {
        paragraphsClones.forEach((paragraphClone) => {
          this.appendParagraph(paragraphClone.cloneNode(true));
        });
      }
    });

    this.clean();

    const children = this.getChildren();

    data.forEach((d, index) => {
      const initialChildrenCount = children.length / data.length;
      const offset = initialChildrenCount * index;
      const childrenToRender = children.slice(offset, offset + initialChildrenCount);

      childrenToRender.forEach((child) => {
        child.render(d);
      });
    });
  }
}
