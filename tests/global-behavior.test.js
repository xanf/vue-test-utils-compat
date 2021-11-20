import { describe, beforeEach, it, expect } from "@jest/globals";
import { makeVTUStub } from "./helpers.js";

describe("global behavior", () => {
  let VTUCompat;

  beforeEach(async () => {
    VTUCompat = await import("../src/index.js");
  });

  it("throws if target module is not supplied", () => {
    expect(() => VTUCompat.installCompat(null, {})).toThrow({
      message: "Unknown module for installation",
    });
  });

  it("throws if installed with different configs multiple times", () => {
    const targetModule = makeVTUStub();
    const fakeConfig = { GLOBAL_STUBS: true };
    const fakeConfig2 = { GLOBAL_STUBS: false };

    VTUCompat.installCompat(targetModule, fakeConfig);
    expect(() => VTUCompat.installCompat(targetModule, fakeConfig2)).toThrow({
      message:
        "You are trying to install compat layer to vue-test-utils, but it was already installed with different config",
    });
  });

  it("should not throw if installed with same config multiple times", () => {
    const targetModule = makeVTUStub();
    const fakeConfig = { GLOBAL_STUBS: true };
    const fakeConfig2 = { GLOBAL_STUBS: true }; // structurally same

    VTUCompat.installCompat(targetModule, fakeConfig);
    VTUCompat.installCompat(targetModule, fakeConfig2);
  });

  it("throws error if unknown option is supplied", () => {
    const targetModule = makeVTUStub();
    expect(() => VTUCompat.installCompat(targetModule, { UNKNOWN_OPTION: true })).toThrow();
  });

  it("throws error if compat config is missing", () => {
    const targetModule = makeVTUStub();
    expect(() => VTUCompat.installCompat(targetModule)).toThrow();
  });

  it("throws error if MOUNT_ARGS_SCOPED_SLOTS_THIS is used but vueH is not passed", () => {
    const targetModule = makeVTUStub();
    expect(() =>
      VTUCompat.installCompat(targetModule, {
        MOUNT_ARGS_SCOPED_SLOTS: true,
        MOUNT_ARGS_SCOPED_SLOTS_THIS: true,
      })
    ).toThrow();
  });

  it("throws error if MOUNT_ARGS_SCOPED_SLOTS_THIS is used without MOUNT_ARGS_SCOPED_SLOTS", () => {
    const targetModule = makeVTUStub();
    expect(() =>
      VTUCompat.installCompat(
        targetModule,
        {
          MOUNT_ARGS_SCOPED_SLOTS: false,
          MOUNT_ARGS_SCOPED_SLOTS_THIS: true,
        },
        () => {}
      )
    ).toThrow();
  });
});
