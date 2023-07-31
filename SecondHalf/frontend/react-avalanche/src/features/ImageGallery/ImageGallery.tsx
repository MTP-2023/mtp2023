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

// BILDER VON UNS
import Bilda from "../../assets/public/gallery/us/0AA3C7A9-4B8F-467B-99E2-0C531406BA6C_1_105_c.jpeg";
import Bildb from "../../assets/public/gallery/us/1034F56B-4317-4DA0-8C7A-BE15B359A5B4_1_105_c.jpeg";
import Bildc from "../../assets/public/gallery/us/22C86FEE-7ABA-4EE2-9A10-6364B5B2A43D_1_105_c.jpeg";
import Bildd from "../../assets/public/gallery/us/2BDA7C45-D86A-45B1-AAEE-678BE06CA99B_1_105_c.jpeg";
import Bilde from "../../assets/public/gallery/us/32055BF2-1C54-42A2-8E1D-19D4F2C95B8F_1_105_c.jpeg";
import Bildf from "../../assets/public/gallery/us/36302D1B-461F-48C7-9EFF-807AB2A1131D_1_105_c.jpeg";
import Bildg from "../../assets/public/gallery/us/39C82CF4-B081-4B57-947E-CB22934EB98A_1_105_c.jpeg";
import Bildh from "../../assets/public/gallery/us/4386496C-B27E-4357-9008-6359E71AAE1D_1_105_c.jpeg";
import Bildi from "../../assets/public/gallery/us/4E47A513-CBDD-4C2F-9B38-DBFE7011E7FA_1_105_c.jpeg";
import Bildj from "../../assets/public/gallery/us/5C0E646A-FDF4-4CCC-B0CA-F35E0FE5951E_1_105_c.jpeg";
import Bildk from "../../assets/public/gallery/us/6E22436D-4341-4AFE-879F-7CF86EC000F8_1_105_c.jpeg";
import test1 from "../../assets/public/gallery/us/2E7E62ED-FE4E-45E9-9BA1-1B72E823E972_1_105_c.jpeg";
import test2 from "../../assets/public/gallery/us/4E47A513-CBDD-4C2F-9B38-DBFE7011E7FA_1_105_c.jpeg";
import test3 from "../../assets/public/gallery/us/5C0E646A-FDF4-4CCC-B0CA-F35E0FE5951E_1_105_c.jpeg";
import test4 from "../../assets/public/gallery/us/7B705220-928F-47E8-B6DD-8A92719E6D4D_1_105_c.jpeg";
import test5 from "../../assets/public/gallery/us/89E55D42-0187-40A3-9F63-CA56334D17F8_1_105_c.jpeg";
import test6 from "../../assets/public/gallery/us/98D1B355-ADA2-4EE3-A9EF-9B164F3DF031_1_105_c.jpeg";
import test7 from "../../assets/public/gallery/us/1034F56B-4317-4DA0-8C7A-BE15B359A5B4_1_105_c.jpeg";
import test8 from "../../assets/public/gallery/us/8531B092-75E7-44BD-8542-519BA2D6964B_1_105_c.jpeg";
import test9 from "../../assets/public/gallery/us/A4E03A1E-38DD-4476-8A8C-78CCCC138091_1_105_c.jpeg";
import test10 from "../../assets/public/gallery/us/A177B506-6EFB-41A1-87C7-B48EA1B97AB3_1_105_c.jpeg";
import test11 from "../../assets/public/gallery/us/AFD9FC02-52F1-4897-ABB4-CF42F77BC596_1_105_c.jpeg";
import test12 from "../../assets/public/gallery/us/B2D9E1E1-1837-4631-BF60-12F4D6E14635_1_105_c.jpeg";
import test13 from "../../assets/public/gallery/us/BB3F0A60-99AC-49D8-9C6A-680F1353BCA9_1_105_c.jpeg";
import test14 from "../../assets/public/gallery/us/D7BB7B2E-0686-4970-A9F4-E463A2DC27CE_1_105_c.jpeg";
import test15 from "../../assets/public/gallery/us/FE1AB5A2-AAAA-4164-8F35-A1B678F8AA09_1_105_c.jpeg";
import test16 from "../../assets/public/gallery/us/IMG_7246.jpg";
import test17 from "../../assets/public/gallery/us/IMG_7248.jpg";

//----------------------------------------------------------------------------------------------------
const images = [
  Bilda,
  Bild6,
  Bild7,
  test16,
  test17,
  Bildb,
  test1,
  test2,
  test3,
  Bildc,
  Bild8,
  Bildd,
  Bild9,
  test4,
  test5,
  test6,
  Bilde,
  Bild10,
  Bild18,
  Bild15,
  Bild1,
  Bildf,
  test10,
  test11,
  test12,
  test13,
  test14,
  Bild2,
  Bild3,
  Bildg,
  test15,
  Bild4,
  Bildh,
  Bild5,
  Bild10,
  Bild11,
  Bildj,
  Bildi,
  Bild12,
  Bild13,
  Bildk,
  test7,
  test8,
  test9,
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
