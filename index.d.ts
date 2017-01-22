export type OpMoveTo = ["move_to", number, number];
export type OpLineTo = ["line_to", number, number];
export type OpCreateFont = ["create_font", string, string, number, number, number];
export type OpSetFont = ["set_font", string];
export type OpDrawChars = ["draw_chars", string[], (number|number[]), (number|number[])];
export type OpSetTextColor = ["set_text_color", number, number, number];
export type OpCreatePen = ["create_pen", string, number, number, number, number];
export type OpSetPen = ["set_pen", string];

export type Op = OpMoveTo | OpLineTo | OpCreateFont | OpSetFont | OpDrawChars | OpSetTextColor | OpCreatePen | OpSetPen;

export function moveTo(x: number, y: number) : OpMoveTo;
export function lineTo(x: number, y: number) : OpLineTo;
export function createFont(name: string, fontName: string, size: number, weight?: number, italic?: number): OpCreateFont;
export function setFont(name: string): OpSetFont;
export function drawChars(chars: string[], xs: (number|number[]), ys: (number|number[])): OpDrawChars;
export function setTextColor(r: number, g: number, b: number): OpSetTextColor;
export function createPen(name: string, r: number, g: number, b: number, width?: number): OpCreatePen;
export function setPen(name: string): OpSetPen;

export type HorizAnchor = "left" | "center" | "right";
export type VertAnchor = "top" | "center" | "bottom";

declare class Box {
	constructor(left: number, top: number, right: number, bottom: number);
	clone(): this;
	innerBox(left: number, top: number, right: number, bottom: number): this;
	left(): number;
	top(): number;
	right(): number;
	bottom(): number;
	width(): number;
	height(): number;
	cx(): number;
	cy(): number;
	setLeft(left: number): this;
	displaceLeftEdge(dx: number): this;
	setTop(top: number): this;
	setRight(right: number): this;
	displaceRightEdge(dx: number): this;
	setBottom(bottom: number): this;
	inset(dx: number, dy: number): this;
	inset4(dxLeft: number, dyTop: number, dxRight: number, dyBottom: number): this;
	shift(dx: number, dy: number): this;
	shiftUp(dy: number): this;
	shiftDown(dy: number): this;
	shiftToRight(dx: number): this;
	shiftToLeft(dx: number): this;
	shrinkWidth(dx: number, anchor: HorizAnchor): this;
	shrinkHeight(dy: number, anchor: VertAnchor): this;
	setWidth(width: number, anchor: HorizAnchor): this;
	setHeight(height: number, anchor: VertAnchor): this;
	flipRight(): this;
	splitToColumns(...divs: number[]): this[];
	splitToRows(...divs: number[]): this[];
	splitToEvenColumns(nCols: number): this[];
	splitToEvenRows(nRows: number): this[];
	splitToEvenCells(nRows: number, nCols: number): this[][];
	boundingBox2(a: Box, b: Box): this;
	boundingBox(bs: (Box|null)[]): this;
	static createA4Box: () => Box;
	static createA5Box: () => Box;
	static createA5LandscapeBox: () => Box;
	static createA6Box: () => Box;
	static createB4Box: () => Box;
	static createB5Box: () => Box;
}

export interface MeasuredChar {
	ch: string,
	width: number
}

export type HorizAlign = "left" | "center" | "right";
export type VertAlign = "top" | "center" | "bottom";
export type Direction = "horizontal" | "vertical";
export type JustifyTo = "left" | "right";
export type Point = { x: number, y: number };

declare class Compiler {
	constructor();
	getOps(): Op[];
	moveTo(x: number, y: number): void;
	lineTo(x: number, y: number): void;
	line(x1: number, y1: number, x2: number, y2: number): void;
	rectangle(left: number, top: number, right: number, bottom: number): void;
	box(box: Box): void;
	createFont(name: string, fontName: string, size: number, weight?: number, italic?: number): void;
	setFont(name: string): void;
	textAt(text: string, x: number, y: number, halign: HorizAlign, valign: VertAlign, opt?: {extraSpace?: number}): void;
	textAtJustified(text: string, left: number, right: number, y: number, valign: VertAlign): void;
	textAtVert(text: string, x: number, y: number, halign: HorizAlign, valign: VertAlign): void;
	textAtVertJustified(text: string, x: number, top: number, bottom: number, halign: HorizAlign): void;
	textIn(text: string, box: Box, halign: HorizAlign, valign: VertAlign, direction?: Direction): void;
	textInEvenColumns(text: string, box: Box, nCols: number, justfityTo?: JustifyTo): void;
	setTextColor(r: number, g: number, b: number): void;
	createPen(name: string, r: number, g: number, b: number, width?: number): void;		
	setPen(name: string): void;
	getCurrentFontSize(): number;
	setPoint(name: string, x: number, y: number): void;
	getPoint(name: string): Point;
	setBox(name: string, box: Box): void;
	getBox(name: string): Box;
	frameRight(box: Box): void;
	frameTop(box: Box): void;
	frameBottom(box: Box): void;
	frameCells(cells: Box[][]): void;
	frameColumnsRight(cells: Box[][], iCol: number, opt: {dx?: number}): void;
	drawEvenInnerColumnBorders(box: Box, nRows: number): void;
	drawInnerColumnBorders(bs: Box[]): void;
	multilineText(texts: string[], box: Box, halign: HorizAlign, valign: VertAlign, leading?: number): Box | null;
	measureText(text: string): {cx: number, cy: number };
	breakLines(text: string, width: number, fontSize?: number): string[];
	static measureChars: (s: string, fontSize: number) => MeasuredChar[];
	static breakLines: (s: string, width: number, fontSize: number) => string[];
}