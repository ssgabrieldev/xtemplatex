export class PPTXRel {
  private presentation: Document;
  private presentationRels: Document;
  public lastID: number = 0;
  public lastRID: string = "rId0";

  constructor(presentation: Document, presentationRels: Document) {
    this.presentation = presentation;
    this.presentationRels = presentationRels;
  }

  public getID(slideNumber: number): number {
    return 0;
  }

  public getRID(slideNumber: number): string {
    return "rId0";
  }

  public createRel(slideNumber: number): ({id: number, rID: string}) {
    return ({
      id: 0,
      rID: "rId0"
    });
  }

  public updateNumber(rID: string, slideNumber: number): void {

  }
}
