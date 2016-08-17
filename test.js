"use strict";

var drawer = require("./index");

var comp = new drawer.Compiler();
comp.moveTo(10, 10);
comp.lineTo(30, 20);
var ops = comp.getOps();
console.log(JSON.stringify([ops], null, 4));

