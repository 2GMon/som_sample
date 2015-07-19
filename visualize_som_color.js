///<reference path="som.ts" />
var VisualizeSOMColor;
(function (VisualizeSOMColor) {
    var Main = (function () {
        function Main(width, height) {
            if (width === void 0) { width = 500; }
            if (height === void 0) { height = 500; }
            this.svg = new SVG(width, height);
            this.map = new ColorMapSpace(this.svg, width, height, 10, 10);
            this.som = new SOM.Main(this.map, 0.3, 0.8);
            this.map.plot();
        }
        Main.prototype.step = function () {
            var r = Math.round(Math.random() * 255);
            var g = Math.round(Math.random() * 255);
            var b = Math.round(Math.random() * 255);
            var inputData = new SOM.EuclidDistanceUnit();
            inputData.vector = [r, g, b];
            this.som.step(inputData);
            console.log(this.map);
            this.map.plot();
        };
        Main.prototype.reset = function () {
            this.som.stepCount = 0;
            this.som.alpha = parseFloat(document.getElementById("color_alpha").value);
            this.som.sigma = parseFloat(document.getElementById("color_sigma").value);
            this.map.rowNums = parseInt(document.getElementById("color_rows").value);
            this.map.colNums = parseInt(document.getElementById("color_cols").value);
            this.map.reset();
        };
        return Main;
    })();
    VisualizeSOMColor.Main = Main;
    var SVG = (function () {
        function SVG(width, height, transitionSec) {
            if (width === void 0) { width = 500; }
            if (height === void 0) { height = 500; }
            if (transitionSec === void 0) { transitionSec = 0; }
            this.width = width;
            this.height = height;
            this.transitionSec = transitionSec;
            this.svg = d3.select("svg#visualize_color_som").attr("width", this.width).attr("height", this.height).style("border", "solid");
        }
        SVG.prototype.getWidth = function () {
            return this.width;
        };
        SVG.prototype.getHeight = function () {
            return this.height;
        };
        SVG.prototype.getTransitionSec = function () {
            return this.transitionSec;
        };
        return SVG;
    })();
    var ColorMapSpace = (function () {
        function ColorMapSpace(svg, width, height, rowNums, colNums) {
            if (rowNums === void 0) { rowNums = 10; }
            if (colNums === void 0) { colNums = 10; }
            this.units = [];
            this.svg = svg;
            this.width = width;
            this.height = height;
            this.rowNums = rowNums;
            this.colNums = colNums;
            this.initGrid();
        }
        ColorMapSpace.prototype.initGrid = function () {
            for (var i = 0; i < this.rowNums; i++) {
                for (var j = 0; j < this.colNums; j++) {
                    var r = Math.round(Math.random() * 255);
                    var g = Math.round(Math.random() * 255);
                    var b = Math.round(Math.random() * 255);
                    var newUnit = new SOM.EuclidDistanceUnit();
                    newUnit.vector = [r, g, b];
                    this.units.push(newUnit);
                }
            }
        };
        ColorMapSpace.prototype.reset = function () {
            this.units = [];
            this.plot();
            this.initGrid();
            this.plot();
        };
        ColorMapSpace.prototype.nearestUnitIndex = function (input) {
            var nearestDistance = Number.MAX_VALUE;
            var nearestIndex = 0;
            for (var i = 0; i < this.rowNums * this.colNums; i++) {
                var tmpDistance = input.distance(this.units[i]);
                if (tmpDistance < nearestDistance) {
                    nearestDistance = tmpDistance;
                    nearestIndex = i;
                }
            }
            return nearestIndex;
        };
        ColorMapSpace.prototype.getCoordinate = function (index) {
            var row = index / this.rowNums;
            var col = index % this.rowNums;
            return [row, col];
        };
        ColorMapSpace.prototype.unitDistance = function (indexA, indexB) {
            var coordinateA = this.getCoordinate(indexA);
            var coordinateB = this.getCoordinate(indexB);
            return Math.sqrt(Math.pow(coordinateA[0] - coordinateB[0], 2) + Math.pow(coordinateA[1] - coordinateB[1], 2));
        };
        ColorMapSpace.prototype.getUnit = function (row, col) {
            if (col < 0 || this.colNums <= col) {
                return undefined;
            }
            else if (row < 0 || this.rowNums <= row) {
                return undefined;
            }
            else {
                return this.units[col + row * this.rowNums];
            }
        };
        ColorMapSpace.prototype.plot = function () {
            var _this = this;
            this.svg.svg.selectAll("rect").data(this.units).enter().append("rect").attr("x", function (d, i) {
                return i % _this.colNums * (_this.width / _this.colNums);
            }).attr("y", function (d, i) {
                return Math.floor(i / _this.colNums) * (_this.height / _this.rowNums);
            }).attr("width", function () {
                return _this.width / _this.colNums;
            }).attr("height", function () {
                return _this.height / _this.rowNums;
            }).attr("fill", function (d, i) {
                var r = d.vector[0];
                var g = d.vector[1];
                var b = d.vector[2];
                if (r < 0) {
                    d.vector[0] = 0;
                }
                else if (255 < r) {
                    d.vector[0] = 255;
                }
                if (g < 0) {
                    d.vector[1] = 0;
                }
                else if (255 < g) {
                    d.vector[1] = 255;
                }
                if (b < 0) {
                    d.vector[2] = 0;
                }
                else if (255 < b) {
                    d.vector[2] = 255;
                }
                return "rgb(" + d.vector[0] + "," + d.vector[1] + "," + d.vector[2] + ")";
            });
            this.svg.svg.selectAll("rect").data(this.units).attr("fill", function (d) {
                return "rgb(" + Math.round(d.vector[0]) + "," + Math.round(d.vector[1]) + "," + Math.round(d.vector[2]) + ")";
            });
            this.svg.svg.selectAll("rect").data(this.units).exit().remove();
        };
        return ColorMapSpace;
    })();
})(VisualizeSOMColor || (VisualizeSOMColor = {}));
window.addEventListener("load", function (e) {
    var color_som = new VisualizeSOMColor.Main();
    var flag = 0;
    var timerId = 0;
    d3.select("button#color_som_control").text("start").on("click", function () {
        if (flag == 0) {
            flag = 1;
            d3.select("button#color_som_control").text("stop");
            timerId = setInterval(function () {
                color_som.step();
            }, 200);
        }
        else {
            flag = 0;
            d3.select("button#color_som_control").text("start");
            clearInterval(timerId);
        }
    });
    d3.select("button#color_som_reset").text("reset").on("click", function () {
        color_som.reset();
    });
});
