import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import { defineComponent } from "vue";
import { installCompat, compatFlags } from "../../../src/index.js";
import { describeOption } from "../../helpers.js";

describeOption(compatFlags.EXPORT_CREATE_WRAPPER, () => {
  let VTU;

  const FakeComponent = defineComponent({ template: "<div>hello</div>" });

  beforeEach(async () => {
    jest.resetModules();
    VTU = { ...(await import("@vue/test-utils")) };
  });

  describe("when enabled", () => {
    beforeEach(() => {
      installCompat(VTU, { [compatFlags.EXPORT_CREATE_WRAPPER]: true });
    });

    it("exposes createWrapper on VTU module", () => {
      expect(VTU.createWrapper).toBeInstanceOf(Function);
    });

    it("returns DOM wrapper when called on a DOM node", () => {
      const domNode = document.createElement("div"); //
      const wrapper = VTU.createWrapper(domNode);
      expect(wrapper).toBeInstanceOf(VTU.DOMWrapper);
    });

    it("returns Vue wrapper when called on a Vue vm", () => {
      const otherWrapper = VTU.mount(FakeComponent);
      const wrapper = VTU.createWrapper(otherWrapper.vm);
      expect(wrapper).toBeInstanceOf(VTU.VueWrapper);
    });
  });

  describe("when disabled", () => {
    beforeEach(() => {
      installCompat(VTU, { [compatFlags.EXPORT_CREATE_WRAPPER]: false });
    });

    it("does not expose createWrapper", () => {
      expect(VTU.createWrapper).toBeUndefined();
    });
  });
});
