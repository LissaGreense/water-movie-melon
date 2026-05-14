import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MovieMenu from "../../components/movieMenu";
import * as accessToken from "../../utils/accessToken";
import * as userConnections from "../../connections/internal/user";
import * as authConnections from "../../connections/internal/authentication";

vi.mock("../../connections/internal/user");
vi.mock("../../connections/internal/authentication");
vi.mock("../../components/movieMenu.css", () => ({}));

describe("MovieMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderMenu = () =>
    render(
      <MemoryRouter>
        <MovieMenu />
      </MemoryRouter>,
    );

  describe("when the user is not logged in", () => {
    beforeEach(() => {
      vi.spyOn(accessToken, "getUsername").mockReturnValue(null);
    });

    it("shows the login option", () => {
      renderMenu();
      expect(screen.getByText("Zaloguj")).toBeInTheDocument();
    });

    it("shows the register option", () => {
      renderMenu();
      expect(screen.getByText("Zarejestruj")).toBeInTheDocument();
    });

    it("does not show navigation links reserved for logged-in users", () => {
      renderMenu();
      expect(screen.queryByText("Kokpit")).not.toBeInTheDocument();
      expect(screen.queryByText("Wyloguj")).not.toBeInTheDocument();
    });
  });

  describe("when the user is logged in", () => {
    beforeEach(() => {
      vi.spyOn(accessToken, "getUsername").mockReturnValue("alice");
      vi.spyOn(userConnections, "getAvatar").mockResolvedValue({
        avatar_url: "",
      });
      vi.spyOn(authConnections, "logout").mockResolvedValue({} as never);
    });

    it("shows the username", () => {
      renderMenu();
      expect(screen.getByText("alice")).toBeInTheDocument();
    });

    it("shows all navigation links", () => {
      renderMenu();
      expect(screen.getByText("Kokpit")).toBeInTheDocument();
      expect(screen.getByText("Filmy")).toBeInTheDocument();
      expect(screen.getByText("Kalendarz")).toBeInTheDocument();
      expect(screen.getByText("Wyloguj")).toBeInTheDocument();
    });

    it("does not show login or register links", () => {
      renderMenu();
      expect(screen.queryByText("Zaloguj")).not.toBeInTheDocument();
      expect(screen.queryByText("Zarejestruj")).not.toBeInTheDocument();
    });

    it("fetches the avatar on mount using the logged-in username", async () => {
      renderMenu();
      await waitFor(() => {
        expect(userConnections.getAvatar).toHaveBeenCalledWith("alice");
      });
    });
  });
});
