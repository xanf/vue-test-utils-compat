import { jest, describe, afterEach, beforeEach, it, expect } from "@jest/globals";
import { h } from "vue";
import { installCompat, compatFlags } from "../../../../src/index.js";
import { describeOption } from "../../../helpers.js";

describeOption(compatFlags.MOUNT_ARGS_CONTEXT_CLASS, () => {
  let VTU;

  const FakeComponent = (props) => h("div", { class: props.class }, "hello");

  beforeEach(async () => {
    jest.resetModules();
    VTU = { ...(await import("@vue/test-utils")) };
  });

  let wrapper;
  const makeWrapperWithCompat = (compatMode) => {
    installCompat(VTU, { [compatFlags.MOUNT_ARGS_CONTEXT_CLASS]: compatMode });
    wrapper = VTU.mount(FakeComponent, {
      context: { class: "foo" },
    });
  };

  afterEach(() => {
    wrapper.unmount();
  });

  describe("when enabled", () => {
    beforeEach(() => makeWrapperWithCompat(true));

    it("should render class passed as context.class", async () => {
      expect(wrapper.html()).toBe('<div class="foo">hello</div>');
    });
  });

  describe("when disabled", () => {
    beforeEach(() => makeWrapperWithCompat(false));

    it("should not render class passed as context.children", async () => {
      expect(wrapper.html()).toBe("<div>hello</div>");
    });
  });
});
