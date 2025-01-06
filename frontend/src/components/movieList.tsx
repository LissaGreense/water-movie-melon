import { FC } from "react";
import { Movie } from "../types/internal/movie.ts";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Avatar } from "primereact/avatar";
import { Chip } from "primereact/chip";
import cover from "../assets/coverplaceholder.jpg";
import dayjs from "dayjs";
import { VirtualScroller } from "primereact/virtualscroller";
import "./movieList.css";
import { DEFAULT_BACKEND_URL } from "../constants/defaults.ts";

interface MovieListProps {
  movies: MovieItem[];
}

export interface MovieItem extends Movie {
  avatarUrl: string;
}

export const MovieList: FC<MovieListProps> = ({ movies }) => {
  const itemTemplate = (data: MovieItem) => {
    return (
      <Accordion className="align-content-start" activeIndex={1}>
        <AccordionTab header={data.title} key={data.title}>
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
            <Avatar
              image={DEFAULT_BACKEND_URL + data.avatarUrl}
              size="xlarge"
              shape="circle"
            />
            <span>{data.user}</span>
            <span>{dayjs(data.date_added).format("YYYY-MM-DD")}</span>
            <div>
              <Chip className="seed center" label={data.genre} />
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
        itemSize={movies.length + 1}
        itemTemplate={itemTemplate}
        scrollHeight="500px"
      />
    </div>
  );
};
