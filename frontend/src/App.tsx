import "./App.css";
import "primeflex/primeflex.css";
import "primereact/resources/themes/vela-green/theme.css";
import { HomePage } from "./pages/homePage.tsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/loginPage.tsx";
import { getAccessToken } from "./utils/accessToken.ts";
import { FC, lazy, ReactElement } from "react";
import { AccountPage } from "./pages/accountPage.tsx";
import {
  ACCOUNT,
  CALENDAR,
  HOMEPAGE,
  LOGIN,
  MOVIES,
  REGISTER,
} from "./constants/paths.ts";
import { CalendarPage } from "./pages/calendarPage.tsx";
import { MoviePage } from "./pages/moviePage.tsx";
import { RegisterPage } from "./pages/registerPage.tsx";
const MovieBackground = lazy(() => import("./components/movieBackground.tsx"));

const RequireAuth: FC<{ children: ReactElement }> = ({ children }) => {
  const userIsLogged = !!getAccessToken();

  if (!userIsLogged) {
    return <LoginPage />;
  }
  return children;
};
const App = () => {
  return (
    <>
      <Router>
        <MovieBackground />
        <div className={"appContainer"}>
          <Routes>
            <Route path={HOMEPAGE} element={<HomePage />} />
            <Route path={LOGIN} element={<LoginPage />} />
            <Route path={REGISTER} element={<RegisterPage />} />
            <Route
              path={ACCOUNT}
              element={
                <RequireAuth>
                  <AccountPage />
                </RequireAuth>
              }
            />
            <Route
              path={CALENDAR}
              element={
                <RequireAuth>
                  <CalendarPage />
                </RequireAuth>
              }
            />
            <Route
              path={MOVIES}
              element={
                <RequireAuth>
                  <MoviePage />
                </RequireAuth>
              }
            />
          </Routes>
        </div>
      </Router>
    </>
  );
};
export default App;
