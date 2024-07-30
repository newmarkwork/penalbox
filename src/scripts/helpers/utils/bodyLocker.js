export const bodyLocker = (bool) => {
  const body = document.querySelector("body");

  if (bool) {
    body.style.overflow = "hidden";
  } else {
    body.style.overflow = "auto";
  }
};
