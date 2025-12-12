import { html, fixture, expect } from '@open-wc/testing';
import "../fox-api.js";

describe("FoxApi test", () => {
  let element;
  beforeEach(async () => {
    element = await fixture(html`
      <fox-api
        title="title"
      ></fox-api>
    `);
  });

  it("basic will it blend", async () => {
    expect(element).to.exist;
  });

  it("passes the a11y audit", async () => {
    await expect(element).shadowDom.to.be.accessible();
  });
});
