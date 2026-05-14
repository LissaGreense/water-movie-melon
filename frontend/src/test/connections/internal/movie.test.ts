import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { getMovies, postMovie } from "../../../connections/internal/movie";
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
  title: "Inception",
  link: "https://imdb.com/inception",
  user: "alice",
  date_added: "2026-01-01T00:00:00Z",
  genre: "Sci-Fi",
  cover_link: "https://example.com/cover.jpg",
  duration: 148,
};

describe("movie connections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMovies", () => {
    it("fetches and returns movies", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: [mockMovie] });

      const result = await getMovies({});

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/movies/"),
        expect.objectContaining({ params: {} }),
      );
      expect(result).toEqual([mockMovie]);
    });

    it("passes watched filter param", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: [] });

      await getMovies({ watched: false });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ params: { watched: false } }),
      );
    });

    it("passes random and limit params", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: [mockMovie] });

      await getMovies({ random: true, limit: 5 });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ params: { random: true, limit: 5 } }),
      );
    });

    it("passes search param", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: [] });

      await getMovies({ search: "matrix" });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ params: { search: "matrix" } }),
      );
    });
  });

  describe("postMovie", () => {
    it("posts movie with auth headers", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: {} });

      await postMovie(mockMovie);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/movies/"),
        mockMovie,
        expect.objectContaining({ withCredentials: true }),
      );
    });
  });
});
