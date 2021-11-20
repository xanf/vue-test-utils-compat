import { jest, describe, afterEach, beforeEach, it, expect } from "@jest/globals";
import { defineComponent } from "vue";
import { installCompat, compatFlags } from "../../../src/index.js";
import { describeOption } from "../../helpers.js";

describeOption(compatFlags.MOUNT_ARGS_MOCKS, () => {
  let VTU;

  const FakeComponent = defineComponent({
    template: "<div>hello</div>",
  });

  beforeEach(async () => {
    jest.resetModules();
    VTU = { ...(await import("@vue/test-utils")) };
  });

  let wrapper;
  const makeWrapperWithCompat = (compatMode) => {
    installCompat(VTU, { [compatFlags.MOUNT_ARGS_MOCKS]: compatMode });
    wrapper = VTU.mount(FakeComponent, {
      mocks: { $mockValue: "something" },
    });
  };

  afterEach(() => {
    wrapper.unmount();
  });

  describe("when enabled", () => {
    beforeEach(() => makeWrapperWithCompat(true));

    it("mocks option is respected", async () => {
      expect(wrapper.vm.$mockValue).toBe("something");
    });
  });

  describe("when disabled", () => {
    beforeEach(() => makeWrapperWithCompat(false));

    it("mocks option is ignored", async () => {
      expect(wrapper.vm.$mockValue).toBeUndefined();
    });
  });
});
