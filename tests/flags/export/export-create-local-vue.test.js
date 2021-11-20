import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import { installCompat, compatFlags } from "../../../src/index.js";
import { describeOption } from "../../helpers.js";

describeOption(compatFlags.EXPORT_CREATE_LOCAL_VUE, () => {
  let VTU;

  beforeEach(async () => {
    jest.resetModules();
    VTU = { ...(await import("@vue/test-utils")) };
  });

  describe("when enabled", () => {
    beforeEach(() => {
      installCompat(VTU, { [compatFlags.EXPORT_CREATE_LOCAL_VUE]: true });
    });

    it("exposes createLocalVue on VTU module", () => {
      expect(VTU.createLocalVue).toBeInstanceOf(Function);
    });

    it.each(["component", "directive"])("registers %s on mounted app", (type) => {
      const fakeEntry = {};
      const localVue = VTU.createLocalVue();
      localVue[type]("fake-entry", fakeEntry);
      const wrapper = VTU.mount(() => "test", {
        localVue,
      });
      expect(localVue[type]("fake-entry")).toBe(fakeEntry);
      expect(wrapper.vm.$.appContext.app[type]("fake-entry")).toBe(fakeEntry);
    });

    it("registers mixin on mounted app", () => {
      const fakeMixin = {
        created() {
          this.mixinInstalled = true;
        },
      };
      const localVue = VTU.createLocalVue();
      localVue.mixin(fakeMixin);
      const wrapper = VTU.mount({ template: "test" }, { localVue });
      expect(wrapper.vm.mixinInstalled).toBe(true);
    });

    it("registers plugin on mounted app", () => {
      const fakeOptions = [];
      const fakePlugin = {
        install(app) {
          // eslint-disable-next-line no-param-reassign
          app.config.globalProperties.$pluginInstalled = fakeOptions;
        },
      };
      const localVue = VTU.createLocalVue();
      localVue.use(fakePlugin, fakeOptions);
      const wrapper = VTU.mount({ template: "test" }, { localVue });
      expect(wrapper.vm.$pluginInstalled).toBe(fakeOptions);
    });

    it("localVue.extend works for normal component", () => {
      const localVue = VTU.createLocalVue();
      const fakeComponent = localVue.extend({ template: "test" });
      const wrapper = VTU.mount(fakeComponent, { localVue });
      expect(wrapper.html()).toBe("test");
    });

    it("localVue.extend works for functional component", () => {
      const localVue = VTU.createLocalVue();
      const fakeComponent = localVue.extend(() => "test");
      const wrapper = VTU.mount(fakeComponent, { localVue });
      expect(wrapper.html()).toBe("test");
    });
  });

  describe("when disabled", () => {
    beforeEach(() => {
      installCompat(VTU, { [compatFlags.EXPORT_CREATE_LOCAL_VUE]: false });
    });

    it("does not expose createLocalVue", () => {
      expect(VTU.createLocalVue).toBeUndefined();
    });
  });
});
