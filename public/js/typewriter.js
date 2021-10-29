const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

let i = 0;
let type = async (str, el, ms) => {
  if (i < str.length) {
    let char = str[i];
    let output = "";
    // Handle custom delays
    if (char == "|") {
      let j = 0;
      let delay;
      while (str[++i] !== "|") j++;
      delay = parseInt(str.slice(i - j, i));
      await sleep(delay);
    }
    // Handle block typing
    else if (char == "\\") {
      let substr = "";
      while (++i < str.length && str[i] !== "\\") {
        substr += str[i];
      }
      output = substr;
    }
    // default behavior
    else {
      output = char === "\n" ? "" : char;
    }
    i++;
    el.innerHTML += output;
    setTimeout(() => type(str, el, ms), ms);
  }
};

// Type text file
export function typewriterFetch(selector, path, ms = 50, deley = 0) {
  fetch(path)
    .then((res) => {
      if (res.ok) return res.text();
      else throw new Error("Fetch - Something went wrong");
    })
    .then((text) => {
      setTimeout(() => {
        type(text, document.querySelector(selector), ms);
      }, deley);
    })
    .catch((e) => {
      console.error(e);
    });
}

// Type string arg
export function typewriter(selector, str, ms = 50, deley = 0) {
  let i = 0;
  setTimeout(() => {
    type(str, document.querySelector(selector), ms);
  }, deley);
}
