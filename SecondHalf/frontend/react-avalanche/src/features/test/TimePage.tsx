import React from "react";
import "./TimePage.css";

import timelineElements from "../test/TimeLineElements";
import WorkSvg from "../../assets/aishowcase.png";
import SkiisSvg from "../../assets/svg/snow-flake-com.svg";
import SkiPng from "../../assets/ski-svgrepo-com.png";
import SchoolSvg from "../../assets/svg/school.svg";
import backgroundImage from "../../assets/Timeline_background.jpg";

import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";

import "react-vertical-timeline-component/style.min.css";

const SVGComponent = () => {
  return (
    <img
      //className="photo"
      src={SkiisSvg}
      style={{ backgroundColor: "#282828", borderRadius: "50%" }}
      //width={250}
      //height={250}
      alt="work"
    />
  );
};

const TimePage = () => {
  return (
    <div
      className="background_timeline"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
      }}
    >
      <h1 className="title">Timeline</h1>
      <VerticalTimeline>
        {timelineElements.map((element) => {
          let isWorkIcon = element.icon === "work";
          let showButton =
            element.buttonText !== undefined &&
            element.buttonText !== null &&
            element.buttonText !== "";

          return (
            <VerticalTimelineElement
              className="date"
              //key={"hi"}
              date={element.date} // Radu fragen: wie man das separieren könnte
              //dateClassName="date"
              icon={<SVGComponent />}
            >
              <h3 className="vertical-timeline-element-title">
                {element.title}
              </h3>
              <h5 className="vertical-timeline-element-subtitle">
                {element.location}
              </h5>
              <p id="description">{element.description} className=""</p>
            </VerticalTimelineElement>
          );
        })}
      </VerticalTimeline>
    </div>
  );
};

export default TimePage;

/*
const TimePage = () => {
  return <div>Test</div>;
};

export default TimePage;
*/

/*
              {showButton && (
                <a
                  className={`button ${
                    isWorkIcon ? "workButton" : "schoolButton"
                  }`}
                  href="/"
                >
                  {element.buttonText}
                </a>
              )}
              */
