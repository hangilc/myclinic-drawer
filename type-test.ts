import { moveTo, Box, Compiler, drawerToSvg } from "./index";

let c = new Compiler();
c.moveTo(10, 10);
c.lineTo(100, 100);
c.createFont("regular", "MS Mincho", 12);
c.setFont("regular");
let b = c.multilineText(["こんにちは世界"], new Box(10, 10, 100, 100), "left", "center");
console.log(c.getOps());
console.log(b);
let e = drawerToSvg(c.getOps(), {
	width: "100mm",
	height: "200mm",
	viewBox: "0 0 100 200"
});
