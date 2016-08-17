"use strict";

exports.moveTo = function(x, y){
	return ["move_to", x, y];
};

exports.lineTo = function(x, y){
	return ["line_to", x, y];
}

exports.createFont = function(name, fontName, size, weight, italic){
	weight = weight ? 1 : 0;
	italic = italic ? 1 : 0;
	return ["create_font", name, fontName, size, weight, italic];
};

exports.setFont = function(name){
	return ["set_font", name];
};

exports.drawChars = function(chars, x_or_xs, y_or_ys){
	return ["draw_chars", chars, x_or_xs, y_or_ys];
}

// exports.drawText = function(text, x, y, halign, valign){
// 	return ["draw_text", text, x, y, halign, valign];
// };

// exports.drawTextJustified = function(text, left, right, y, valign){
// 	return ["draw_text_justified", text, left, right, y, valign];
// };

exports.setTextColor = function(r, g, b){
	return ["set_text_color", r, g, b];
};

exports.createPen = function(name, r, g, b, opt_width){
	var width = opt_width === undefined ? 0.1 : opt_width;
	return ["create_pen", name, r, g, b, width];
};

exports.setPen = function(name){
	return ["set_pen", name];
};
