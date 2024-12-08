import backgroundImage from "../assets/backgroundimage.png";
import "./movieBackground.css";

export default function MovieBackground() {
  return (
    <>
      <div className={"background-container"}>
        <img
          className={"background-img"}
          src={backgroundImage}
          alt="background"
        />
      </div>
    </>
  );
}
