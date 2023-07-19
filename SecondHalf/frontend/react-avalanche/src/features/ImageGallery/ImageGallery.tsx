import React from "react";

import data from "./image_data.json";

function ImageGallery() {
  return (
    <div className="wrapper">
      {data.data.map((item, index) => (
        <div key={index} className="wrapper-images">
          <img src={`$item.link`} alt={item.text} />
          <h2>{item.text}</h2>
        </div>
      ))}
      ImageGallery
    </div>
  );
}

export default ImageGallery;
