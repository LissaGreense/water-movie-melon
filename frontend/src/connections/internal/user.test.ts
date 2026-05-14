import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAvatar,
  getStatistics,
  uploadAvatar,
  postNewPassword,
} from "./user";
import { Statistics } from "../../types/internal/user";

// Both the cached axios instance and the cache storage are created at module
// load time, so we hoist the mocks before any imports run.
const { mockGet, mockPost, mockStorageRemove } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockStorageRemove: vi.fn(),
}));

vi.mock("axios", () => ({
  default: { create: vi.fn(() => ({})) },
}));

vi.mock("axios-cache-interceptor", () => ({
  setupCache: vi.fn(() => ({
    get: mockGet,
    post: mockPost,
    storage: { remove: mockStorageRemove },
  })),
}));

vi.mock("../../utils/accessToken", () => ({
  getAuthHeadersConfig: vi.fn((includeCSRF: boolean) => ({
    headers: {
      User: "testuser",
      ...(includeCSRF && { "X-CSRFToken": "csrf-token" }),
    },
    withCredentials: true,
  })),
}));

const mockAvatar = {
  avatar_url: "http://localhost:8000/media/avatars/alice.jpg",
};

const mockStats: Statistics = {
  added_movies: 5,
  seven_rated_movies: 2,
  watched_movies: 10,
  hosted_movie_nights: 3,
  highest_rated_movie: "Inception",
  lowest_rated_movie: "Cats",
  movie_tickets: 1,
};

describe("user connections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAvatar", () => {
    it("fetches avatar for a given username", async () => {
      mockGet.mockResolvedValue({ data: mockAvatar });

      const result = await getAvatar("alice");

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining("/movies/userAvatar/alice/"),
        expect.objectContaining({ id: "avatar-alice", withCredentials: true }),
      );
      expect(result).toEqual(mockAvatar);
    });

    it("includes the cache id keyed to the username", async () => {
      mockGet.mockResolvedValue({ data: mockAvatar });

      await getAvatar("bob");

      expect(mockGet).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ id: "avatar-bob" }),
      );
    });
  });

  describe("getStatistics", () => {
    it("fetches statistics for a given username", async () => {
      mockGet.mockResolvedValue({ data: mockStats });

      const result = await getStatistics("alice");

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining("/movies/userStatistics/alice/"),
        expect.objectContaining({ withCredentials: true }),
      );
      expect(result).toEqual(mockStats);
    });
  });

  describe("uploadAvatar", () => {
    it("posts avatar as FormData and invalidates the cache entry", async () => {
      mockPost.mockResolvedValue({ data: mockAvatar });
      mockStorageRemove.mockResolvedValue(undefined);

      const blob = new Blob(["image-data"], { type: "image/jpeg" });
      const result = await uploadAvatar("alice", blob);

      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining("/movies/userAvatar/alice/"),
        expect.any(FormData),
        expect.objectContaining({ withCredentials: true }),
      );
      expect(mockStorageRemove).toHaveBeenCalledWith("avatar-alice");
      expect(result).toEqual(mockAvatar);
    });

    it("invalidates the correct cache key for the given username", async () => {
      mockPost.mockResolvedValue({ data: mockAvatar });
      mockStorageRemove.mockResolvedValue(undefined);

      await uploadAvatar("bob", new Blob());

      expect(mockStorageRemove).toHaveBeenCalledWith("avatar-bob");
    });
  });

  describe("postNewPassword", () => {
    it("posts old and new password with CSRF header", async () => {
      mockPost.mockResolvedValue({ data: { result: "ok" } });

      const result = await postNewPassword("alice", "oldpass", "newpass");

      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining("/movies/userPassword/alice/"),
        { old_password: "oldpass", new_password: "newpass" },
        expect.objectContaining({
          withCredentials: true,
          headers: expect.objectContaining({ "X-CSRFToken": "csrf-token" }),
        }),
      );
      expect(result).toEqual({ result: "ok" });
    });

    it("handles null username in the URL", async () => {
      mockPost.mockResolvedValue({ data: { result: "ok" } });

      await postNewPassword(null, "old", "new");

      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining("/movies/userPassword/null/"),
        expect.any(Object),
        expect.anything(),
      );
    });
  });
});
