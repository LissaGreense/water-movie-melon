import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Accordion, AccordionTab } from "primereact/accordion";
import { postMovie } from "../connections/internal/movie.ts";
import dayjs from "dayjs";
import { InputNumber } from "primereact/inputnumber";
import { getUsername } from "../utils/accessToken.ts";
import { getMoviePosterUrl } from "../connections/external/omdb.ts";
import React, { useCallback, useEffect, useState } from "react";
import { Movie } from "../types/internal/movie.ts";

export const NewMovieForm = () => {
  const [movieTitle, setMovieTitle] = useState<string>("");
  const [movieLink, setMovieLink] = useState<string>("");
  const [movieGenre, setMovieGenre] = useState<string>("");
  const [movieCoverLink, setMovieCoverLink] = useState<string>("");
  const [movieDuration, setMovieDuration] = useState<number>(0);
  const [formIncomplete, setFormIncomplete] = useState<boolean>(true);
  const [posterUrls, setPosterUrls] = useState<string[]>([]);
  const URL_REGEX: string =
    "^(https?:\\/\\/)?((([-a-z0-9]{1,63}\\.)*?[a-z0-9]([-a-z0-9]{0,253}[a-z0-9])?\\.[a-z]{2,63})|((\\d{1,3}\\.){3}\\d{1,3}))(:\\d{1,5})?((\\/|\\?)((%[0-9a-f]{2})|[-\\w\\+\\.\\?\\/@~#&=])*)?$";
  const checkUrl: RegExp = new RegExp(URL_REGEX, "i");

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
    const moviePosterUrls: string[] = [];
    getMoviePosterUrl(movieTitle).then((poster) => {
      if (poster) {
        const posterData = poster["Search"];
        if (posterData.length > 4) {
          for (let i = 0; i < 5; i++) {
            moviePosterUrls.push(posterData[i]["Poster"]);
          }
        } else {
          for (const poster of posterData) {
            moviePosterUrls.push(poster["Poster"]);
          }
        }
        setPosterUrls(moviePosterUrls);
      }
    });
  };

  const showChosenPoster = () => {
    if (movieCoverLink !== "") {
      return (
        <>
          <span className="melonStyleContainerPeel p-inputgroup-addon">
            Wybrana okładka
          </span>
          <img
            className="melonStyleContainerPeel"
            src={movieCoverLink}
            alt="Wybrana okładka filmu"
          />
        </>
      );
    }
  };

  const showPosters = () => {
    if (posterUrls.length !== 0) {
      return posterUrls.map((url) => (
        <>
          <img
            className="melonStyleContainerPeel p-inputgroup flex-1"
            src={url}
            alt={"Proponowana okładka"}
          ></img>
          <Button
            className="melonStyleContainerPeel"
            onClick={() => setMovieCoverLink(url)}
            type={"button"}
          >
            Wybierz okładkę
          </Button>
        </>
      ));
    }
  };

  const handleMovieLink = (url: string) => {
    if (checkUrl.test(url)) {
      const checkedUrl = checkForHttp(url);
      setMovieLink(checkedUrl);
    } else {
      console.warn("URL invalid");
    }
  };

  function checkForHttp(url: string) {
    if (url.startsWith("http")) {
      url = url.split("//")[1];
    }
    return url;
  }

  return (
    <Accordion className={"addMovies"} activeIndex={1}>
      <AccordionTab
        className="melonStyleContainerPeel textSansNoBorder"
        header={"Dodaj Film"}
      >
        <form
          onSubmit={(e: React.FormEvent) => {
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
            postMovie(movie);
          }}
          id="new_movie_form"
          name="new_movie_form"
        >
          <div className="melonStyleContainerPeel p-inputgroup flex-1">
            <span className="melonStyleContainerPeel p-inputgroup-addon">
              Tytuł
            </span>
            <InputText
              className="melonStyleContainerPeel"
              placeholder="eg. Superzioło"
              name={"title"}
              onChange={(e) => setMovieTitle(e.target.value)}
            />
          </div>
          <div className="melonStyleContainerPeel p-inputgroup flex-1">
            <span className="melonStyleContainerPeel p-inputgroup-addon">
              Gatunek
            </span>
            <InputText
              className="melonStyleContainerPeel"
              placeholder="eg. komedia"
              name={"genre"}
              onChange={(e) => setMovieGenre(e.target.value)}
            />
          </div>
          <div className="melonStyleContainerPeel p-inputgroup flex-1">
            <span className="melonStyleContainerPeel p-inputgroup-addon">
              Czas trwania
            </span>
            <InputNumber
              className="melonStyleContainerPeel"
              placeholder="w minutach"
              name={"duration"}
              onChange={(e) => setMovieDuration(e.value as number)}
            />
          </div>
          <div className="melonStyleContainerPeel p-inputgroup flex-1">
            <span className="melonStyleContainerPeel p-inputgroup-addon">
              Link do filmu
            </span>
            <InputText
              className="melonStyleContainerPeel"
              placeholder="eg. cda.pl/..."
              name={"link"}
              onChange={(e) => handleMovieLink(e.target.value)}
            />
          </div>
          <div className="melonStyleContainerPeel p-inputgroup flex-1">
            {showChosenPoster()}
          </div>
          <Button
            className="melonStyleContainerPeel"
            label="Wczytaj okładki"
            icon="pi pi-check"
            onClick={handleMoviePoster}
            type={"button"}
          ></Button>
          <Button
            className="melonStyleContainerPeel"
            label="Dodaj Film"
            icon="pi pi-check"
            type={"submit"}
            disabled={formIncomplete}
          />
          <div className="melonStyleContainerPeel">{showPosters()}</div>
        </form>
      </AccordionTab>
    </Accordion>
  );
};
