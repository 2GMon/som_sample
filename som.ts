///<reference path="d3.d.ts" />
module SOM {
    export interface UnitInterface {
        vector: number[];
        distance(other: UnitInterface): number;
    }

    export class EuclidDistanceUnit implements UnitInterface {
        vector: number[];

        distance(other: EuclidDistanceUnit): number {
            var distance: number = 0;
            for (var i = 0; i < this.vector.length; i++) {
                distance += Math.pow(this.vector[i] - other.vector[i], 2);
            }
            return Math.sqrt(distance);
        }
    }

    export interface MapSpaceInterface {
        units: UnitInterface[];

        nearestUnitIndex(input: UnitInterface): number;
        unitDistance(indexA: number, indexB: number): number;
    }

    export class GridMapSpace implements MapSpaceInterface {
        units: EuclidDistanceUnit[];
        width: number;
        height: number;

        rowNums: number;
        colNums: number;

        constructor(width: number, height: number, rowNums = 5, colNums = 5) {
            this.units = [];

            this.width = width;
            this.height = height;
            this.rowNums = rowNums;
            this.colNums = colNums;

            this.initGrid();
        }

        initGrid() {
            for (var i = 0; i < this.rowNums; i++) {
                for (var j = 0; j < this.colNums; j++) {
                    var x: number = Math.round(this.width / (this.colNums + 1) * (j + 1));
                    var y: number = Math.round(this.height / (this.rowNums + 1) * (i + 1));
                    var newUnit = new EuclidDistanceUnit();
                    newUnit.vector = [x, y]
                    this.units.push(newUnit);
                }
            }
        }

        nearestUnitIndex(input: UnitInterface): number {
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

        getUnit(row: number, col: number): EuclidDistanceUnit {
            if (col < 0 || this.colNums <= col) {
                return undefined;
            } else if (row < 0 || this.rowNums <= row) {
                return undefined;
            } else {
                return this.units[col + row * this.rowNums];
            }
        }
    }

    export class Main {
        map: MapSpaceInterface;
        stepCount: number;
        initAlpha: number;
        initSigma: number;
        alpha: number;
        sigma: number;

        constructor(map: MapSpaceInterface, alpha = 0.999, sigma = 1) {
            this.map = map;
            this.stepCount = 0;
            this.initAlpha = this.alpha = alpha;
            this.initSigma = this.sigma = sigma;
        }

        step(input: UnitInterface) {
            this.stepCount += 1;
            var nearestUnitIndex: number = this.map.nearestUnitIndex(input);
            this.alpha *= 0.999;
            this.sigma *= 0.999;
            for (var i = 0; i < this.map.units.length; i++) {
                var hebb = this.nearestRadius(i, nearestUnitIndex) * this.alpha;
                for (var j = 0; j < this.map.units[i].vector.length; j++) {
                    this.map.units[i].vector[j] += hebb * (input.vector[j] - this.map.units[i].vector[j]);
                }
            }
        }

        private nearestRadius(indexA: number, indexB: number): number {
            return Math.exp(
                    (this.map.unitDistance(indexA, indexB)
                     / (2 * Math.pow(this.sigma, 2))) * -1);
        }
    }
}
