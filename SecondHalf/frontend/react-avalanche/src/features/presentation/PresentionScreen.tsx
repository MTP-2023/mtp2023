import React from "react";
import "./PresentationScreen.css";

import avalImg from "../../assets/avalanche-game.jpeg";

import present from "../../assets/present.jpeg";
import sandbox from "../../assets/sandbox.png";
import challenge from "../../assets/challenge.png";
import aishowcase from "../../assets/aishowcase.png";
import video from "../../assets/video/avalanche3.mp4";
import TestComponent from "../test/TimePage";
import backgroundImage from "../../assets/Timeline_background.jpg";
import mountains from "../../assets/public/gallery/mattias-olsson-nQz49efZEFs-unsplash.jpg";

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
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Imperdiet proin fermentum leo vel orci. Neque ornare aenean
                  euismod elementum nisi quis eleifend quam adipiscing. Nulla
                  facilisi cras fermentum odio eu feugiat pretium nibh ipsum.
                  Pellentesque habitant morbi tristique senectus et netus et.
                  Sagittis orci a scelerisque purus semper. Sit amet est
                  placerat in egestas erat imperdiet sed.",
                </p>
              </div>
            </div>
          </section>
          <section id="instructions">
            <div className="section-content reverse">
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
          <section id="instructions">
            <div className="section-content reverse">
              <div className="column">
                <h2>The Team</h2>
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
