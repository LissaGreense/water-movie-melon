import { FC, useEffect, useState } from "react";
import { Movie } from "../types/internal/movie.ts";
import { getMovies } from "../connections/internal/movie.ts";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Avatar } from "primereact/avatar";
import { Chip } from "primereact/chip";
import cover from "../assets/coverplaceholder.jpg";
import dayjs from "dayjs";
import { VirtualScroller } from "primereact/virtualscroller";
import "./movieList.css";

interface MovieListProps {
  movieFormVisible: boolean;
}

export const MovieList: FC<MovieListProps> = ({ movieFormVisible }) => {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    getMovies()
      .then((moviesData) => {
        setMovies(moviesData);
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
      });
  }, [movieFormVisible]);

  const itemTemplate = (data: Movie) => {
    return (
      <Accordion className="align-content-start" activeIndex={1}>
        <AccordionTab
          className="melonStyleContainerFruit"
          header={data.title}
          key={data.title}
        >
          <div className="floatLeft movieCoverDiv">
            <img
              src={data.cover_link}
              alt="Okładka filmu"
              onError={(event) => {
                const target = event.target as HTMLImageElement;
                target.src = cover;
                target.onerror = null;
              }}
            />
          </div>
          <div className="align-content-start movieData">
            <p>
              <a href={"//" + data.link}>link</a>
            </p>
            <Avatar label="u" size="xlarge" shape="circle" />
            <span>{data.user}</span>
            <span>{dayjs(data.date_added).format("YYYY-MM-DD")}</span>
            <div>
              <Chip label={data.genre} />
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    );
  };

  return (
    <div className="card">
      <VirtualScroller
        items={movies}
        itemTemplate={itemTemplate}
        itemSize={7}
        inline
        scrollHeight="500px"
      ></VirtualScroller>
    </div>
  );
};
