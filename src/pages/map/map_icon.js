export const getColor = (color) =>`rgba(${color.r}, ${color.g}, ${color.b}, 255)`;
const colorToRgb = (color) => `rgb(${color.r} ${color.g} ${color.b} / 100%)`;
const getAngle = (degrees) => degrees * Math.PI / 180;

function cropImageFromCanvas(ctx, threshold = 0) {
    const canvas = ctx.canvas,
        w = canvas.width, h = canvas.height,
        tlCorner = {x:w+1, y:h+1},
        brCorner = {x:-1, y:-1},
        imageData = ctx.getImageData(0,0,canvas.width,canvas.height);

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const index = (y * w + x) * 4;
            if (imageData.data[index+3] > threshold) {
                tlCorner.x = Math.min(x, tlCorner.x);
                tlCorner.y = Math.min(y, tlCorner.y);
                brCorner.x = Math.max(x, brCorner.x);
                brCorner.y = Math.max(y, brCorner.y);
            }
        }
    }
    const cut = ctx.getImageData(tlCorner.x, tlCorner.y, brCorner.x - tlCorner.x, brCorner.y - tlCorner.y);

    canvas.width = brCorner.x - tlCorner.x;
    canvas.height = brCorner.y - tlCorner.y;

    ctx.putImageData(cut, 0, 0);

    return {width:canvas.width, height:canvas.height, x:tlCorner.x, y:tlCorner.y};
}

export const makeIcon = (iconDef, color, size = 1) => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;

    const ctx = canvas.getContext('2d');

    if (size < 0.1) {
        size = 0.1;
    }

    ctx.scale(size, size);
    ctx.translate(127, 127);

    for (const def of iconDef) {
        if (def.SetPixel) {
            ctx.fillStyle = color;
            ctx.fillRect(def.SetPixel[0], -def.SetPixel[1], 1, 1);
        } else if (def.Line) {
            ctx.beginPath();
            ctx.moveTo(def.Line.start[0], -def.Line.start[1]);
            ctx.lineTo(def.Line.end[0], -def.Line.end[1]);
            ctx.strokeStyle = color;
            ctx.stroke();
            ctx.closePath();
        } else if (def.Arc){
            ctx.beginPath();
            ctx.arc(def.Arc.center[0], -def.Arc.center[1], def.Arc.radius, getAngle(def.Arc.start_angle), getAngle(def.Arc.end_angle));
            if (def.Arc.inner_radius > 0){
                ctx.arc(def.Arc.center[0], -def.Arc.center[1], def.Arc.inner_radius, getAngle(def.Arc.start_angle), getAngle(def.Arc.end_angle), true);
            }
            if (def.Arc.fill){
                ctx.fillStyle = color;
                ctx.fill();
            } else {
                ctx.strokeStyle = color;
                ctx.stroke()
            }
            ctx.closePath();
        } else if (def.Ellipse){
            ctx.beginPath();
            ctx.ellipse(def.Ellipse.center[0], -def.Ellipse.center[1], def.Ellipse.radius[0], def.Ellipse.radius[1], getAngle(def.Ellipse.rotation), getAngle(def.Ellipse.start_angle), getAngle(def.Ellipse.end_angle));
            if (def.Ellipse.inner_radius[0] > 0 && def.Ellipse.inner_radius[1] > 0){
                ctx.ellipse(def.Ellipse.center[0], -def.Ellipse.center[1], def.Ellipse.inner_radius[0], def.Ellipse.inner_radius[1], getAngle(def.Ellipse.rotation), getAngle(def.Ellipse.start_angle), getAngle(def.Ellipse.end_angle), true);
            }
            if (def.Ellipse.fill){
                ctx.fillStyle = color;
                ctx.fill();
            } else {
                ctx.strokeStyle = color;
                ctx.stroke()
            }
            ctx.closePath();
        } else if (def.Polygon) {
            ctx.beginPath();
            if (def.Polygon[0]) {
                ctx.moveTo(def.Polygon[0][0], -def.Polygon[0][1]);
            }

            for (const coord of def.Polygon) {
                ctx.lineTo(coord[0], coord[1]);
            }

            if (def.Polygon[0]) {
                ctx.lineTo(def.Polygon[0][0], -def.Polygon[0][1]);
            }

            ctx.fillStyle = color;
            ctx.fill();
            ctx.closePath();
        }
    }

    const crop = cropImageFromCanvas(ctx, 0);
    const image_data = ctx.getImageData(0, 0, crop.width, crop.height);

    return {
        data: image_data.data,
        width: crop.width,
        height: crop.height
    };
};