import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import { defineComponent } from "vue";
import { installCompat, compatFlags } from "../../../src/index.js";
import { describeOption } from "../../helpers.js";

describeOption(compatFlags.WRAPPER_SET_VALUE_DOES_NOT_TRIGGER_CHANGE, () => {
  let VTU;

  const onInput = jest.fn();
  const onChange = jest.fn();
  const FakeComponent = defineComponent({
    methods: { onInput, onChange },
    template: `<div><input @input="onInput" @change="onChange" type="text"></div>`,
  });

  beforeEach(async () => {
    jest.resetModules();
    VTU = await import("@vue/test-utils");
  });

  let wrapper;

  describe("when enabled", () => {
    it("only input event is triggered", async () => {
      installCompat(VTU, { [compatFlags.WRAPPER_SET_VALUE_DOES_NOT_TRIGGER_CHANGE]: true });
      wrapper = VTU.mount(FakeComponent);

      await wrapper.find("input").setValue("test");

      expect(onInput).toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("when disabled", () => {
    it("both input and change events are triggered", async () => {
      installCompat(VTU, { [compatFlags.WRAPPER_SET_VALUE_DOES_NOT_TRIGGER_CHANGE]: false });
      wrapper = VTU.mount(FakeComponent);

      await wrapper.find("input").setValue("test");

      expect(onInput).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalled();
    });
  });
});
