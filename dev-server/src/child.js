// support hot module reload
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    console.log(`Handling hot reload accept for ${import.meta.url}`);
    document.querySelector("#child").replaceWith(newModule.Child());
  });
}

/** @param {HTMLElement} parent */
export function Child() {
  const $el = document.createElement("div");
  $el.id = "child";
  $el.textContent = `Hello my ID is ${(Math.random() * 100).toFixed(0)}`;
  return $el;
}
