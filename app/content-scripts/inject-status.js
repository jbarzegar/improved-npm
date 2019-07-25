// All these weird class names is highly <div>isive (I'm sorry)
const divClasses = ["_702d723c", "dib", "w-50", "bb", "b--black-10", "pr2"];

let fetchInfoTables = () => document.querySelectorAll(".fdbf4038 ._702d723c");
let fetchLastEl = () => {
  // Get the index of the last item and return it
  let tables = fetchInfoTables();
  let lastIndex = tables.length - 1;

  return tables[lastIndex];
};

// Create a stat card. Writing children and setting attributes.
let constructInfoCard = (children = [], attrs = {}) => {
  let div = document.createElement("div");
  divClasses.forEach(c => div.classList.add(c));

  Object.entries(attrs).forEach(([name, value]) =>
    name === "className" // Right now we only really need to handle className as a specific case
      ? value.forEach(c => div.classList.add(c))
      : div.setAttribute(name, value)
  );

  children.forEach(child => (div.innerHTML += child));

  return div;
};
// Yeet that into the DOM
let injectInfoCard = (el, placement = "afterend") => {
  let injectedEl = document.querySelector(`#${el.id}`);
  // In some rare cases the elements may already exist, if they do we just replace the dom node with a new one
  if (injectedEl) {
    injectedEl.replaceWith(el);
  } else {
    fetchLastEl().insertAdjacentElement(placement, el);
  }
};

// The content script will wait to update the page only if the background page says to
browser.runtime.onMessage.addListener(async ({ action, payload = [] }) => {
  if (action === "update-stats") {
    payload.forEach(({ children, ...conf }) => {
      let el = constructInfoCard(children, conf);
      injectInfoCard(el);
    });
  }
});
