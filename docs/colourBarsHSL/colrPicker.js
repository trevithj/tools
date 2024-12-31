export function makePicker(name, label, listener) {
    const div = document.createElement("div");
    div.classList.add("control");
    // lazy way of creating sub-elements
    const html = [
        '<label for="', name, '">', label, '</label>',
        '<div class="colr-box"></div>',
        ' (Hue: <span class="hue-value">0deg</span>)',
        '<input type="range" min="0" max="360" value="0" name="', name, '" />',
    ];
    div.innerHTML = html.join("");

    const hue = div.querySelector("input");
    const box = div.querySelector(".colr-box");
    const val = div.querySelector(".hue-value");
    hue.addEventListener("input", () => {
      box.style.backgroundColor = `hsl(${hue.value} 100% 50%)`;
      val.textContent = `${hue.value}deg`;
      listener(name, hue.value);
    });
    // Initialize
    hue.dispatchEvent(new Event("input"));
    return div;
}
