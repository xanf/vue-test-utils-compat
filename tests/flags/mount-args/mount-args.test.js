import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import { installCompat, fullCompatConfig } from "../../../src/index.js";

describe("mount args", () => {
  let VTU;

  const FakeComponent = () => "test";

  beforeEach(async () => {
    jest.resetModules();
    VTU = { ...(await import("@vue/test-utils")) };
  });

  it("patches mount & shallowMount when needed", async () => {
    const mountSpy = jest.spyOn(VTU, "mount");
    const shallowMountSpy = jest.spyOn(VTU, "shallowMount");

    installCompat(VTU, fullCompatConfig, () => {});

    VTU.mount(FakeComponent);
    expect(mountSpy).toHaveBeenCalled();

    VTU.shallowMount(FakeComponent);
    expect(shallowMountSpy).toHaveBeenCalled();
  });

  it("does not patch mount & shallowMount when not needed", () => {
    const mountSpy = jest.spyOn(VTU, "mount");
    const shallowMountSpy = jest.spyOn(VTU, "shallowMount");

    installCompat(VTU, {});

    expect(VTU.mount).toBe(mountSpy);
    expect(VTU.shallowMount).toBe(shallowMountSpy);
  });
});
