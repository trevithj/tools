export function makeDragHandlers(element, panBy) {
    const state = {px: 0, py: 0, isDragging: false};

    function updateState(e) {
        state.px = e.clientX;
        state.py = e.clientY;
    }

    element.addEventListener('pointerdown', e => {
        // so pointermove fires even if pointer is outside SVG
        element.setPointerCapture(e.pointerId);
        updateState(e);
        state.isDragging = true;
    });

    element.addEventListener('pointermove', e => {
        if (!state.isDragging) return;
        const dx = (e.clientX - state.px);
        const dy = (e.clientY - state.py);
        updateState(e);   // advance the reference
        panBy(dx, dy);
    });

    const endDrag = e => {
        element.releasePointerCapture(e.pointerId);
        state.isDragging = false;
    };
    element.addEventListener('pointerup', endDrag);
    element.addEventListener('pointercancel', endDrag);
    element.addEventListener('pointerleave', endDrag);
}
