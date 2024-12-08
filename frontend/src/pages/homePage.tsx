import MovieMenu from "../components/movieMenu.tsx";
import TopMovies from "../components/movieTopFilms.tsx";
import { MovieNightCounter } from "../components/movieNightCounter.tsx";
import bucket from "../assets/bucketph.png";
import { useEffect, useState } from "react";
import { getMovieDate } from "../connections/internal/movieNight.ts";
import "./homePage.css";

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
        <div className={"topMoviesSection"}>
          <TopMovies />
        </div>
        <div className={"bucketSpace"}>
          {currentDate && (
            <>
              <MovieNightCounter nextNightDate={currentDate} />
              <img className={"bucket"} alt={"bucket"} src={bucket} />
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
