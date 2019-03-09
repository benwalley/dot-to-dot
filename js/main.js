var canvas = document.getElementById('main-canvas');
var ctx = canvas.getContext('2d');

var data = {
    'font-size': '15px', 
    'font-family': 'Georgia',
    'background-color': 'grey',
    sampleImages: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-V1sOwYVOrzIozeOECw2uKNaCnkaCkW9PK014vyEuQm8vAtHq4g"],
    menuOpen: true,
    pageHeight: undefined,
    pageWidth: undefined,
    heightRatio: undefined,
    widthRatio: undefined,
    currentPos: 1,
    dotRadius: 2,
    lineWidth: 1,
    pageMargin: 20,
    showLines: true,
    showDots: true,
    dotColor: "#000000",
    numberColor: "#000000",
    selectedMode: "create",
    shiftPressed: false,
    xPressed: false,
    animating: false,
    editingPoint: undefined,
    lastMousePosX: 0,
    lastMousePosY: 0,
    mode: 'create',
    drawRadius: 10,
    drawColor: '#e1e1e1',
    drawShape: 'circle',
    showDrawing: true,
    mousedown: false,
    eraseRadius: 20
};

var currentImage;


var points = [];
var drawing = [];

$(function() {
    init()
})

// Canvas size
// ===========================================
function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function download() {
    var download = document.getElementById("download");
    var image = document.getElementById("main-canvas").toDataURL("image/png")
    .replace("image/png", "image/octet-stream");
    download.setAttribute("href", image);
//download.setAttribute("download","archive.png");
}

function init() {
    setCanvasSize()
    points = [];
    drawing = [];
    data.sampleImages = ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-V1sOwYVOrzIozeOECw2uKNaCnkaCkW9PK014vyEuQm8vAtHq4g"]
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    $("#set-draw-size").val(data.drawRadius * 2);
    $("#set-erase-size").val(data.drawRadius * 2);
    $("#set-drawing-color").val(data.drawColor);

    // add sample images
    for(var i = 0; i < data.sampleImages.length; i++) {
        // I should change the function so that I can just pass the src in, but I don't feel like it right now.
        var myImage = new Image();
    
        myImage.src = data.sampleImages[i];
        // If import is successfull
        myImage.onload = function() {
            $(myImage).addClass("image-option")
            // add click listener
            $(myImage).click(function() {
                imageOptionHandler(this)
            })
            $(".images").append(myImage)
        }
    }
}

$( window ).resize(function() {
    setCanvasSize()
})

function drawRect(data) {
    if(data.fill) {
        ctx.fillRect(data.x, data.y, data.width, data.height)
    }else {
         ctx.strokeRect(data.x, data.y, data.width, data.height)
    }
}

function drawCircle(info) {
    ctx.beginPath();
    ctx.arc(info.x, info.y, info.r, 0, Math.PI * 2, true)
    if(info.color) {
        ctx.fillStyle = info.color
    } else {
        ctx.fillStyle = data.dotColor;
    }
    
    ctx.fill()
}

function write(data) {
    ctx.fillText(data.text, data.x, data.y)
}

function addImage() {
    var myImage = new Image();
    
    myImage.src = $('.image-url-input').val();
    // If import is successfull
    myImage.onload = function() {
        $(myImage).addClass("image-option")
        // add click listener
        $(myImage).click(function() {
            imageOptionHandler(this)
        })
        $(".images").append(myImage)
    }; 
    // if image import fails
    myImage.onerror = function() {
        console.log("image import failed.")
    }
    // reset input value
    $('.image-url-input').val("")
}

function toggleMenu() {
    if(data.menuOpen) {
        $(".main-menu").css("right", '-25%')
        $(".toggle-menu").css("transform", "rotate(90deg)")
        data.menuOpen = false;
    } else {
        $(".main-menu").css("right", '0')
        $(".toggle-menu").css("transform", "rotate(-90deg)")
        data.menuOpen = true;
    }
}

// Click listener
$(".pickUrl").on('click', function(e) {
    e.preventDefault()
    addImage()
})


function imageOptionHandler(that) {
  $(".image-option").each(function() {
        $(this).removeClass("active")
    })
    
    $(that).addClass("active")
    changeImage()
}

$("#show-hide-image").change(function() {
    if($(this).is(":checked")) {
        $("#background-image").css("display", "block")
    } else {
        $("#background-image").css("display", "none")
    }
})

$("#show-hide-dots").change(function() {
    if($(this).is(":checked")) {
        data.showDots = true;
    } else {
        data.showDots = false;
    }
    
    draw()
})

$("#show-hide-lines").change(function() {
    if($(this).is(":checked")) {
        data.showLines = true;
    } else {
        data.showLines = false;
    }
    
    draw()
})

$(".set-mode").change(function() {
    var value = $(this).val()
    if(value == "edit") {
        data.mode = "edit"
        data.selectedMode = "edit";
    } else if ( value == "create") {
        data.mode = "create"
        data.selectedMode = "create";
    } else if ( value == "delete") {
        data.mode = "delete";
        data.selectedMode = "delete"
    } else if (value == "draw") {
        data.mode = "draw"
        data.selectedMode = "draw";
    } else if (value == "erase") {
        data.mode = "erase";
        data.selectedMode = "erase";
    }
})

$("#set-drawing-color").change(function() {
    data.drawColor = $(this).val();
}) 

$(".toggle-menu").click(function() {
    toggleMenu()
})

$("#set-draw-size").change(function() {
    var value = $(this).val()
    data.drawRadius = value/2
})

$("#set-eraser-size").change(function() {
    var value = $(this).val()
    data.eraseRadius = value/2
})

$("#reset-canvas").click(function() {
    init()
})

function addDrawing() {
    drawing.push({x: data.mouseX, y: data.mouseY, r: data.drawRadius, color: data.drawColor, shape: draw.drawShape, type: 1})
}

// replace current image with another image
function changeImage() {
    var image = $(".active")
    currentImage = image[0];
    // set image in html
    $("#background-image").css("background-image", "url(" + image[0].src + ")")
    
}

function addPoint(x,y) {
    points.push({x: x, y: y, number: data.currentPos})
    data.currentPos += 1;
    draw()
}

function addErase() {
    drawing.push({x: data.mouseX, y: data.mouseY, r: data.eraseRadius, type: 0})
}

function closestPoint(x, y) {
    var shortest = {point: 0, dist: window.innerWidth * window.innerHeight } // make sure dist is further than any point
    for(var i = 0; i < points.length; i++) {
        
        // check x distance
        var xDiff = Math.abs(x - points[i].x)
        var yDiff = Math.abs(y - points[i].y)
        var finalDiff = Math.sqrt(xDiff * xDiff + yDiff * yDiff)
        if(finalDiff < shortest.dist) {
            shortest.dist = finalDiff;
            shortest.point = i
        }
    }
    return shortest.point
}

function calculatePoint() {
    var point = data.editingPoint;
    // change position of current point
    points[point].x = points[point].x + (data.mouseX - data.lastMousePosX)
    points[point].y = points[point].y + (data.mouseY - data.lastMousePosY)
    data.lastMousePosX = data.mouseX;
    data.lastMousePosY = data.mouseY;
}

// event Listeners 
// =====================================================
document.addEventListener('keydown', function (e) {
    if (e.keyCode == 13) {
        e.preventDefault();
        // call function based on focused element
        if($("#image-url-input")[0] == document.activeElement) {
            addImage()
        }
    }
    // if controll is pressed
    else if (e.keyCode == 17) {
        // data.ctrlPressed = true;
        data.mode = "edit"
    }
    
    else if (e.keyCode == 88) {
        data.mode = "delete"
    }

    else if (e.keyCode == 68) {
        // C pressed. draw mode
        data.mode = "draw";
    }

    else if (e.keyCode == 16) {
        // Shift pressed. Erase mode
        data.mode = "erase";
    }
});

document.addEventListener('keyup', function (e) {
    data.mode = data.selectedMode;
});

document.addEventListener("mousemove", function(e) {
    data.mouseX = e.clientX;
    data.mouseY = e.clientY;
    if(data.mode == "draw" && data.mousedown) {
        addDrawing();
        draw()
    } else if (data.mode == "erase") {
        if(data.mousedown) {
            addErase();
        }
        draw()
    }


})


$("#main-canvas").mousedown(function(e) {
    data.mousedown = true;
    if(data.mode == "edit") {
        data.editingPoint = closestPoint(data.mouseX, data.mouseY)
        data.lastMousePosX = data.mouseX;
        data.lastMousePosY = data.mouseY;
        // start animating
        data.animating = true;
        animate()
        
    } else if (data.mode == "draw") {
        addDrawing()
        draw()
    } else if (data.mode=="edit") {
        data.editingPoint = closestPoint(data.mouseX, data.mouseY)
        data.lastMousePosX = data.mouseX;
        data.lastMousePosY = data.mouseY;
        // start animating
        data.animating = true;
        animate()
    }else if (data.mode == "delete") {
        var point = closestPoint(data.mouseX, data.mouseY);
        points.splice(point, 1)
        draw()
    }else if ( data.mode == "create") {
        addPoint(data.mouseX, data.mouseY)
    }
})

$("#main-canvas").mouseup(function(e) {
    data.mousedown = false
    if(data.mode == "edit") {
        data.animating = false
    }
     data.animating = false
})

// ==========================================================

function drawDots() {
    for(var i = 0; i < points.length; i++) {
        drawCircle({x: points[i].x, y: points[i].y , r: data.dotRadius})
        write({text: i + 1, x: points[i].x - 2, y: points[i].y + 15})
    }
}

function drawLines() {
    if(points.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = data.dotColor;
        ctx.moveTo(points[0].x, points[0].y)
        ctx.lineWidth = data.lineWidth;
        for(var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y)
        }
        ctx.stroke()
    }
}

function drawDrawing() {
    for (var i = 0; i < drawing.length; i++) {
        if(drawing[i].type == 1) {
            drawCircle({x: drawing[i].x, y: drawing[i].y, r: drawing[i].r, color: drawing[i].color})
        } else if (drawing[i].type == 0) {
            ctx.clearRect(drawing[i].x - drawing[i].r, drawing[i].y - drawing[i].r, drawing[i].r * 2, drawing[i].r * 2);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(data.showDrawing) {
        drawDrawing()
    }
    if(data.showDots) {
        drawDots()
    }
    if(data.showLines) {
       drawLines(); 
    }
    if(data.mode == "erase") {
        drawRect({x:data.mouseX - data.eraseRadius, y:data.mouseY - data.eraseRadius, width:data.eraseRadius * 2, height:data.eraseRadius * 2})
    }
    
}

function animate() {
    if(data.animating) {
        draw();
        if(data.mode == "edit") {
            calculatePoint()
        }
        window.requestAnimationFrame(animate);
    }
}