import { jest, describe, afterEach, beforeEach, it, expect } from "@jest/globals";
import { defineComponent, h } from "vue";
import { installCompat, compatFlags } from "../../../src/index.js";
import { describeOption } from "../../helpers.js";

describeOption(compatFlags.WRAPPER_ATTRIBUTES_VALUE, () => {
  let VTU;

  const FakeComponent = defineComponent({
    render() {
      const value = "correct";
      return h("input", { type: "text", value });
    },
  });

  beforeEach(async () => {
    jest.resetModules();
    VTU = await import("@vue/test-utils");
  });

  let wrapper;

  afterEach(() => {
    wrapper.unmount();
  });

  describe("when enabled", () => {
    beforeEach(() => {
      installCompat(VTU, { [compatFlags.WRAPPER_ATTRIBUTES_VALUE]: true });
      wrapper = VTU.mount(FakeComponent);
    });

    it("should return correct value from attributes call", async () => {
      expect(wrapper.attributes().value).toBe("correct");
      expect(wrapper.attributes("value")).toBe("correct");
      expect(wrapper.attributes().type).toBe("text");
      expect(wrapper.attributes("type")).toBe("text");
    });
  });

  describe("when disabled", () => {
    beforeEach(() => {
      installCompat(VTU, { [compatFlags.WRAPPER_ATTRIBUTES_VALUE]: false });
      wrapper = VTU.mount(FakeComponent);
    });

    it("should not return correct value from attributes call", async () => {
      // value is not actually managed as attribute in Vue3
      expect(wrapper.attributes().value).toBeUndefined();
      expect(wrapper.attributes("value")).toBeUndefined();
      expect(wrapper.attributes().type).toBe("text");
      expect(wrapper.attributes("type")).toBe("text");
    });
  });
});
