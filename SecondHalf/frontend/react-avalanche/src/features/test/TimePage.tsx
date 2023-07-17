import React from "react";
import timelineElements from "../test/TimeLineElements";
import WorkSvg from "../../assets/svg/work.svg";
import SchoolSvg from "../../assets/svg/school.svg";

import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";

import "react-vertical-timeline-component/style.min.css";

const SVGComponent = () => {
  return <img src={WorkSvg} alt="work" />;
};

const TimePage = () => {
  return (
    <div>
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
              key={"hi"}
              date={element.date}
              dateClassName="date"
              icon={<SVGComponent />}
            >
              <h3 className="vertical-timeline-element-title">
                {element.title}
              </h3>
              <h5 className="vertical-timeline-element-subtitle">
                {element.location}
              </h5>
              <p id="description">{element.description}</p>
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
