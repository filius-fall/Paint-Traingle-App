window.onload = function () {

    var canvas = document.getElementById("myCanvas");
    var clr_button = document.getElementById("clear");
    var is_active = false;
    var starting_cordinates = null;
    var ending_cordinates = null;
    var context = canvas.getContext("2d");
    var data = [];
    var bool_value = false;
    var dragged_value = 0;
    var randomColor = null;
    var XYcordinates = {
        x: 0,
        y: 0
    };

    canvas.addEventListener('dblclick', function (e) {

        var pos = get_pointer_cordinates(canvas, e);
        data.forEach(function (value) {
            var Area = findArea(value[0][0], value[0][1], value[1][0], value[1][1], value[2][0], value[2][1]);
            var Area1 = findArea(value[0][0], value[0][1], pos.x, pos.y, value[2][0], value[2][1]);
            var Area2 = findArea(value[0][0], value[0][1], value[1][0], value[1][1], pos.x, pos.y);
            var Area3 = findArea(pos.x, pos.y, value[1][0], value[1][1], value[2][0], value[2][1]);
            if (Math.round(Area) === Math.round(Area1 + Area2 + Area3)) {
                var newList = [];
                var item = data[data.indexOf(value)];
                data.forEach(function (value2) {
                    if (value2 !== item) {
                        newList.push(value2);
                    }
                });
                data = newList;
                clear_all();
                data.forEach(function (value2) {
                    move_triangle(value2[0][0], value2[0][1], value2[4], value2[3]);
                });
                return true;
            }
        });
        is_active = false;

    });


    canvas.addEventListener('mousedown', function (e) {
        canvas.style.cursor = 'move';
        e.preventDefault();
        var mousePos = get_pointer_cordinates(canvas, e);
        starting_cordinates = mousePos;
        ending_cordinates = mousePos;
        is_active = true;
        bool_value = checkIfInside(mousePos);
        starting_cordinates = mousePos;
        ending_cordinates = mousePos;
        randomColor = getrandomColor();
        if (data.length > 0) {
            XYcordinates.x = data[dragged_value][0][0] - mousePos.x;
            XYcordinates.y = data[dragged_value][0][1] - mousePos.y
        }
        console.log(XYcordinates);
    });


    canvas.addEventListener('mousemove', function (e) {

        ending_cordinates = get_pointer_cordinates(canvas, e);

        if (is_active && bool_value) {
            clear_all();
            canvas.style.cursor = 'ne-resize';
            move_triangle(starting_cordinates.x, starting_cordinates.y, calculateLineDistance(starting_cordinates.x, starting_cordinates.y, ending_cordinates.x, ending_cordinates.y), randomColor);
            data.forEach(function (value) {
                move_triangle(value[0][0], value[0][1], value[4], value[3]);
            });
        } else if (is_active) {
            canvas.style.cursor = 'crosshair';
            clear_all();
            
            var item = data[dragged_value];
            var difX = ending_cordinates.x - item[0][0] + XYcordinates.x;
            var difY = ending_cordinates.y - item[0][1] + XYcordinates.y;
            item[0][0] += difX;
            item[0][1] += difY;
            item[1][0] += difX;
            item[1][1] += difY;
            item[2][0] += difX;
            item[2][1] += difY;
            move_triangle(item[0][0], item[0][1], item[4], item[3]);
            data.forEach(function (value) {
                if (value[0][0] !== starting_cordinates.x && value[0][1] !== starting_cordinates.y) {
                    move_triangle(value[0][0], value[0][1], value[4], value[3]);
                }
            });
        }

    }, true);

    canvas.addEventListener('mouseup', function (e) {
        canvas.style.cursor = 'pointer';
        var mousePos = get_pointer_cordinates(canvas, e);
        if (!bool_value) {
            is_active = false;
            bool_value = false;
            drag_translation(mousePos.x, mousePos.y);
        } else if (is_active && calculateLineDistance(starting_cordinates.x, starting_cordinates.y, ending_cordinates.x, ending_cordinates.y) > 2) {
            is_active = false;
            bool_value = false;
            // getting the end mouse position
            ending_cordinates = mousePos;
            drawTriangle(1, starting_cordinates.x, starting_cordinates.y, ending_cordinates.x, ending_cordinates.y);
        }

    });


    clr_button.addEventListener('click', function () {

        data = [];
        clear_all();

    });

    function checkIfInside(pos) {

        bool_value = true;
        data.forEach(function (value) {
            var Area = findArea(value[0][0], value[0][1], value[1][0], value[1][1], value[2][0], value[2][1]);
            var Area1 = findArea(value[0][0], value[0][1], pos.x, pos.y, value[2][0], value[2][1]);
            var Area2 = findArea(value[0][0], value[0][1], value[1][0], value[1][1], pos.x, pos.y);
            var Area3 = findArea(pos.x, pos.y, value[1][0], value[1][1], value[2][0], value[2][1]);
            if (Math.round(Area) === Math.round(Area1 + Area2 + Area3)) {
                dragged_value = data.indexOf(value);
                bool_value = false;
                return true;
            }
        });
        return bool_value;

    }

    function findArea(x1, y1, x2, y2, x3, y3) {

        return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0);

    }


    function drag_translation(newx, newy) {

        var item = data[dragged_value];
        var difX = newx - item[0][0] + XYcordinates.x;
        var difY = newy - item[0][1] + XYcordinates.y;
        item[0][0] += difX;
        item[0][1] += difY;
        item[1][0] += difX;
        item[1][1] += difY;
        item[2][0] += difX;
        item[2][1] += difY;
        data.splice(dragged_value, 0, item);
        clear_all();
        data.forEach(function (value) {
            move_triangle(value[0][0], value[0][1], value[4], value[3]);
        });

    }

    function clear_all() {

        context.clearRect(0, 0, canvas.width, canvas.height);

    }


    function get_pointer_cordinates(canvas, event) {

        var bounds = canvas.getBoundingClientRect();
        return {

            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top

        };

    }

    function calculateLineDistance(x1, y1, x2, y2) {

        return Math.round(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));

    }

    function move_triangle(x1, y1, distance, color) {

        var height = 1.414 * (distance);
  
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x1 + distance / 2, y1 + height);
        context.lineTo(x1 - distance / 2, y1 + height);
        context.moveTo(x1, y1);
        context.fillStyle = color;
        context.fill();
        context.stroke();

    }

    function drawTriangle(mode, x1, y1, x2, y2) {

      
        var distance = calculateLineDistance(x1, y1, x2, y2);
     
        var height = 1.414 * (distance) * mode;
   
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x1 + distance / 2, y1 + height);
        context.lineTo(x1 - distance / 2, y1 + height);
        context.moveTo(x1, y1);
        context.fillStyle = randomColor;
        context.fill();
        context.stroke();
        
        data.push([[x1, y1], [x1 + distance / 2, y1 + height * 1.25], [x1 - distance / 2, y1 + height * 1.25], [context.fillStyle], [distance]]);


    }

    function getrandomColor() {
        var r = Math.ceil(Math.random() * 256);
        var g = Math.ceil(Math.random() * 256);
        var b = Math.ceil(Math.random() * 256);
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }

};