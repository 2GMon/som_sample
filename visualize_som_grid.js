///<reference path="som.ts" />
var VisualizeSOMGrid;
(function (VisualizeSOMGrid) {
    var Main = (function () {
        function Main(width, height) {
            if (width === void 0) { width = 500; }
            if (height === void 0) { height = 500; }
            this.svg = new SVG(width, height);
            this.map = new SOM.GridMapSpace(width, height, 10, 10);
            this.inputDataset = new InputDataset(this.svg);
            this.plotMap = new PlotMap(this.svg, this.map);
            this.som = new SOM.Main(this.map);
        }
        Main.prototype.step = function () {
            var randomIndex = Math.round(Math.random() * (this.inputDataset.dataset.length - 1));
            this.som.step(this.inputDataset.dataset[randomIndex]);
            this.plotMap.plot();
        };
        Main.prototype.reset = function () {
            this.som.stepCount = 0;
            this.som.alpha = this.som.initAlpha;
            this.som.sigma = this.som.initSigma;
            this.inputDataset.reset();
            this.plotMap.reset();
        };
        return Main;
    })();
    VisualizeSOMGrid.Main = Main;
    var SVG = (function () {
        function SVG(width, height, transitionSec) {
            if (width === void 0) { width = 500; }
            if (height === void 0) { height = 500; }
            if (transitionSec === void 0) { transitionSec = 0; }
            this.width = width;
            this.height = height;
            this.transitionSec = transitionSec;
            this.svg = d3.select("svg#visualize_grid_som").attr("width", this.width).attr("height", this.height).style("border", "solid");
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
    var MapLink = (function () {
        function MapLink(start, end) {
            this.start = start;
            this.end = end;
        }
        return MapLink;
    })();
    var PlotMap = (function () {
        function PlotMap(svg, map) {
            this.svg = svg;
            this.map = map;
            this.links = [];
            this.initLink();
        }
        PlotMap.prototype.initLink = function () {
            for (var i = 0; i < this.map.rowNums; i++) {
                for (var j = 0; j < this.map.colNums; j++) {
                    if (j < this.map.colNums - 1) {
                        this.links.push(new MapLink(this.map.getUnit(i, j), this.map.getUnit(i, j + 1)));
                    }
                    if (i < this.map.rowNums - 1) {
                        this.links.push(new MapLink(this.map.getUnit(i, j), this.map.getUnit(i + 1, j)));
                    }
                }
            }
        };
        PlotMap.prototype.reset = function () {
            this.map.units = [];
            this.links = [];
            this.plot();
            this.map.initGrid();
            this.initLink();
        };
        PlotMap.prototype.plot = function () {
            this.svg.svg.selectAll("line").data(this.links).enter().append("line").attr("stroke", "black").attr("x1", function (d) {
                return d.start.vector[0];
            }).attr("y1", function (d) {
                return d.start.vector[1];
            }).attr("x2", function (d) {
                return d.end.vector[0];
            }).attr("y2", function (d) {
                return d.end.vector[1];
            });
            this.svg.svg.selectAll("line").data(this.links).transition().duration(this.svg.getTransitionSec()).attr("x1", function (d) {
                return d.start.vector[0];
            }).attr("y1", function (d) {
                return d.start.vector[1];
            }).attr("x2", function (d) {
                return d.end.vector[0];
            }).attr("y2", function (d) {
                return d.end.vector[1];
            });
            this.svg.svg.selectAll("line").data(this.links).exit().remove();
            this.svg.svg.selectAll("circle.map").data(this.map.units).enter().append("circle").attr("class", "map").attr("r", 5).attr("fill", "red").attr("cx", function (d) {
                return d.vector[0];
            }).attr("cy", function (d) {
                return d.vector[1];
            });
            this.svg.svg.selectAll("circle.map").data(this.map.units).transition().duration(this.svg.getTransitionSec()).attr("cx", function (d) {
                return d.vector[0];
            }).attr("cy", function (d) {
                return d.vector[1];
            });
            this.svg.svg.selectAll("circle.map").data(this.map.units).exit().remove();
        };
        return PlotMap;
    })();
    var InputDataset = (function () {
        function InputDataset(svg) {
            var _this = this;
            this.svg = svg;
            this.dataset = [];
            this.svg.svg.on("click", function () {
                var coordinate = d3.mouse(_this.svg.svg[0][0]);
                _this.addData(coordinate);
                _this.plot();
            });
        }
        InputDataset.prototype.plot = function () {
            this.svg.svg.selectAll("circle.data").data(this.dataset).enter().append("circle").attr("class", "data").attr("r", 5).attr("fill", "gray").attr("cx", function (d) {
                return d.vector[0];
            }).attr("cy", function (d) {
                return d.vector[1];
            });
            this.svg.svg.selectAll("circle.data").data(this.dataset).exit().remove();
        };
        InputDataset.prototype.addData = function (coordinate) {
            var data = new SOM.EuclidDistanceUnit();
            data.vector = coordinate;
            this.dataset.push(data);
        };
        InputDataset.prototype.reset = function () {
            this.dataset = [];
            this.plot();
        };
        return InputDataset;
    })();
})(VisualizeSOMGrid || (VisualizeSOMGrid = {}));
window.addEventListener("load", function (e) {
    var visualize = new VisualizeSOMGrid.Main();
    var flag = 0;
    var timerId = 0;
    d3.select("button#grid_som_control").text("start").on("click", function () {
        if (flag == 0) {
            flag = 1;
            d3.select("button#grid_som_control").text("stop");
            timerId = setInterval(function () {
                visualize.step();
            }, 100);
        }
        else {
            flag = 0;
            d3.select("button#grid_som_control").text("start");
            clearInterval(timerId);
        }
        visualize.step();
    });
    d3.select("button#grid_som_reset").text("reset").on("click", function () {
        visualize.reset();
    });
});
