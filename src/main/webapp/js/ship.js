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
function ShipManager(net, audioPlayer, ng) {
    this.ng = ng;
    this.shipMaker = {lastTimeShipsMade:0, shipMakeTime:1000, makeCycle:0, noOfShipsToMake:1};
    this.myShip = {player:true, center:{x:800 * Math.random(), y:600 * Math.random()},
        looksAt:{x:0, y:0},
        radius:25 * Math.random() + 10, speed:50,
        reloadTime:1000, lastTimeFired:0, player:true};
    audioPlayer.setPosition(this.myShip.center);
    this.ships = [this.myShip];
    this.net = net;
    this.audioPlayer = audioPlayer;
    this.geo = new Geo();
}

ShipManager.prototype.init = function () {
    this.shipMaker = {lastTimeShipsMade:0, shipMakeTime:1000, makeCycle:0, noOfShipsToMake:1};
    this.myShip.shot = false;
    this.ships = [this.myShip];
}

ShipManager.prototype.isFired = function (time) {
    if (!this.myShip.shot && this.myShip.fire &&
        time - this.myShip.lastTimeFired > this.myShip.reloadTime) {
        this.myShip.fire = false;
        this.myShip.lastTimeFired = time;

        var ship = {
            center:{x:this.myShip.center.x, y:this.myShip.center.y},
            looksAt:{x:this.myShip.looksAt.x, y:this.myShip.looksAt.y},
            radius:5, speed:500
        };
        this.geo.moveInLine(ship.center, ship.looksAt, ship.radius + this.myShip.radius);

        this.ships.push(ship);
        this.net.send({cmd:"fire", ship:ship});
        this.audioPlayer.play('fire');
    }
}

ShipManager.prototype.explode = function (ship) {
    if (ship && ship.radius >= 12) {
        var s = {
            center:{x:ship.center.x, y:ship.center.y},
            looksAt:{x:ship.looksAt.x, y:ship.looksAt.y},
            radius:ship.radius / 3, speed:ship.speed,
            timeLeft:400, expiring:true
        };
        this.geo.moveInLine(s.center, s.looksAt, ship.radius);
        this.ships.push(s);

        s = {
            center:{x:ship.center.x, y:ship.center.y},
            looksAt:{x:ship.looksAt.x, y:ship.looksAt.y},
            radius:ship.radius / 3, speed:ship.speed,
            timeLeft:400, expiring:true
        };
        this.geo.changeLooksAtWithDegree(s, 0.25)
        this.geo.moveInLine(s.center, s.looksAt, ship.radius);
        this.ships.push(s);

        s = {
            center:{x:ship.center.x, y:ship.center.y},
            looksAt:{x:ship.looksAt.x, y:ship.looksAt.y},
            radius:ship.radius / 3, speed:ship.speed,
            timeLeft:400, expiring:true
        };
        this.geo.changeLooksAtWithDegree(s, -0.25)
        this.geo.moveInLine(s.center, s.looksAt, ship.radius);
        this.ships.push(s);
    }
}

ShipManager.prototype.createShipTowards = function (myShip) {
    var cx, cy;
    var wR = this.ng.next();
    if (wR < 0.25) {
        cx = this.ng.next() * 800;
        cy = 0;
    } else if (wR < 0.50) {
        cx = this.ng.next() * 800;
        cy = 600;
    } else if (wR < 0.75) {
        cx = 0;
        cy = this.ng.next() * 600;
    } else {
        cx = 800;
        cy = this.ng.next() * 600;
    }
    var ship = {center:{x:cx, y:cy},
        looksAt:{x:myShip.center.x, y:myShip.center.y},
        radius:25 * this.ng.next(), speed:150 * this.ng.next()};
    return ship;
}

ShipManager.prototype.getAPixelOnTheSide = function (side) {
    if (side == 0) {
        return {x:this.ng.next() * 800, y:0}
    } else if (side == 1) {
        return {x:this.ng.next() * 800, y:600}
    } else if (side == 2) {
        return {x:0, y:this.ng.next() * 600}
    } else {
        return {x:800, y:this.ng.next() * 600}
    }
}

ShipManager.prototype.createShipSideToSide = function () {
    var s1 = Math.floor(this.ng.next() * 4);
    var s2 = Math.floor(this.ng.next() * 4);
    if (s1 == s2) {
        s2 = (s2 + 2) % 4;
    }

    s1 = this.getAPixelOnTheSide(s1);
    s2 = this.getAPixelOnTheSide(s2);

    var ship = {center:s1, looksAt:s2,
        radius:25 * this.ng.next() + 10, speed:250 * this.ng.next() + 50};
    return ship;
}

ShipManager.prototype.create = function (time) {
    if (time - this.shipMaker.lastTimeShipsMade > this.shipMaker.shipMakeTime) {
        this.shipMaker.lastTimeShipsMade = time;
        this.shipMaker.makeCycle++;
        if (this.shipMaker.makeCycle % 30 == 0) {
            // should get harder
            this.shipMaker.shipMakeTime -= 10;
            this.shipMaker.noOfShipsToMake++;
        }

        for (var i = 0; i < this.shipMaker.noOfShipsToMake; i++) {
            if (this.ng.next() < 0.8) {
                this.ships.push(this.createShipSideToSide());
            } else {
                this.ships.push(this.createShipTowards(this.myShip));
            }
        }
    }
}

function Ship(inito) {
    this.player = inito.player;
    this.center = inito.center;
    this.target = inito.looksAt;
    this.aimAt = inito.looksAt;
    this.radius = inito.radius;
    this.speed = inito.speed;
    this.reloadTime = inito.reloadTme;
    this.lastTimeFired = inito.lastTimeFired;
}

Ship.prototype.move = function (xy) {
    this.looksAt = xy;
}

Ship.prototype.target = function (xy) {
    this.target = xy;
}

Ship.prototype.aimAt = function (xy) {
    this.aimAt = xy;
}

Ship.prototype.dist = function (xy) {
    return Math.sqrt((this.center.x - xy.x) * (this.center.x - xy.x) + (this.center.y - xy.y) * (this.center.y - xy.y));
}