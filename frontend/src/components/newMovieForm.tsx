import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Accordion, AccordionTab } from "primereact/accordion";
import { postMovie } from "../connections/internal/movie.ts";
import dayjs from "dayjs";
import { InputNumber } from "primereact/inputnumber";
import { getUsername } from "../utils/accessToken.ts";
import { getMoviePosterUrl } from "../connections/external/omdb.ts";
import React, { useState } from "react";
import { Movie } from "../types/internal/movie.ts";

export const NewMovieForm = () => {
  const [movieTitle, setMovieTitle] = useState<string>("");
  const [movieLink, setMovieLink] = useState<string>("");
  const [movieGenre, setMovieGenre] = useState<string>("");
  const [movieCoverLink, setMovieCoverLink] = useState<string>("");
  const [movieDuration, setMovieDuration] = useState<number>(0);
  const [posterUrls, setPosterUrls] = useState<string[] | undefined>(undefined);

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
    if (posterUrls?.length > 0) {
      return posterUrls?.map((url) => (
        <>
          <img
            className="melonStyleContainerPeel p-inputgroup flex-1"
            src={url}
            alt={"Movie Poster"}
          />
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
    if (posterUrls !== undefined && posterUrls.length === 0) {
      return <p>Nie znaleziono okładek dla podanego przez Ciebie filmu :/</p>;
    }
  };

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
              onChange={(e) => setMovieLink(e.target.value)}
            />
          </div>
          <div className="melonStyleContainerPeel p-inputgroup flex-1">
            {showChosenPoster()}
          </div>
          <Button
            className="melonStyleContainerPeel"
            label="Wczytaj okładkę"
            icon="pi pi-check"
            onClick={handleMoviePoster}
            type={"button"}
          ></Button>
          <Button
            className="melonStyleContainerPeel"
            label="Dodaj Film"
            icon="pi pi-check"
            type={"submit"}
          />
          <div>{showPosters()}</div>
        </form>
      </AccordionTab>
    </Accordion>
  );
};
