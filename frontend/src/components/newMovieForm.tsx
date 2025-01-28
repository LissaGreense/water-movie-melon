import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { postMovie } from "../connections/internal/movie.ts";
import dayjs from "dayjs";
import { InputNumber } from "primereact/inputnumber";
import { getUsername } from "../utils/accessToken.ts";
import { getMoviePosterUrl } from "../connections/external/omdb.ts";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Movie } from "../types/internal/movie.ts";
import { LOGIN } from "../constants/paths.ts";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";

interface NewMovieFormProps {
  ticketsCount: number;
  setTicketsCount: (count: number) => void;
}

export const NewMovieForm = (props: NewMovieFormProps) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const toast = useRef<Toast | null>(null);
  // TODO: make one object or use form ref maybe?
  const [movieTitle, setMovieTitle] = useState<string>("");
  const [movieLink, setMovieLink] = useState<string>("");
  const [movieGenre, setMovieGenre] = useState<string>("");
  const [movieCoverLink, setMovieCoverLink] = useState<string>("");
  const [movieDuration, setMovieDuration] = useState<number>(0);
  const [posterUrls, setPosterUrls] = useState<string[] | undefined>(undefined);
  const [formIncomplete, setFormIncomplete] = useState<boolean>(true);
  const URL_REGEX: RegExp = new RegExp(
    "^(https?:\\/\\/)?((([-a-z0-9]{1,63}\\.)*?[a-z0-9]([-a-z0-9]{0,253}[a-z0-9])?\\.[a-z]{2,63})|((\\d{1,3}\\.){3}\\d{1,3}))(:\\d{1,5})?(([/?])((%[0-9a-f]{2})|[-\\w+.?\\/@~#&=])*)?$",
    "i",
  );
  const navigate = useNavigate();

  const emptyFieldsInForm = useCallback(() => {
    return (
      movieTitle == "" ||
      movieLink == "" ||
      movieGenre == "" ||
      movieCoverLink == "" ||
      movieDuration == 0
    );
  }, [movieCoverLink, movieDuration, movieGenre, movieLink, movieTitle]);

  useEffect(() => {
    setFormIncomplete(emptyFieldsInForm());
  }, [emptyFieldsInForm]);

  const resetForm = () => {
    formRef.current?.reset();
    setFormIncomplete(true);
    setMovieDuration(0);
    setMovieTitle("");
    setMovieLink("");
    setMovieGenre("");
    setPosterUrls(undefined);
    setMovieCoverLink("");
  };

  const handleMoviePoster = () => {
    getMoviePosterUrl(movieTitle).then((poster) => {
      const moviePosterUrls: string[] = [];
      if (poster) {
        const posterData = poster["Search"];
        if (posterData && posterData.length > 4) {
          for (let i = 0; i < 5; i++) {
            moviePosterUrls.push(posterData[i]["Poster"]);
          }
        } else if (posterData) {
          for (const poster of posterData) {
            moviePosterUrls.push(poster["Poster"]);
          }
        }
      }
      setPosterUrls(moviePosterUrls);
    });
  };

  const showChosenPoster = () => {
    if (movieCoverLink !== "") {
      return (
        <>
          <span className="p-inputgroup-addon">Wybrana okładka</span>
          <img src={movieCoverLink} alt="Wybrana okładka filmu" />
        </>
      );
    }
  };

  const showPosters = () => {
    if (posterUrls && posterUrls.length > 0) {
      return posterUrls.map((url, index) => (
        <div className="m-2" key={"cover-item" + index}>
          <img
            className="p-inputgroup flex-1"
            src={url}
            alt={"Proponowana okładka"}
          />
          <Button
            className="m-1"
            onClick={() => setMovieCoverLink(url)}
            type={"button"}
          >
            Wybierz okładkę
          </Button>
        </div>
      ));
    }
    if (posterUrls !== undefined && posterUrls.length === 0) {
      return <p>Nie znaleziono okładek dla podanego przez Ciebie filmu :/</p>;
    }
  };

  const handleMovieLink = (url: string) => {
    if (URL_REGEX.test(url)) {
      const checkedUrl = checkForHttp(url);
      setMovieLink(checkedUrl);
    } else {
      console.warn("URL invalid");
    }
  };

  const checkForHttp = (url: string) => {
    if (url.startsWith("http")) {
      url = url.split("//")[1];
    }
    return url;
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const movie: Movie = {
      title: movieTitle,
      link: movieLink,
      user: getUsername() as string,
      date_added: dayjs().format("YYYY-MM-DD HH:mm"),
      genre: movieGenre,
      cover_link: movieCoverLink,
      duration: movieDuration,
    };
    postMovie(movie)
      .then(() => {
        const newTicketsCount = props.ticketsCount - 1;
        toast.current?.show({
          severity: "success",
          summary: "Dodano Film!",
          detail: "Pozostała liczba biletów: " + newTicketsCount,
        });
        props.setTicketsCount(newTicketsCount);
        resetForm();
      })
      .catch((error) => {
        if (error.response.data.status === 401) {
          navigate(LOGIN);
        } else if (error.response.data.status === 402) {
          toast.current?.show({
            severity: "error",
            summary: "Brak biletów",
            detail:
              "Nie masz wystarczająco biletów aby dodać film. Załóż nowy wieczór filmowy, bądź dołącz do istniejącego",
          });
        }
        console.error("Error uploading movie:", error);
      });
  };

  const getInputFields = () => {
    return (
      <>
        <Toast ref={toast} />
        <div className="p-inputgroup flex-1 m-2">
          <span className="p-inputgroup-addon">Tytuł</span>
          <InputText
            placeholder="eg. Superzioło"
            name={"title"}
            onChange={(e) => setMovieTitle(e.target.value)}
          />
        </div>
        <div className="p-inputgroup flex-1 m-2">
          <span className="p-inputgroup-addon">Gatunek</span>
          <InputText
            placeholder="eg. komedia"
            name={"genre"}
            onChange={(e) => setMovieGenre(e.target.value)}
          />
        </div>
        <div className="p-inputgroup flex-1 m-2">
          <span className="p-inputgroup-addon">Czas trwania</span>
          <InputNumber
            placeholder="w minutach"
            name={"duration"}
            onChange={(e) => setMovieDuration(e.value as number)}
          />
        </div>
        <div className="p-inputgroup flex-1 m-2">
          <span className="p-inputgroup-addon">Link do filmu</span>
          <InputText
            placeholder="eg. cda.pl/..."
            name={"link"}
            onChange={(e) => handleMovieLink(e.target.value)}
          />
        </div>
      </>
    );
  };

  return (
    <form
      onSubmit={(e: React.FormEvent) => {
        handleSubmitForm(e);
      }}
      id="new_movie_form"
      name="new_movie_form"
      ref={formRef}
    >
      {getInputFields()}
      <div className="melonStyleContainerPeel p-inputgroup flex-1">
        {showChosenPoster()}
      </div>
      <Button
        className="m-1"
        label="Wczytaj okładki"
        icon="pi pi-check"
        onClick={handleMoviePoster}
        type={"button"}
      />
      <Button
        className="m-1"
        label="Dodaj Film"
        icon="pi pi-check"
        type={"submit"}
        disabled={formIncomplete}
      />
      <div className="m-2">{showPosters()}</div>
    </form>
  );
};
