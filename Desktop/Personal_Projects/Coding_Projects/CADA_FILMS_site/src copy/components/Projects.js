import React from "react";
import "./Projects.css";

const Projects = () => {
  return (
    <section id="projects" className="projects-section">
      <h2>Projects</h2>
      <div className="project-teaser">
        <a href="projects/beetle-frames.html">
          <img src="/beetle-frames-thumbnail.jpg" alt="Beetle Frames Thumbnail" />
          <h3>Beetle Frames</h3>
        </a>
      </div>
    </section>
  );
};

export default Projects;
