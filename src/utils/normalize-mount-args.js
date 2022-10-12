const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

function smartMerge(...args) {
  const filteredArgs = args.filter((a) => a != null);
  if (filteredArgs.length === 0) {
    return args[0];
  }

  return Object.assign({}, ...filteredArgs);
}

function listenersToProps(listeners) {
  if (listeners == null) {
    return listeners;
  }

  return Object.fromEntries(
    Object.keys(listeners).map((key) => {
      const fixedKey = `on${capitalize(key)}`;
      return [fixedKey, listeners[key]];
    })
  );
}

function normalizeStubs(stubs) {
  if (stubs == null) {
    return stubs;
  }

  const stubsAsObj = Array.isArray(stubs) ? Object.fromEntries(stubs.map((key) => [key, true])) : stubs;
  return Object.fromEntries(
    Object.entries(stubsAsObj).map(([key, stub]) => {
      if (typeof stub === "string") {
        return [key, { name: key, template: stub }];
      }

      return [key, stub];
    })
  );
}

function mergeGlobal(newGlobal, oldGlobal = {}) {
  return {
    components: smartMerge(newGlobal.components, oldGlobal.components),
    config: smartMerge(newGlobal.config, oldGlobal.config),
    directives: smartMerge(newGlobal.directives, oldGlobal.directives),
    mixins:
      /* istanbul ignore next */
      newGlobal.mixins || oldGlobal.mixins ? [...(newGlobal.mixins ?? []), ...(oldGlobal.mixins ?? [])] : undefined,
    mocks: smartMerge(newGlobal.mocks, oldGlobal.mocks),
    plugins:
      /* istanbul ignore next */
      newGlobal.plugins || oldGlobal.plugins ? [...(newGlobal.plugins ?? []), ...(oldGlobal.plugins ?? [])] : undefined,
    provide: smartMerge(newGlobal.provide, oldGlobal.provide),
    renderStubDefaultSlot: oldGlobal.renderStubDefaultSlot,
    stubs: smartMerge(newGlobal.stubs, normalizeStubs(oldGlobal.stubs)),
  };
}

function normalizeConfigOption(obj) {
  const resultObj = Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null));
  return Object.keys(resultObj).length > 0 ? resultObj : null;
}

function normalizeScopedSlots(scopedSlots, scopedSlotsThis) {
  if (scopedSlots == null) {
    return scopedSlots;
  }

  return Object.fromEntries(
    Object.entries(scopedSlots).map(([k, v]) => {
      let normalizedValue = v;
      if (typeof v === "string" && !v.startsWith("<template")) {
        normalizedValue = `<template #default="props">${v}</template>`;
      } else if (typeof v === "function") {
        normalizedValue = (...args) => v.call(scopedSlotsThis, ...args);
      } else {
        throw new Error("Unknown slot type");
      }

      return [k, normalizedValue];
    })
  );
}

function contextOnToProps(on) {
  if (on == null) {
    return on;
  }
  return Object.fromEntries(
    Object.keys(on).map((key) => {
      const capitalized = capitalize(key);
      return [`on${capitalized}`, on[key]];
    })
  );
}

function normalizeProvide(provide) {
  return typeof provide === "function" ? provide() : provide;
}

export function normalizeMountArgs(args, config, vueH) {
  if (args == null) {
    return args;
  }

  const {
    // VTU v1 props
    localVue,

    context,
    mocks,
    provide,
    listeners,
    scopedSlots,
    stubs,
    components,
    directives,

    // VTU v2 props
    props,
    propsData,
    slots,
    global,
    ...otherArgsOptions
  } = args;

  const scopedSlotsThis = config.MOUNT_ARGS_SCOPED_SLOTS_THIS
    ? {
        $createElement: vueH,
        $set: (obj, path, value) => {
          // eslint-disable-next-line no-param-reassign
          obj[path] = value;
        },
      }
    : {};

  const {
    plugins,
    directives: localVueDirectives,
    components: localVueComponents,
    mixins,
  } = localVue?.getLocalVueConfig() ?? {};
  const computedArgs = normalizeConfigOption({
    props: smartMerge(
      config.MOUNT_ARGS_CONTEXT_ATTRS ? context?.attrs : null,
      config.MOUNT_ARGS_CONTEXT_PROPS ? context?.props : null,
      config.MOUNT_ARGS_CONTEXT_CLASS && context?.class ? { class: context?.class } : null,
      config.MOUNT_ARGS_CONTEXT_ON ? contextOnToProps(context?.on) : null,
      config.MOUNT_ARGS_LISTENERS ? listenersToProps(listeners) : null,
      propsData,
      props
    ),
    slots: smartMerge(
      config.MOUNT_ARGS_SCOPED_SLOTS ? normalizeScopedSlots(scopedSlots, scopedSlotsThis) : null,
      config.MOUNT_ARGS_CONTEXT_CHILDREN && context?.children ? { default: context.children } : null,
      slots
    ),
    global: normalizeConfigOption(
      mergeGlobal(
        {
          stubs: config.MOUNT_ARGS_STUBS
            ? {
                ...normalizeStubs(stubs),
                ...(config.MOUNT_ARGS_DIRECTIVES && directives
                  ? Object.fromEntries(Object.entries(directives).map(([k, v]) => [`v${capitalize(k)}`, v]))
                  : {}),
              }
            : null,
          mocks: config.MOUNT_ARGS_MOCKS ? mocks : null,
          provide: config.MOUNT_ARGS_PROVIDE ? normalizeProvide(provide) : null,
          plugins,
          mixins,
          components: smartMerge(localVueComponents, config.MOUNT_ARGS_COMPONENTS ? components : null),
          directives: smartMerge(localVueDirectives, config.MOUNT_ARGS_DIRECTIVES ? directives : null),
        },
        global
      )
    ),
  });
  return smartMerge(computedArgs, otherArgsOptions);
}
