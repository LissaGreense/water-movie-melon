import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { MovieItem, MovieList } from "../components/movieList.tsx";
import { NewMovieForm } from "../components/newMovieForm.tsx";
import "./moviePage.css";
import { getAvatar, getStatistics } from "../connections/internal/user.ts";
import { getUsername } from "../utils/accessToken.ts";
import { getMovies } from "../connections/internal/movie.ts";
import { Movie, MovieSearchQuery } from "../types/internal/movie.ts";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { TriStateCheckbox } from "primereact/tristatecheckbox";
import { Nullable } from "primereact/ts-helpers";

export const MoviePage = () => {
  const [movieFormVisible, setMovieFormVisible] = useState<boolean>(false);
  const [userHasTickets, setUserHasTickets] = useState<boolean>(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [movieItems, setMovieItems] = useState<MovieItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [orderBy, setOrderBy] = useState<Map<string, string | boolean>>(new Map<string, string>());
  const [orderByType, setOrderByType] = useState<string>('');
  const [orderByAscending, setOrderByAscending] = useState<Nullable<boolean>>(null);
  const [searchQuery, setSearchQuery] = useState<MovieSearchQuery>({});

  const optionsOrderBy: string[] = ['Tytuł', 'Data dodania', 'Czas trwania']

  useEffect(() => {
    getStatistics(getUsername() as string).then(async (r) => {
      if (r === null) {
        alert("Error fetching user data...");
      } else if (r.movie_tickets > 0) {
        setUserHasTickets(true);
      }
    });

    return () => {
      setUserHasTickets(false);
    };
  }, [movieFormVisible]);

  useEffect(() => {
    console.log(searchQuery)
    getMovies(searchQuery)
      .then((movies) => {
        setMovies(movies);
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
      });

    return () => {
      setMovies([]);
    };
  }, [movieFormVisible, searchQuery]);

  useEffect(() => {
    let ignoreAvatarRequest = false; // race condition prevention

    for (const movie of movies) {
      getAvatar(movie.user).then((avatar) => {
        if (!ignoreAvatarRequest) {
          setMovieItems((movieItems) => [
            ...movieItems,
            { ...movie, avatarUrl: avatar.avatar_url },
          ]);
        }
      });
    }

    return () => {
      setMovieItems([]);
      ignoreAvatarRequest = true; // ignore request during cleanup
    };
  }, [movies]);

  useEffect(() => {
    const searchQuery = new Map<string, string | Map<string, string | boolean>>();

    if (searchTerm) {
      searchQuery.set('search', searchTerm);
    }

    if (orderBy.has('ascending') && orderBy.has('type')) {
      searchQuery.set('orderBy', orderBy);
    }

    setSearchQuery(searchQuery as MovieSearchQuery);

    return () => {
      setSearchQuery({});
    }
  }, [searchTerm, orderBy]);

  const handleOrderBy = () => {
    const orderBy = new Map<string, string | boolean>();

    if (orderByType) {
      orderBy.set("type", orderByType);
    }

    if (orderByAscending === true) {
      orderBy.set("ascending", true);
    } else if (orderByAscending === false) {
      orderBy.set("ascending", false);
    }

    setOrderBy(orderBy);
  }

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
        <div className="melonStyleContainerPeel">
          <div className="p-inputgroup flex-1">
            <InputText placeholder="Szukaj" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Dropdown placeholder="Sortowanie" value={orderByType} onChange={(e) => {setOrderByType(e.target.value)}} options={optionsOrderBy} showClear />
            <TriStateCheckbox value={orderByAscending} onChange={(e) => setOrderByAscending(e.target.value)} disabled={!orderByType} />
            <Button label={'Sortuj'} onClick={handleOrderBy} />
          </div>
        </div>
        <div className="melonStyleContainerFruit">
          <MovieList movies={movieItems}></MovieList>
        </div>
      </div>
    </>
  );
};
