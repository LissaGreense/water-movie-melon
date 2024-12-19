import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { MovieItem, MovieList } from "../components/movieList.tsx";
import { NewMovieForm } from "../components/newMovieForm.tsx";
import "./moviePage.css";
import { getAvatar, getStatistics } from "../connections/internal/user.ts";
import { getUsername } from "../utils/accessToken.ts";
import { getMovies } from "../connections/internal/movie.ts";
import { Movie } from "../types/internal/movie.ts";

export const MoviePage = () => {
  const [movieFormVisible, setMovieFormVisible] = useState<boolean>(false);
  const [userHasTickets, setUserHasTickets] = useState<boolean>(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [movieItems, setMovieItems] = useState<MovieItem[]>([]);

  useEffect(() => {
    console.log("tickety")
    getStatistics(getUsername() as string).then(async (r) => {
      if (r === null) {
        alert("Error fetching user data...");
      } else if (r.movie_tickets > 0) {
        setUserHasTickets(true);
      }
    });

    return () => {
      setUserHasTickets(false);
    }
  }, [movieFormVisible]);

  useEffect(() => {
    console.log("filmy")
    getMovies({})
      .then((movies) => {
        setMovies(movies);

      }).catch((error) => {
      console.error("Error fetching movies:", error);
    });

    return () => {
      setMovies([]);
    }
  }, [movieFormVisible]);

  useEffect(() => {
      console.log("avatary")
    // TODO: better cache implementation is needed
      const avatarMem: Map<string, string> = new Map<string, string>();

      movies.forEach((movie: Movie) => {
        if (!avatarMem.has(movie.user)) {
          getAvatar(movie.user).then((avatar) => {
            avatarMem.set(movie.user, avatar.avatar_url);
            // here this magic
            setMovieItems(movieItems => [
              ...movieItems,
              { ...movie, avatarUrl: avatar.avatar_url }
            ])
          }).catch((error) => {
            console.error("Error fetching avatar:", error);
          });
        } else {
          // and here also magic
          setMovieItems(movieItems => [
            ...movieItems,
            { ...movie, avatarUrl: avatarMem.get(movie.user) as string }
          ])
        }
      });

    return () => {
      setMovieItems([]);
    }
  }, [movies]);

  return (
    <>
      <div className="moviesContainer">
        <div className="melonStyleContainerPeel">
          <Button
            label={
              userHasTickets
                ? "Dodaj Film"
                : "Nie masz wystarczająco biletów aby dodać film. Załóż nowy wieczór filmowy, bądź dołącz do istniejącego"
            }
            disabled={!userHasTickets}
            onClick={() => setMovieFormVisible(true)}
          />
          <Dialog
            visible={movieFormVisible}
            onHide={() => {
              setMovieFormVisible(false);
            }}
          >
            <NewMovieForm></NewMovieForm>
          </Dialog>
        </div>
        <div className="melonStyleContainerFruit">
          <MovieList movies={movieItems}></MovieList>
        </div>
      </div>
    </>
  );
};
