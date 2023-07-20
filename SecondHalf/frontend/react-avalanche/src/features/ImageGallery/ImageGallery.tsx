import React, { useState } from "react";

import "./ImageGallery.css";

import data from "./image_data.json";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

//SVG
import arrowleft from "../../assets/svg/angle-right.svg";
import arrowright from "../../assets/svg/angle-rleft.svg";
import cross from "../../assets/svg/close.svg";

//IMAGES
import Bild1 from "../../assets/public/gallery/chris-lutke-VMJGmTuRVFs-unsplash.jpg";
import Bild2 from "../../assets/public/gallery/hisham-hanif-dj9sEO1IwM0-unsplash.jpg";
import Bild3 from "../../assets/public/gallery/ines-alvarez-fdez-Yi3PX12Jbv8-unsplash.jpg";
import Bild4 from "../../assets/public/gallery/joshua-sukoff-4l_L0aFiJOc-unsplash.jpg";
import Bild5 from "../../assets/public/gallery/markus-spiske-fH5VEmsewO0-unsplash.jpg";
import Bild6 from "../../assets/public/gallery/max-lawton-ZJSe0tL8ZWk-unsplash.jpg";
import Bild7 from "../../assets/public/gallery/philipp-kammerer-1FJZBOthB8k-unsplash.jpg";
import Bild8 from "../../assets/public/gallery/sam-arnold-lQoC90sqn8s-unsplash.jpg";

const images = [Bild1, Bild2, Bild3, Bild4, Bild5, Bild6, Bild7, Bild8];
const SVGComponent1 = () => {
  return (
    <img
      //className="photo"
      src={arrowleft}
      style={{ backgroundColor: "#282828", borderRadius: "50%" }}
      //width={250}
      //height={250}
      alt="work"
    />
  );
};

const ImageGallery = () => {
  const [data, setData] = useState({ img: "", i: 0 });

  const viewImage = (img: string, i: number) => {
    setData({ img, i });
  };

  const imgAction = (action: string | undefined) => {
    let i = data.i;
    if (action === "next-img") {
      setData({ img: images[i + 1], i: i + 1 });
    }
    if (action === "previous-img") {
      setData({ img: images[i - 1], i: i - 1 });
    }
    if (action === "close") {
      setData({ img: "", i: 0 });
    }
  };

  return (
    <>
      {data.img && (
        <div
          className="background-imagescreen"
          style={{
            width: "100%",
            height: "100vh",
            background: "black",
            position: "fixed",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <button
            className="button-style2"
            onClick={() => imgAction("close")}
            style={{ position: "absolute", top: "10px", right: "10px" }}
          >
            <img src={cross} width="100" alt="folder" />
          </button>
          <div></div>
          <button
            className="button-style"
            onClick={() => imgAction("previous-img")}
            style={{ display: "flex", flexDirection: "column", border: "none" }}
          >
            <img src={arrowleft} width="100" alt="folder" />
          </button>
          <img
            src={data.img}
            style={{ width: "auto", maxWidth: "90%", maxHeight: "90%" }}
          />
          <button
            className="button-style"
            onClick={() => imgAction("next-img")}
            style={{ display: "flex", flexDirection: "column", border: "none" }}
          >
            {" "}
            <img src={arrowright} width="100" alt="folder" />
          </button>
        </div>
      )}
      <div style={{ padding: "10px" }} className="color-div">
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
          className="background-page"
        >
          <Masonry gutter="20px">
            {images.map((image, i) => (
              <img
                key={i}
                src={image}
                style={{ width: "100%", display: "block", cursor: "pointer" }}
                alt=""
                onClick={() => viewImage(image, i)}
              />
            ))}
          </Masonry>
        </ResponsiveMasonry>
      </div>
    </>
  );
};

export default ImageGallery;
