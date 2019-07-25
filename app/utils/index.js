export let getPkgName = url => url.split("/package/")[1];

export let listen = ({ to, handle = () => {} }) => {
  if (to.hasListener(handle)) {
    to.removeListener(handle);
  }

  to.addListener(handle);

  return () => to.removeListener(handle);
};

export let sendRequest = async (url, options = {}) => {
  try {
    let resp = await fetch(url, options);

    if (!resp.ok) {
      throw resp;
    }

    return resp;
  } catch (e) {
    throw e;
  }
};
