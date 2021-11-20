import { jest, describe, afterEach, beforeEach, it, expect } from "@jest/globals";
import { h } from "vue";
import { installCompat, compatFlags } from "../../../../src/index.js";
import { describeOption } from "../../../helpers.js";

describeOption(compatFlags.MOUNT_ARGS_CONTEXT_ON, () => {
  let VTU;

  const FakeComponent = (props) => h("div", props, "hello");

  beforeEach(async () => {
    jest.resetModules();
    VTU = { ...(await import("@vue/test-utils")) };
  });

  let wrapper;
  const clickHandler = jest.fn();
  const makeWrapperWithCompat = (compatMode) => {
    installCompat(VTU, { [compatFlags.MOUNT_ARGS_CONTEXT_ON]: compatMode });
    wrapper = VTU.mount(FakeComponent, {
      context: { on: { click: clickHandler } },
    });
  };

  afterEach(() => {
    wrapper.unmount();
  });

  describe("when enabled", () => {
    beforeEach(() => makeWrapperWithCompat(true));

    it("handler passed in context.on should be triggered", async () => {
      await wrapper.trigger("click");
      expect(clickHandler).toHaveBeenCalled();
    });

    it("does not throw when context.on is null", () => {
      expect(() => VTU.mount(FakeComponent, { context: { on: null } })).not.toThrow();
    });
  });

  describe("when disabled", () => {
    beforeEach(() => makeWrapperWithCompat(false));

    it("handler passed in context.on is ignored", async () => {
      await wrapper.trigger("click");
      expect(clickHandler).not.toHaveBeenCalled();
    });
  });
});
