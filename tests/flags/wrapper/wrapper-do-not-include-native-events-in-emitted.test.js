import { jest, describe, afterEach, beforeEach, it, expect } from "@jest/globals";
import { defineComponent } from "vue";
import { installCompat, compatFlags } from "../../../src/index.js";
import { describeOption } from "../../helpers.js";

describeOption(compatFlags.WRAPPER_DO_NOT_INCLUDE_NATIVE_EVENTS_IN_EMITTED, () => {
  let VTU;

  const FakeComponent = defineComponent({
    template: `<div @click="$emit('click-event')">clicker</div>`,
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
      installCompat(VTU, { [compatFlags.WRAPPER_DO_NOT_INCLUDE_NATIVE_EVENTS_IN_EMITTED]: true });
      wrapper = VTU.mount(FakeComponent);
    });

    it("should ignore native event in emitted", async () => {
      await wrapper.trigger("click");
      expect(Object.keys(wrapper.emitted())).toHaveLength(1);
      expect(wrapper.emitted()["click-event"]).toBeDefined();
    });
  });

  describe("when disabled", () => {
    beforeEach(() => {
      installCompat(VTU, { [compatFlags.WRAPPER_DO_NOT_INCLUDE_NATIVE_EVENTS_IN_EMITTED]: false });
      wrapper = VTU.mount(FakeComponent);
    });

    it("should ignore native event in emitted", async () => {
      await wrapper.trigger("click");
      expect(Object.keys(wrapper.emitted())).toHaveLength(2);
      expect(wrapper.emitted()["click-event"]).toBeDefined();
      expect(wrapper.emitted().click).toBeDefined();
      expect(wrapper.emitted().click[0][0]).toBeInstanceOf(Event);
    });
  });
});
