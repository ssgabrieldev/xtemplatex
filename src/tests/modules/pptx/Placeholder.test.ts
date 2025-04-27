import { PPTXPlaceholder } from "../../../modules/pptx/Placeholder";
import { PPTXSlide } from "../../../modules/pptx/Slide";
import { UtilsXml } from "../../../utils/Xml";

describe("PPTXPlaceholder", () => {
  it("should replace placeholder by text", () => {
    const tag = '{item}'
    const expectedOutput = UtilsXml.parser.parseFromString(`
      <a:p>
        <a:r>
          <a:t>foo</a:t>
        </a:r>
      </a:p>
    `, "application/xml");
    const input = UtilsXml.parser.parseFromString(`
      <a:p>
        <a:r>
          <a:t>${tag}</a:t>
        </a:r>
      </a:p>
    `, "application/xml");
    const placeholderInputNode = input.getElementsByTagName("a:t")[0]

    const placeholder = new PPTXPlaceholder(
      tag,
      tag,
      placeholderInputNode,
      placeholderInputNode,
      {} as PPTXSlide
    );

    placeholder.render("foo");

    const parentNodeXMLString = UtilsXml.serializer.serializeToString(input);
    const expectedOutputXMLString = UtilsXml.serializer.serializeToString(expectedOutput);

    expect(parentNodeXMLString.replace(/\s+/g, ""))
      .toBe(expectedOutputXMLString.replace(/\s+/g, ""));
  });

  it ("should loop inline placeholder", () => {
    const openTag = "{#names}";
    const closeTag = "{/names}";
    const names = [
      "name1",
      "name2",
      "name3"
    ]
    const expectedOutput = UtilsXml.parser.parseFromString(`
      <a:p>
        <a:r>
          <a:t>names: name: ${names[0]},name: ${names[1]},name: ${names[2]}, end</a:t>
        </a:r>
      </a:p>
    `, "application/xml");
    const input = UtilsXml.parser.parseFromString(`
      <a:p>
        <a:r>
          <a:t>names: ${openTag}name: {name},${closeTag} end</a:t>
        </a:r>
      </a:p>
    `, "application/xml");
    const placeholderInputNode = input.getElementsByTagName("a:t")[0]

    const placeholder = new PPTXPlaceholder(
      openTag,
      closeTag,
      placeholderInputNode,
      placeholderInputNode,
      {} as PPTXSlide
    );

    placeholder.render(names);

    const parentNodeXMLString = UtilsXml.serializer.serializeToString(input);
    const expectedOutputXMLString = UtilsXml.serializer.serializeToString(expectedOutput);

    expect(parentNodeXMLString.replace(/\s+/g, ""))
      .toBe(expectedOutputXMLString.replace(/\s+/g, ""));
  });

  it("should loop all lines of placeholder", () => {
    const openTag = "{#names}";
    const closeTag = "{/names}";
    const names = [
      "name1",
      "name2",
      "name3"
    ]
    const expectedOutput = UtilsXml.parser.parseFromString(`
      <p:txBody>
        <a:p>
          <a:r>
            <a:t>names: </a:t>
          </a:r>
        </a:p>
        <a:p>
          <a:r>
            <a:t>name: ${names[0]},</a:t>
          </a:r>
        </a:p>
        <a:p>
          <a:r>
            <a:t>name: ${names[1]},</a:t>
          </a:r>
        </a:p>
        <a:p>
          <a:r>
            <a:t>name: ${names[2]},</a:t>
          </a:r>
        </a:p>
        <a:p>
          <a:r>
            <a:t> end</a:t>
          </a:r>
        </a:p>
      </p:txBody>
    `, "application/xml");
    const input = UtilsXml.parser.parseFromString(`
      <p:txBody>
        <a:p>
          <a:r>
            <a:t>names: ${openTag}</a:t>
          </a:r>
        </a:p>
        <a:p>
          <a:r>
            <a:t>name: {name},</a:t>
          </a:r>
        </a:p>
        <a:p>
          <a:r>
            <a:t>${closeTag} end</a:t>
          </a:r>
        </a:p>
      </p:txBody>
    `.replaceAll(/\s*/g, ""), "application/xml");
    const textNodes = input.getElementsByTagName("a:t");
    const openNode = textNodes[0];
    const closeNode = textNodes[2];

    const placeholder = new PPTXPlaceholder(
      openTag,
      closeTag,
      openNode,
      closeNode,
      {} as PPTXSlide
    );

    placeholder.render(names);

    const parentNodeXMLString = UtilsXml.serializer.serializeToString(input);
    const expectedOutputXMLString = UtilsXml.serializer.serializeToString(expectedOutput);

    expect(parentNodeXMLString.replace(/\s+/g, ""))
      .toBe(expectedOutputXMLString.replace(/\s+/g, ""));
  });
});
