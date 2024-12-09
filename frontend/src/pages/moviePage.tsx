import { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { MovieList } from "../components/movieList.tsx";
import { NewMovieForm } from "../components/newMovieForm.tsx";
import "./moviePage.css";

export const MoviePage = () => {
  const [movieFormVisible, setMovieFormVisible] = useState<boolean>(false);

  return (
    <>
      <div className={"logoBar"}></div>
      <div className="pageContent">
        <div className="moviesContainer">
          <div className="melonStyleContainerPeel">
            <Button
              label={"Dodaj Film"}
              onClick={() => setMovieFormVisible(true)}
            />
            <Dialog
              visible={movieFormVisible}
              onHide={() => {
                setMovieFormVisible(false);
              }}
            >
              <NewMovieForm></NewMovieForm>
            </Dialog>
          </div>
          <div className="melonStyleContainerFruit">
            <MovieList movieFormVisible={movieFormVisible}></MovieList>
          </div>
        </div>
      </div>
    </>
  );
};
