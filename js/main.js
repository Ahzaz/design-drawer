'use strict'

var isDrawing = false;
var dummyDrawingData = {
    bigRadius: 257,
    smallRadius: 197,
    point: {
        r: 115,
        theta: 90
    },
    theta: -90,
    color: "#0000FF"
};

var canvas;
var jsCanvas = document.getElementById('drawingArea');
var context = jsCanvas.getContext('2d');

var disableForm = function(val) {
    // $("#control-form :input").attr("disabled", val);
    val = !val ? 'enable' : 'disable';
    $('#big-radius').slider(val);
    $('#small-radius').slider(val);
};
var disableStopButton = function(val) {
    $('#stop-btn').attr('disabled', val);
};
var disableStartButton = function(val) {
    $('#start-btn').attr('disabled', val);
};


var drawingData = dummyDrawingData;
var toggleDrawing = function(goingToDraw) {
    if (goingToDraw) {
        disableForm(true);
        disableStopButton(false);
        disableStartButton(true);
    } else {
        disableForm(false);
        disableStopButton(true);
        disableStartButton(false);
    }
};
var start = function() {
    context.clearRect(0, 0, canvas.width(), canvas.height());
    drawingData.color = $('#drawing-color').val();
    context.strokeStyle = drawingData.color;
    toggleDrawing(true);
    startDrawing();
};

var stop = function() {
    stopDrawing();
    toggleDrawing(false);
}

var toRad = function(val) {
    return val * Math.PI / 180;
};

var intervalHandle;
var startDrawing = function() {

    var deltaX = drawingData.point.x - drawingData.sx; 
    var deltaY = drawingData.point.y - drawingData.sy; 
    drawingData.point.r = Math.sqrt(Math.pow(deltaX,2)+Math.pow(deltaY,2));
    drawingData.point.theta = Math.atan2(deltaY, deltaX) * (180 / Math.PI);


    var currentPosition = {
        x: drawingData.cx + ((drawingData.bigRadius - drawingData.smallRadius) * Math.cos(toRad(drawingData.theta))) + (drawingData.point.r * Math.cos(toRad(drawingData.point.theta))),
        y: drawingData.cy + ((drawingData.bigRadius - drawingData.smallRadius) * Math.sin(toRad(drawingData.theta))) + (drawingData.point.r * Math.sin(toRad(drawingData.point.theta)))
    };
    var nextPos = function() {
        var r = drawingData.bigRadius - drawingData.smallRadius;
        drawingData.theta = (drawingData.theta + 1) % 360;
        drawingData.point.theta = (drawingData.point.theta - (drawingData.bigRadius / drawingData.smallRadius)) % 360
        return {
            x: drawingData.cx + (r * Math.cos(toRad(drawingData.theta))) + (drawingData.point.r * Math.cos(toRad(drawingData.point.theta))),
            y: drawingData.cy + (r * Math.sin(toRad(drawingData.theta))) + (drawingData.point.r * Math.sin(toRad(drawingData.point.theta)))
        }
    };
    var step = function() {
        var np = nextPos();
        context.beginPath();
        context.moveTo(currentPosition.x, currentPosition.y);
        context.lineTo(np.x, np.y);
        context.stroke();
        currentPosition = np;
    };

    intervalHandle = setInterval(step, 10);
}

var stopDrawing = function() {
    if (intervalHandle) {
        clearInterval(intervalHandle);
    }
}

var drawBigCircle = function() {
    context.strokeStyle = "#0000FF";
    context.beginPath();
    context.arc(drawingData.cx, drawingData.cy, drawingData.bigRadius, 0, 2 * Math.PI);
    context.stroke();
}

var drawSmallCircle = function() {
    context.strokeStyle = "#FFFF00";
    var r = drawingData.bigRadius - drawingData.smallRadius;
    var x = drawingData.sx = drawingData.cx + (r * Math.cos(toRad(drawingData.theta)));
    var y = drawingData.sy = drawingData.cy + (r * Math.sin(toRad(drawingData.theta)));
    context.beginPath();
    context.arc(x, y, drawingData.smallRadius, 0, 2 * Math.PI);
    context.stroke();
}

var resetStaticCanvas = function() {
    var bigRadius = $('#big-radius').val();
    var smallRadius = $('#small-radius').val();
    drawingData.bigRadius = bigRadius;
    drawingData.smallRadius = smallRadius;
    context.clearRect(0, 0, canvas.width(), canvas.height());
    drawBigCircle();
    drawSmallCircle();
}

var inCircle = function(x,y) {
    return Math.sqrt(Math.pow((drawingData.sx-x),2) + Math.pow((drawingData.sy-y),2)) < drawingData.smallRadius;
}
var setPoint = function(event) {
    var rect = jsCanvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    if (inCircle(x, y)) {
        resetStaticCanvas();
        context.fillStyle = "#ff2626"; // Red color
        context.beginPath(); //Start path
        context.arc(x, y, 3, 0, Math.PI * 2, true);
        context.fill();
        drawingData.point.x = x;
        drawingData.point.y = y;
    }
}

$(document).ready(function() {
    canvas = $('#drawingArea');
    drawingData.cx = canvas.width() / 2;
    drawingData.cy = canvas.height() / 2;
    disableStopButton(true);
    resetStaticCanvas();
    $('#big-radius').on('slide', resetStaticCanvas);
    $('#small-radius').on('slide', resetStaticCanvas);
    console.log('start');
});