var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;
var block_size = 10;
var score = 0;
var widthInBlocks = width / block_size;
var heightInBlocks = height / block_size;

var drawBorder = function () { 
	ctx.fillStyle = "Gray";
	ctx.fillRect(0,0, width, block_size);
	ctx.fillRect(0, height-block_size, width, block_size);
	ctx.fillRect(0,0, block_size, height);
	ctx.fillRect(width-block_size,0, block_size, height);
}

// Выводим счет игры в левом верхнем углу
var drawScore = function () {
	ctx.font = "20px Courier";
	ctx.fillStyle = "Black";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Счет: " + score, block_size, block_size);
};

var gameOver = function () {
	clearInterval(intervalId);
	ctx.font = "60px Courier";
	ctx.fillStyle = "Black";
	ctx.textAlign = "center";
	ctx.textBaseLine = "middle";
	ctx.fillText("Конец игры", width/2, height/2);
}

var circle = function(x,y, radius, fillCircle) {
	ctx.beginPath();
	ctx.arc(x,y,radius,0,Math.PI*2, false);
	if(fillCircle) {
		ctx.fill();
	} else {
		ctx.stroke();
	}
}


// Создаем объект-змейку и объект-яблоко
var snake = new Snake();
var apple = new Apple();
// Запускаем функцию анимации через setInterval
var intervalId = setInterval(function () {
	ctx.clearRect(0, 0, width, height);
	drawScore();
	snake.move();
	snake.draw();
	apple.draw();
	drawBorder();
}, 100);
// Преобразуем коды клавиш в направления
var directions = {
	37: "left",
	38: "up",
	39: "right",
	40: "down"
};
// Задаем обработчик события keydown (клавиши-стрелки)
$("body").keydown(function (event) {
	var newDirection = directions[event.keyCode];
	if (newDirection !== undefined) {
		snake.setDirection(newDirection);
	}
});
