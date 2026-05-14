import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import TopMovies from "../../components/movieTopFilms";
import * as movieRateConnections from "../../connections/internal/movieRate";
import { MovieRateAverage } from "../../types/internal/movieRate";
import { Movie } from "../../types/internal/movie";

vi.mock("../../connections/internal/movieRate");
vi.mock("../../components/movieTopFilms.css", () => ({}));

// VirtualScroller relies on real scroll dimensions unavailable in jsdom.
// Replace it with a simple passthrough that renders all items directly.
vi.mock("primereact/virtualscroller", () => ({
  VirtualScroller: ({
    items,
    itemTemplate,
  }: {
    items: unknown[];
    itemTemplate: (item: unknown) => React.ReactNode;
  }) => (
    <div>
      {items?.map((item, i) => <div key={i}>{itemTemplate(item)}</div>)}
    </div>
  ),
}));

const mockMovie: Movie = {
  title: "Inception",
  link: "https://imdb.com/inception",
  user: "alice",
  date_added: "2026-01-01T00:00:00Z",
  genre: "Sci-Fi",
  cover_link: "http://example.com/inception.jpg",
  duration: 148,
};

const mockRatings: MovieRateAverage[] = [{ movie: mockMovie, rating: 6.5 }];

describe("TopMovies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the TOP MOVIES button", async () => {
    vi.spyOn(movieRateConnections, "getAverageRatings").mockResolvedValue([]);

    render(<TopMovies />);

    expect(screen.getByText("TOP MOVIES")).toBeInTheDocument();
    // wait for the ratings fetch to settle so no act() warnings leak into other tests
    await waitFor(() => {
      expect(movieRateConnections.getAverageRatings).toHaveBeenCalled();
    });
  });

  it("fetches average ratings on mount", async () => {
    vi.spyOn(movieRateConnections, "getAverageRatings").mockResolvedValue(
      mockRatings,
    );

    render(<TopMovies />);

    await waitFor(() => {
      expect(movieRateConnections.getAverageRatings).toHaveBeenCalledOnce();
    });
  });

  it("opens the sidebar when the TOP MOVIES button is clicked", async () => {
    vi.spyOn(movieRateConnections, "getAverageRatings").mockResolvedValue(
      mockRatings,
    );

    render(<TopMovies />);
    fireEvent.click(screen.getByText("TOP MOVIES"));

    await waitFor(() => {
      expect(screen.getByText("Top Movies")).toBeInTheDocument();
    });
  });

  it("displays movie titles after sidebar is opened", async () => {
    vi.spyOn(movieRateConnections, "getAverageRatings").mockResolvedValue(
      mockRatings,
    );

    render(<TopMovies />);
    fireEvent.click(screen.getByText("TOP MOVIES"));

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });
  });
});
