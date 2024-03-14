import './App.css'
import "primereact/resources/themes/vela-green/theme.css";
import {NewMovieForm} from "./components/newMovieForm.tsx";
import {HomePage} from "./components/movieHomePage.tsx";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";


function App() {
  return (
      <>
        <Router>
          <div>
            <Routes>
              <Route path="/" element={<HomePage/>}/>
              <Route path="/login" element={<h2>LOGIN HERE</h2>}/>
              <Route path="/new-movie" element={<NewMovieForm/>}/>
            </Routes>
          </div>
        </Router>
      </>
  )
}

export default App;
