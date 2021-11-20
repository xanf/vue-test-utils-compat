import { jest, it, beforeEach, expect, describe } from "@jest/globals";
import { installCompat, compatFlags } from "../../../src/index.js";
import { describeOption } from "../../helpers.js";

describeOption(compatFlags.WRAPPER_DESTROY, () => {
  let VTU;
  beforeEach(async () => {
    jest.resetModules();
    VTU = { ...(await import("@vue/test-utils")) };
  });

  describe("when enabled", () => {
    beforeEach(() => {
      installCompat(VTU, { [compatFlags.WRAPPER_DESTROY]: true });
    });

    it("should call unmount instead of destroy when enabled", async () => {
      const unmounted = jest.fn();
      const FakeComponent = {
        template: "<div></div>",
        unmounted,
      };
      const wrapper = VTU.mount(FakeComponent);
      wrapper.destroy();
      expect(unmounted).toHaveBeenCalled();
    });
  });

  describe("when disabled", () => {
    beforeEach(() => {
      installCompat(VTU, { [compatFlags.WRAPPER_DESTROY]: false });
    });

    it("should not provide destroy method on wrapper when disabled", async () => {
      const unmounted = jest.fn();
      const FakeComponent = {
        template: "<div></div>",
        unmounted,
      };

      const wrapper = VTU.mount(FakeComponent);
      expect(wrapper.destroy).toBeUndefined();
    });
  });
});
