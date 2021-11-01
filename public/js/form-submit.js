// handle form submit

let form = document.querySelector("#modal-form");
async function handleSubmit(event) {
  event.preventDefault();
  let formData = new FormData(event.target);
  let url = window.location.protocol + "//" + window.location.host + "/";
  let data = {};
  formData.forEach((value, key) => (data[key] = value));
  fetch(url, {
    method: form.method,
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      alert("Thanks for your submission!");
      document.getElementById("close-btn").click();
      form.reset();
    })
    .catch((error) => {
      console.error(error);
      alert("Oops! There was a problem submitting your form");
    });
}
form.addEventListener("submit", handleSubmit);
