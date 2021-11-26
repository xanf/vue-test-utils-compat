import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import { defineComponent } from "vue";
import { installCompat, compatFlags } from "../../../src/index.js";
import { describeOption } from "../../helpers.js";

describeOption(compatFlags.WRAPPER_FIND_COMPONENT_BY_REF_RETURNS_DOM, () => {
  let VTU;

  const FakeComponent = defineComponent({
    template: `<div><span ref="demo">Hello</span></div>`,
  });

  beforeEach(async () => {
    jest.resetModules();
    VTU = await import("@vue/test-utils");
  });

  let wrapper;

  describe("when enabled", () => {
    it("findComponent by ref finds relevant DOM nodes", () => {
      installCompat(VTU, { [compatFlags.WRAPPER_FIND_COMPONENT_BY_REF_RETURNS_DOM]: true });
      wrapper = VTU.mount(FakeComponent);

      expect(wrapper.findComponent({ ref: "demo" }).text()).toBe("Hello");
    });
  });

  describe("when disabled", () => {
    it("find/findAll returns components", () => {
      installCompat(VTU, { [compatFlags.WRAPPER_FIND_COMPONENT_BY_REF_RETURNS_DOM]: false });
      wrapper = VTU.mount(FakeComponent);

      expect(wrapper.findComponent({ ref: "demo" }).exists()).toBe(false);
    });
  });
});
