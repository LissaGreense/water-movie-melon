import { MovieList } from "./movieList.tsx";
import { NewMovieForm } from "./newMovieForm.tsx";

export const MoviePage = () => {
  return (
    <>
      <div className={"logoBar"}></div>
      <div className="pageContent">
        <div className="melonStyleContainer">
          <div className="melonStyleContainerPeel">
            <NewMovieForm></NewMovieForm>
          </div>
          <div className="melonStyleContainerFruit">
            <MovieList></MovieList>
          </div>
        </div>
      </div>
    </>
  );
};
