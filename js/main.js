var canvas = document.getElementById('main-canvas');
var ctx = canvas.getContext('2d');

var data = {
    'font-size': '15px', 
    'font-family': 'Georgia',
    'background-color': 'grey',
    menuOpen: true,
    pageHeight: undefined,
    pageWidth: undefined,
    heightRatio: undefined,
    widthRatio: undefined,
    currentPos: 1,
    dotRadius: 2,
    pageMargin: 20,
    showLines: true,
    showDots: true,
    selectedMode: "create",
    shiftPressed: false,
    xPressed: false,
    animating: false,
    editingPoint: undefined,
    lastMousePosX: 0,
    lastMousePosY: 0,
    mode: 'create'
};

var currentImage;


var points = [];

$(function() {
    init()
})

// Canvas size
// ===========================================
function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function init() {
    setCanvasSize()
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

function drawCircle(data) {
    ctx.beginPath();
    ctx.arc(data.x, data.y, data.r, 0, Math.PI * 2, true)
    ctx.fill()
    ctx.stroke()
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
    }
})

$(".toggle-menu").click(function() {
    toggleMenu()
})



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
    
    else if (e.keyCode == 88 || data.mode == "delete") {
        data.mode = "delete"
    }
});

document.addEventListener('keyup', function (e) {
    // if controll is pressed
    if (e.keyCode == 17) {
        // data.ctrlPressed = false
        // reset mode
        data.mode = data.selectedMode;
    }
    
    else if (e.keyCode == 88) {
        // reset mode
        data.mode = data.selectedMode;
    }
});

document.addEventListener("mousemove", function(e) {
    data.mouseX = e.clientX;
    data.mouseY = e.clientY;
})


$("#main-canvas").mousedown(function(e) {
    if(data.mode == "edit") {
        data.editingPoint = closestPoint(data.mouseX, data.mouseY)
        data.lastMousePosX = data.mouseX;
        data.lastMousePosY = data.mouseY;
        // start animating
        data.animating = true;
        animate()
        
    } else if (data.shiftPressed) {
        console.log("shif pressed")
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
    }else {
        addPoint(data.mouseX, data.mouseY)
    }
})

$("#main-canvas").mouseup(function(e) {
    if(data.mode == "edit") {
        data.animating = false
    }
     data.animating = false
})

// ==========================================================

function drawImage() {
    if(currentImage) {
        ctx.drawImage(currentImage, data.pageMargin, data.pageMargin, currentImage.width * data.heightRatio, currentImage.height * data.heightRatio);
    }
    
}

function drawDots() {
    for(var i = 0; i < points.length; i++) {
        drawCircle({x: points[i].x, y: points[i].y , r: data.dotRadius})
        write({text: i + 1, x: points[i].x - 2, y: points[i].y + 15})
    }
}

function drawLines() {
    if(points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y)
        for(var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y)
        }
        ctx.stroke()
    }
}

// function drawOutline() {
    
//     var width = currentImage.width;
//     var height = currentImage.height;
    
//     data.heightRatio = (window.innerHeight - (data.pageMargin * 2 )) / height;
//     data.widthRatio = (window.innerWidth - (data.pageMargin * 2 )) / width;
//     // check if width or height should be the defining size
//     if(height * data.widthRatio > window.innerHeight) {
//         // use height ratio
//         drawRect({x:data.pageMargin, y: data.pageMargin, width: width * data.heightRatio, height: height * data.heightRatio })
//     } else {
//         // Use width ratio
//         drawRect({x:data.pageMargin, y: data.pageMargin, width: width * data.widthRatio, height: height * data.widthRatio })
//     }
// }


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(data.showDots) {
        drawDots()
    }
    if(data.showLines) {
       drawLines(); 
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