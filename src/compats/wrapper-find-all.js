function wrapResults(results) {
  return {
    ...results,
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

export function install(VTU, config) {
  [VTU.config.plugins.DOMWrapper, VTU.config.plugins.VueWrapper].forEach((pluginHost) =>
    pluginHost.install((wrapper) => {
      const { findAll, findAllComponents } = wrapper;
      return {
        findAll: (...args) => {
          const results = findAll.call(wrapper, ...args);

          if (config.WRAPPER_FIND_BY_CSS_SELECTOR_RETURNS_COMPONENTS) {
            const componentResults = findAllComponents.call(wrapper, ...args);
            results.forEach((v, i) => {
              const matchingComponent = componentResults.find((w) => w.element === v.element);
              if (matchingComponent) {
                results[i] = matchingComponent;
              }
            });
          }

          return config.WRAPPER_FIND_ALL ? wrapResults(results) : results;
        },
        findAllComponents: (...args) => {
          const results = findAllComponents.call(wrapper, ...args);
          return config.WRAPPER_FIND_ALL ? wrapResults(results) : results;
        },
      };
    })
  );
}
