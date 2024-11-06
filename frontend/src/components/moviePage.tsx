import { MovieList } from "./movieList.tsx";
import { NewMovieForm } from "./newMovieForm.tsx";
import { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

export const MoviePage = () => {
  const [movieFormVisible, setMovieFormVisible] = useState<boolean>(false);

  return (
    <>
      <div className={"logoBar"}></div>
      <div className="pageContent">
        <div className="melonStyleContainer">
          <div className="melonStyleContainerPeel">
            <Button label={"Dodaj Film"} onClick={() => setMovieFormVisible(true)} />
            <Dialog visible={movieFormVisible} onHide={() => {if (!movieFormVisible) return; setMovieFormVisible(false)}}>
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
