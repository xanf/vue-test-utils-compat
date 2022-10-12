import { jest, describe, afterEach, beforeEach, it, expect } from "@jest/globals";
import { installCompat, compatFlags } from "../../../src/index.js";
import { describeOption } from "../../helpers.js";

describeOption(compatFlags.MOUNT_ARGS_DIRECTIVES, () => {
  let VTU;

  beforeEach(async () => {
    jest.resetModules();
    VTU = { ...(await import("@vue/test-utils")) };
  });

  const directiveCreated = jest.fn();
  let wrapper;
  const makeWrapperWithCompat = (compatMode) => {
    const FakeComponent = {
      template: "<div v-custom-dir>i-am-root</div>",
    };

    installCompat(VTU, { [compatFlags.MOUNT_ARGS_DIRECTIVES]: compatMode, [compatFlags.MOUNT_ARGS_STUBS]: compatMode });
    wrapper = VTU.mount(FakeComponent, {
      global: {
        config: {
          warnHandler: () => {},
        },
      },
      directives: {
        CustomDir: { created: directiveCreated },
      },
    });
  };

  afterEach(() => {
    wrapper.unmount();
  });

  describe("when enabled", () => {
    it("directives option is respected", async () => {
      makeWrapperWithCompat(true);
      expect(wrapper.html()).toBe("<div>i-am-root</div>");
      expect(directiveCreated).toHaveBeenCalled();
    });
  });

  describe("when disabled", () => {
    it("directives option is ignored", async () => {
      expect(() => makeWrapperWithCompat(false)).toThrow();
    });
  });
});
