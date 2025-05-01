import { PPTXRel } from "../../../modules/pptx/Rel";
import { PPTXSlide } from "../../../modules/pptx/Slide";
import { PPTXTemplateHandler } from "../../../modules/pptx/TemplateHandler";
import { UtilsXml } from "../../../utils/Xml";

describe("PPTX Slide", () => {
  it("should load placeholders", () => {
    const doc = UtilsXml.parser.parseFromString(
      `
        <slide>
          <p:txBody>
            <a:p>
              <a:r>
                <a:t>
                  Pre txt {placeholder1}
                </a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:t>
                  {placeholder2} Pos txt
                </a:t>
              </a:r>
            </a:p>
          </p:txBody>
          <p:txBody>
            <a:p>
              <a:r>
                <a:t>
                  {#placeholder3}
                </a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:t>
                  {placeholder1} Between txt {/placeholder3}
                </a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </slide>
      `.replaceAll(/\s+/g, ""),
      "application/xml"
    );
    const templateHandler = {} as PPTXTemplateHandler;
    const rel = {
      getID: (_slideNumber: number) => 1,
      getRID: (_slideNumber: number) => 'rId1'
    } as PPTXRel;
    const slide = new PPTXSlide(
      1,
      doc,
      rel,
      templateHandler
    );

    expect((slide as any).placeholders.length)
      .toBe(3);
  });

  it("should load placeholders", () => {
    const data = {
      placeholder1: "texto 1",
      placeholder2: "texto 2",
      placeholder3: [
        "texto 3",
        "texto 4"
      ]
    }
    const output = UtilsXml.parser.parseFromString(`
        <slide>
          <p:txBody>
            <a:p>
              <a:r>
                <a:t>
                  Pre txt ${data.placeholder1}
                </a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:t>
                  ${data.placeholder2} Pos txt
                </a:t>
              </a:r>
            </a:p>
          </p:txBody>
          <p:txBody>
            <a:p>
              <a:r>
                <a:t>
                  ${data.placeholder3[0]} Between txt 
                </a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:t>
                  ${data.placeholder3[1]} Between txt 
                </a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </slide>
      `.replaceAll(/\s+/g, ""),
      "application/xml"
    );
    const input = UtilsXml.parser.parseFromString(
      `
        <slide>
          <p:txBody>
            <a:p>
              <a:r>
                <a:t>
                  Pre txt {placeholder1}
                </a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:t>
                  {placeholder2} Pos txt
                </a:t>
              </a:r>
            </a:p>
          </p:txBody>
          <p:txBody>
            <a:p>
              <a:r>
                <a:t>
                  {#placeholder3}
                </a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:t>
                  {placeholder1} Between txt {/placeholder3}
                </a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </slide>
      `.replaceAll(/\s+/g, ""),
      "application/xml"
    );
    const templateHandler = {} as PPTXTemplateHandler;
    const rel = {
      getID: (_slideNumber: number) => 1,
      getRID: (_slideNumber: number) => 'rId1'
    } as PPTXRel;
    const slide = new PPTXSlide(
      1,
      input,
      rel,
      templateHandler
    );

    slide.render(data);

    const inputResult = UtilsXml.serializer.serializeToString(input);
    const expectedOutput = UtilsXml.serializer.serializeToString(output);

    expect(inputResult.replaceAll(/\s+/g, ""))
      .toBe(expectedOutput.replaceAll(/\s+/g, ""));
  });
});
