import './App.css'
import "primereact/resources/themes/vela-green/theme.css";
import {NewMovieForm} from "./components/newMovieForm.tsx";
import {HomePage} from "./components/movieHomePage.tsx";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {NewMovieNightForm} from "./components/newMovieNightForm.tsx";


function App() {
    return (
        <>
            <Router>
                <div className={"background-img"}>
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/login" element={<h2>LOGIN HERE</h2>}/>
                        <Route path="/new-movie" element={<NewMovieForm/>}/>
                        <Route path="/new-movie-night" element={<NewMovieNightForm/>}/>
                    </Routes>
                </div>
            </Router>
        </>
    )
}

export default App;
