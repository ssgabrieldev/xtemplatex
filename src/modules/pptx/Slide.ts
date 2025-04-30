import { PPTXTemplateHandler } from "./TemplateHandler";
import { PPTXRel } from "./Rel";
import { PPTXPlaceholder } from "./Placeholder";

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
    return [];
  }

  public clone(): PPTXSlide {
    return this;
  }

  public render(data: object): void {
  }
}
