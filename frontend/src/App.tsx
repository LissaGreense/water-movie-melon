import './App.css'
import {PrimeReactProvider} from "primereact/api";
import "primereact/resources/themes/vela-green/theme.css";
import {Accordion, AccordionTab} from "primereact/accordion";
import {Chip} from "primereact/chip";
import {Avatar} from "primereact/avatar";
import {getMovies} from "./connections/movie.ts";
import {useEffect, useState} from "react";
import {Movie} from "./types/movie.ts";


function App() {
function getMovieTabs() {

    const [movies, setMovies] = useState<Movie[]>([]);

    useEffect(() => {
        getMovies()
            .then((moviesData) => {
                setMovies(moviesData);
            })
            .catch((error) => {
                console.error('Error fetching movies:', error);
            });
    }, []);
    return (
        <>
            {movies.map((movie) => (
                <AccordionTab header={movie.title}>
                    <div className={"userRow"}>
                        <Avatar label="u" size="xlarge" shape="circle" />
                        <span>{movie.user}</span>
                        <span>{movie.date_added}</span>
                    </div>
                    <p>
                        <a href={movie.link}>link</a>
                    </p>
                    <div>
                        <Chip label={movie.genre} />
                    </div>
                </AccordionTab>
            ))
            }
        </>
    )
}

  return (
    <>
        <PrimeReactProvider>
            <Accordion className={"classExample"} activeIndex={0}>
                {getMovieTabs()}
            </Accordion>
        </PrimeReactProvider>
    </>
  )
}

export default App
