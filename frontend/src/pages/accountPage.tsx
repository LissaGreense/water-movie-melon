import "./accountPage.css";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { clearAccessToken, getUsername } from "../utils/accessToken.ts";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "../constants/paths.ts";
import { getAvatar, getStatistics } from "../connections/internal/user.ts";
import React, { useEffect, useState } from "react";
import { FileUpload } from "primereact/fileupload";
import { Statistics } from "../types/internal/user.ts";
import { CropperDialog } from "../components/cropperDialog.tsx";
import { PasswordChangeDialog } from "../components/passwordChangeDialog.tsx";

export const AccountPage = () => {
  const navigate = useNavigate();
  const backend_url = "http://localhost:8000";
  const [avatar, setAvatar] = useState<string>("");
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [showPasswordChange, setShowPasswordChange] = useState<boolean>(false);
  const [currentImage, setCurrentImage] = useState<
    string | ArrayBuffer | null
  >();
  const [userStatistics, setUserStatistics] = useState<Statistics | null>(null);

  const handleLogoutEvent = (e: React.MouseEvent) => {
    e.preventDefault();
    clearAccessToken();
    navigate(LOGIN);
  };
  const handleAvatarChangeError = () => {
    alert("Cos poszło nie tak kiedy dodawałeś swoją arbuzową fotę!");
  };

  const handleCropImage = (e: { files: File[] }) => {
    const file = e.files.pop();
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setCurrentImage(reader.result);
      };
    }
    setShowCropper(true);
  };

  useEffect(() => {
    getAvatar(getUsername() as string).then((r) => {
      if (r.avatar_url == "") {
        alert("Error fetching avatar...");
      }
      setAvatar(backend_url + r.avatar_url);
    });
  }, [showCropper]);

  useEffect(() => {
    getStatistics(getUsername() as string).then(async (r) => {
      if (r === null) {
        alert("Error fetching statistics...");
      } else {
        setUserStatistics(await r);
      }
    });
  }, []);

  return (
    <div className={"pageContent center"}>
      <CropperDialog
        visible={showCropper}
        setShowCropper={setShowCropper}
        image={currentImage}
      />
      <PasswordChangeDialog
        visible={showPasswordChange}
        setVisible={setShowPasswordChange}
      />
      <div className={"accountContainer"}>
        <div className={"watermelonPeel"}>
          <h2>KONTO</h2>
        </div>
        <div className={"userSummary"}>
          <div className={"half-left"}>
            <div className={"avatar-space"}>
              <Image src={avatar} height={"150px"} />
              <FileUpload
                mode="basic"
                name="avatar"
                accept="image/*"
                maxFileSize={1000000}
                auto
                chooseLabel="ZMIEŃ AVATAR"
                onError={handleAvatarChangeError}
                customUpload={true}
                onSelect={handleCropImage}
              />
            </div>
            <h4>ID: {getUsername()}</h4>
          </div>
          <div className={"half-right"}>
            <Button onClick={() => setShowPasswordChange(true)}>
              ZMIEŃ HASŁO
            </Button>
            <Button onClick={(e) => handleLogoutEvent(e)}>WYLOGUJ</Button>
          </div>
        </div>
        <div className={"statistics"}>
          <h3>DODANE FILMY: {userStatistics?.added_movies}</h3>
          <h3>FILMY Z OCENĄ 7: {userStatistics?.seven_rated_movies}</h3>
          <h3>OBEJRZANE FILMY: {userStatistics?.watched_movies}</h3>
          <h3>HOSTOWANE WIECZORY: {userStatistics?.hosted_movie_nights}</h3>
          <h3>
            NAJWYŻEJ OCENIANY FILM:{" "}
            {userStatistics?.highest_rated_movie
              ? userStatistics.highest_rated_movie
              : "Brak danych"}
          </h3>
          <h3>
            NAJNIŻEJ OCENIANY FILM:{" "}
            {userStatistics?.lowest_rated_movie
              ? userStatistics.lowest_rated_movie
              : "Brak danych"}
          </h3>
        </div>
      </div>
    </div>
  );
};
