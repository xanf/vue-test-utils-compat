import { defineComponent } from "vue";
import { describe, jest } from "@jest/globals";

export const makeVTUStub = () => ({
  config: {
    global: {
      stubs: {},
    },
  },
  mount: jest.fn(),
  shallowMount: jest.fn(),
  enableAutoUnmount: jest.fn(),
  disableAutoUnmount: jest.fn(),
  RouterLinkStub: defineComponent({ template: "<div>stub</div" }),
  VueWrapper: {},
  DOMWrapper: {},
  flushPromises: jest.fn(),
  createWrapperError: jest.fn(),
});

export const describeOption = (option, fn) => {
  /* istanbul ignore if */
  if (!option) {
    throw new Error("Invalid option");
  }

  return describe(`option ${option}`, fn);
};
