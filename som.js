///<reference path="d3.d.ts" />
var SOM;
(function (SOM) {
    var EuclidDistanceUnit = (function () {
        function EuclidDistanceUnit() {
        }
        EuclidDistanceUnit.prototype.distance = function (other) {
            var distance = 0;
            for (var i = 0; i < this.vector.length; i++) {
                distance += Math.pow(this.vector[i] - other.vector[i], 2);
            }
            return Math.sqrt(distance);
        };
        return EuclidDistanceUnit;
    })();
    SOM.EuclidDistanceUnit = EuclidDistanceUnit;
    var GridMapSpace = (function () {
        function GridMapSpace(width, height, rowNums, colNums) {
            if (rowNums === void 0) { rowNums = 5; }
            if (colNums === void 0) { colNums = 5; }
            this.units = [];
            this.width = width;
            this.height = height;
            this.rowNums = rowNums;
            this.colNums = colNums;
            this.initGrid();
        }
        GridMapSpace.prototype.initGrid = function () {
            for (var i = 0; i < this.rowNums; i++) {
                for (var j = 0; j < this.colNums; j++) {
                    var x = Math.round(this.width / (this.colNums + 1) * (j + 1));
                    var y = Math.round(this.height / (this.rowNums + 1) * (i + 1));
                    var newUnit = new EuclidDistanceUnit();
                    newUnit.vector = [x, y];
                    this.units.push(newUnit);
                }
            }
        };
        GridMapSpace.prototype.nearestUnitIndex = function (input) {
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
        GridMapSpace.prototype.getCoordinate = function (index) {
            var row = index / this.rowNums;
            var col = index % this.rowNums;
            return [row, col];
        };
        GridMapSpace.prototype.unitDistance = function (indexA, indexB) {
            var coordinateA = this.getCoordinate(indexA);
            var coordinateB = this.getCoordinate(indexB);
            return Math.sqrt(Math.pow(coordinateA[0] - coordinateB[0], 2) + Math.pow(coordinateA[1] - coordinateB[1], 2));
        };
        GridMapSpace.prototype.getUnit = function (row, col) {
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
        return GridMapSpace;
    })();
    SOM.GridMapSpace = GridMapSpace;
    var Main = (function () {
        function Main(map, alpha, sigma) {
            if (alpha === void 0) { alpha = 0.999; }
            if (sigma === void 0) { sigma = 1; }
            this.map = map;
            this.stepCount = 0;
            this.initAlpha = this.alpha = alpha;
            this.initSigma = this.sigma = sigma;
        }
        Main.prototype.step = function (input) {
            this.stepCount += 1;
            var nearestUnitIndex = this.map.nearestUnitIndex(input);
            this.alpha *= 0.999;
            this.sigma *= 0.999;
            for (var i = 0; i < this.map.units.length; i++) {
                var hebb = this.nearestRadius(i, nearestUnitIndex) * this.alpha;
                for (var j = 0; j < this.map.units[i].vector.length; j++) {
                    this.map.units[i].vector[j] += hebb * (input.vector[j] - this.map.units[i].vector[j]);
                }
            }
        };
        Main.prototype.nearestRadius = function (indexA, indexB) {
            return Math.exp((this.map.unitDistance(indexA, indexB) / (2 * Math.pow(this.sigma, 2))) * -1);
        };
        return Main;
    })();
    SOM.Main = Main;
})(SOM || (SOM = {}));
