import { jest, describe, afterEach, beforeEach, it, expect } from "@jest/globals";
import { installCompat, compatFlags } from "../../../src/index.js";
import { describeOption } from "../../helpers.js";

describeOption(compatFlags.MOUNT_ARGS_STUBS, () => {
  let VTU;

  const ChildComponent = {
    name: "ChildComponent",
    template: "i-am-child",
  };

  const FakeComponent = {
    components: { ChildComponent },
    template: "<div>i-am-root <child-component /></div>",
  };

  beforeEach(async () => {
    jest.resetModules();
    VTU = { ...(await import("@vue/test-utils")) };
  });

  let wrapper;
  const makeWrapperWithCompat = (compatMode) => {
    installCompat(VTU, { [compatFlags.MOUNT_ARGS_STUBS]: compatMode });
    wrapper = VTU.mount(FakeComponent, {
      stubs: {
        ChildComponent: { template: "stubbed-child" },
      },
    });
  };

  afterEach(() => {
    wrapper.unmount();
  });

  describe("when enabled", () => {
    beforeEach(() => makeWrapperWithCompat(true));

    it("stubs option is respected", async () => {
      expect(wrapper.text()).toBe("i-am-root stubbed-child");
    });

    it("handle stubs passed as string", () => {
      expect(VTU.mount(FakeComponent, { stubs: { ChildComponent: "string-stub" } }).text()).toBe(
        "i-am-root string-stub"
      );
    });

    it("handle stubs passed as array", () => {
      expect(
        VTU.mount(FakeComponent, { stubs: ["ChildComponent"] })
          .findComponent(ChildComponent)
          .html()
      ).toBe("<child-component-stub></child-component-stub>");
    });

    it("does not throw when stubs is null", () => {
      expect(() => VTU.mount(FakeComponent, { stubs: null })).not.toThrow();
    });
  });

  describe("when disabled", () => {
    beforeEach(() => makeWrapperWithCompat(false));

    it("stubs option is ignored", async () => {
      expect(wrapper.text()).toBe("i-am-root i-am-child");
    });
  });
});
