var fns = {
    'pg1': 'y=x+5',
    'pg2': 'y=x*x',
    'pg3': 'y=1/x',
    'pg4': 'y=Math.pow(2,x)',
    'pg5': 'y=Math.log(x)',
    'pg6': 'y=Math.sin(x)'
}
var expressions = [];
var colors = {
    'pg1': 'black',
    'pg2': 'blue',
    'pg3': 'red',
    'pg4': 'gray',
    'pg5': 'green',
    'pg6': 'orange',
}
var expDiv = document.getElementById('input');
var editBox = document.getElementById('editBox')
var ratios = [60, 30, 20, 15, 12, 10, 6, 5, 4, 3, 2, 1]; //放缩可选值
var index = 4;
var ratio = ratios[index]; //每个小格子
var RATIO = ratio;
var gap = 12; //左右上下间隔
var spotGap = ratio / 200;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.translate(0.5, 0.5); //移动原点位置
var width = canvas.width;
var height = canvas.height;

function drawGrid() {
    //竖线不加粗
    for (var i = 0; i < width; i++) {
        ctx.strokeStyle = " #E8E8E8";
        var start = gap + i * ratio;
        ctx.beginPath();
        ctx.moveTo(start, 0);
        ctx.lineTo(start, height - 5);
        ctx.stroke();
    }
    //横线包括加粗
    for (var i = 0; i < height; i++) {
        ctx.strokeStyle = " #E8E8E8";
        ctx.lineWidth = 1;
        var start = gap + i * ratio;
        if (i % 5 === 0) {
            ctx.strokeStyle = 'black';
        }
        if (2 * start === height) {
            ctx.lineWidth = 2;
        }
        ctx.beginPath();
        ctx.moveTo(0, start);
        ctx.lineTo(width, start);
        ctx.stroke();
    }
    //素线加粗
    for (var i = 0; i < width; i++) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        var start = gap + 5 * i * ratio;
        if (2 * start === height) ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(start, 0);
        ctx.lineTo(start, height - 5);
        ctx.stroke();
    }
}
//处理输入，判断是否合理
function testExpression(expression) {
    // var re1 = /[^Math.][A-WY-Za-wy-z]+/; //非x字母连续
    // var re2 = /xx+/; //多个x重叠
    // var re3 = /Math\./

    if (expression.length < 3) {
        return false;
    } else {
        return true;
    }
}

function evil(str) {
    var fn = Function;
    return new fn('return ' + str)();
}

function drawFormula(spotGap, expression, color, isFirst) {
    if (!isFirst && testExpression(expression)) {
        isFirst = false;
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        var halfWidth = width / 2;
        for (var i = (-halfWidth / spotGap); i < halfWidth / spotGap; i++) {
            var x = (i * spotGap); //以(312,312)为原点的坐标x
            eval(expression); // y = x+1;
            var factX = +x;
            x = factX / ratio;
            eval(expression);
            y = y * ratio;
            var limitWidth = 1.1 * halfWidth;
            if (-limitWidth <= y && y <= limitWidth) {
                ctx.moveTo(halfWidth + factX, halfWidth - y);
                x = factX;
                factX = (x + spotGap);
                x = factX / ratio;
                eval(expression);
                y = y * ratio;
                if (-limitWidth <= y && y <= limitWidth) {
                    ctx.lineTo(halfWidth + factX, halfWidth - y);
                }
            }
        }
        ctx.stroke();
        ctx.closePath()
    }
}

function clickExample() {
    var examples = document.getElementsByClassName('example');
    [].slice.apply(examples).forEach(v => {
        v.onclick = addExpression;
    })
}

function addExpression(e) {
    var id = e.target.id;
    var len = expressions.length;
    if (len == 6) {
        alert('Please delete a existing expression');
        return false;
    } else {
        var obj = {};
        obj[id] = fns[id];
        expressions.push(obj);
        createExpression(fns[id], id);
        drawFormula(spotGap, fns[id], colors[id]);
    }
}
//颜色如何保持？
function showExpressions() {
    var input = [].slice.call(document.getElementsByTagName('input'));
    expressions.forEach((v, i) => {
        var key = Object.keys(v)[0];
        drawFormula(spotGap, v[key], colors[key]);
    })
}

function createExpression(expression, id) {
    var exp = document.createElement('div');
    var p = document.createElement('p');
    var input = document.createElement('input');
    var y = document.createElement('span');
    var deleteBtn = document.createElement('button');
    var len = expressions.length;
    deleteBtn.innerHTML = 'X';
    deleteBtn.className = 'deleteExpBtn';
    deleteBtn.setAttribute('data-id', id);
    y.className = 'span';
    y.innerHTML = 'y=';
    input.style.color = y.style.color = colors['pg' + len];
    input.setAttribute('data-id', id);
    p.className = 'expTitle';
    p.innerHTML = '表达式 ' + len;
    exp.appendChild(p);
    exp.className = 'expression';
    exp.setAttribute('data-id', id)
    input.value = expression.slice(2);
    y.appendChild(input);
    expDiv.appendChild(exp);
    exp.appendChild(y);
    y.appendChild(deleteBtn);
    input.onclick = editFormula;
    deleteBtn.onclick = deleteExpression;
    changeExpNumber();
}

function deleteExpression(e) {
    //删除表达式
    editBox.className = 'hidden';
    var deleteExpBtn = e.target;
    var deleteExpId = deleteExpBtn.getAttribute("data-id");
    var deletedInput = document.querySelector(`input[data-id=${deleteExpId}]`)
    var deletedExp = deletedInput.value;
    var len = expressions.length
    for (var i = 0; i < len; i++) {
        var expression = expressions[i];
        var key = Object.keys(expression)[0];
        if (expression[key].slice(2) === deletedExp) {
            expressions.splice(i, 1);
            break;
        }
    }
    var inputDiv = document.getElementById('input');
    var removedChild = document.querySelector(`div[data-id=${deleteExpId}]`)
    inputDiv.removeChild(removedChild);
    changeExpNumber();
    reNumberExp();
    reflow();

}

function changeExpNumber() {
    var number = document.getElementById('expNumber');
    number.innerHTML = expressions.length;
}

function reNumberExp() {
    var expTitles = [].slice.call(document.getElementsByClassName('expTitle'));
    expTitles.forEach((v, i) => {
        v.innerHTML = "表达式" + (i + 1);
    })
}

function clickChangeExpNumber() {
    var clickNumber = document.getElementById('addExpBox');
    clickNumber.onclick = () => {
        editBox.className = 'hidden';
        var expression = 'y=';
        var id = "pg" + (expressions.length + 1);
        if (expressions.length == 6) {
            alert("to the limit")
        } else {
            var obj = {};
            obj[id] = expression;
            expressions.push(obj);
            createExpression(expression, id);
            drawFormula(spotGap, expression, colors[id], true);
        }
    }
}

function editFormula(e) {
    e.target.focus();
    var pos = e.target.getBoundingClientRect();
    var x = pos.x
    var y = pos.y
    var inputGap = 25;
    editBox.style.left = x + "px";
    editBox.style.top = y + inputGap + "px";
    editBox.className = 'appear';
    var btns = document.getElementsByClassName('inputBtn');
    [].slice.call(btns).forEach((V) => {
        V.onclick = function(event) {
            e.target.value += event.target.innerHTML;
            e.target.focus();
            editBox.className = 'appear';
        }
    })
    //input click Event
    var input = e.target;
    var len = expressions.length;
    var enterButtons = [].slice.call(document.getElementsByClassName('enterBtn'));
    enterButtons.forEach(v => {
        v.onclick = () => enterExpression(input);
    })
    //删除操作
    var deleteBtn = document.getElementsByClassName('deleteBtn')[0];
    deleteBtn.onclick = () => {
        input.value = input.value.slice(0, -1)
    }
}
//点击enter后的操作
function enterExpression(input) {
    editBox.className = 'hidden';
    var id = input.getAttribute('data-id');
    var newExpression = 'y=' + input.value;
    expressions.forEach((v, i) => {
        var key = Object.keys(v)[0];
        if (key === id) expressions[i][key] = newExpression
    })
    reflow();
}
//放大缩小还原有无网格
function controller() {
    var grow = document.getElementById('grow');
    grow.onclick = function() {
        if (index > 0) {
            index--;
            ratio = ratios[index];
            reflow()
        } else alert('To the limit,Please shrink');
    }
    var shrink = document.getElementById('shrink');
    shrink.onclick = function() {
        if (index < 11) {
            index++;
            ratio = ratios[index];
            reflow()
        } else alert('To the limit,Please magnify');
    }
    var isGrid = document.getElementById('isGrid');
    var isgrid = true;
    isGrid.onclick = function() {
        if (isgrid) {
            ctx.clearRect(0, 0, width, height);
            drawPixel();
            showExpressions()
            isgrid = false;
        } else {
            reflow();
            isgrid = true;
        }
    }
    var restore = document.getElementById('restore');
    restore.onclick = function() {
        ratio = RATIO;
        reflow()
    }
}

function reflow() {
    ctx.clearRect(0, 0, width, height);
    drawGrid();
    drawPixel();
    showExpressions()
}
//画网格


function drawPixel() {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, width / 2);
    ctx.lineTo(width, width / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, width);
    ctx.stroke();
    //添加数字
    var leftNumber = -(width - 2 * gap) / 2 / ratio;
    for (var i = 0; i < width; i++) {
        var numStr = '' + (leftNumber + i * 5);
        if (numStr === '0') {
            ctx.fillText(numStr, gap + 5 * i * ratio, width / 2 + gap)
        } else {
            ctx.fillText(numStr, gap + 5 * i * ratio, width / 2 + gap)
            ctx.fillText('' + -numStr, width / 2, 5 * i * ratio + gap)
        }
    }
}
window.onload = function() {
    clickExample();
    drawGrid();
    drawPixel();
    controller();
    clickChangeExpNumber();
}
window.onkeydown = function(e) {
    if (editBox.className === 'appear' && e.keyCode === 13) {
        document.getElementsByClassName('enterBtn')[0].click();
        var input = [].slice.call(document.getElementsByTagName('input'))
        input.forEach(v => {
            v.blur();
        })
    }
}