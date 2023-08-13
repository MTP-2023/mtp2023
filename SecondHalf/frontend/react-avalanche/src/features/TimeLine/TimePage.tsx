import "./TimePage.css";

import timelineElements from "./TimeLineElements";
import SkiisSvg from "../../assets/svg/snow-flake-com.svg";
import background3 from "../../assets/public/gallery/Mountains-clean.jpg";

import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";

import "react-vertical-timeline-component/style.min.css";

const SVGComponent = () => {
  return (
    <img
      src={SkiisSvg}
      style={{ backgroundColor: "#282828", borderRadius: "50%" }}
      alt="work"
    />
  );
};

const TimePage = () => {
  return (
    <div
      className="background_timeline"
      style={{
        backgroundImage: `url(${background3})`,
        backgroundSize: "cover",
      }}
    >
      <h1 className="title">Timeline</h1>
      <VerticalTimeline>
        {timelineElements.map((element) => {
          return (
            <VerticalTimelineElement
              className="date"
              //key={"hi"}
              date={element.date}
              //dateClassName="date"
              icon={<SVGComponent />}
            >
              <h3 className="vertical-timeline-element-title">
                {element.title}
              </h3>
              <h5 className="vertical-timeline-element-subtitle">
                {element.location}
              </h5>
              <p id="description">{element.description}</p>
            </VerticalTimelineElement>
          );
        })}
      </VerticalTimeline>
    </div>
  );
};

export default TimePage;

