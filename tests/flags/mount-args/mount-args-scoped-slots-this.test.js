import { jest, describe, afterEach, beforeEach, it, expect } from "@jest/globals";
import { h } from "vue";
import { installCompat, compatFlags } from "../../../src/index.js";
import { describeOption } from "../../helpers.js";

describeOption(compatFlags.MOUNT_ARGS_SCOPED_SLOTS_THIS, () => {
  let VTU;

  const FakeComponent = (props, context) =>
    h("div", ["hello", " ", context.slots?.default?.(), " ", context.slots?.scoped?.({ foo: "bar" })]);

  beforeEach(async () => {
    jest.resetModules();
    VTU = { ...(await import("@vue/test-utils")) };
  });

  let wrapper;
  const mountComponent = () => {
    wrapper = VTU.mount(FakeComponent, {
      global: {
        config: {
          warnHandler: () => {},
        },
      },
      slots: {
        default: "<div>default</div>",
      },
      scopedSlots: {
        scoped(scope) {
          this.$set(scope, "baz", "$set");
          return this.$createElement("div", [scope.foo, " ", scope.baz]);
        },
      },
    });
  };

  afterEach(() => {
    wrapper.unmount();
  });

  describe("when enabled", () => {
    beforeEach(() => {
      installCompat(
        VTU,
        {
          [compatFlags.MOUNT_ARGS_SCOPED_SLOTS]: true,
          [compatFlags.MOUNT_ARGS_SCOPED_SLOTS_THIS]: true,
        },
        h
      );
      mountComponent();
    });

    it("scoped slots are passed this with $createElement and $set", async () => {
      expect(wrapper.text()).toBe("hello default bar $set");
    });
  });

  describe("when disabled", () => {
    beforeEach(() => {
      installCompat(
        VTU,
        {
          [compatFlags.MOUNT_ARGS_SCOPED_SLOTS]: true,
          [compatFlags.MOUNT_ARGS_SCOPED_SLOTS_THIS]: false,
        },
        h
      );
    });

    it("throws when trying to use $set or $createElement", async () => {
      expect(mountComponent).toThrow();
    });
  });
});
