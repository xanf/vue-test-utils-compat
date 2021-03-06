export function install(VTU, config) {
  [VTU.config.plugins.DOMWrapper, VTU.config.plugins.VueWrapper].forEach((pluginHost) =>
    pluginHost.install((wrapper) => {
      const { find, findAllComponents, findComponent } = wrapper;
      return {
        find: (...args) => {
          const result = find.call(wrapper, ...args);
          if (!result.exists()) {
            return result;
          }

          if (config.WRAPPER_FIND_BY_CSS_SELECTOR_RETURNS_COMPONENTS) {
            const componentResults = args[0].ref
              ? [findComponent.call(wrapper, ...args)]
              : findAllComponents.call(wrapper, ...args);

            const matchingComponent = componentResults.find((w) => w.exists() && w.element === result.element);
            if (matchingComponent) {
              return matchingComponent;
            }
          }
          return result;
        },
        findComponent(selector) {
          const result = findComponent.call(wrapper, selector);
          if (
            !result.exists() &&
            selector.ref &&
            config.WRAPPER_FIND_COMPONENT_BY_REF_RETURNS_DOM &&
            wrapper.vm.$refs?.[selector.ref]
          ) {
            return new VTU.DOMWrapper(wrapper.vm.$refs?.[selector.ref]);
          }
          return result;
        },
      };
    })
  );
}
