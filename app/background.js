import { listen, getPkgName, sendRequest } from "./utils/index.js";
import { bundlePhobiaUrl, classes } from "./utils/constants.js";
import { bytes } from "./lib/bytes.js";

let NA = "N\\A";

// Create dom configurations for each set of info cards
/*
  each is an object that will take attributes and set them as is.
  [attributeName<string>]: attributeValue<any>

  the only special cases that are handled custom are: className, children
  className takes an array of strings. Deconstructing them into classes.
  children is an object of objects.
  children {
    [tag]: {HTMLAttributes}
  }
*/
let bundleSizeConf = {
  className: ["__b-npm__"],
  id: "__bundle-size",
  children: {
    h3: {
      className: classes.h3,
      textContent: "bundle size"
    },
    p: {
      className: classes.p,
      innerHTML: obj => {
        let el = document.createElement("a");

        el.className = classes.a.join(" ");
        el.href = obj.bundlePhobiaLink;
        el.innerText = obj.gzip === NA ? NA : `${obj.gzip} gzip`;

        return el.outerHTML;
      }
    }
  }
};

let viewPkgContents = {
  className: ["__b-npm__"],
  id: "__view-pkg",
  children: {
    h3: {
      className: classes.h3,
      textContent: "runpkg"
    },
    p: {
      className: classes.p,
      innerHTML: obj => {
        let el = document.createElement("a");

        el.href = `https://runpkg.com?${obj.packageName}`;
        el.className = classes.a.join(" ");
        el.innerText = "View Package";

        return el.outerHTML;
      }
    }
  }
};

// We only want the tab update to run on the below url. Everything else should be no-op.
let validUrl = "https://www.npmjs.com/package/";
let isValidUrl = url => typeof url !== "string" || url.startsWith(validUrl);

// Fetch the bundle size of the package
let fetchPackageBundleSize = async packageName => {
  let url = `${bundlePhobiaUrl}/api/size?package=${packageName}`;

  try {
    let { size, gzip } = await (await sendRequest(url)).json();

    return Object.entries({ size, gzip }).reduce((obj, [k, v]) => {
      obj[k] = bytes(v, {
        decimalPlaces: 1
      });
      return obj;
    }, {});
  } catch (e) {
    // Some packages fail to build so bundlephobia requests can timeout, throwing a 500
    console.error(e);

    // Simple to cover the case by showing N\A. Instead of silently failing
    return { size: NA, gzip: NA };
  }
};

async function tabUpdate(id, { status }, tab) {
  if (status !== "complete" || !isValidUrl(tab.url)) return;

  let packageName = getPkgName(tab.url);

  let bundleSize = await fetchPackageBundleSize(packageName);
  let bundlePhobiaLink = `${bundlePhobiaUrl}/result?p=${packageName}`;

  let deps = { ...bundleSize, bundlePhobiaLink, packageName };

  // Build the children into stringified html elements (Allows to send as a message)
  let updatedEls = [bundleSizeConf, viewPkgContents].map(conf => ({
    ...conf,
    children: Object.entries(conf.children).reduce(
      (arr, [tag, innerTagConf]) => {
        let el = document.createElement(tag);

        Object.entries(innerTagConf).forEach(([attr, v]) => {
          let r;
          // We're making assumptions on attributes here.
          // TODO: This is very bad. Make better
          if (Array.isArray(v)) {
            r = v.join(" "); // probably class
          } else if (typeof v === "function") {
            r = v(deps); // probably innerHTML
          } else if (typeof v === "string") {
            r = v; // Yeah we're just gonna do that I guess
          }

          el[attr] = r;
        });

        return [...arr, el.outerHTML];
      },
      []
    )
  }));

  // Tell the content-script to update the stats
  browser.tabs.sendMessage(id, { action: "update-stats", payload: updatedEls });
}
listen({ to: browser.tabs.onUpdated, handle: tabUpdate });
