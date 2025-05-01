import { TemplateHandler } from "../../abstracts/TemplateHandler";

import {PPTXSlide} from "./Slide";

export class PPTXTemplateHandler extends TemplateHandler {
  private slides: PPTXSlide[] = [];

  private getSlides(): PPTXSlide[] {
    return []
  }

  public addSlide(slide: PPTXSlide): void {

  }

  public render(data: object): void {
      
  }

  public save(path: string): void {
      
  }
}
