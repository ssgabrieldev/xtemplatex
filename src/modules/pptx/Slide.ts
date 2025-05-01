import { PPTXTemplateHandler } from "./TemplateHandler";
import { PPTXRel } from "./Rel";
import { PPTXPlaceholder } from "./Placeholder";
import { UtilsPlaceholder } from "../../utils/Placeholder";

export class PPTXSlide {
  private id: number;
  private rID: string;
  private doc: Document;
  private originalDoc: Document;
  private templateHandler: PPTXTemplateHandler;
  private rel: PPTXRel;

  private placeholders: PPTXPlaceholder[] = [];

  public number = 0;

  constructor(
    number: number,
    doc: Document,
    rel: PPTXRel,
    templateHandler: PPTXTemplateHandler,
  ) {
    this.doc = doc;
    this.rel = rel;
    this.number = number;
    this.templateHandler = templateHandler;
    this.originalDoc = doc.cloneNode(true) as Document;
    this.id = this.rel.getID(this.number);
    this.rID = this.rel.getRID(this.number);

    this.getPlaceholders();
  }

  private getPlaceholders(): PPTXPlaceholder[] {
    const placeholders = this.placeholders;
    const doc = this.doc;

    const currentChildOpenTags: string[] = [];
    const currentChildOpenNodes: Node[] = [];

    UtilsPlaceholder.forEachNodeWithPlaceholder(doc, "a:t", (textNode, tag) => {
      const isOpenTag = UtilsPlaceholder.isOpenTag(tag);
      const isCloseTag = UtilsPlaceholder.isCloseTag(tag);

      let hasPlaceholdersOpens = currentChildOpenTags.length > 0;

      if (isOpenTag) {
        currentChildOpenTags.push(tag);
        currentChildOpenNodes.push(textNode);

        return;
      }

      if (isCloseTag) {
        const openTag = currentChildOpenTags.pop();
        const currentChildOpenNode = currentChildOpenNodes.pop();

        hasPlaceholdersOpens = currentChildOpenTags.length > 0

        if (!hasPlaceholdersOpens && openTag && currentChildOpenNode) {
          const placeholder = new PPTXPlaceholder(
            openTag,
            tag,
            currentChildOpenNode,
            textNode,
            this
          );
          this.placeholders.push(placeholder)
        }

        return;
      }

      if (!hasPlaceholdersOpens) {
        const placeholder = new PPTXPlaceholder(
          tag,
          tag,
          textNode,
          textNode,
          this
        );
        this.placeholders.push(placeholder);
      }
    });

    return placeholders;
  }

  public clone(): PPTXSlide {
    return this;
  }

  public render(data: {[key: string]: any}): void {
    const placeholders = this.placeholders;

    placeholders.forEach((placeholder) => {
      placeholder.render(data[placeholder.key]);
    });
  }
}
