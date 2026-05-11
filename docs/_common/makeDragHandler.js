const NoOp = () => null;

export function makeDragHandlers(element, panBy) {
    panBy = typeof panBy === "function" ? panBy : NoOp;
    const state = {px: 0, py: 0, isDragging: false};

    function updateState(e) {
        state.px = e.clientX;
        state.py = e.clientY;
    }

    element.addEventListener('pointerdown', e => {
        e.stopPropagation();
        // so pointermove fires even if pointer is outside SVG
        element.setPointerCapture(e.pointerId);
        updateState(e);
        state.isDragging = true;
    });

    element.addEventListener('pointermove', e => {
        e.stopPropagation();
        if (!state.isDragging) return;
        const dx = (e.clientX - state.px);
        const dy = (e.clientY - state.py);
        updateState(e);   // advance the reference
        panBy(dx, dy);
    });

    const endDrag = e => {
        e.stopPropagation();
        element.releasePointerCapture(e.pointerId);
        state.isDragging = false;
    };
    element.addEventListener('pointerup', endDrag);
    element.addEventListener('pointercancel', endDrag);
    element.addEventListener('pointerleave', endDrag);

    // return cleanup fn
    return () => {
        element.removeEventListener('pointerup', endDrag);
        element.removeEventListener('pointercancel', endDrag);
        element.removeEventListener('pointerleave', endDrag);
    }
}
