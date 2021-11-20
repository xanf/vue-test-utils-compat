import { jest, describe, afterEach, beforeEach, it, expect } from "@jest/globals";
import { defineComponent } from "vue";
import { installCompat, compatFlags } from "../../../src/index.js";
import { describeOption } from "../../helpers.js";

describeOption(compatFlags.MOUNT_ARGS_PROVIDE, () => {
  let VTU;

  const FakeComponent = defineComponent({
    inject: {
      providedValue: {
        default: "not-provided",
      },
    },
    template: "<div>{{ providedValue }}</div>",
  });

  beforeEach(async () => {
    jest.resetModules();
    VTU = { ...(await import("@vue/test-utils")) };
  });

  let wrapper;
  const makeWrapperWithCompat = (compatMode) => {
    installCompat(VTU, { [compatFlags.MOUNT_ARGS_PROVIDE]: compatMode });
    wrapper = VTU.mount(FakeComponent, {
      provide: { providedValue: "ok-provided" },
    });
  };

  afterEach(() => {
    wrapper.unmount();
  });

  describe("when enabled", () => {
    beforeEach(() => makeWrapperWithCompat(true));

    it("provide option is respected", async () => {
      expect(wrapper.html()).toBe("<div>ok-provided</div>");
    });

    it("correctly handles provide as a function", async () => {
      const wrapperWithProvideFn = VTU.mount(FakeComponent, {
        provide() {
          return { providedValue: "ok-provided-from-fn" };
        },
      });
      expect(wrapperWithProvideFn.html()).toBe("<div>ok-provided-from-fn</div>");
    });
  });

  describe("when disabled", () => {
    beforeEach(() => makeWrapperWithCompat(false));

    it("provide option is ignored", async () => {
      expect(wrapper.html()).toBe("<div>not-provided</div>");
    });
  });
});
