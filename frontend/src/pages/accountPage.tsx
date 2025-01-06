import "./accountPage.css";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { clearUser, getUsername } from "../utils/accessToken.ts";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "../constants/paths.ts";
import { getAvatar, getStatistics } from "../connections/internal/user.ts";
import React, { useEffect, useState } from "react";
import { FileUpload } from "primereact/fileupload";
import { Statistics } from "../types/internal/user.ts";
import { CropperDialog } from "../components/cropperDialog.tsx";
import { PasswordChangeDialog } from "../components/passwordChangeDialog.tsx";
import { logout } from "../connections/internal/authentication.ts";

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
    logout()
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        clearUser();
        navigate(LOGIN);
      });
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
      setShowCropper(true);
    }
  };

  const handleImageValidationError = (file: File) => {
    if (file.size > 1000000) {
      alert("Obrazek waży tyle co stara pepe! Wybierz coś lżejszego...");
    } else {
      console.error("Error validating image...");
    }
    setShowCropper(false);
  };

  useEffect(() => {
    getAvatar(getUsername() as string)
      .then((r) => {
        if (r.avatar_url == "") {
          alert("Error fetching avatar...");
        }
        setAvatar(backend_url + r.avatar_url);
      })
      .catch((error) => {
        if (error.response.status === 403) {
          clearUser();
          navigate(LOGIN);
        } else {
          alert("Error fetching statistics...");
        }
      });
  }, [showCropper]);

  useEffect(() => {
    getStatistics(getUsername() as string)
      .then(async (r) => {
        if (r === null) {
          alert("Error fetching statistics...");
        } else {
          setUserStatistics(await r);
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          clearUser();
          navigate(LOGIN);
        } else {
          alert("Error fetching statistics...");
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
        <div className={"topAccountContainerBar melonStyleContainerPeel"}>
          <h2>KONTO</h2>
        </div>
        <div className={"userSummary"}>
          <div className={"half-left"}>
            <div className={"avatar-space"}>
              <Image src={avatar} height={"150rem"} />
              <FileUpload
                mode="basic"
                name="avatar"
                accept="image/*"
                maxFileSize={1000000}
                onValidationFail={handleImageValidationError}
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
        <div className={"statistics grid align-items-center"}>
          <div className="col-4">
            <h4>DODANE FILMY:</h4>
          </div>
          <div className="col-2">
            <h4 className="rectangle-border">
              {" "}
              {userStatistics?.added_movies}
            </h4>
          </div>
          <div className="col-4">
            <h4>FILMY Z OCENĄ 7:</h4>
          </div>
          <div className="col-2">
            <h4 className="rectangle-border">
              {userStatistics?.seven_rated_movies}
            </h4>
          </div>
          <div className="col-4">
            <h4>OBEJRZANE FILMY: </h4>
          </div>
          <div className="col-2">
            <h4 className="rectangle-border">
              {" "}
              {userStatistics?.watched_movies}
            </h4>
          </div>
          <div className="col-4">
            <h4>HOSTOWANE WIECZORY:</h4>
          </div>
          <div className="col-2">
            <h4 className="rectangle-border">
              {userStatistics?.hosted_movie_nights}
            </h4>
          </div>
          <h4 className="col-12">NAJWYŻEJ OCENIANY FILM</h4>
          <div className="col-6 col-offset-3">
            <h4 className="rectangle-border">
              {userStatistics?.highest_rated_movie
                ? userStatistics.highest_rated_movie
                : "Brak danych"}
            </h4>
          </div>
          <h4 className="col-12">NAJNIŻEJ OCENIANY FILM</h4>
          <div className="col-6 col-offset-3">
            <h4 className="rectangle-border">
              {userStatistics?.lowest_rated_movie
                ? userStatistics.lowest_rated_movie
                : "Brak danych"}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};
