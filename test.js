"use strict";

var drawer = require("./index");

var comp = new drawer.Compiler();
comp.moveTo(10, 10);
comp.lineTo(30, 20);
comp.createFont("gothic", "MS Gothic", 10, 0, 0);
comp.setFont("gothic");
comp.textAt("Hello, world", 10, 20, "left", "top");
comp.setTextColor(0, 0, 255);
comp.textAt("Hello, world", 10, 40, "left", "top");
comp.createPen("green", 0, 255, 0, 0.1);
comp.setPen("green");
comp.moveTo(10, 50);
comp.lineTo(30, 60);
var ops = comp.getOps();
console.log(JSON.stringify([ops], null, 4));
