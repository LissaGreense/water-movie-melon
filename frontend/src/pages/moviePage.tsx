import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { MovieList } from "../components/movieList.tsx";
import { NewMovieForm } from "../components/newMovieForm.tsx";
import "./moviePage.css";
import { getStatistics } from "../connections/internal/user.ts";
import { getUsername } from "../utils/accessToken.ts";

export const MoviePage = () => {
  const [movieFormVisible, setMovieFormVisible] = useState<boolean>(false);
  const [userHasTickets, setUserHasTickets] = useState<boolean>(false);

  useEffect(() => {
    getStatistics(getUsername() as string).then(async (r) => {
      if (r === null) {
        alert("Error fetching user data...");
      } else {
        if (r.movie_tickets > 0) {
          setUserHasTickets(true);
        } else {
          setUserHasTickets(false);
        }
      }
    });
  }, [movieFormVisible]);

  return (
    <>
      <div className={"logoBar"}></div>
      <div className="pageContent">
        <div className="moviesContainer">
          <div className="melonStyleContainerPeel">
            <Button
              label={
                userHasTickets
                  ? "Dodaj Film"
                  : "Nie masz wystarczająco biletów aby dodać film. Załóż nowy wieczór filmowy, bądź dołącz do istniejącego"
              }
              disabled={!userHasTickets}
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
