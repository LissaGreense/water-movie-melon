import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import {
  getMovieNights,
  getMovieNight,
  postMovieNight,
  joinMovieNight,
  getAttendees,
  getSelectedMovie,
  getMovieDate,
  checkForNights,
} from "../../../connections/internal/movieNight";
import { MovieNight } from "../../../types/internal/movieNight";
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
  title: "The Matrix",
  link: "https://imdb.com/matrix",
  user: "alice",
  date_added: "2026-01-01T00:00:00Z",
  genre: "Sci-Fi",
  cover_link: "",
  duration: 136,
};

const mockNight: MovieNight = {
  host: "alice",
  night_date: "2026-06-01T20:00:00Z",
  location: "Alice's place",
  selected_movie: mockMovie,
};

describe("movieNight connections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMovieNights", () => {
    it("fetches and returns movie nights", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: [mockNight] });

      const result = await getMovieNights();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/movies/newNight/"),
        expect.objectContaining({ withCredentials: true }),
      );
      expect(result).toEqual([mockNight]);
    });
  });

  describe("getMovieNight", () => {
    it("fetches nights without date param when null", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: [mockNight] });

      await getMovieNight(null);

      const getMock = mockedAxios.get as unknown as ReturnType<typeof vi.fn>;
      const callConfig = getMock.mock.calls[0][1] as Record<string, unknown>;
      expect(callConfig?.params).toBeUndefined();
    });

    it("passes date param as ISO string when provided", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: [mockNight] });
      const date = new Date("2026-06-01T20:00:00Z");

      await getMovieNight(date);

      const getMock = mockedAxios.get as unknown as ReturnType<typeof vi.fn>;
      const callConfig = getMock.mock.calls[0][1] as Record<string, unknown>;
      expect(callConfig?.params).toEqual({ date: date.toISOString() });
    });
  });

  describe("postMovieNight", () => {
    it("posts a new movie night with auth headers", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: {} });

      await postMovieNight("alice", "2026-06-01T20:00:00Z", "Alice's place");

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/movies/newNight/"),
        {
          host: "alice",
          night_date: "2026-06-01T20:00:00Z",
          location: "Alice's place",
        },
        expect.objectContaining({ withCredentials: true }),
      );
    });
  });

  describe("joinMovieNight", () => {
    it("posts attendee data with auth headers", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: {} });

      await joinMovieNight(mockNight, "bob", "2026-05-01T10:00:00Z");

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/movies/attendees/"),
        { night: mockNight, user: "bob", accept_date: "2026-05-01T10:00:00Z" },
        expect.objectContaining({ withCredentials: true }),
      );
    });
  });

  describe("getAttendees", () => {
    it("fetches and returns attendees", async () => {
      const attendees = [
        { night: mockNight, user: "bob", accept_date: "2026-05-01T10:00:00Z" },
      ];
      mockedAxios.get = vi.fn().mockResolvedValue({ data: attendees });

      const result = await getAttendees();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/movies/attendees/"),
        expect.objectContaining({ withCredentials: true }),
      );
      expect(result).toEqual(attendees);
    });
  });

  describe("getSelectedMovie", () => {
    it("returns the selected movie", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: mockMovie });

      const result = await getSelectedMovie();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/movies/selectedMovie/"),
        expect.objectContaining({ withCredentials: true }),
      );
      expect(result).toEqual(mockMovie);
    });

    it("returns null when no movie is selected", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: null });

      const result = await getSelectedMovie();
      expect(result).toBeNull();
    });
  });

  describe("getMovieDate", () => {
    it("returns a valid Date when backend returns a date string", async () => {
      mockedAxios.get = vi
        .fn()
        .mockResolvedValue({ data: "2026-06-01T20:00:00Z" });

      const result = await getMovieDate();

      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toBe("2026-06-01T20:00:00.000Z");
    });

    it("returns null when backend returns an empty array", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: [] });

      const result = await getMovieDate();
      expect(result).toBeNull();
    });

    it("returns null when backend returns an invalid date", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: "not-a-date" });

      const result = await getMovieDate();
      expect(result).toBeNull();
    });
  });

  describe("checkForNights", () => {
    it("returns true when nights exist", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: true });

      const result = await checkForNights();
      expect(result).toBe(true);
    });

    it("returns false when no nights exist", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: false });

      const result = await checkForNights();
      expect(result).toBe(false);
    });

    it("returns false on network error", async () => {
      mockedAxios.get = vi.fn().mockRejectedValue(new Error("Network Error"));

      const result = await checkForNights();
      expect(result).toBe(false);
    });
  });
});
