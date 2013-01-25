/*
 * Copyright 2011 MCA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function Physics(shipManager, width, height, onCollision) {
    this.shipManager = shipManager;
    this.width = width;
    this.height = height;
    this.onCollision = onCollision;
    this.geo = new Geo();
}

Physics.prototype.tick = function (timeLapse) {
    var ships = this.shipManager.ships;
    //move ships
    for (var i = 0; i < ships.length; i++) {
        var ship = ships[i];
        var moveLen = ship.speed * timeLapse / 1000
        this.geo.moveInLine(ship.center, ship.looksAt, moveLen);
    }

    //remove ships out of bounds
    for (var i = ships.length - 1; 0 <= i; i--) {
        var ship = ships[i];
        if (ship.center.x < 0 || ship.center.x > this.width || ship.center.y < 0 || ship.center.y > this.height) {
            if (!ship.player) {
                ships.splice(i, 1);
            }
        } else if (ship.expiring) {
            ship.timeLeft -= timeLapse;
            if (ship.timeLeft <= 0) {
                ships.splice(i, 1);
            }
        }
    }

    // handle collisions
    var collisions = [];
    for (var i = 0; i < ships.length; i++) {
        for (var j = i + 1; j < ships.length; j++) {
            var r = ships[i].radius + ships[j].radius;
            var dist = this.geo.distance(ships[i].center, ships[j].center);
            if (dist < r) {
                collisions.push({x:i, y:j});
            }
        }
    }

    for (var i = 0; i < collisions.length; i++) {
        ships[collisions[i].x].shot = true;
        ships[collisions[i].y].shot = true;

        this.onCollision(ships[collisions[i].x], ships[collisions[i].y]);

        this.shipManager.explode(ships[collisions[i].x]);
        this.shipManager.explode(ships[collisions[i].y]);
    }

    for (var i = ships.length - 1; 0 <= i; i--) {
        var ship = ships[i];
        if (ship.shot) {
            ships.splice(i,1);
        }
    }
}
