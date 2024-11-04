import MovieMenu from "./movieMenu.tsx";
import TopMovies from "./movieTopFilms.tsx";
import { MovieNightCounter } from "./movieNightCounter.tsx";
import bucket from "../assets/bucketph.png";
import { useEffect, useState } from "react";
import { getMovieDate } from "../connections/internal/movieNight.ts";

export const HomePage = () => {
  const [currentDate, setCurrentDate] = useState<Date>();

  useEffect(() => {
    try {
      getMovieDate().then((d) => {
        setCurrentDate(d);
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <>
      <div className={"logoBar"}></div>
      <div className={"pageContent"}>
        <div className={"topMovies"}>
          <TopMovies />
        </div>
        <div className={"bucketSpace"}>
          {currentDate && (
            <>
              <MovieNightCounter nextNightDate={currentDate} />
              <img className={"bucket"} alt={"bucket"} src={bucket} />
            </>
          )}
          <div className={"userMenu"}>
            <MovieMenu />
          </div>
        </div>
      </div>
    </>
  );
};
