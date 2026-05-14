import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { login, logout, register, getRegisterQuestion } from "../../../connections/internal/authentication";

vi.mock("axios");
vi.mock("../../../utils/accessToken", () => ({
  getUsername: vi.fn(() => "testuser"),
  getCSRToken: vi.fn(() => "csrf-token"),
  getAuthHeadersConfig: vi.fn((includeCSRF: boolean) => ({
    headers: {
      User: "testuser",
      ...(includeCSRF && { "X-CSRFToken": "csrf-token" }),
    },
    withCredentials: true,
  })),
}));

const mockedAxios = vi.mocked(axios);

describe("authentication connections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("posts credentials and returns token data", async () => {
      const tokenData = { token: "abc123", expiry: "2026-01-01" };
      mockedAxios.post = vi.fn().mockResolvedValue({ data: tokenData });

      const result = await login("alice", "password123");

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/movies/login/"),
        { username: "alice", password: "password123" },
        expect.objectContaining({ withCredentials: true }),
      );
      expect(result).toEqual(tokenData);
    });

    it("propagates network errors", async () => {
      mockedAxios.post = vi.fn().mockRejectedValue(new Error("Network Error"));
      await expect(login("alice", "wrong")).rejects.toThrow("Network Error");
    });
  });

  describe("logout", () => {
    it("posts to logout endpoint with auth headers", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: {} });

      await logout();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/movies/logout/"),
        null,
        expect.objectContaining({ withCredentials: true }),
      );
    });
  });

  describe("register", () => {
    it("posts username, password and answer", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: { result: "ok" } });

      const result = await register("bob", "pass", "answer42");

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/movies/register/"),
        { username: "bob", password: "pass", answer: "answer42" },
        expect.objectContaining({ withCredentials: true }),
      );
      expect(result).toEqual({ result: "ok" });
    });
  });

  describe("getRegisterQuestion", () => {
    it("fetches and returns a question", async () => {
      const question = { question: "What is 2+2?", day: "1" };
      mockedAxios.get = vi.fn().mockResolvedValue({ data: question });

      const result = await getRegisterQuestion();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/movies/registerQuestion/"),
      );
      expect(result).toEqual(question);
    });
  });
});
