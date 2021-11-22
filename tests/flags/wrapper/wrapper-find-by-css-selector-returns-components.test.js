import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import { defineComponent } from "vue";
import { installCompat, compatFlags } from "../../../src/index.js";
import { describeOption } from "../../helpers.js";

describeOption(compatFlags.WRAPPER_FIND_BY_CSS_SELECTOR_RETURNS_COMPONENTS, () => {
  let VTU;

  const NestedCmp = defineComponent({
    props: ["text"],
    template: "<h1>{{ text }}</h1>",
  });

  const FakeComponent = defineComponent({
    components: { NestedCmp },
    template: [
      "<div>",
      "<nested-cmp class='foo' />",
      "<p class='foo'>1</p>",
      "<p class='foo'>2</p>",
      "<nested-cmp class='foo' />",
      "</div>",
    ].join(""),
  });

  beforeEach(async () => {
    jest.resetModules();
    VTU = await import("@vue/test-utils");
  });

  let wrapper;
  let results;
  let result;

  describe("when enabled", () => {
    it("find/findAll returns components", () => {
      installCompat(VTU, { [compatFlags.WRAPPER_FIND_BY_CSS_SELECTOR_RETURNS_COMPONENTS]: true });
      wrapper = VTU.mount(FakeComponent);
      results = wrapper.findAll(".foo");
      result = wrapper.find(".foo");

      expect(results).toHaveLength(4);
      expect(results[0]).toBeInstanceOf(VTU.VueWrapper);
      expect(results[1]).toBeInstanceOf(VTU.DOMWrapper);
      expect(results[2]).toBeInstanceOf(VTU.DOMWrapper);
      expect(results[3]).toBeInstanceOf(VTU.VueWrapper);
      expect(result).toBeInstanceOf(VTU.VueWrapper);
    });
  });

  describe("when disabled", () => {
    it("find/findAll returns components", () => {
      installCompat(VTU, { [compatFlags.WRAPPER_FIND_BY_CSS_SELECTOR_RETURNS_COMPONENTS]: true });
      wrapper = VTU.mount(FakeComponent);
      results = wrapper.findAll(".foo");
      result = wrapper.find(".foo");

      expect(results).toHaveLength(4);
      expect(results[0]).toBeInstanceOf(VTU.VueWrapper);
      expect(results[1]).toBeInstanceOf(VTU.DOMWrapper);
      expect(results[2]).toBeInstanceOf(VTU.DOMWrapper);
      expect(results[3]).toBeInstanceOf(VTU.VueWrapper);
      expect(result).toBeInstanceOf(VTU.VueWrapper);
    });
  });
});
