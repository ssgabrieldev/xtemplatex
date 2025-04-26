import { mkdirSync, readFileSync, writeFileSync } from "fs";

import { dirname } from "path";

import JSZip from "jszip";

import { DOMParser } from "xmldom";

export class FileHandler {
  private zip = new JSZip();
  private parser = new DOMParser();
  private path = "";

  constructor(path: string) {
    this.path = path;
  }

  public async load() {
    const buffer = readFileSync(this.path);

    await this.zip.loadAsync(buffer);
  }

  public write(path: string, content: string) {
    this.zip.file(path, content);
  }

  public async content(path: string) {
    const file = this.zip.file(path);

    if (file) {
      const xml = await file.async("string");
      const document = this.parser.parseFromString(
        xml,
        "application/xml"
      );

      return document;
    }
  }

  public async save(path: string) {
    const dirPath = dirname(path);
    mkdirSync(dirPath, { recursive: true });

    const buffer = await this.zip.generateAsync({ type: "nodebuffer" });
    writeFileSync(path, buffer);
  }
}
