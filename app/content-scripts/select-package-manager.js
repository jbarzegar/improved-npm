// Selector we'll be modifying
let container = document.querySelector(".fdbf4038 p.lh-copy");
let codeDiv = container.querySelector("code");
let installSpan = codeDiv.children[0];

let localStorageKey = "__b-npm_preferred_pkg_manager";

// Possible "add" commands. TODO: Let users add their own options
let packageMangerOptions = ["npm i", "yarn add"];
// Gotta get that package
let [, package] = installSpan.innerHTML.split(" <!-- -->");
// People like when their prefs are saved
let preferredPackageManager = localStorage.getItem(localStorageKey);
// Write the child so the click-to-copy-paste thing can pick it up
let writePackageMangerChange = str => {
  installSpan.innerHTML = `${str} <!-- -->${package}`;
};

// Create select element filled with it's options
let createSelectEl = () => {
  let el = document.createElement("select");
  el.style.height = "100%";
  el.style.background = "none";
  el.style.border = "none";

  packageMangerOptions.forEach(opt => {
    let option = document.createElement("option");
    option.text = opt;
    option.value = opt;
    el.appendChild(option);
  });

  // We'll use the right selected option if the preference was set previously
  if (preferredPackageManager) {
    el.selectedIndex = packageMangerOptions.findIndex(
      str => preferredPackageManager === str
    );
    writePackageMangerChange(preferredPackageManager);
  }

  return el;
};

// Making the absolute <select> stay within bounds
container.style.position = "relative";

// container for the select
let selectEl = document.createElement("div");
// Style em' up
selectEl.style.position = "absolute";
selectEl.style.bottom = 0;
selectEl.style.right = 0;
selectEl.style.top = 0;

let select = createSelectEl();
// Make sure we update the package manager preference when the select changes
select.addEventListener("change", evt => {
  let preferredManager = evt.currentTarget.value;
  localStorage.setItem(localStorageKey, preferredManager);
  writePackageMangerChange(preferredManager);
});

// Yeet that into the DOM
selectEl.appendChild(select);
container.appendChild(selectEl);
