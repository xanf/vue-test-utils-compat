import { jest, describe, afterEach, beforeEach, it, expect } from "@jest/globals";
import { h } from "vue";
import { installCompat, compatFlags } from "../../../src/index.js";
import { describeOption } from "../../helpers.js";

describeOption(compatFlags.WRAPPER_ATTRIBUTES_DISABLED, () => {
  let VTU;

  const FakeComponent = () => h("input", { type: "text", disabled: "" });
  const FakeComponentWithoutDisabled = () => h("input", { type: "text" });

  beforeEach(async () => {
    jest.resetModules();
    VTU = await import("@vue/test-utils");
  });

  let wrapper;
  let wrapperWithoutDisabled;

  afterEach(() => {
    wrapper.unmount();
  });

  describe("when enabled", () => {
    beforeEach(() => {
      installCompat(VTU, { [compatFlags.WRAPPER_ATTRIBUTES_DISABLED]: true });
      wrapper = VTU.mount(FakeComponent);
      wrapperWithoutDisabled = VTU.mount(FakeComponentWithoutDisabled);
    });

    it("should return normalized value for disabled from attributes call", async () => {
      expect(wrapper.attributes().disabled).toBe("disabled");
      expect(wrapper.attributes("disabled")).toBe("disabled");
      expect(wrapper.attributes().type).toBe("text");
      expect(wrapper.attributes("type")).toBe("text");
      expect(wrapperWithoutDisabled.attributes().disabled).toBe(undefined);
      expect(wrapperWithoutDisabled.attributes("disabled")).toBe(undefined);
      expect(wrapperWithoutDisabled.attributes().type).toBe("text");
      expect(wrapperWithoutDisabled.attributes("type")).toBe("text");
    });
  });

  describe("when disabled", () => {
    beforeEach(() => {
      installCompat(VTU, { [compatFlags.WRAPPER_ATTRIBUTES_VALUE]: false });
      wrapper = VTU.mount(FakeComponent);
      wrapperWithoutDisabled = VTU.mount(FakeComponentWithoutDisabled);
    });

    it("should not modify disabled value from attributes call", async () => {
      expect(wrapper.attributes().disabled).toBe("");
      expect(wrapper.attributes("disabled")).toBe("");
      expect(wrapper.attributes().type).toBe("text");
      expect(wrapper.attributes("type")).toBe("text");
      expect(wrapperWithoutDisabled.attributes().disabled).toBe(undefined);
      expect(wrapperWithoutDisabled.attributes("disabled")).toBe(undefined);
      expect(wrapperWithoutDisabled.attributes().type).toBe("text");
      expect(wrapperWithoutDisabled.attributes("type")).toBe("text");
    });
  });
});
