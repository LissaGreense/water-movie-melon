import './App.css'
import {PrimeReactProvider} from "primereact/api";
import "primereact/resources/themes/vela-green/theme.css";
import {Accordion} from "primereact/accordion";
import {getMovieTabs} from "./components/movieAccordion.tsx";
import {getMovieForm} from "./components/movieFormAdd.tsx";


function App() {
  return (
    <>
        <PrimeReactProvider>
            <Accordion className={"showMovies"} activeIndex={0}>
                {getMovieTabs()}
            </Accordion>
            <Accordion className={"addMovies"} activeIndex={1}>
                {getMovieForm()}
            </Accordion>
        </PrimeReactProvider>
    </>
  )
}

export default App
