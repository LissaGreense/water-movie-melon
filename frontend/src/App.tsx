import './App.css'
import "primereact/resources/themes/vela-green/theme.css";
import {NewMovieForm} from "./components/newMovieForm.tsx";
import {HomePage} from "./components/movieHomePage.tsx";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {NewMovieNightForm} from "./components/newMovieNightForm.tsx";
import {LoginPage} from "./pages/loginPage.tsx";
import {getAccessToken} from "./utils/accessToken.ts";
import {FC, ReactElement} from "react";
import {ACCOUNT, HOMEPAGE, LOGIN, NEW_MOVIE, NEW_MOVIE_NIGHT} from "./constants/paths.ts";
import {AccountPage} from "./pages/accountPage.tsx";


const RequireAuth: FC<{ children: ReactElement }> = ({children}) => {
    const userIsLogged = !!getAccessToken();

    if (!userIsLogged) {
        return <LoginPage/>;
    }
    return children;
};
const App = () => {
    return (
        <>
            <Router>
                <div className={"background-img"}>
                    <Routes>
                        <Route path={HOMEPAGE} element={<HomePage/>}/>
                        <Route path={LOGIN} element={<LoginPage/>}/>
                        <Route path={NEW_MOVIE} element={<RequireAuth><NewMovieForm/></RequireAuth>}/>
                        <Route path={NEW_MOVIE_NIGHT}
                               element={<RequireAuth><NewMovieNightForm/></RequireAuth>}/>
                        <Route path={ACCOUNT} element={<RequireAuth><AccountPage/></RequireAuth>}/>
                    </Routes>
                </div>
            </Router>
        </>
    )
}
export default App;
