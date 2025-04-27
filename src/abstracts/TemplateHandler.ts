import { FileHandler } from "../modules/file/FileHandler"

export abstract class TemplateHandler {
  private fileHandler: FileHandler;

  constructor(path: string) {
    this.fileHandler = new FileHandler(path);
  }

  public abstract render(data: object): void;
  public abstract save(path: string): void;
}
