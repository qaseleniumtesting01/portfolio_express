// init terminal
import {
  updateBashSize,
  toggleDisplay,
  terminalBody,
  terminal,
} from "./terminal.js";
import "../scss/main.scss";

// init dock
import "./dock.js";

// import form handle
import "./form-submit.js";
("use strict");

// typewriter
import { typewriter, typewriterFetch } from "./typewriter.js";

// register
import "./reg.js";

// screen size presets
const GRIDD_LG = 992;
const GRID_MD = 768;
const Grid_SM = 567;
const FONT_SIZE_PX = 14;

// colors preset
const darkBackgroundModes = [
  "#3498DB", // Curious Blue
  "#1565C0", // Denim
  "#1ABC9C", // Mountain Meadow
  "#E74C3C", // Cinnabar
  "#9B59B6", // Wisteria
  "#E67E22", // Zest
  "#282C34", // day
];
const lightBackgroundModes = [
  // "#FAFAFA", // night
  "#FFCDD2", // Pastel Pink
  "#E1BEE7", // French Lilac
  "#C8E6C9", // Zanah
  "#B3E5FC", // French Pass
  "#FFF9C4", // Lemon Chiffon
];

const rootElement = document.documentElement;
const mainClickArea = document.querySelector(".clickable");
const navbar = document.querySelector(".navbar");
const navSocialIcons = document.querySelector("#social-icons");
const darkModeToggler = document.querySelector("#dark-mode-toggler");
const aboutSection = document.getElementById("about");
const accordionBodies = document.querySelectorAll(".accordion-item");
const accordionButtons = document.querySelectorAll("#about button");
const projects = document.querySelector("#projects");
const projectsCards = document.querySelectorAll(".card");
const modalButton = document.querySelector("#contact-modal .btn-accent");

// create color generation function
// than add color chaange on click to tag <main>
function* colorGen(colorArr) {
  let length = colorArr.length;
  for (let i = 0; ; i++) {
    yield colorArr[i % length];
  }
}

function adjustColor(color, amount) {
  return (
    "#" +
    color
      .replace(/^#/, "")
      .replace(/../g, (color) =>
        (
          "0" +
          Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)
        ).substr(-2)
      )
  );
}

// init color gens
// const lightColorGen = colorGen(lightBackgroundModes);
// const darkColorGen = colorGen(darkBackgroundModes);
function changeBG(color = "#282C34") {
  rootElement.style.setProperty("--accent", color);
}

// const btn = [].forEach.call(
//   document.querySelectorAll(".change-color"),
//   (item) =>
//     item.addEventListener("click", (e) => {
//       let color = item.dataset.color;
//       rootElement.style.setProperty("--accent", color);
//     })
// );

// Change navbar apperance based on scroll location
navSocialIcons.style.display = "none";

window.onscroll = function () {
  "use strict";
  let navSocialIcons = document.querySelector("#social-icons");
  let vpHeight = window.innerHeight;
  if (
    document.body.scrollTop >= vpHeight ||
    document.documentElement.scrollTop >= vpHeight
  ) {
    navSocialIcons.style.display = "flex";
  } else {
    navSocialIcons.style.display = "none";
  }
};

function multiToggle(el, ...classes) {
  classes.map((cls) => el.classList.toggle(cls));
}

// Toggle main theme color
const toogleTheme = () => {
  multiToggle(navbar, "navbar-light", "navbar-dark");
  multiToggle(
    aboutSection,
    "text-light",
    "bg-100",
    "bg-material-gray-background"
  );
  multiToggle(terminalBody, "text-dark", "bg-light");
  multiToggle(modalButton, "text-light");
  multiToggle(projects, "text-light", "bg-material-gray-background-lighten");
  accordionBodies.forEach((item) => {
    multiToggle(item, "bg-material-gray-800");
  });
  accordionButtons.forEach((item) => {
    multiToggle(item, "bg-material-gray-background", "bg-100");
  });
  projectsCards.forEach((item) => {
    multiToggle(item, "bg-material-gray-800", "card-dark");
  });
};

// init background color and theme (dark preset)
let color = colorGen(darkBackgroundModes);
changeBG(color.next().value);
multiToggle(terminalBody, "text-dark", "bg-light");
navbar.classList.toggle("navbar-light");
aboutSection.classList.toggle("bg-100");
// accordionBodies.forEach((item) => {
//   multiToggle(item, "bg-100");
// });
accordionButtons.forEach((item) => multiToggle(item, "bg-100"));
toogleTheme();

// init background color and theme (light preset)
// let color = colorGen(lightBackgroundModes);
// changeBG(color.next().value);
// multiToggle(terminalBody, "text-dark", "bg-light");
// navbar.classList.toggle("navbar-light");
// aboutSection.classList.toggle("bg-100");
// accordionButtons.forEach((item) => item.classList.toggle("bg-100"));

// Dark mode toggle
darkModeToggler.addEventListener("click", (e) => {
  const el = e.target;
  toogleTheme();
  if (el.dataset.dark_mode_on === "true") {
    // color = colorGen(darkBackgroundModes); // for ligth first
    color = colorGen(lightBackgroundModes); // for dark first
    changeBG(color.next().value);
    el.dataset.dark_mode_on = "false";
  } else {
    // color = colorGen(lightBackgroundModes); // for ligth first
    color = colorGen(darkBackgroundModes); // for dark first
    changeBG(color.next().value);
    el.dataset.dark_mode_on = "true";
  }
});

// Add on click bg color change callback
mainClickArea.addEventListener("click", () => {
  changeBG(color.next().value);
});

function showElm() {
  navbar.classList.remove("visually-hidden");
  document.querySelector(".back-title").classList.toggle("text-dark");
  terminal.classList.add("fade-in-animation");
  toggleDisplay(terminal, "block");
  typewriterFetch(".typewriter", "assets/txt/showcase-text.txt", 40, 2400);
  // init terminal title - "bash" size
  setTimeout(() => {
    updateBashSize();
  }, 0);
}

// wait for web fonts to dl before showing the main page.
document.fonts.ready.then(showElm).catch(showElm);
