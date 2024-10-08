export function initialize(parent, width, height) {
    createScroller(parent, width, height);
    return createCanvas(parent, width, height);
}

function createCanvas(parent, width, height) {
    const canvas = document.createElement("canvas")

    const dpr = window.devicePixelRatio;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d", {alpha: false});
    ctx.scale(dpr, dpr);

    parent.appendChild(canvas);
    return ctx;
}

function createScroller(parent, width, height) {
    const scroller = document.createElement("div");
    scroller.id = "scroller";
    scroller.style.width = `${width}px`;
    scroller.style.height = `${height}px`;
    scroller.style.position = "absolute";
    scroller.style.overflow = "auto";

    createMarker(scroller);

    parent.appendChild(scroller);
}

function createMarker(parent) {
    const marker = document.createElement("div");
    marker.id = "marker";
    marker.classList.add("marker");
    parent.appendChild(marker);
}