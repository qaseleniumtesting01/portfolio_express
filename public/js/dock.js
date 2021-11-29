const icons = document.querySelectorAll(".ico");
const dock = document.querySelector(".dock");
icons.forEach((item, index) => {
  item.addEventListener("mouseover", (e) => {
    focus(e.target, index);
  });
  item.addEventListener("mouseleave", (e) => {
    icons.forEach((item) => {
      item.style.transform = "scale(1)  translateY(0px)";
    });
  });
});

const focus = (elem, index) => {
  dock.classList.toggle("init-dock-show", false);
  let prev = index - 1;
  let prevPrev = index - 2;
  let next = index + 1;
  let nextNext = index + 2;

  if (prev == -1 || next == icons.length) {
    elem.style.transform = "scale(1.5) translateY(-10px)";
  } else {
    elem.style.transform = "scale(1.5) translateY(-10px)";
    icons[prev].style.transform = "scale(1.2) translateY(-6px)";
    icons[next].style.transform = "scale(1.2) translateY(-6px)";
    if (prevPrev >= 0) icons[prevPrev].style.transform = "scale(1.1)";
    if (nextNext < icons.length) icons[nextNext].style.transform = "scale(1.1)";
  }
};

dock.classList.toggle("init-dock-show", true);
setTimeout(() => {
  dock.classList.toggle("init-dock-show", false);
}, 7000);

// console.info("dock.js script loaded");
