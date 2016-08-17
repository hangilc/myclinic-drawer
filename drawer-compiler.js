"use strict";

var drawerOps = require("./drawer-ops");
var Box = require("./drawer-box");

function DrawerCompiler(){
    this.ops = [];
    this.fontDict = {}; // name => size
    this.pointDict = {};
    this.boxDict = {};
    this.currentFontSize = null;
}

module.exports = DrawerCompiler;

function sum(list, key){
    return list.reduce(function(val, item){
        if( key === undefined ){
            return val + item;
        } else {
            return val + item[key];
        }
    }, 0);
}

function isHankaku(code){
    return (code >= 0xff61 && code <= 0xff64) ||
        (code >= 0xff65 && code <= 0xff9f) ||
        (code >= 0xffa0 && code <= 0xffdc) ||
        (code >= 0xffe8 && code <= 0xffee);
}

function charWidth(code, fontSize){
    if( code < 256 || isHankaku(code) ){
        return fontSize/2;
    } else {
        return fontSize;
    }
}

function measureChars(str, fontSize){
    return str.split("").map(function(ch){
        return {
            ch: ch,
            width: charWidth(ch.charCodeAt(0), fontSize)
        }
    })
}

function calcTotalWidth(mes){
    return sum(mes, "width");
}

DrawerCompiler.measureChars = measureChars;

function min(args){
    return Math.min.apply(Math, args);
}

function max(args){
    return Math.max.apply(Math, args);
}

function breakLines(str, width, fontSize){
    var parts = measureChars(str, fontSize);
    var i, len;
    var lines = [];
    var curChars = [], curWidth = 0, nextWidth, part;
    for(i=0,len=parts.length;i<len;){
        part = parts[i];
        if( curWidth === 0 ){
            if( part.ch === " " ){
                i += 1;
            } else {
                curChars.push(part.ch);
                curWidth = part.width;
                i += 1;
            }
        } else {
            nextWidth = curWidth + part.width;
            if( nextWidth > width ){
                lines.push(curChars.join(""));
                curChars = [];
                curWidth = 0;
            } else {
                curChars.push(part.ch);
                curWidth = nextWidth;
                i += 1;
            }
        }
    }
    if( curChars.length > 0 ){
        lines.push(curChars.join(""));
    }
    if( lines.length === 0 ){
        lines = [""];
    }
    return lines;
}

DrawerCompiler.breakLines = breakLines;

DrawerCompiler.prototype.getOps = function(){
    return this.ops;
}

DrawerCompiler.prototype.moveTo = function(x, y){
    this.ops.push(drawerOps.moveTo(x, y));
};

DrawerCompiler.prototype.lineTo = function(x, y){
    this.ops.push(drawerOps.lineTo(x, y));
};

DrawerCompiler.prototype.line = function(x1, y1, x2, y2){
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
};

DrawerCompiler.prototype.rectangle = function(left, top, right, bottom){
    this.moveTo(left, top);
    this.lineTo(right, top);
    this.lineTo(right, bottom);
    this.lineTo(left, bottom);
    this.lineTo(left, top);
};

DrawerCompiler.prototype.box = function(box){
    this.rectangle(box.left(), box.top(), box.right(), box.bottom());
}

DrawerCompiler.prototype.createFont = function(name, fontName, fontSize, weight, italic){
    if( name in this.fontDict ) return;
    this.ops.push(drawerOps.createFont(name, fontName, fontSize, weight, italic));
    this.fontDict[name] = fontSize;
};

DrawerCompiler.prototype.setFont = function(name){
    this.ops.push(drawerOps.setFont(name));
    this.currentFontSize = this.fontDict[name];
};

function composeXs(mes, left, extra){
    var i, n = mes.length, xs = [];
    for(i=0;i<n;i++){
        xs.push(left);
        left += mes[i].width;
        if( extra ){
            left += extra;
        }
    }
    return xs;
}

function composeYs(nchars, top, fontSize, extra){
    var ys = [];
    var i;
    for(i=0;i<nchars;i++){
        ys.push(top);
        top += fontSize;
        if( extra ){
            top += extra;
        }
    }
    return ys;
}

DrawerCompiler.prototype.textAt = function(text, x, y, halign, valign, opt){
    if( opt === undefined ) opt = {};
    var extraSpace = opt.extraSpace || 0;
    var fontSize = this.getCurrentFontSize();
    var mes = measureChars(text, fontSize);
    var totalWidth = sum(mes, "width") + (text.length > 1 ? (text.length - 1) * extraSpace : 0);
    var left, top;
    switch(halign){
        case "left": left = x; break;
        case "center": left = x - totalWidth/2.0; break;
        case "right": left = x - totalWidth; break;
        default: throw new Error("invalid halign: " + halign);
    }
    switch(valign){
        case "top": top = y; break;
        case "center": top = y - fontSize/2; break;
        case "bottom": top = y - fontSize; break;
        default: throw new Error("invalid valign: " + valign);
    }
    var xs = composeXs(mes, left, extraSpace);
    var ys = top;
    this.ops.push(drawerOps.drawChars(text, xs, ys));
    return new Box(left, top, left + totalWidth, top + fontSize);
}

DrawerCompiler.prototype.textAtJustified = function(text, left, right, y, valign){
    var fontSize = this.getCurrentFontSize();
    var mes = measureChars(text, fontSize);
    var totalWidth = sum(mes, "width");
    var top, extra, xs;
    if( text.length < 2 ){
        return this.textAt(text, left, y, "left", valign);
    } else {
        switch(valign){
            case "top": top = y; break;
            case "center": top = y - fontSize/2; break;
            case "bottom": top = y - fontSize; break;
            default: throw new Error("invalid valign: " + valign);
        }
        extra = ((right - left) - totalWidth) / (text.length - 1);
        xs = composeXs(mes, left, extra);
        this.ops.push(drawerOps.drawChars(text, xs, top));
        return new Box(left, top, right, top + fontSize);
    }
}

DrawerCompiler.prototype.textAtVert = function(text, x, y, halign, valign){
    var fontSize = this.getCurrentFontSize();
    var mes = measureChars(text, fontSize);
    var totalHeight = fontSize * mes.length;
    var xs, top, ys;
    xs = mes.map(function(m){
        switch(halign){
            case "left": return x;
            case "center": return x - m.width / 2.0;
            case "right": return x - m.width;
            default: throw new Error("invalid halign: " + halign);
        }
    });
    switch(valign){
        case "top": top = y; break;
        case "center": top = y - totalHeight/2; break;
        case "bottom": top = y - totalHeight; break;
        default: throw new Error("invalid valign: " + valign);
    }
    ys = composeYs(mes.length, top, fontSize);
    this.ops.push(drawerOps.drawChars(text, xs, ys));
    return new Box(min(xs), top, max(xs), top + totalHeight);
}

DrawerCompiler.prototype.textAtVertJustified = function(text, x, top, bottom, halign){
    var fontSize = this.getCurrentFontSize();
    var mes = measureChars(text, fontSize);
    var xs, ys, totalHeight, extra;
    if( text.length < 2 ){
        return this.textAt(text, x, top, halign, "top");
    } else {
        xs = mes.map(function(m){
            switch(halign){
                case "left": return x;
                case "center": return x - m.width / 2.0;
                case "right": return x - m.width;
                default: throw new Error("invalid halign: " + halign);
            }
        });
        totalHeight = fontSize * mes.length;
        extra = ((bottom - top) - totalHeight) / (mes.length - 1);
        ys = composeYs(mes.length, top, fontSize, extra);
        this.ops.push(drawerOps.drawChars(text, xs, ys));
        return new Box(min(xs), top, max(xs), bottom);
    }
}

DrawerCompiler.prototype.textIn = function(text, box, halign, valign, direction){
    var x, y;
    if( halign !== "justified" ){
        switch(halign){
            case "left": x = box.left(); break;
            case "center": x = box.cx(); break;
            case "right": x = box.right(); break;
            default: throw new Error("invalid halign:" + halign);
        }
    }
    if( valign !== "justified" ){
        switch(valign){
            case "top": y = box.top(); break;
            case "center": y = box.cy(); break;
            case "bottom": y = box.bottom(); break;
            default: throw new Error("invalid valign: " + valign);
        }
    }
    if( direction === undefined ) direction = "horizontal";
    if( direction === "horizontal" ){
        if( halign === "justified" ){
            return this.textAtJustified(text, box.left(), box.right(), y, valign);
        } else {
            return this.textAt(text, x, y, halign, valign);
        }
    } else if( direction === "vertical" ){
        if( valign === "justified" ){
            return this.textAtVertJustified(text, x, box.top(), box.bottom(), halign);
        } else {
            return this.textAtVert(text, x, y, halign, valign);
        }
    } else {
        throw new Error("invalid direction: " + direction);
    }
}

DrawerCompiler.prototype.textInEvenColumns = function(text, box, nCols, justifyTo){
    var textLength = text.length, i, cols, j;
    if( justifyTo === undefined ){
        justifyTo = "left";
    }
    if( justifyTo === "left" ){
        i = 0;
    } else if( justifyTo === "right" ){
        i = nCols - textLength;
        if( i < 0 ){
            console.log("too few columns in textInEvenColumns", text, nCols)
            throw new Error("too few columns");
        }
    } else {
        throw new Error("invalid justifyTo: " + justifyTo);
    }
    cols = box.splitToEvenColumns(nCols);
    for(j=0;i<nCols;i++,j++){
        this.textIn(text[j], cols[i], "center", "center");
    }
}

DrawerCompiler.prototype.setTextColor = function(r, g, b){
    if( r instanceof Array ){
        (function(){
            var color = r;
            r = color[0];
            g = color[1];
            b = color[2];
        })();
    }
    this.ops.push(["set_text_color", r, g, b]);
};

DrawerCompiler.prototype.createPen = function(name, r, g, b, width){
    if( r instanceof Array ){
        (function(){
            var color = r;
            width = g === undefined ? 0.1 : g;
            r = color[0];
            g = color[1];
            b = color[2];
        })();
    } else {
        if( width === undefined ){
            width = 0.1;
        }
    }
    this.ops.push(["create_pen", name, r, g, b, width]);
};

DrawerCompiler.prototype.setPen = function(name){
    this.ops.push(["set_pen", name]);
};

DrawerCompiler.prototype.getCurrentFont = function(){
    return this.currentFont;
};

DrawerCompiler.prototype.getFontInfo = function(name){
    return this.fontDict[name];
};

DrawerCompiler.prototype.getCurrentFontInfo = function(){
    return this.fontDict[this.currentFont];
}

DrawerCompiler.prototype.getCurrentFontSize = function(){
    if( this.currentFontSize === null ){
        throw new Error("cannot resolve current font size");
    }
    return this.currentFontSize;
}

DrawerCompiler.prototype.setPoint = function(name, x, y){
    this.pointDict[name] = {x:x, y:y};
};

DrawerCompiler.prototype.getPoint = function(name){
    return this.pointDict[name];
};

DrawerCompiler.prototype.setBox = function(name, box){
    this.boxDict[name] = box.clone();
};

DrawerCompiler.prototype.getBox = function(name){
    return this.boxDict[name];
};

DrawerCompiler.prototype.frameRight = function(box){
    this.line(box.right(), box.top(), box.right(), box.bottom());
};

DrawerCompiler.prototype.frameTop = function(box){
    this.line(box.left(), box.top(), box.right(), box.top());
};

DrawerCompiler.prototype.frameBottom = function(box){
    this.line(box.left(), box.bottom(), box.right(), box.bottom());
};

DrawerCompiler.prototype.frameCells = function(cells){
    cells.forEach(function(cols){
        cols.forEach(function(cell){
            this.box(cell);
        }.bind(this))
    }.bind(this));
};

DrawerCompiler.prototype.frameColumnsRight = function(cells, icol, opt){
    var rowSize = cells.length;
    var topCell = cells[0][icol];
    var botCell = cells[rowSize-1][icol];
    var top = topCell.top();
    var bot = botCell.bottom();
    var x = topCell.right();
    if( opt.dx ){
        x += opt.dx;
    }
    this.line(x, top, x, bot);
}

DrawerCompiler.prototype.drawEvenInnerColumnBorders = function(box, nRows){
    var left = box.left(), top = box.top(), bottom = box.bottom(),
        w = box.width() / nRows;
    var i, x;
    for(i=1;i<nRows;i++){
        x = left + w * i;
        this.line(x, top, x, bottom);
    }
};

DrawerCompiler.prototype.drawInnerColumnBorders = function(boxes){
    var i, n = boxes.length - 1;
    for(i=0;i<n;i++){
        this.frameRight(boxes[i]);
    }
}

DrawerCompiler.prototype.multilineText = function(texts, box, halign, valign, leading){
    if( !texts ){
        texts = [];
    }
    if( leading === undefined ){
        leading = 0;
    }
    var fontSize = this.getCurrentFontSize();
    var nLines = texts.length;
    var y;
    switch(valign){
        case "top": y = box.top(); break;
        case "center": y = box.top() + (box.height() - calcTotalHeight())/ 2; break;
        case "bottom": y = box.top() + box.height() - calcTotalHeight(); break;
        default: throw new Error("invalid valign: " + valign);
    }
    var x;
    switch(halign){
        case "left": x = box.left(); break;
        case "center": x = box.cx(); break;
        case "right": x = box.right(); break;
        default: throw new Error("invalid halign: " + halign);
    }
    var bound = null, render;
    texts.forEach(function(line){
        render = this.textAt(line, x, y, halign, "top");
        bound = Box.boundingBox(bound, render);
        y += fontSize + leading;
    }.bind(this));
    return bound;
    
    function calcTotalHeight(){
        return fontSize * nLines + leading * (nLines - 1);
    }
}

DrawerCompiler.prototype.measureText = function(text){
    var fontSize = this.getCurrentFontSize();
    var mes = measureChars(text, fontSize);
    return {
        cx: sum(mes, "width"),
        cy: fontSize
    };
}

DrawerCompiler.prototype.breakLines = function(text, width, fontSize){
    if( fontSize === undefined ) fontSize = this.getCurrentFontSize();
    return breakLines(text, width, fontSize);
}
