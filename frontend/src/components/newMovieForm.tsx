import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import {Accordion, AccordionTab} from "primereact/accordion";
import {postMovie} from "../connections/internal/movie.ts";
import dayjs from 'dayjs'
import {InputNumber} from "primereact/inputnumber";
import {getUsername} from "../utils/accessToken.ts";
import {getMoviePosterUrl} from "../connections/external/omdb.ts";
import {useState} from "react";

export const NewMovieForm = () => {
  const [movieTitle, setMovieTitle] = useState<string>("");
  const [movieLink, setMovieLink] = useState<string>("")
  const [movieGenre, setMovieGenre] = useState<string>("")
  const [movieCoverLink, setMovieCoverLink] = useState<string>("")
  const [movieDuration, setMovieDuration] = useState<number>(0)
  const [posterUrls, setPosterUrls] = useState<string[]>([]);

  const handleMoviePoster = () => {
    const moviePosterUrls: string[] = [];
    getMoviePosterUrl(movieTitle).then((poster) => {
      if (poster) {
        const posterData = poster['Search']
        if (posterData.length > 4) {
          for (let i = 0; i < 5; i++) {
            moviePosterUrls.push(posterData[i]["Poster"]);
          }
        } else {
          for (const poster of posterData) {
            moviePosterUrls.push(poster["Poster"]);
          }
        }
        setPosterUrls(moviePosterUrls);
      }})

  }

  const ShowPosters = () => {
    if (posterUrls.length !== 0) {
      return (
          posterUrls.map(url =>
              <>
                <img className="melonStyleContainerPeel p-inputgroup flex-1" src={url}></img>
                <Button className="melonStyleContainerPeel" onClick={() => setMovieCoverLink(url)} type={"button"}>Wybierz okładkę</Button>
              </>
          )
      )
    }

  }

  return (
      <Accordion className={"addMovies"} activeIndex={1}>
        <AccordionTab className="melonStyleContainerPeel textSansNoBorder" header={'Dodaj Film'}>
          <form onSubmit={(e) => {
            e.preventDefault();
            postMovie(movieTitle, movieLink, getUsername(), dayjs().format('YYYY-MM-DD HH:mm'), movieGenre, movieCoverLink, movieDuration);
          }} id="new_movie_form" name="new_movie_form">

            <div className="melonStyleContainerPeel p-inputgroup flex-1">
              <span className="melonStyleContainerPeel p-inputgroup-addon">Tytuł</span>
              <InputText className="melonStyleContainerPeel" placeholder="eg. Superzioło" name={'title'} onChange={(e) => setMovieTitle(e.target.value)} />
            </div>
            <div className="melonStyleContainerPeel p-inputgroup flex-1">
              <span className="melonStyleContainerPeel p-inputgroup-addon">Gatunek</span>
              <InputText className="melonStyleContainerPeel" placeholder="eg. komedia" name={'genre'} onChange={(e) => setMovieGenre(e.target.value)}/>
            </div>
            <div className="melonStyleContainerPeel p-inputgroup flex-1">
              <span className="melonStyleContainerPeel p-inputgroup-addon">Czas trwania</span>
              <InputNumber className="melonStyleContainerPeel" placeholder="w minutach" name={'duration'} onChange={(e) => setMovieDuration(e.value as number)}/>
            </div>
            <div className="melonStyleContainerPeel p-inputgroup flex-1">
              <span className="melonStyleContainerPeel p-inputgroup-addon">Link do filmu</span>
              <InputText className="melonStyleContainerPeel" placeholder="eg. cda.pl/..." name={'link'} onChange={(e) => setMovieLink(e.target.value)}/>
            </div>
            <div className="melonStyleContainerPeel p-inputgroup flex-1">
              <span className="melonStyleContainerPeel p-inputgroup-addon">Link do okładki</span>
              <InputText className="melonStyleContainerPeel" placeholder="eg. google.com/..." name={'cover_link'} value={movieCoverLink} disabled/>
            </div>
            <div>
              {ShowPosters()}
            </div>
            <Button className="melonStyleContainerPeel" label="Wczytaj okładkę" icon="pi pi-check" onClick={handleMoviePoster} type={"button"}></Button>
            <Button className="melonStyleContainerPeel" label="Dodaj Film" icon="pi pi-check" type={"submit"}/>
          </form>
        </AccordionTab>
      </Accordion>
  )
}

