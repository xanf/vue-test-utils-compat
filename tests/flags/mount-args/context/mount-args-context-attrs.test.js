import { jest, describe, afterEach, beforeEach, it, expect } from "@jest/globals";
import { h } from "vue";
import { installCompat, compatFlags } from "../../../../src/index.js";
import { describeOption } from "../../../helpers.js";

describeOption(compatFlags.MOUNT_ARGS_CONTEXT_ATTRS, () => {
  let VTU;

  const FakeComponent = (props) => h("div", props, "hello");

  beforeEach(async () => {
    jest.resetModules();
    VTU = { ...(await import("@vue/test-utils")) };
  });

  let wrapper;
  const makeWrapperWithCompat = (compatMode) => {
    installCompat(VTU, { [compatFlags.MOUNT_ARGS_CONTEXT_ATTRS]: compatMode });
    wrapper = VTU.mount(FakeComponent, {
      context: { attrs: { "aria-label": "test" } },
    });
  };

  afterEach(() => {
    wrapper.unmount();
  });

  describe("when enabled", () => {
    beforeEach(() => makeWrapperWithCompat(true));

    it("attrs from context.attrs are passed to props", async () => {
      expect(wrapper.html()).toBe(`<div aria-label="test">hello</div>`);
    });
  });

  describe("when disabled", () => {
    beforeEach(() => makeWrapperWithCompat(false));

    it("attrs from context.attrs are ignored", async () => {
      expect(wrapper.html()).toBe(`<div>hello</div>`);
    });
  });
});
