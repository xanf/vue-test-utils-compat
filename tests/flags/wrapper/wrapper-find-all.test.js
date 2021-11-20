import { jest, describe, afterEach, beforeEach, it, expect } from "@jest/globals";
import { defineComponent } from "vue";
import { installCompat, compatFlags } from "../../../src/index.js";
import { describeOption } from "../../helpers.js";

describeOption(compatFlags.WRAPPER_FIND_ALL, () => {
  let VTU;

  const NestedCmp = defineComponent({
    props: ["text"],
    template: "<h1>{{ text }}</h1>",
  });

  const handleClick = jest.fn();
  const FakeComponent = defineComponent({
    components: { NestedCmp },
    methods: {
      handleClick,
    },
    template: [
      "<div>",
      "<p @click='handleClick'>1</p>",
      "<p @click='handleClick'>2</p>",
      "<p @click='handleClick'>3</p>",
      "<nested-cmp @click='handleClick' text='hello-1' />",
      "<nested-cmp @click='handleClick' text='hello-2' />",
      "</div>",
    ].join(""),
  });

  beforeEach(async () => {
    jest.resetModules();
    VTU = await import("@vue/test-utils");
  });

  let wrapper;
  let results;

  describe("when enabled", () => {
    describe.each`
      method                 | selector     | length
      ${"findAll"}           | ${"p"}       | ${3}
      ${"findAllComponents"} | ${NestedCmp} | ${2}
    `("wrapping $method", ({ method, selector, length }) => {
      beforeEach(() => {
        installCompat(VTU, { [compatFlags.WRAPPER_FIND_ALL]: true });
        wrapper = VTU.mount(FakeComponent);
        results = wrapper[method](selector);
      });

      afterEach(() => {
        wrapper.unmount();
      });

      it("should wrap results in wrapper", () => {
        expect(results).toHaveLength(length);
        expect(results.wrappers).toBeInstanceOf(Array);
        expect(results.at).toBeInstanceOf(Function);
        expect(results.at(0)).toBe(results.wrappers[0]);
      });

      it("should filter results based on condition", () => {
        const filteredResults = results.filter((w) => w.text().includes("1"));
        expect(filteredResults).toHaveLength(1);
      });

      it("should trigger event on all wrappers", () => {
        results.trigger("click");
        expect(handleClick).toHaveBeenCalledTimes(results.length);
      });

      it("should report exists as false for empty wrapper", () => {
        expect(wrapper[method]("some-weird-selector").exists()).toBe(false);
      });

      it("should report exists as true for non-empty wrapper", () => {
        expect(results.exists()).toBe(true);
      });
    });
  });

  describe("when disabled", () => {
    beforeEach(() => {
      installCompat(VTU, { [compatFlags.WRAPPER_FIND_ALL]: false });
      wrapper = VTU.mount(FakeComponent);
    });

    it.each(["findAll", "findAllComponents"])("%s returns an array", (method) => {
      results = wrapper[method]("something");
      expect(results).toBeInstanceOf(Array);
    });
  });
});
