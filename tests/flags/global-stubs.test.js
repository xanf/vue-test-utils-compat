import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { installCompat, compatFlags } from "../../src/index.js";
import { describeOption } from "../helpers.js";

describeOption(compatFlags.GLOBAL_STUBS, () => {
  let VTU;
  beforeEach(async () => {
    jest.resetModules();
    VTU = await import("@vue/test-utils");
  });

  describe("when enabled", () => {
    beforeEach(() => {
      installCompat(VTU, { [compatFlags.GLOBAL_STUBS]: true });
    });

    it("should mirror stubs", () => {
      expect(VTU.config.global.stubs).toBe(VTU.config.stubs);
    });
  });

  describe("when disabled", () => {
    beforeEach(() => {
      installCompat(VTU, { [compatFlags.GLOBAL_STUBS]: false });
    });

    it("should not mirror stubs", () => {
      expect(VTU.config.global.stubs).not.toBe(VTU.config.stubs);
    });
  });
});
