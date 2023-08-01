import React from "react";
import "./PresentationScreen.css";
import { View, Image } from "react-native";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
//const Spacer = require("react-spacer");

import avalImg from "../../assets/avalanche-game.jpeg";

import present from "../../assets/present.jpeg";
import sandbox from "../../assets/sandbox.png";
import challenge from "../../assets/challenge.png";
import aishowcase from "../../assets/aishowcase.png";
import video from "../../assets/video/avalanche3.mp4";
import TestComponent from "../test/TimePage";
import backgroundImage from "../../assets/Timeline_background.jpg";
import mountains from "../../assets/public/gallery/mattias-olsson-nQz49efZEFs-unsplash.jpg";
import background2 from "../../assets/public/gallery/philipp-kammerer-1FJZBOthB8k-unsplash.jpg";

// user profiles
import andre from "../../assets/public/gallery/profiles/andre.png";
import rot from "../../assets/public/gallery/profiles/rot.png";
import theresa from "../../assets/public/gallery/profiles/theresa.png";
import thomas from "../../assets/public/gallery/profiles/thomas.png";
import { Padding } from "@mui/icons-material";

const itemData = [
  {
    img: andre,
    title: "CFO, Senior Server Specialist",
    author: "Andre Scheld",
  },
  {
    img: rot,
    title: "Executive Game Director",
    author: "Michael Temnov",
  },
  {
    img: theresa,
    title: "Chief Creative Director, Web Design",
    author: "Theresa Hartmann",
  },
  {
    img: thomas,
    title: "AI Specialist, Senior Skin Designer",
    author: "Thomas Nowak",
  },
];

const PresentationScreen = () => {
  return (
    <div className="presentation-container">
      <main>
        <section className="hero">
          <div className="hero__background">
            <video src={video} autoPlay loop muted></video>
          </div>
          <div className="hero__content">
            <h1>Master Team-Project</h1>
          </div>
        </section>
        <div className="sections">
          <section id="aboutAvalanche">
            <div className="section-content">
              <div className="column">
                <h2>Orginial Avalanche Game</h2>
                <p>
                  Avalanche is a strategic board game designed for tactical
                  thinking and engaging gameplay. The objective is to be the
                  last player with at least one marble remaining on the board.
                  Players take turns sliding marbles, causing an "avalanche"
                  effect that pushes other marbles off the edge. It requires
                  careful planning and predicting the movement of marbles to
                  outmaneuver opponents.
                </p>
                <div className="column img"></div>
              </div>
            </div>
          </section>
          <section id="aboutProject">
            <div className="section-content reverse">
              <div className="column">
                <h2>About the Game</h2>
                <p>
                  {" "}
                  The protection of glaciers is essential to combat the negative
                  impacts of global warming and climate change. Melting glaciers
                  have an impact on sea levels, weather patterns and water
                  availability, so urgent action is needed. Interventions
                  include reducing greenhouse gas emissions, using clean energy
                  sources and implementing measures to protect glacier areas.
                  Increasing public awareness and education is crucial to
                  promote individual responsibility. By working together
                  globally, we can protect glaciers for future generations and
                  preserve the Earth's delicate ecological balance.<br></br>
                  <br></br> Our game can contribute to saving glaciers by
                  raising awareness, encouraging behaviour change, supporting
                  conservation efforts through donations, advocating for climate
                  action and engaging players in positive environmental issues
                  and challenges. Through these initiatives, the game can
                  inspire players to take real action to protect glaciers and
                  combat climate change. For our part, we donate 50% of every
                  skin purchased and advertising revenue to WWF, GreenPeace and
                  local organisations.
                </p>
              </div>
            </div>
          </section>
          <section />

          <section id="instructions">
            <div className="section-content reverse">
              <div className="column2">
                <h2>The Team</h2>
                <p>
                  Our outstanding team is characterised by clear goals,
                  effective cooperation and open communication. What's more, our
                  members have diverse skills, take responsibility for their
                  tasks and are able to adapt to change. A supportive work
                  environment, effective leadership and constructive conflict
                  resolution contribute to the team's success and continuous
                  improvement. Recognising success and learning from experience
                  are also important elements of our outstanding team culture.
                  Other characteristics are diversity, inclusion, innovation,
                  climate protection, cosmopolitanism, creativity,
                  individuality....( all the things that start-ups are ). We are
                  not only colleagues, we are also a family that lives for the
                  same goals and beliefs.
                </p>
              </div>
              <div className="column">
                <ImageList sx={{ width: 700, height: 650 }}>
                  {itemData.map((item) => (
                    <ImageListItem key={item.img} style={{ padding: 0 }}>
                      <img
                        src={`${item.img}?w=248&fit=crop&auto=format`}
                        srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
                        alt={item.title}
                        loading="eager"
                      />
                      <ImageListItemBar
                        title={item.title}
                        subtitle={<span>by: {item.author}</span>}
                        position="below"
                        className="list-item"
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </div>
            </div>
          </section>
          <section id="instructions">
            <div className="section-content">
              <div className="column">
                <h2>Instructions</h2>
                <p>
                  Our project focuses on developing AI agents for a modified
                  version of the Avalanche board game. The objective is to
                  create intelligent agents capable of strategically dropping
                  marbles onto defined switches to solve challenges. By
                  combining the excitement of the game with AI capabilities, we
                  aim to push the boundaries of strategic decision-making in
                  gaming.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer className="footer">
        <p>&copy; 2023 Masters Project - Uni Mannheim & UBB</p>
      </footer>
    </div>
  );
};

export default PresentationScreen;

/*
below text
<div className="column">
                <img src={present} alt="Masters Project" />
              </div>
*/

/*

 <div className="column">
                <div className="dark-overlay">
                  <img src={mountains} alt="Avalanche Game" />
                </div>
              </div>
*/

/*
 <section>
          <div className="section-content reverse">
            <div className="column">
              <h2>Challenge Screen</h2>
              <p>
                The Challenge Screen presents users with pre-defined puzzles on
                a default board. Marbles need to be strategically dropped onto
                switches marked in red to successfully complete the challenges.
                It's a test of skill and logical thinking for players.
              </p>
            </div>
            <div className="column">
              <img src={challenge} alt="Challenge Screen" />
            </div>
          </div>
        </section>
*/
/*
<section>
          <div className="section-content">
            <div className="column">
              <h2>AI Showcase Screen</h2>
              <p>
                The AI Showcase Screen allows users to witness the power of AI
                agents in action. Users can observe different AI agents, such as
                PPO and AlphaZero, attempting to solve the same challenges faced
                in the game. It demonstrates the capabilities of these agents
                and highlights their strategic decision-making.
              </p>
            </div>
            <div className="column">
              <img src={aishowcase} alt="AI Showcase Screen" />
            </div>
          </div>
        </section>
*/
