import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getUsername,
  setUsername,
  clearUser,
  getCSRToken,
  getAuthHeadersConfig,
} from "./accessToken";

// vi.hoisted ensures mockGet is defined before vi.mock hoisting runs,
// so the Cookies instance created at module load in accessToken.ts uses it.
const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock("universal-cookie", () => ({
  default: vi.fn(() => ({ get: mockGet })),
}));

describe("accessToken utils", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("getUsername", () => {
    it("returns null when no username is stored", () => {
      expect(getUsername()).toBeNull();
    });

    it("returns the stored username", () => {
      localStorage.setItem("username", "alice");
      expect(getUsername()).toBe("alice");
    });
  });

  describe("setUsername", () => {
    it("stores the username in localStorage", () => {
      setUsername("bob");
      expect(localStorage.getItem("username")).toBe("bob");
    });
  });

  describe("clearUser", () => {
    it("removes the username from localStorage", () => {
      localStorage.setItem("username", "alice");
      clearUser();
      expect(localStorage.getItem("username")).toBeNull();
    });

    it("does nothing when no username is stored", () => {
      expect(() => clearUser()).not.toThrow();
    });
  });

  describe("getCSRToken", () => {
    it("returns the csrftoken cookie value", () => {
      mockGet.mockReturnValue("test-csrf-token");
      expect(getCSRToken()).toBe("test-csrf-token");
      expect(mockGet).toHaveBeenCalledWith("csrftoken");
    });

    it("returns undefined when cookie is not set", () => {
      mockGet.mockReturnValue(undefined);
      expect(getCSRToken()).toBeUndefined();
    });
  });

  describe("getAuthHeadersConfig", () => {
    it("includes User header from localStorage", () => {
      localStorage.setItem("username", "alice");
      const config = getAuthHeadersConfig(false);
      expect(config.headers?.User).toBe("alice");
    });

    it("sets User header to null when not logged in", () => {
      const config = getAuthHeadersConfig(false);
      expect(config.headers?.User).toBeNull();
    });

    it("includes X-CSRFToken when includeCSRF is true", () => {
      mockGet.mockReturnValue("csrf-abc");
      const config = getAuthHeadersConfig(true);
      expect(config.headers?.["X-CSRFToken"]).toBe("csrf-abc");
    });

    it("omits X-CSRFToken when includeCSRF is false", () => {
      const config = getAuthHeadersConfig(false);
      expect(config.headers?.["X-CSRFToken"]).toBeUndefined();
    });

    it("always sets withCredentials to true", () => {
      const config = getAuthHeadersConfig(false);
      expect(config.withCredentials).toBe(true);
    });
  });
});
