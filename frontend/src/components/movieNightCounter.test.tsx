import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { MovieNightCounter } from "./movieNightCounter";
import * as movieNightConnections from "../connections/internal/movieNight";

vi.mock("../connections/internal/movieNight");
vi.mock("./movieNightCounter.css", () => ({}));

const mockMovie = {
  title: "The Matrix",
  link: "https://imdb.com/matrix",
  user: "alice",
  date_added: "2026-01-01T00:00:00Z",
  genre: "Sci-Fi",
  cover_link: "http://example.com/matrix.jpg",
  duration: 136,
};

describe("MovieNightCounter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows "Nie ma planów" when there are no upcoming nights', async () => {
    vi.spyOn(movieNightConnections, "checkForNights").mockResolvedValue(false);
    vi.spyOn(movieNightConnections, "getSelectedMovie").mockResolvedValue(null);

    render(<MovieNightCounter nextNightDate={null} />);

    await waitFor(() => {
      expect(screen.getByText("Nie ma planów :|")).toBeInTheDocument();
    });
  });

  it("shows a countdown when there is a future movie night", async () => {
    vi.spyOn(movieNightConnections, "checkForNights").mockResolvedValue(true);
    vi.spyOn(movieNightConnections, "getSelectedMovie").mockResolvedValue(null);

    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);

    render(<MovieNightCounter nextNightDate={futureDate} />);

    await waitFor(() => {
      expect(screen.getByText(/\d+d:\d+h:\d+m:\d+s/)).toBeInTheDocument();
    });
  });

  it("shows the selected movie title when the countdown has finished and movie is set", async () => {
    vi.spyOn(movieNightConnections, "checkForNights").mockResolvedValue(true);
    vi.spyOn(movieNightConnections, "getSelectedMovie").mockResolvedValue(mockMovie);

    // 30 minutes ago — countdown finished but still within the 1-hour display window
    const recentPastDate = new Date(Date.now() - 1000 * 60 * 30);

    render(<MovieNightCounter nextNightDate={recentPastDate} />);

    await waitFor(() => {
      expect(screen.getByText("Oglądamy The Matrix!")).toBeInTheDocument();
    });
  });

  it("shows the movie cover image when the selected movie is displayed", async () => {
    vi.spyOn(movieNightConnections, "checkForNights").mockResolvedValue(true);
    vi.spyOn(movieNightConnections, "getSelectedMovie").mockResolvedValue(mockMovie);

    const recentPastDate = new Date(Date.now() - 1000 * 60 * 30);

    render(<MovieNightCounter nextNightDate={recentPastDate} />);

    await waitFor(() => {
      const img = screen.getByAltText("Dzisiejszy film") as HTMLImageElement;
      expect(img).toBeInTheDocument();
      expect(img.src).toBe(mockMovie.cover_link);
    });
  });

  it("shows a zeroed countdown when nextNightDate is null but nights exist", async () => {
    vi.spyOn(movieNightConnections, "checkForNights").mockResolvedValue(true);
    vi.spyOn(movieNightConnections, "getSelectedMovie").mockResolvedValue(null);

    render(<MovieNightCounter nextNightDate={null} />);

    await waitFor(() => {
      expect(screen.getByText("0d:0h:0m:0s")).toBeInTheDocument();
    });
  });

  it("does not show the selected movie more than 1 hour after the night", async () => {
    vi.spyOn(movieNightConnections, "checkForNights").mockResolvedValue(true);
    vi.spyOn(movieNightConnections, "getSelectedMovie").mockResolvedValue(mockMovie);

    // 2 hours ago — outside the 1-hour display window
    const oldDate = new Date(Date.now() - 1000 * 60 * 120);

    render(<MovieNightCounter nextNightDate={oldDate} />);

    await waitFor(() => {
      expect(screen.queryByText(/Oglądamy/)).not.toBeInTheDocument();
    });
  });
});
