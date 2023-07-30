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
import Bild9 from "../../assets/public/gallery/austrian-national-library-r4v18AhK8gw-unsplash.jpg";
import Bild10 from "../../assets/public/gallery/benjamin-szabo-QVN5ydW0k1k-unsplash.jpg";
import Bild11 from "../../assets/public/gallery/carl-raw-8Gdayy2Lhi0-unsplash.jpg";
import Bild12 from "../../assets/public/gallery/georgie-cobbs-SU35VU5de1o-unsplash.jpg";
import Bild13 from "../../assets/public/gallery/ian-dooley-aaAllJ6bmac-unsplash.jpg";
import Bild14 from "../../assets/public/gallery/johannes-waibel-WdBQHcIiSIw-unsplash.jpg";
import Bild15 from "../../assets/public/gallery/joshua-bartell-eeX7MYk3HcY-unsplash.jpg";
import Bild16 from "../../assets/public/gallery/mattias-olsson-nQz49efZEFs-unsplash.jpg";
import Bild17 from "../../assets/public/gallery/oliver-schwendener-9lcWCCRXiKU-unsplash.jpg";
import Bild18 from "../../assets/public/gallery/toby-otti-k6-usAW2aFw-unsplash.jpg";
import Bild19 from "../../assets/public/gallery/xenia-radchenko-ezEn4jYrVYQ-unsplash.jpg";

const images = [
  Bild6,
  Bild7,
  Bild8,
  Bild9,
  Bild10,
  Bild18,
  Bild15,
  Bild1,
  Bild2,
  Bild3,
  Bild4,
  Bild5,
  Bild10,
  Bild11,
  Bild12,
  Bild13,
  Bild14,
  Bild16,
  Bild17,
  Bild18,
  Bild19,
];
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
