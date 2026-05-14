import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { postRating, getRating, getAverageRatings } from "../../../connections/internal/movieRate";
import { Movie } from "../../../types/internal/movie";

vi.mock("axios");
vi.mock("../../../utils/accessToken", () => ({
  getAuthHeadersConfig: vi.fn(() => ({
    headers: { User: "testuser" },
    withCredentials: true,
  })),
}));

const mockedAxios = vi.mocked(axios);

const mockMovie: Movie = {
  title: "Interstellar",
  link: "https://imdb.com/interstellar",
  user: "alice",
  date_added: "2026-01-01T00:00:00Z",
  genre: "Sci-Fi",
  cover_link: "",
  duration: 169,
};

describe("movieRate connections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("postRating", () => {
    it("posts a rating with movie, user, and rating value", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: {} });

      await postRating("Interstellar", "alice", 9);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/movies/rate/"),
        { movie: "Interstellar", user: "alice", rating: 9 },
        expect.objectContaining({ withCredentials: true }),
      );
    });

    it("handles null user and undefined rating", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: {} });

      await postRating("Interstellar", null, undefined);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        { movie: "Interstellar", user: null, rating: undefined },
        expect.anything(),
      );
    });
  });

  describe("getRating", () => {
    it("fetches and returns ratings", async () => {
      const ratings = [{ movie: mockMovie, user: "alice", rating: 9 }];
      mockedAxios.get = vi.fn().mockResolvedValue({ data: ratings });

      const result = await getRating();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/movies/rate/"),
      );
      expect(result).toEqual(ratings);
    });
  });

  describe("getAverageRatings", () => {
    it("fetches and returns average ratings", async () => {
      const averages = [{ movie: mockMovie, rating: 8.5 }];
      mockedAxios.get = vi.fn().mockResolvedValue({ data: averages });

      const result = await getAverageRatings();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/movies/average_ratings"),
      );
      expect(result).toEqual(averages);
    });
  });
});
