import { ChangeEvent, useEffect, useState, useRef } from "react";
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
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Nullable } from "primereact/ts-helpers";
import { Toast } from "primereact/toast";
import {
  MultiStateCheckbox,
  MultiStateCheckboxChangeEvent,
} from "primereact/multistatecheckbox";
import "primeicons/primeicons.css";

interface OrderByItem {
  value: string;
  name: string;
}

interface OrderAscendingItem {
  value: boolean;
  icon: string;
}

export const MoviePage = () => {
  const toast = useRef<Toast>(null);
  const [movieFormVisible, setMovieFormVisible] = useState<boolean>(false);
  const [userTickets, setUserTickets] = useState<number>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [movieItems, setMovieItems] = useState<MovieItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [orderByType, setOrderByType] = useState<string>("");
  const [orderByAscending, setOrderByAscending] =
    useState<Nullable<boolean>>(undefined);
  const [searchQuery, setSearchQuery] = useState<MovieSearchQuery>({});

  const optionsOrderBy: OrderByItem[] = [
    { value: "title", name: "Tytuł" },
    { value: "date_added", name: "Data Dodania" },
    { value: "duration", name: "Czas trwania" },
  ];
  const optionsOrderAscending: OrderAscendingItem[] = [
    { value: true, icon: "pi pi-sort-alpha-down" },
    { value: false, icon: "pi pi-sort-alpha-down-alt" },
  ];

  useEffect(() => {
    getStatistics(getUsername() as string).then(async (r) => {
      if (r === null) {
        alert("Error fetching user data...");
      } else {
        setUserTickets(r.movie_tickets);
      }
    });

    return () => {
      setUserTickets(null);
    };
  }, [movieFormVisible]);

  useEffect(() => {
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

  const handleOrderBy = () => {
    const searchQuery: MovieSearchQuery = {
      search: searchTerm,
    };

    if (orderByAscending || orderByAscending === false) {
      searchQuery.orderBy = {
        type: orderByType,
        ascending: orderByAscending,
      };
    }

    setSearchQuery(searchQuery);
  };

  const handleSearchTermChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);

    const searchQuery: MovieSearchQuery = {
      search: e.target.value,
    };
    setSearchQuery(searchQuery);
  };

  const handleMultiStateCheckbox = (e: MultiStateCheckboxChangeEvent) => {
    setOrderByAscending(e.target.value);
  };

  const handleSortButton = () => {
    let disabled = true;
    if ((orderByType && orderByAscending) || orderByAscending === false) {
      disabled = false;
    }
    return disabled;
  };

  const handleDropdownChange = (e: DropdownChangeEvent) => {
    setOrderByType(e.target.value);
    if (e.target.value) {
      setOrderByAscending(true);
    } else {
      setOrderByAscending(undefined);
    }
  };

  return (
    <>
      <div className="moviesContainer">
        <div className="melonStyleContainerPeel">
          <Toast ref={toast} />
          <Button
            label={"Dodaj Film"}
            onClick={() => {
              if (!userTickets) {
                toast.current.show({
                  severity: "error",
                  summary: "Brak biletów",
                  detail:
                    "Nie masz wystarczająco biletów aby dodać film. Załóż nowy wieczór filmowy, bądź dołącz do istniejącego",
                  life: 10000,
                });
              } else {
                setMovieFormVisible(true);
                toast.current.show({
                  severity: "info",
                  summary: "Pozostałe bilety",
                  detail:
                    "Dodanie filmu kosztuje 1 bilet. Pozostałe bilety: " +
                    userTickets,
                  life: 5000,
                });
              }
            }}
          />
          <Dialog
            visible={movieFormVisible}
            onHide={() => {
              setMovieFormVisible(false);
            }}
          >
            <NewMovieForm
              ticketsCount={userTickets}
              setTicketsCount={setUserTickets}
              messageToast={toast.current}
            />
          </Dialog>
        </div>
        <div className="melonStyleContainerPeel">
          <div className="p-inputgroup flex-1">
            <InputText
              placeholder="Szukaj"
              value={searchTerm}
              onChange={handleSearchTermChange}
            />
            <Dropdown
              className={"melonStyleContainerFruit"}
              placeholder="Sortowanie"
              value={orderByType}
              onChange={handleDropdownChange}
              options={optionsOrderBy}
              optionValue={"value"}
              optionLabel={"name"}
              showClear
            />
            <MultiStateCheckbox
              className={"melonStyleContainerFruit"}
              value={orderByAscending}
              onChange={handleMultiStateCheckbox}
              options={optionsOrderAscending}
              optionValue={"value"}
            />
            <Button
              className={"melonStyleContainerFruit"}
              label={"Sortuj"}
              onClick={handleOrderBy}
              disabled={handleSortButton()}
            />
          </div>
        </div>
        <div className="melonStyleContainerFruit">
          <MovieList movies={movieItems}></MovieList>
        </div>
      </div>
    </>
  );
};
