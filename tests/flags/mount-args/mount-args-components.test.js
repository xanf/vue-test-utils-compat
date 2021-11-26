import { jest, describe, afterEach, beforeEach, it, expect } from "@jest/globals";
import { installCompat, compatFlags } from "../../../src/index.js";
import { describeOption } from "../../helpers.js";

describeOption(compatFlags.MOUNT_ARGS_COMPONENTS, () => {
  let VTU;

  beforeEach(async () => {
    jest.resetModules();
    VTU = { ...(await import("@vue/test-utils")) };
  });

  let wrapper;
  const makeWrapperWithCompat = (compatMode) => {
    const ChildComponent = {
      name: "ChildComponent",
      template: "<div>i-am-child <some-global-component /></div>",
    };

    const FakeComponent = {
      components: { ChildComponent },
      template: "<div>i-am-root <child-component /></div>",
    };

    installCompat(VTU, { [compatFlags.MOUNT_ARGS_COMPONENTS]: compatMode });
    wrapper = VTU.mount(FakeComponent, {
      global: {
        config: {
          warnHandler: () => {},
        },
      },
      components: {
        SomeGlobalComponent: { template: "<div>i-am-global</div>" },
      },
    });
  };

  afterEach(() => {
    wrapper.unmount();
  });

  describe("when enabled", () => {
    beforeEach(() => makeWrapperWithCompat(true));

    it("components option is respected", async () => {
      expect(wrapper.text()).toBe("i-am-root i-am-child i-am-global");
    });
  });

  describe("when disabled", () => {
    beforeEach(() => makeWrapperWithCompat(false));

    it("components option is ignored", async () => {
      expect(wrapper.text()).toBe("i-am-root i-am-child");
    });
  });
});
