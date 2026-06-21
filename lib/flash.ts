export function flash(el: HTMLElement): void {
  el.classList.remove("flashing");
  void el.offsetWidth;
  el.classList.add("flashing");
  el.addEventListener("animationend", () => el.classList.remove("flashing"), {
    once: true,
  });
}
