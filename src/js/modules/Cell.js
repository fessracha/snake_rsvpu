// Задаем конструктор Block (ячейка)
var Block = function (col, row) {
    this.col = col;
    this.row = row;
};
// Рисуем квадрат в позиции ячейки
Block.prototype.drawSquare = function (color) {
    var x = this.col * block_size;
    var y = this.row * block_size;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, block_size, block_size);
};
// Рисуем круг в позиции ячейки
Block.prototype.drawCircle = function (color) {
    var centerX = this.col * block_size + block_size / 2;
    var centerY = this.row * block_size + block_size / 2;
    ctx.fillStyle = color;
    circle(centerX, centerY, block_size / 2, true);
};
// Проверяем, находится ли эта ячейка в той же позиции, что и ячейка
// otherBlock
Block.prototype.equal = function (otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
};