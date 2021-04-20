export const updateViewport = (): void => {
  const vh = window.innerHeight / 100;
  const vw = window.innerWidth / 100;

  const root = document.documentElement;

  // 各カスタムプロパティに`window.innerHeight / 100`,`window.innerWidth / 100`の値をセット
  root.style.setProperty("--vh", `${vh}px`);
  console.log("updateViewport", vh, vw);
  if (vh > vw) {
    root.style.setProperty("--vmax", `${vh}px`);
    root.style.setProperty("--vmin", `${vw}px`);
  } else {
    root.style.setProperty("--vmax", `${vw}px`);
    root.style.setProperty("--vmin", `${vh}px`);
  }
};

updateViewport();

window.addEventListener("resize", updateViewport);
