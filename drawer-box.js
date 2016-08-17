"use strict";

function Box(left, top, right, bottom){
	this.left_ = left;
	this.top_ = top;
	this.right_ = right;
	this.bottom_ = bottom;
}

Box.prototype.clone = function(){
	return new Box(this.left_, this.top_, this.right_, this.bottom_);
}

Box.prototype.innerBox = function(left, top, right, bottom){
	return new Box(this.left_ + left, this.top_ + top, this.left_ + right, this.top_ + bottom);
};

Box.prototype.left = function(){
	return this.left_;
};

Box.prototype.top = function(){
	return this.top_;
};

Box.prototype.right = function(){
	return this.right_;
};

Box.prototype.bottom = function(){
	return this.bottom_;
};

Box.prototype.width = function(){
	return this.right_ - this.left_;
};

Box.prototype.height = function(){
	return this.bottom_ - this.top_;
};

Box.prototype.cx = function(){
	return (this.left_ + this.right_)/2;
};

Box.prototype.cy = function(){
	return (this.top_ + this.bottom_)/2;
};

Box.prototype.setLeft = function(left){
	this.left_ = left;
	return this;
};

Box.prototype.displaceLeftEdge = function(dx){
    this.left_ += dx;
    return this;
}

Box.prototype.setTop = function(top){
	this.top_ = top;
	return this;
}

Box.prototype.setRight = function(right){
	this.right_ = right;
	return this;
};

Box.prototype.displaceRightEdge = function(dx){
    this.right_ += dx;
    return this;
}

Box.prototype.setBottom = function(bottom){
	this.bottom_ = bottom;
	return this;
}

Box.prototype.inset = function(dx, dy){
	if( dy === undefined ){
		dy = dx;
	}
	this.left_ += dx;
	this.top_ += dy;
	this.right_ -= dx;
	this.bottom_ -= dy;
	return this;
};

Box.prototype.inset4 = function(dxLeft, dyTop, dxRight, dyBottom){
	this.left_ += dxLeft;
	this.top_ += dyTop;
	this.right_ -= dxRight;
	this.bottom_ -= dyBottom;
	return this;
};

Box.prototype.shift = function(dx, dy){
	this.left_ += dx;
	this.top_ += dy;
	this.right_ += dx;
	this.bottom_ += dy;	
	return this;
};

Box.prototype.shiftUp = function(dy){
	return this.shift(0, -dy);
};

Box.prototype.shiftDown = function(dy){
	return this.shift(0, dy);
};

Box.prototype.shiftToRight = function(dx){
	return this.shift(dx, 0);
}

Box.prototype.shiftToLeft = function(dx){
	return this.shift(-dx, 0);
}

Box.prototype.shrinkWidth = function(dx, anchor){
	var half;
	switch(anchor){
		case "left": this.right_ -= dx; break;
		case "center": half = dx/2; this.left_ += dx; this.right_ -= dx; break;
		case "right": this.left_ += dx; break;
		default: throw new Error("invalid anchor:" + anchor);
	}
	return this;
};

Box.prototype.shrinkHeight = function(dy, anchor){
	var half;
	switch(anchor){
		case "top": this.bottom_ -= dy; break;
		case "center":
			half = dy/2;
			this.top_ += half;
			this.bottom_ -= half;
			break;
		case "bottom": this.top_ += dy; break;
		default: throw new Error("invalid anchor:" + anchor);
	}
	return this;
}

Box.prototype.setWidth = function(width, anchor){
	switch(anchor){
		case "left": this.right_ = this.left_ + width; break;
		case "center": 
			this.left_ = this.cx() - width/2;
			this.right_ = this.left_ + width;
			break;
		case "right": this.left_ = this.right_ - width; break;
		default: throw new Error("invalid anchor:" + anchor);
	}
	return this;
}

Box.prototype.setHeight = function(height, anchor){
	switch(anchor){
		case "top": this.bottom_ = this.top_ + height; break;
		case "center": 
			this.top_ = this.cy() - height/2;
			this.bottom_ = this.top_ + height;
			break;
		case "bottom": this.top_ = this.bottom_ - height; break;
		default: throw new Error("invalid anchor:" + anchor);
	}
	return this;
};

Box.prototype.flipRight = function(){
	var w = this.width();
	this.left_ = this.right_;
	this.right_ = this._left + w;
	return this;
}

Box.prototype.splitToColumns = function(){
	var divs = Array.prototype.slice.apply(arguments);
	var boxes = [], i, n = divs.length, left, top, right, bottom;
	top = this.top_;
	bottom = this.bottom_;
	for(i=0;i<=n;i++){
		left = this.left_ + (i === 0 ? 0 : divs[i-1]);
		right = i === n ? this.right_ : (this.left_ + divs[i]);
		boxes.push(new Box(left, top, right, bottom));
	}
	return boxes;
};

Box.prototype.splitToRows = function(){
	var divs = Array.prototype.slice.apply(arguments);
	var boxes = [], i, n = divs.length, left, top, right, bottom;
	left = this.left_;
	right = this.right_;
	for(i=0;i<=n;i++){
		top = this.top_ + (i === 0 ? 0 : divs[i-1]);
		bottom = i === n ? this.bottom_ : (this.top_ + divs[i]);
		boxes.push(new Box(left, top, right, bottom));
	}
	return boxes;
};

Box.prototype.splitToEvenColumns = function(nCols){
	var w = this.width() / nCols, divs = [], i;
	for(i=1;i<nCols;i++){
		divs.push(w*i);
	}
	return this.splitToColumns.apply(this, divs);
}

Box.prototype.splitToEvenRows = function(nRows){
	var h = this.height() / nRows, divs = [];
	var i;
	for(i=1;i<nRows;i++){
		divs.push(h*i);
	}
	return this.splitToRows.apply(this, divs);
}

Box.prototype.splitToEvenCells = function(nrows, ncols){
    var rows = this.splitToEvenRows(nrows);
    return rows.map(function(row){
        return row.splitToEvenColumns(ncols);
    });
}

function boundingBox2(a, b){
	var left = Math.min(a.left(), b.left());
	var top = Math.min(a.top(), b.top());
	var right = Math.max(a.right(), b.right());
	var bottom = Math.max(a.bottom(), b.bottom());
	return new Box(left, top, right, bottom);
}

Box.boundingBox = function(){
	var args = Array.prototype.slice.call(arguments);
	return args.reduce(function(curr, box){
		if( curr === null ) return box;
		return boundingBox2(curr, box);
	}, null);
}

var PAPER_A4 = [210, 297];  // mm
var PAPER_A5 = [148, 210];
var PAPER_A5_landscape = [210, 148];
var PAPER_A6 = [105, 148];
var PAPER_B4 = [257, 364];
var PAPER_B5 = [182, 257];

Box.createA4Box = function(){
	return new Box(0, 0, PAPER_A4[0], PAPER_A4[1]);
}

Box.createA5Box = function(){
	return new Box(0, 0, PAPER_A5[0], PAPER_A5[1]);
}

Box.createA5LandscapeBox = function(){
	return new Box(0, 0, PAPER_A5_landscape[0], PAPER_A5_landscape[1]);
}

Box.createA6Box = function(){
	return new Box(0, 0, PAPER_A6[0], PAPER_A6[1]);
}

Box.createB4Box = function(){
	return new Box(0, 0, PAPER_B4[0], PAPER_B4[1]);
}

Box.createB5Box = function(){
	return new Box(0, 0, PAPER_B5[0], PAPER_B5[1]);
}

module.exports = Box;


