import { useEffect, useState } from "react";
import { Rating } from "primereact/rating";
import { Movie } from "../types/internal/movie.ts";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { VirtualScroller } from "primereact/virtualscroller";
import { getAverageRatings } from "../connections/internal/movieRate.ts";
import { MovieRateAverage } from "../types/internal/movieRate.ts";

interface TopFilms {
  movie: Movie;
  average_rating: number;
}

export default function TopMovies() {
  const [ratings, setRatings] = useState<MovieRateAverage[]>();
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    getAverageRatings()
      .then((ratingData) => {
        setRatings(ratingData);
      })
      .catch((error) => {
        console.error("Error fetching ratings:", error);
      });
  }, []);

  const itemTemplate = (data: TopFilms) => {
    return (
      <div className={"topMovieDiv"}>
        <div className={"topMovieCoverDiv"}>
          <img
            className="topMovieCover"
            src={data.movie.cover_link}
            alt={data.movie.title}
          />
        </div>
        <div className="topMovieCoverData">
          <div>
            <div>
              <div className="textSans">{data.movie.title}</div>
            </div>
            <div className="flex flex-column gap-2">
              <Rating
                value={data.average_rating}
                readOnly
                cancel={false}
                stars={7}
              ></Rating>
              <span className="flex align-items-center gap-2">
                <i className="pi pi-tag product-category-icon"></i>
                <span className="textSansNoBorder">{data.movie.genre}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card flex justify-content-center">
      <Sidebar visible={visible} onHide={() => setVisible(false)}>
        <h2>Top Movies</h2>
        <div className="card">
          <VirtualScroller
            items={ratings}
            itemTemplate={itemTemplate}
            itemSize={7}
            scrollHeight="500px"
          />
        </div>
      </Sidebar>
      <Button label="TOP MOVIES" onClick={() => setVisible(true)} />
    </div>
  );
}
