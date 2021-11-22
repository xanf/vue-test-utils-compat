import { install as installWrapperAttributesCompat } from "./compats/wrapper-attributes.js";
import { install as installWrapperFindAllCompat } from "./compats/wrapper-find-all.js";
import { install as installWrapperFindCompat } from "./compats/wrapper-find.js";
import { createLocalVue } from "./utils/create-local-vue.js";
import { normalizeMountArgs } from "./utils/normalize-mount-args.js";

const installedConfigs = new WeakMap();

function needsNormalization(config) {
  return (
    config.EXPORT_CREATE_LOCAL_VUE || Object.entries(config).some(([k, v]) => k.startsWith("MOUNT_ARGS") && Boolean(v))
  );
}

export const compatFlags = Object.freeze({
  EXPORT_CREATE_LOCAL_VUE: "EXPORT_CREATE_LOCAL_VUE",
  EXPORT_CREATE_WRAPPER: "EXPORT_CREATE_WRAPPER",

  GLOBAL_STUBS: "GLOBAL_STUBS",

  MOUNT_ARGS_CONTEXT_ATTRS: "MOUNT_ARGS_CONTEXT_ATTRS",
  MOUNT_ARGS_CONTEXT_CHILDREN: "MOUNT_ARGS_CONTEXT_CHILDREN",
  MOUNT_ARGS_CONTEXT_CLASS: "MOUNT_ARGS_CONTEXT_CLASS",
  MOUNT_ARGS_CONTEXT_ON: "MOUNT_ARGS_CONTEXT_ON",
  MOUNT_ARGS_CONTEXT_PROPS: "MOUNT_ARGS_CONTEXT_PROPS",
  MOUNT_ARGS_LISTENERS: "MOUNT_ARGS_LISTENERS",
  MOUNT_ARGS_MOCKS: "MOUNT_ARGS_MOCKS",
  MOUNT_ARGS_PROVIDE: "MOUNT_ARGS_PROVIDE",
  MOUNT_ARGS_SCOPED_SLOTS: "MOUNT_ARGS_SCOPED_SLOTS",
  MOUNT_ARGS_SCOPED_SLOTS_THIS: "MOUNT_ARGS_SCOPED_SLOTS_THIS",
  MOUNT_ARGS_STUBS: "MOUNT_ARGS_STUBS",

  WRAPPER_ATTRIBUTES_DISABLED: "WRAPPER_ATTRIBUTES_DISABLED",
  WRAPPER_ATTRIBUTES_VALUE: "WRAPPER_ATTRIBUTES_VALUE",
  WRAPPER_DESTROY: "WRAPPER_DESTROY",
  WRAPPER_DO_NOT_INCLUDE_NATIVE_EVENTS_IN_EMITTED: "WRAPPER_DO_NOT_INCLUDE_NATIVE_EVENTS_IN_EMITTED",
  WRAPPER_FIND_ALL: "WRAPPER_FIND_ALL",
  WRAPPER_FIND_BY_CSS_SELECTOR_RETURNS_COMPONENTS: "WRAPPER_FIND_BY_CSS_SELECTOR_RETURNS_COMPONENTS",
});

export const fullCompatConfig = Object.freeze({
  ...Object.fromEntries(Object.keys(compatFlags).map((option) => [option, true])),
});

export function installCompat(VTU, compatConfig, vueH = null) {
  if (!VTU) {
    throw new Error("Unknown module for installation");
  }

  if (!compatConfig) {
    throw new Error("compatConfig is required");
  }

  const invalidOptions = Object.keys(compatConfig).filter((option) => !Object.keys(compatFlags).includes(option));
  if (invalidOptions.length > 0) {
    throw new Error(`Got unknown compat options: ${invalidOptions.join(", ")}`);
  }

  if (compatConfig.MOUNT_ARGS_SCOPED_SLOTS_THIS && !compatConfig.MOUNT_ARGS_SCOPED_SLOTS) {
    throw new Error("MOUNT_ARGS_SCOPED_SLOTS_THIS require MOUNT_ARGS_SCOPED_SLOTS compat to function");
  }

  if (compatConfig.MOUNT_ARGS_SCOPED_SLOTS_THIS && !vueH) {
    throw new Error("vueH (third parameter) is required when MOUNT_ARGS_SCOPED_SLOTS_THIS is used");
  }

  const installedCompatConfig = installedConfigs.get(VTU);
  if (installedCompatConfig && installedCompatConfig !== JSON.stringify(compatConfig)) {
    throw new Error(
      "You are trying to install compat layer to vue-test-utils, but it was already installed with different config"
    );
  }
  installedConfigs.set(VTU, JSON.stringify(compatConfig));

  if (compatConfig.GLOBAL_STUBS) {
    // eslint-disable-next-line no-param-reassign
    VTU.config.stubs = VTU.config.global.stubs;
  }

  if (compatConfig.EXPORT_CREATE_WRAPPER) {
    // eslint-disable-next-line no-param-reassign
    VTU.createWrapper = (vm) => (vm instanceof HTMLElement ? new VTU.DOMWrapper(vm) : new VTU.VueWrapper(null, vm));
  }

  if (compatConfig.EXPORT_CREATE_LOCAL_VUE) {
    // eslint-disable-next-line no-param-reassign
    VTU.createLocalVue = createLocalVue;
  }

  if (compatConfig.WRAPPER_DESTROY) {
    VTU.config.plugins.VueWrapper.install((wrapper) => ({
      destroy: () => wrapper.unmount(),
    }));
    // eslint-disable-next-line no-param-reassign
    VTU.enableAutoDestroy = VTU.enableAutoUnmount;
    // eslint-disable-next-line no-param-reassign
    VTU.disableAutoDestroy = VTU.disableAutoUnmount;
  }

  if (compatConfig.WRAPPER_FIND_ALL || compatConfig.WRAPPER_FIND_BY_CSS_SELECTOR_RETURNS_COMPONENTS) {
    installWrapperFindAllCompat(VTU, compatConfig);
  }

  if (compatConfig.WRAPPER_FIND_BY_CSS_SELECTOR_RETURNS_COMPONENTS) {
    installWrapperFindCompat(VTU, compatConfig);
  }

  if (compatConfig.WRAPPER_DO_NOT_INCLUDE_NATIVE_EVENTS_IN_EMITTED) {
    // eslint-disable-next-line no-param-reassign
    VTU.VueWrapper.prototype.attachNativeEventListener = () => {};
  }

  if (needsNormalization(compatConfig)) {
    const originalMount = VTU.mount;
    // eslint-disable-next-line no-param-reassign
    VTU.mount = function patchedMount(component, args) {
      return originalMount.call(this, component, normalizeMountArgs(args, compatConfig, vueH));
    };

    const originalShallowMount = VTU.shallowMount;
    // eslint-disable-next-line no-param-reassign
    VTU.shallowMount = function patchedMount(component, args) {
      return originalShallowMount.call(this, component, normalizeMountArgs(args, compatConfig, vueH));
    };
  }

  if (compatConfig.WRAPPER_ATTRIBUTES_VALUE || compatConfig.WRAPPER_ATTRIBUTES_DISABLED) {
    installWrapperAttributesCompat(VTU, compatConfig);
  }
}
