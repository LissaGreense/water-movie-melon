import { useEffect, useState } from "react";
import { Movie } from "../types/internal/movie.ts";
import { getMovies } from "../connections/internal/movie.ts";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Avatar } from "primereact/avatar";
import { Chip } from "primereact/chip";

export const MovieList = () => {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    getMovies()
    .then((moviesData) => {
      setMovies(moviesData);
    })
    .catch((error) => {
      console.error('Error fetching movies:', error);
    });
  }, []);

  return (
      <Accordion className={"showMovies"} activeIndex={0}>
        {movies.map((movie) => (
            <AccordionTab header={movie.title} key={movie.title}>
              <div className={"userRow"}>
                <Avatar label="u" size="xlarge" shape="circle"/>
                <span>{movie.user}</span>
                <span>{movie.date_added}</span>
              </div>
              <p>
                <a href={movie.link}>link</a>
              </p>
              <div>
                <Chip label={movie.genre}/>
              </div>
            </AccordionTab>
        ))}
      </Accordion>
  );
};
