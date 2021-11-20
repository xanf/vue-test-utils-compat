function makeGetOrSetStorageFn(storage) {
  return function getOrSet(id, definition) {
    if (arguments.length === 1) {
      return storage[id];
    }
    // eslint-disable-next-line no-param-reassign
    storage[id] = definition;
    return undefined;
  };
}

export function createLocalVue() {
  const plugins = [];
  const directives = {};
  const components = {};
  const mixins = [];

  return {
    extend(options) {
      return options;
    },
    use(...args) {
      plugins.push(args);
    },
    component: makeGetOrSetStorageFn(components),
    directive: makeGetOrSetStorageFn(directives),
    mixin(entry) {
      mixins.push(entry);
    },
    getLocalVueConfig() {
      return {
        ...(plugins.length ? { plugins } : {}),
        ...(Object.keys(directives).length ? { directives } : {}),
        ...(Object.keys(components).length ? { components } : {}),
        ...(mixins.length ? { mixins } : {}),
      };
    },
  };
}
