import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import { defineComponent, h } from "vue";
import { installCompat, compatFlags } from "../../../src/index.js";
import { describeOption } from "../../helpers.js";

describeOption(compatFlags.WRAPPER_VUE_SET_VALUE_USES_DOM, () => {
  let VTU;

  const InputComponent = defineComponent({
    name: "InputComponent",
    template: `<input type="text">`,
  });

  const FakeComponent = () => h(InputComponent);

  beforeEach(async () => {
    jest.resetModules();
    VTU = await import("@vue/test-utils");
  });

  let wrapper;

  describe("when enabled", () => {
    it("model event is triggered", async () => {
      installCompat(VTU, { [compatFlags.WRAPPER_VUE_SET_VALUE_USES_DOM]: true });
      wrapper = VTU.mount(FakeComponent);

      await wrapper.findComponent(InputComponent).setValue("test");

      expect(wrapper.findComponent(InputComponent).emitted().input).toBeDefined();
      expect(wrapper.findComponent(InputComponent).emitted().change).toBeDefined();
      expect(wrapper.findComponent(InputComponent).emitted()["update:modelValue"]).toBeUndefined();
    });
  });

  describe("when disabled", () => {
    it("both input and change events are triggered", async () => {
      installCompat(VTU, { [compatFlags.WRAPPER_VUE_SET_VALUE_USES_DOM]: false });
      wrapper = VTU.mount(FakeComponent);

      await wrapper.findComponent(InputComponent).setValue("test");

      expect(wrapper.findComponent(InputComponent).emitted()).toStrictEqual({ "update:modelValue": [["test"]] });
    });
  });
});
