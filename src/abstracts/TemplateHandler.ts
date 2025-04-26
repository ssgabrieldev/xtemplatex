import { FileHandler } from "../modules/file/FileHandler"

export abstract class TemplateHandler {
  abstract fileHandler: FileHandler;

  public abstract render(data: object): void;
  public abstract save(path: string): void;
}
