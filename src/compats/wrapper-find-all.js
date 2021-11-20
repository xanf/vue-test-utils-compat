function wrapResults(results) {
  return {
    wrappers: results,
    at(i) {
      return results[i];
    },

    filter(condition) {
      return wrapResults(results.filter(condition));
    },

    trigger(...params) {
      results.forEach((w) => w.trigger(...params));
    },

    exists() {
      return results.length > 0 && results.every((x) => x.exists());
    },

    get length() {
      return results.length;
    },
  };
}

export function install(VTU) {
  [VTU.config.plugins.DOMWrapper, VTU.config.plugins.VueWrapper].forEach((pluginHost) =>
    pluginHost.install((wrapper) => {
      const { findAll, findAllComponents } = wrapper;
      return {
        findAll: (...args) => wrapResults(findAll.call(wrapper, ...args)),
        findAllComponents: (...args) => wrapResults(findAllComponents.call(wrapper, ...args)),
      };
    })
  );
}
