"use strict";
var index_1 = require("./index");
var c = new index_1.Compiler();
c.moveTo(10, 10);
c.lineTo(100, 100);
c.createFont("regular", "MS Mincho", 12);
c.setFont("regular");
var b = c.multilineText(["こんにちは世界"], new index_1.Box(10, 10, 100, 100), "left", "center");
console.log(c.getOps());
console.log(b);
var e = index_1.drawerToSvg(c.getOps(), {
    width: "100mm",
    height: "200mm",
    viewBox: "0 0 100 200"
});
