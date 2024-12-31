export function makeSlider(name, label, listener) {
    const div = document.createElement("div");
    div.classList.add("control");
    // lazy way of creating sub-elements
    const html = [
        '<label for="', name, '">', label, '</label>',
        '(<span class="count">16</span>)',
        '<input type="range" max="128" min="4" name="', name, '" value="16"/>',
    ];
    div.innerHTML = html.join("");

    const input = div.querySelector("input");
    const value = div.querySelector(".count");
    input.addEventListener("input", () => {
      value.textContent = input.value;
      listener(name, input.value);
    });
    // Initialize
    input.dispatchEvent(new Event("input"));
    return div;
}
