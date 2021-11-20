import { jest, describe, afterEach, beforeEach, it, expect } from "@jest/globals";
import { h } from "vue";
import { installCompat, compatFlags } from "../../../../src/index.js";
import { describeOption } from "../../../helpers.js";

describeOption(compatFlags.MOUNT_ARGS_CONTEXT_CHILDREN, () => {
  let VTU;

  const FakeComponent = (props, context) => h("div", context.slots.default?.());

  beforeEach(async () => {
    jest.resetModules();
    VTU = { ...(await import("@vue/test-utils")) };
  });

  let wrapper;
  const makeWrapperWithCompat = (compatMode) => {
    installCompat(VTU, { [compatFlags.MOUNT_ARGS_CONTEXT_CHILDREN]: compatMode });
    wrapper = VTU.mount(FakeComponent, {
      context: {
        children: ["foo", "<span>bar</span>"],
      },
    });
  };

  afterEach(() => {
    wrapper.unmount();
  });

  describe("when enabled", () => {
    beforeEach(() => makeWrapperWithCompat(true));

    it("should render children passed as context.children as default slot", async () => {
      expect(wrapper.html()).toBe("<div>foo<span>bar</span></div>");
    });
  });

  describe("when disabled", () => {
    beforeEach(() => makeWrapperWithCompat(false));

    it("should not render children passed as context.children", async () => {
      expect(wrapper.html()).toBe("<div></div>");
    });
  });
});
