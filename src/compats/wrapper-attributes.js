export function install(VTU, compatConfig) {
  [VTU.config.plugins.DOMWrapper, VTU.config.plugins.VueWrapper].forEach((pluginHost) =>
    pluginHost.install((wrapper) => {
      const { attributes } = wrapper;
      return {
        attributes(attr) {
          const originalAttributes = attributes.call(wrapper, attr);

          if (attr === "value" && compatConfig.WRAPPER_ATTRIBUTES_VALUE) {
            return wrapper.element.value;
          }

          if (attr === "disabled" && compatConfig.WRAPPER_ATTRIBUTES_DISABLED) {
            return typeof originalAttributes === "string" ? "disabled" : originalAttributes;
          }

          if (attr) {
            return originalAttributes;
          }

          const normalizedDisabled = originalAttributes.disabled === "" ? "disabled" : originalAttributes.disabled;
          const normalizedAttributes = { ...originalAttributes };
          if (compatConfig.WRAPPER_ATTRIBUTES_VALUE && "value" in wrapper.element) {
            normalizedAttributes.value = wrapper.element.value;
          }
          if (compatConfig.WRAPPER_ATTRIBUTES_DISABLED && "disabled" in originalAttributes) {
            normalizedAttributes.disabled = normalizedDisabled;
          }

          return normalizedAttributes;
        },
      };
    })
  );
}
