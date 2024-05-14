import './accountPage.css'
import {Button} from "primereact/button";
import {Image} from 'primereact/image';
import {clearAccessToken, getUsername} from "../utils/accessToken.ts";
import {useNavigate} from "react-router-dom";
import {LOGIN} from "../constants/paths.ts";
import {getAvatar} from "../connections/internal/user.ts";
import {useEffect, useState} from "react";

export const AccountPage = () => {
    const navigate = useNavigate();
    const backend_url = 'http://localhost:8000';
    const [avatar, setAvatar] = useState<string>('');
    const handleLogoutEvent = (e) => {
        e.preventDefault();
        clearAccessToken();
        navigate(LOGIN);
    };

    useEffect(() => {
        getAvatar(getUsername() as string).then((r) => {
                if (r.avatar_url == '') {
                    alert("Error fetching avatar...")
                }
                setAvatar(backend_url + r.avatar_url);
                console.log(r.avatar_url)
            }
        )
    }, [])
    return (
        <div className={'pageContent center'}>
            <div className={'accountContainer'}>
                <div className={'watermelonPeel'}>
                    <h2>
                        KONTO
                    </h2>
                </div>
                <div className={'userSummary'}>
                    <div className={'half-left'}>
                        <div className={'avatar-space'}>
                            <Image src={avatar} height="150"/>
                            <Button>ZMIEŃ AVATAR</Button>
                        </div>
                        <h4>ID: {getUsername()}</h4>
                    </div>
                    <div className={'half-right'}>
                        <Button>ZMIEŃ HASŁO</Button>
                        <Button onClick={(e) => handleLogoutEvent(e)}>WYLOGUJ</Button>
                    </div>
                </div>
                <div className={'statistics'}>
                    <h3>DODANE FILMY: </h3>
                    <h3>FILMY Z OCENĄ 7: </h3>
                    <h3>OBEJRZANE FILMY: </h3>
                    <h3>HOSTOWANE WIECZORY: </h3>
                    <h3>NAJWYŻEJ OCENIANY FILM: </h3>
                    <h3>NAJNIŻEJ OCENIANY FILM: </h3>
                </div>
            </div>
        </div>
    )
}