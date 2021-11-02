// TERMINAL elements
export const terminal = document.querySelector(".terminal-container");
export const terminalBody = document.querySelector(".terminal-container .body");
const terminaDocklIcon = document.querySelector("#terminal-icon");
const terminalRed = document.querySelector(".circle.red");
const terminalYellow = document.querySelector(".circle.yellow");
const terminalGreen = document.querySelector(".circle.green");
const topBar = document.querySelector(".title");

// Terminal events
function visable(el) {
  return !!(
    (el.offsetWidth || el.offsetHeight || el.getClientRects().length) &&
    window.getComputedStyle(el).visibility !== "hidden"
  );
}

// check if element is visable/displayed
export function toggleDisplay(el, disp) {
  if (visable(el)) el.style.display = "none";
  else el.style.display = disp;
}

// set click events for the UI buttons
[terminaDocklIcon, terminalRed, terminalGreen].forEach((item) =>
  item.addEventListener("click", () => {
    toggleDisplay(terminal, "block");
    if (item == terminalRed)
      terminaDocklIcon.classList.toggle("li-open", false);
    if (item == terminaDocklIcon) {
      terminal.classList.toggle("fade-in-animation", false);
      terminaDocklIcon.classList.toggle("li-open", true);
    }
  })
);

topBar.addEventListener("dblclick", () => {
  terminal.classList.toggle("terminal-maximize");
  updateBashSize();
});

terminalYellow.addEventListener("click", () => {
  terminal.classList.toggle("terminal-maximize");
  updateBashSize();
});

// get text width in pixels
function getTextWidth(text, font) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = font || getComputedStyle(document.body).font;
  return context.measureText(text).width;
}

const bodyComputedStyle = window.getComputedStyle(terminalBody);
const bashTitle = document.querySelector(".terminal .title");

// compute terminal body size in rows of text and columns of chars
const computeBashSize = (computedStyle) => {
  const h = terminalBody.clientHeight;
  const w =
    terminalBody.clientWidth -
    parseInt(computedStyle.paddingLeft) -
    parseInt(computedStyle.paddingRight);
  const lineHeight = parseInt(computedStyle.lineHeight);
  const charWidth = getTextWidth("A", computedStyle.font);
  //  get "bash" size
  const bashH = Math.floor(h / lineHeight);
  const bashW = Math.floor(w / charWidth);
  // console.log(`${bashW}x${bashH}`);

  return `-zsh -- ${bashW}x${bashH}`;
};

// update current bash size as terminal title
export const updateBashSize = () => {
  const innerText = computeBashSize(bodyComputedStyle);
  bashTitle.innerText = innerText;
};

// update on resize end
window.onresize = () => {
  clearTimeout(window.resized);
  window.resized = setTimeout(updateBashSize, 100);
};

// console.info("terminal script loaded");
