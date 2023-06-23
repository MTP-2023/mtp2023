import React from "react";
import "./PresentationScreen.css";

import avalImg from "../../assets/avalanche-game.jpeg";

import present from "../../assets/present.jpeg";
import sandbox from "../../assets/sandbox.png";
import challenge from "../../assets/challenge.png";
import aishowcase from "../../assets/aishowcase.png";

const PresentationScreen = () => {
  return (
    <div className="presentation-container">
      <header className="header">
        <h1>AI Agents in Avalanche: Masters Project</h1>
      </header>
      <main>
        <section>
          <div className="section-content">
            <div className="column">
              <h2>About the Avalanche Game</h2>
              <p>
                Avalanche is a strategic board game designed for tactical
                thinking and engaging gameplay. The objective is to be the last
                player with at least one marble remaining on the board. Players
                take turns sliding marbles, causing an "avalanche" effect that
                pushes other marbles off the edge. It requires careful planning
                and predicting the movement of marbles to outmaneuver opponents.
              </p>
            </div>
            <div className="column">
              <img src={avalImg} alt="Avalanche Game" />
            </div>
          </div>
        </section>
        <section>
          <div className="section-content reverse">
            <div className="column">
              <h2>About the Project</h2>
              <p>
                Our project focuses on developing AI agents for a modified
                version of the Avalanche board game. The objective is to create
                intelligent agents capable of strategically dropping marbles
                onto defined switches to solve challenges. By combining the
                excitement of the game with AI capabilities, we aim to push the
                boundaries of strategic decision-making in gaming.
              </p>
            </div>
            <div className="column">
              <img src={present} alt="Masters Project" />
            </div>
          </div>
        </section>

        <section>
          <div className="section-content">
            <div className="column">
              <h2>Sandbox Screen</h2>
              <p>
                The Sandbox Screen offers users a playground to experiment and
                explore the modified Avalanche board. Users can freely throw
                marbles onto the board and observe the cascading effects as they
                change the board's horizontal and vertical layout.
              </p>
            </div>
            <div className="column">
              <img src={sandbox} alt="Sandbox Screen" />
            </div>
          </div>
        </section>

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
      </main>
      <footer className="footer">
        <p>&copy; 2023 Masters Project - Uni Mannheim & UBB</p>
      </footer>
    </div>
  );
};

export default PresentationScreen;
