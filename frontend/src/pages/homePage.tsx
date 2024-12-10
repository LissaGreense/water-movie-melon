import MovieMenu from "../components/movieMenu.tsx";
import TopMovies from "../components/movieTopFilms.tsx";
import { MovieNightCounter } from "../components/movieNightCounter.tsx";
import { useEffect, useState } from "react";
import { getMovieDate } from "../connections/internal/movieNight.ts";
import { BucketWithCovers } from "../components/bucketWithCovers.tsx";
import "./homePage.css";


export const HomePage = () => {
  const [nextMovieDate, setNextMovieDate] = useState<Date>();

  useEffect(() => {
    try {
      getMovieDate().then((d) => {
        setNextMovieDate(d);
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <>
      <div className={"logoBar"}></div>
      <div className={"pageContent"}>
        <div className={"topMoviesSection"}>
          <TopMovies />
        </div>
        <div id={'bucketSpace'} className={"bucketSpace"}>
          {nextMovieDate && (
            <>
              <MovieNightCounter nextNightDate={nextMovieDate} />
              <BucketWithCovers />
            </>
          )}
        </div>
        <div className={"userMenu"}>
          <MovieMenu />
        </div>
      </div>
    </>
  );
};
