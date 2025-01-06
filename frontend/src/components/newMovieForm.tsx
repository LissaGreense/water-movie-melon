import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { postMovie } from "../connections/internal/movie.ts";
import dayjs from "dayjs";
import { InputNumber } from "primereact/inputnumber";
import { getUsername } from "../utils/accessToken.ts";
import { getMoviePosterUrl } from "../connections/external/omdb.ts";
import React, { useCallback, useEffect, useState } from "react";
import { Movie } from "../types/internal/movie.ts";
import { Dialog } from "primereact/dialog";
import { LOGIN } from "../constants/paths.ts";
import { useNavigate } from "react-router-dom";

export const NewMovieForm = () => {
  const [movieTitle, setMovieTitle] = useState<string>("");
  const [movieLink, setMovieLink] = useState<string>("");
  const [movieGenre, setMovieGenre] = useState<string>("");
  const [movieCoverLink, setMovieCoverLink] = useState<string>("");
  const [movieDuration, setMovieDuration] = useState<number>(0);
  const [posterUrls, setPosterUrls] = useState<string[] | undefined>(undefined);
  const [formIncomplete, setFormIncomplete] = useState<boolean>(true);
  const [postSuccessful, setPostSuccessful] = useState<boolean>(false);
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
    if (emptyFieldsInForm()) {
      setFormIncomplete(true);
    } else {
      setFormIncomplete(false);
    }
  }, [emptyFieldsInForm]);

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
        setPostSuccessful(true);
      })
      .catch((error) => {
        if (error.response.data.status === 401) {
          navigate(LOGIN);
        }
        console.error("Error uploading movies:", error);
      });
  };

  const getInputFields = () => {
    return (
      <>
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
      ></Button>
      <Button
        className="m-1"
        label="Dodaj Film"
        icon="pi pi-check"
        type={"submit"}
        disabled={formIncomplete}
      />
      <Dialog visible={postSuccessful} onHide={() => setPostSuccessful(false)}>
        <span className="melonStyleContainerPeel">Dodano film!</span>
      </Dialog>
      <div className="m-2">{showPosters()}</div>
    </form>
  );
};
