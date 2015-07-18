///<reference path="som.ts" />

module VisualizeSOMGrid {
    export class Main {
        private svg: SVG;
        private map: SOM.GridMapSpace;
        private inputDataset: InputDataset;
        private plotMap: PlotMap;
        private som: SOM.Main;

        constructor(width = 500, height = 500) {
            this.svg = new SVG(width, height);
            this.map = new SOM.GridMapSpace(width, height, 10, 10);
            this.inputDataset = new InputDataset(this.svg);
            this.plotMap = new PlotMap(this.svg, this.map);
            this.som = new SOM.Main(this.map);
        }

        step() {
            var randomIndex = Math.round(Math.random() * (this.inputDataset.dataset.length - 1));
            this.som.step(this.inputDataset.dataset[randomIndex]);
            this.plotMap.plot();
        }

        reset() {
            this.som.stepCount = 0;
            this.som.alpha = this.som.initAlpha;
            this.som.sigma = this.som.initSigma;
            this.inputDataset.reset();
            this.plotMap.reset();
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
            this.svg = d3.select("svg#visualize_grid_som")
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

    class MapLink {
        start: SOM.UnitInterface;
        end: SOM.UnitInterface;

        constructor(start: SOM.UnitInterface, end: SOM.UnitInterface) {
            this.start = start;
            this.end = end;
        }
    }

    class PlotMap {
        svg: SVG;
        map: SOM.GridMapSpace;
        links: MapLink[];

        constructor(svg: SVG, map: SOM.GridMapSpace) {
            this.svg = svg;
            this.map = map;
            this.links = [];

            this.initLink();
        }

        private initLink() {
            for (var i = 0; i < this.map.rowNums; i++) {
                for (var j = 0; j < this.map.colNums; j++) {
                    if (j < this.map.colNums - 1) {
                        this.links.push(
                                new MapLink(this.map.getUnit(i, j),
                                    this.map.getUnit(i, j + 1)));
                    }

                    if (i < this.map.rowNums - 1) {
                        this.links.push(
                                new MapLink(this.map.getUnit(i, j),
                                    this.map.getUnit(i + 1, j)));
                    }
                }
            }
        }

        reset() {
            this.map.units = [];
            this.links = [];
            this.plot();
            this.map.initGrid();
            this.initLink();
        }

        plot() {
            this.svg.svg.selectAll("line").data(this.links).enter()
                .append("line").attr("stroke", "black")
                .attr("x1", (d) => { return d.start.vector[0]; })
                .attr("y1", (d) => { return d.start.vector[1]; })
                .attr("x2", (d) => { return d.end.vector[0]; })
                .attr("y2", (d) => { return d.end.vector[1]; });

            this.svg.svg.selectAll("line").data(this.links).transition()
                .duration(this.svg.getTransitionSec())
                .attr("x1", (d) => { return d.start.vector[0]; })
                .attr("y1", (d) => { return d.start.vector[1]; })
                .attr("x2", (d) => { return d.end.vector[0]; })
                .attr("y2", (d) => { return d.end.vector[1]; });

            this.svg.svg.selectAll("line").data(this.links).exit().remove();

            this.svg.svg.selectAll("circle.map").data(this.map.units).enter()
                .append("circle").attr("class", "map").attr("r", 5).attr("fill", "red")
                .attr("cx", (d) => { return d.vector[0]; })
                .attr("cy", (d) => { return d.vector[1]; });

            this.svg.svg.selectAll("circle.map").data(this.map.units).transition()
                .duration(this.svg.getTransitionSec())
                .attr("cx", (d) => { return d.vector[0]; })
                .attr("cy", (d) => { return d.vector[1]; });

            this.svg.svg.selectAll("circle.map").data(this.map.units).exit().remove();
        }
    }

    class InputDataset {
        private svg: SVG;
        dataset: SOM.EuclidDistanceUnit[];

        constructor(svg: SVG) {
            this.svg = svg;
            this.dataset = [];

            this.svg.svg.on("click", () => {
                var coordinate: [number, number] = d3.mouse(this.svg.svg[0][0]);
                this.addData(coordinate);
                this.plot();
            });
        }

        plot() {
            this.svg.svg.selectAll("circle.data").data(this.dataset).enter()
                .append("circle").attr("class", "data").attr("r", 5).attr("fill", "gray")
                .attr("cx", (d) => { return d.vector[0]; })
                .attr("cy", (d) => { return d.vector[1]; });

            this.svg.svg.selectAll("circle.data").data(this.dataset).exit().remove();
        }

        addData(coordinate: [number, number]) {
            var data = new SOM.EuclidDistanceUnit();
            data.vector = coordinate;
            this.dataset.push(data);
        }

        reset() {
            this.dataset = [];
            this.plot();
        }
    }
}


window.addEventListener("load", (e) => {
    var visualize = new VisualizeSOMGrid.Main();
    var flag = 0;
    var timerId = 0;
    d3.select("button#grid_som_control").text("start").on("click", () => {
        if (flag == 0) {
            flag = 1;
            d3.select("button#grid_som_control").text("stop");
            timerId = setInterval(() => {visualize.step() }, 100);
        } else {
            flag = 0;
            d3.select("button#grid_som_control").text("start");
            clearInterval(timerId);
        }
        visualize.step()
    });
    d3.select("button#grid_som_reset").text("reset").on("click", () => {
        visualize.reset()
    });
});

