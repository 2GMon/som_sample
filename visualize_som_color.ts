///<reference path="som.ts" />

module VisualizeSOMColor {
    export class Main {
        private svg: SVG;
        private map: ColorMapSpace;
        private som: SOM.Main;

        constructor(width = 500, height = 500) {
            this.svg = new SVG(width, height);
            this.map = new ColorMapSpace(this.svg, width, height, 10, 10);
            this.som = new SOM.Main(this.map, 0.3, 0.8);

            this.map.plot();
        }

        step() {
            var r: number = Math.round(Math.random() * 255);
            var g: number = Math.round(Math.random() * 255);
            var b: number = Math.round(Math.random() * 255);
            var inputData = new SOM.EuclidDistanceUnit();
            inputData.vector = [r, g, b]
            this.som.step(inputData);
            console.log(this.map);

            this.map.plot();
        }

        reset() {
            this.som.stepCount = 0;
            this.som.alpha = parseFloat((<HTMLInputElement>document.getElementById("color_alpha")).value);
            this.som.sigma = parseFloat((<HTMLInputElement>document.getElementById("color_sigma")).value);
            this.map.rowNums = parseInt((<HTMLInputElement>document.getElementById("color_rows")).value);
            this.map.colNums = parseInt((<HTMLInputElement>document.getElementById("color_cols")).value);
            this.map.reset();
        }
    }

    class SVG {
        private width: number;
        private height: number;
        private transitionSec: number;
        svg;

        constructor(width = 500, height = 500, transitionSec = 0) {
            this.width = width;
            this.height = height;
            this.transitionSec = transitionSec;
            this.svg = d3.select("svg#visualize_color_som")
                .attr("width", this.width).attr("height", this.height)
                .style("border", "solid");
        }

        getWidth(): number {
            return this.width;
        }

        getHeight(): number {
            return this.height;
        }

        getTransitionSec(): number {
            return this.transitionSec;
        }
    }

    class ColorMapSpace implements SOM.MapSpaceInterface {
        units: SOM.EuclidDistanceUnit[];
        svg: SVG;
        width: number;
        height: number;

        rowNums: number;
        colNums: number;

        constructor(svg: SVG, width: number, height: number, rowNums = 10, colNums = 10) {
            this.units = [];

            this.svg = svg;
            this.width = width;
            this.height = height;
            this.rowNums = rowNums;
            this.colNums = colNums;

            this.initGrid();
        }

        initGrid() {
            for (var i = 0; i < this.rowNums; i++) {
                for (var j = 0; j < this.colNums; j++) {
                    var r: number = Math.round(Math.random() * 255);
                    var g: number = Math.round(Math.random() * 255);
                    var b: number = Math.round(Math.random() * 255);
                    var newUnit = new SOM.EuclidDistanceUnit();
                    newUnit.vector = [r, g, b]
                    this.units.push(newUnit);
                }
            }
        }

        reset() {
            this.units = [];
            this.plot();
            this.initGrid();
            this.plot();
        }

        nearestUnitIndex(input: SOM.EuclidDistanceUnit): number {
            var nearestDistance: number = Number.MAX_VALUE;
            var nearestIndex: number = 0;

            for (var i = 0; i < this.rowNums * this.colNums; i++) {
                var tmpDistance = input.distance(this.units[i]);
                if (tmpDistance < nearestDistance) {
                    nearestDistance = tmpDistance;
                    nearestIndex = i;
                }
            }
            return nearestIndex;
        }

        private getCoordinate(index :number): [number, number] {
            var row = index / this.rowNums;
            var col = index % this.rowNums;
            return [row, col];
        }

        unitDistance(indexA: number, indexB: number): number {
            var coordinateA: [number ,number] = this.getCoordinate(indexA);
            var coordinateB: [number ,number] = this.getCoordinate(indexB);
            return  Math.sqrt(Math.pow(coordinateA[0] - coordinateB[0], 2)
                    + Math.pow(coordinateA[1] - coordinateB[1], 2));
        }

        getUnit(row: number, col: number): SOM.EuclidDistanceUnit {
            if (col < 0 || this.colNums <= col) {
                return undefined;
            } else if (row < 0 || this.rowNums <= row) {
                return undefined;
            } else {
                return this.units[col + row * this.rowNums];
            }
        }

        plot() {
            this.svg.svg.selectAll("rect").data(this.units).enter()
                .append("rect")
                .attr("x", (d, i) => { return i % this.colNums * (this.width / this.colNums); })
                .attr("y", (d, i) => { return Math.floor(i / this.colNums) * (this.height / this.rowNums); })
                .attr("width", () => { return this.width / this.colNums; })
                .attr("height", () => { return this.height / this.rowNums; } )
                .attr("fill", (d, i) => {
                    var r = d.vector[0];
                    var g = d.vector[1];
                    var b = d.vector[2];
                    if (r < 0) { d.vector[0] = 0; } else if (255 < r) { d.vector[0] = 255; }
                    if (g < 0) { d.vector[1] = 0; } else if (255 < g) { d.vector[1] = 255; }
                    if (b < 0) { d.vector[2] = 0; } else if (255 < b) { d.vector[2] = 255; }
                    return "rgb(" + d.vector[0]  + "," + d.vector[1] + "," + d.vector[2] + ")";
                })

            this.svg.svg.selectAll("rect").data(this.units)
                .attr("fill", (d) => {
                    return "rgb(" + Math.round(d.vector[0]) + ","
                        + Math.round(d.vector[1]) + ","
                        + Math.round(d.vector[2]) + ")";
                })

            this.svg.svg.selectAll("rect").data(this.units).exit().remove();
        }
    }
}


window.addEventListener("load", (e) => {
    var color_som = new VisualizeSOMColor.Main();

    var flag = 0;
    var timerId = 0;
    d3.select("button#color_som_control").text("start").on("click", () => {
        if (flag == 0) {
            flag = 1;
            d3.select("button#color_som_control").text("stop");
            timerId = setInterval(() => {color_som.step() }, 200);
        } else {
            flag = 0;
            d3.select("button#color_som_control").text("start");
            clearInterval(timerId);
        }
    });
    d3.select("button#color_som_reset").text("reset").on("click", () => {
        color_som.reset()
    });
});

