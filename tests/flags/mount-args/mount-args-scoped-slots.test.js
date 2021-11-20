import { jest, describe, afterEach, beforeEach, it, expect } from "@jest/globals";
import { h } from "vue";
import { installCompat, compatFlags } from "../../../src/index.js";
import { describeOption } from "../../helpers.js";

describeOption(compatFlags.MOUNT_ARGS_SCOPED_SLOTS, () => {
  let VTU;

  const FakeComponent = (props, context) =>
    h("div", ["hello", " ", context.slots?.default?.(), " ", context.slots?.scoped?.({ foo: "bar" })]);

  beforeEach(async () => {
    jest.resetModules();
    VTU = { ...(await import("@vue/test-utils")) };
  });

  let wrapper;
  const makeWrapperWithCompat = (compatMode) => {
    installCompat(VTU, { [compatFlags.MOUNT_ARGS_SCOPED_SLOTS]: compatMode });
    wrapper = VTU.mount(FakeComponent, {
      slots: {
        default: "<div>default</div>",
      },
      scopedSlots: {
        scoped(scope) {
          return scope.foo;
        },
      },
    });
  };

  afterEach(() => {
    wrapper.unmount();
  });

  describe("when enabled", () => {
    beforeEach(() => makeWrapperWithCompat(true));

    it("scoped slots are rendered", async () => {
      expect(wrapper.text()).toBe("hello default bar");
    });

    it("correctly renders scoped slot when it is presented as a string", async () => {
      expect(
        VTU.mount(FakeComponent, {
          slots: {
            default: "<div>default</div>",
          },
          scopedSlots: {
            scoped: "{{ props.foo }} string",
          },
        }).text()
      ).toBe("hello default bar string");
    });

    it("does not throw when scopedSlots is null", () => {
      expect(() => VTU.mount(FakeComponent, { scopedSlots: null })).not.toThrow();
    });

    it("throws when something weird is passed to scopedSlots", () => {
      expect(() => VTU.mount(FakeComponent, { scopedSlots: { scoped: 3 } })).toThrow();
    });
  });

  describe("when disabled", () => {
    beforeEach(() => makeWrapperWithCompat(false));

    it("scoped slots are ignored", async () => {
      expect(wrapper.text()).toBe("hello default");
    });
  });
});
