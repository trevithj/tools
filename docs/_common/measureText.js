const _canvas = document.createElement('canvas');
const _ctx = _canvas.getContext('2d');

const DEFAULT_FONT = "normal 16px sans-serif"

export function measureTextWidth(text, cssFont = DEFAULT_FONT) {
    if (!_ctx) return 0;

    _ctx.font = cssFont;
    // console.log(text, cssFont);
    return _ctx.measureText(text).width;
}
