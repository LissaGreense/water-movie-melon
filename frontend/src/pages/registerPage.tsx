import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import {
  getRegisterQuestion,
  register,
} from "../connections/internal/authentication.ts";
import { Question } from "../types/internal/authentication.ts";
import { LOGIN } from "../constants/paths.ts";
import { useNavigate } from "react-router-dom";
import "./registerPage.css";
import axios from "axios";

const TOO_MANY_ATTEMPTS_ERROR_MSG =
  "Wykorzystałeś swoje trzy próby logowania. Spróbuj ponownie jutro! Może jutrzejsze arbuzowe pytanie będzie łatwiejsze ;)";
const USER_ALREADY_EXISTS_ERROR_MSG =
  "Użytkownik o takiej nazwie już istnieje!";
const WRONG_ANSWER_ERROR_MSG =
  "Nie znasz odpowiedzi na dzisiejsze arbuzowe pytanie? ;)";
const ANSWER_NOT_PROVIDED_ERROR_MSG = "Musisz podać odpowiedź!";
const REGISTRATION_FAILED_ERROR_MSG =
  "Nie udało się zarejestrować! skontaktuj się z administracją.";
const WEAK_PASSWORD_MSG =
  "Imperator Cię zhackuje w ciągu tygodnia z takim hasłem";
const MEDIUM_PASSWORD_MSG =
  "Imperator Cię zhackuje w ciągu roku z takim hasłem";
const STRONG_PASSWORD_MSG = "Imperator Cię nie zhackuje, gratuluję!";
export const RegisterPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");

  useEffect(() => {
    getRegisterQuestion()
      .then((r: Question) => {
        setCurrentQuestion(r.question);
      })
      .catch((error) => {
        console.error(error.toString());
      });
  }, []);

  function handleRegister() {
    function handleErrorResponse(error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorStatus = error.response?.status;

        if (errorStatus === 403) {
          alert(TOO_MANY_ATTEMPTS_ERROR_MSG);
          return;
        }

        const errorMsg = error.response?.data?.error;

        if (errorStatus === 400) {
          if (errorMsg === "USER ALREADY EXISTS") {
            alert(USER_ALREADY_EXISTS_ERROR_MSG);
          } else if (errorMsg === "BAD ANSWER") {
            alert(WRONG_ANSWER_ERROR_MSG);
          } else if (errorMsg === "ANSWER NOT PROVIDED") {
            alert(ANSWER_NOT_PROVIDED_ERROR_MSG);
          }
        } else {
          alert(REGISTRATION_FAILED_ERROR_MSG);
        }
      } else {
        alert(REGISTRATION_FAILED_ERROR_MSG);
      }
    }

    register(username, password, answer)
      .then((r) => {
        if (r && "result" in r && r["result"] === "OK") {
          alert("Zostałeś filmowym arbuzem! Yey!");
          navigate(LOGIN);
        }
      })
      .catch((error) => {
        handleErrorResponse(error);
      });
  }

  const handleSubmitEvent = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (username == "") {
      alert("Username should be filled!");
    } else if (password == "") {
      alert("Password should be filled!");
    } else if (currentQuestion && answer == "") {
      alert("Question should be filled!");
    } else {
      handleRegister();
    }
  };

  return (
    <div
      className={"registerContainer centerAbsolute melonStyleContainerFruit"}
    >
      <div className={"topRegisterBar melonStyleContainerPeel"}>
        <h2>DOŁĄCZ DO ARBUZOWEJ RODZINY</h2>
      </div>
      <form>
        <div className="mt-2">
          <InputText
            name={"username"}
            type="text"
            placeholder="Username"
            className="m-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <Password
            name={"password"}
            type="password"
            placeholder="Password"
            className="m-2"
            weakLabel={WEAK_PASSWORD_MSG}
            mediumLabel={MEDIUM_PASSWORD_MSG}
            strongLabel={STRONG_PASSWORD_MSG}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {currentQuestion && (
          <div>
            <p>
              <b>{currentQuestion}</b>
            </p>
            <InputText
              name={"odpowiedź"}
              type="text"
              value={answer}
              placeholder="Zioło to, zioło tamo"
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>
        )}
        <div>
          <Button
            label="Zarbujestruj"
            className="m-2"
            onClick={(event) => handleSubmitEvent(event)}
          />
        </div>
      </form>
    </div>
  );
};
