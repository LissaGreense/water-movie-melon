import {InputText} from "primereact/inputtext";
import {Password} from "primereact/password";
import {useEffect, useState} from "react";
import {Button} from "primereact/button";
import {getRegisterQuestion, register} from "../connections/internal/authentication.ts";
import {Question} from "../types/internal/authentication.ts";
import {LOGIN} from "../constants/paths.ts";
import {useNavigate} from "react-router-dom";

const TOO_MANY_ATTEMPTS_ERROR_MSG = "Wykorzystałeś swoje trzy próby logowania. Spróbuj ponownie jutro! Może jutrzejsze arbuzowe pytanie będzie łatwiejsze ;)";
const USER_ALREADY_EXISTS_ERROR_MSG = "Użytkownik o takiej nazwie już istnieje!";
const WRONG_ANSWER_ERROR_MSG = "Nie znasz odpowiedzi na dzisiejsze arbuzowe pytanie? ;)";
const REGISTRATION_FAILED_ERROR_MSG = "Nie udało się zarejestrować! skontaktuj się z administracją.";
export const RegisterPage = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [answer, setAnswer] = useState<string>('');
    const [currenQuestion, setCurrenQuestion] = useState<string>('');

    useEffect(() => {
        getRegisterQuestion().then((r: Question) => {
                setCurrenQuestion(r.question);
            }
        )
    }, [])

    function handleRegister() {
        function handleErrorResponse(r) {
            const errorStatus = r["response"]["status"];

            if (errorStatus === 403) {
                alert(TOO_MANY_ATTEMPTS_ERROR_MSG);
            } else if (errorStatus === 400) {
                const errorMsg = r["response"]["data"]["error"]

                if (errorMsg === "USER ALREADY EXISTS") {
                    alert(USER_ALREADY_EXISTS_ERROR_MSG);
                } else if (errorMsg === "BAD ANSWER") {
                    alert(WRONG_ANSWER_ERROR_MSG);
                }
            } else {
                alert(REGISTRATION_FAILED_ERROR_MSG);
            }
        }

        register(username, password, answer).then((r) => {
            if (r && "result" in r && r["result"] === "OK") {
                alert("Zostałeś filmowym arbuzem! Yey!");
                navigate(LOGIN);
            } else {
                handleErrorResponse(r);
            }
        });
    }

    const handleSubmitEvent = (event: any) => {
        event.preventDefault();
        if (username == "") {
            alert("Username should be filled!");
        } else if (password == ""){
            alert("Password should be filled!")
        } else if (answer == "") {
            alert("Question should be filled!");
        } else {
            handleRegister();
        }
    };

    return (
        <div className={'pageContent center'}>
            <form>
                <div>
                    <p>Nazwa użytkownika:</p>
                    <InputText name={"username"} type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}/>
                </div>
                <div>
                    <p>Hasło:</p>
                    <Password name={"password"} type="password" placeholder="Password"
                              weakLabel="Julian Cię zhackuje w ciągu tygodnia z takim hasłem"
                              mediumLabel="Julian Cię zhackuje w ciągu roku z takim hasłem"
                              strongLabel="Julian Cię nie zhackuje, gratuluję!"
                              value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <p>{currenQuestion}</p>
                    <InputText name={"odpowiedź"} type="text" value={answer} placeholder="Zioło to, zioło tamo" onChange={(e) => setAnswer(e.target.value)}/>
                </div>
                <div>
                    <Button label="Zarbujestruj" onClick={event => handleSubmitEvent(event)}/>
                </div>
            </form>
        </div>
    )
}