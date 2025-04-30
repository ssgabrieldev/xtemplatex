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

  private removeParagraph(paragraph: Node): void {
    const parent = paragraph.parentNode;

    if (parent) {
      parent.removeChild(paragraph);
    }
  }

  protected clean(): void {
    const openTag = this.openTag;
    const openNode = this.openNode;
    const initialOpenTextContent = openNode.textContent;

    if (initialOpenTextContent) {
      const openParagraphNode = this.getParagraph(openNode);
      const openRowNode = openNode.parentNode;
      const newTextContent = initialOpenTextContent.replace(openTag, "");

      if (newTextContent == "" && openRowNode) {
        openParagraphNode.removeChild(openRowNode);
      } else {
        openNode.textContent = newTextContent;
      }

      if (!openParagraphNode.textContent) {
        this.removeParagraph(openParagraphNode);
      }
    }

    const closeTag = this.closeTag;
    const closeNode = this.closeNode;
    const initialCloseTextContent = closeNode.textContent;

    if (initialCloseTextContent) {
      const closeParagraphNode = this.getParagraph(closeNode);
      const newTextContent = initialCloseTextContent.replace(closeTag, "");
      const closeRowNode = closeNode.parentNode;

      if (newTextContent == "" && closeRowNode) {
        closeParagraphNode.removeChild(closeRowNode);
      } else {
        closeNode.textContent = newTextContent;
      }

      if (!closeParagraphNode.textContent) {
        this.removeParagraph(closeParagraphNode);
      }
    }
  }

  private appendParagraph(paragraph: Node): void {
    const openNode = this.openNode;
    const closeNode = this.closeNode;

    if (openNode == closeNode) {
      const textContent = paragraph.textContent;

      if (textContent) {
        const match = textContent.match(new RegExp(`${this.openTag}.*?${this.closeTag}`));
        if (match) {
          let [content] = match;
          content = content
            .replace(this.openTag, "");

          const openNodeTextContent = openNode.textContent;

          if (openNodeTextContent) {
            openNode.textContent = openNodeTextContent.replace(this.closeTag, content);
          }
        }
      }

      return;
    }

    const openParagraphNode = this.getParagraph(openNode);
    const closeParagraphNode = this.getParagraph(closeNode);

    if (openParagraphNode == closeParagraphNode) {
      const xmlString = UtilsXml.serializer.serializeToString(paragraph);
      const paragraphWithOnlyPlaceholderChildren = UtilsXml.parser.parseFromString(
        xmlString
          .replace(new RegExp(`<a:p>.*?${this.openTag}`), "<a:p><a:r><a:t>")
          .replace(new RegExp(`${this.closeTag}.*?</a:p>`), "</a:t></a:r></a:p>"),
      );

      const childrenPlaceholders = [];
      const rowNodes = paragraphWithOnlyPlaceholderChildren.getElementsByTagName("a:r");

      for (let i = 0; i < rowNodes.length; i++) {
        const isLastRow = i == rowNodes.length - 1;
        const rowNode = rowNodes[i];

        if (isLastRow) {
          childrenPlaceholders.unshift(rowNode);

          continue;
        }

        childrenPlaceholders.push(rowNode);
      }

      childrenPlaceholders.forEach((child) => {
        if (child.textContent) {
          openParagraphNode.insertBefore(child.cloneNode(true), closeNode.parentNode);
        }
      });

      return;
    }

    const textBoxNode = UtilsXml.getParentNodeByTag("p:txBody", closeParagraphNode);
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
        textBoxNode.insertBefore(paragraphToInsert.documentElement, closeParagraphNode);

        break;
      }
    }
  }

  private forEachParagraphs(callback: (paragraph: Node) => void) {
    const openNode = this.openNode;
    const closeNode = this.closeNode;
    const openParagraphNode = this.getParagraph(openNode);
    const closeParagraphNode = this.getParagraph(closeNode);

    let currentParagraphNode: Node | null = openParagraphNode;

    while (currentParagraphNode) {
      callback(currentParagraphNode);

      if (currentParagraphNode == closeParagraphNode) {
        break;
      }

      currentParagraphNode = currentParagraphNode.nextSibling;
    }
  }

  protected getChildren(): Placeholder[] {
    const children = this.children;
    const openNode = this.openNode;
    const closeNode = this.closeNode;

    const currentChildOpenTags: string[] = [];
    const currentChildOpenNodes: Node[] = [];

    this.forEachParagraphs((paragraph) => {
      const textNodes = UtilsXml.getChildNodesByTag("a:t", paragraph);

      for (let i = 0; i < textNodes.length; i++) {
        const textNode = textNodes[i];
        const textContent = textNode.textContent;

        if (textContent) {
          const matchs = textContent.matchAll(/{.*?}/g);

          for (const match of matchs) {
            const [tag] = match;
            const isOpenTag = this.isOpenTag(tag);
            const isCloseTag = this.isCloseTag(tag);

            let hasPlaceholdersOpens = currentChildOpenTags.length > 0
              && currentChildOpenNodes.length > 0;

            if (isOpenTag) {
              if (openNode == textNode) {
                continue;
              }

              currentChildOpenTags.push(tag);
              currentChildOpenNodes.push(textNode);

              continue;
            }

            if (isCloseTag) {
              if (closeNode == textNode) {
                continue;
              }

              const openTag = currentChildOpenTags.pop();
              const currentChildOpenNode = currentChildOpenNodes.pop();

              hasPlaceholdersOpens = currentChildOpenTags.length > 0

              if (!hasPlaceholdersOpens && openTag && currentChildOpenNode) {
                const child = new PPTXPlaceholder(
                  openTag,
                  tag,
                  currentChildOpenNode,
                  textNode,
                  this.slide
                );
                this.appendChild(child);
              }

              continue;
            }

            if (!hasPlaceholdersOpens) {
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

    const children = this.getChildren();

    data.forEach((d, index) => {
      const initialChildrenCount = children.length / data.length;
      const offset = initialChildrenCount * index;
      const childrenToRender = children.slice(offset, offset + initialChildrenCount);

      childrenToRender.forEach((child) => {
        child.render(d);
      });
    });

    this.clean();
  }
}
