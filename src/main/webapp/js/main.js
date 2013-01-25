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
function GameEngine(id, width, height, sceneraio) {
    this.setUpImages();
    this.net = this.setUpNetwork();
    this.audioPlayer = this.setUpAudio(width, height);
    this.ng = new NumberGenerator(this.net, 50, 50);
    this.shipManager = new ShipManager(this.net, this.audioPlayer, this.ng);
    this.net.init();

    this.physics = new Physics(this.shipManager, width, height,
        (function (ge) {
            return function (x, y) {
                ge.audioPlayer.playPositional('blast', x.center);
            }
        })(this)
    );

    this.canvas = document.getElementById(id);
    this.context = this.canvas.getContext('2d');
    this.painter = new Painter(this.context);

    this.time = new Date().getTime();
    this.setUpInputs();
    this.scenario = sceneraio;

    this.timeLastHUDUpdate = this.time;
    this.loopCount = 0;
    this.fps = 0;
    this.points = 0;

    this.pauseAndStart = true;
    this.loop();
}

GameEngine.prototype.setUpInputs = function () {
    this.canvas.addEventListener('mousedown',
        (function (ge) {
            return function (ev) {
                ge.shipManager.myShip.fire = true;
            }
        }(this)), false);
    this.canvas.addEventListener('mousemove',
        (function (ge) {
            return function (ev) {
                var x, y;

                // Get the mouse position relative to the canvas element.
                if (ev.layerX || ev.layerX == 0) { // Firefox
                    x = ev.layerX;
                    y = ev.layerY;
                } else if (ev.offsetX || ev.offsetX == 0) { // Opera
                    x = ev.offsetX;
                    y = ev.offsetY;
                }

                ge.shipManager.myShip.looksAt.x = x;
                ge.shipManager.myShip.looksAt.y = y;
                ge.net.send({cmd:"updateLooks", ship:ge.shipManager.myShip});
            }
        }(this)), false);
}

GameEngine.prototype.setUpNetwork = function () {
    var net = new Network({
            url:'ws://localhost:8080/play',
            encode:function (o) {
                return JSON.stringify(o)
            },
            decode:function (t) {
                return JSON.parse(t)
            },
            onopen:(function (ge) {
                return function () {
                    this.send({cmd:"new", ship:ge.shipManager.myShip});
                }
            })(this),
            onmessage:(function (ge) {
                return function (jo) {
                    if (jo.cmd == "addShip") {
                        if (jo.ship.player) {
                            console.log("handle updates: " + jo.updatesNumbers);
                            ge.ng.setUpdates(jo.updatesNumbers)
                            ge.ng.init(jo.numbers);
                            ge.shipManager.init();
                            ge.pauseAndStart = ge.time;
                        }
                        ge.shipManager.ships.push(jo.ship);
                    } else if (jo.cmd == "remove" && jo.ship.id) {
                        var i = findIndexOfShipWithId(ge.shipManager.ships, jo.ship.id);
                        ge.shipManager.ships.splice(i, 1);
                    } else if (jo.cmd == "updateLooks" && jo.ship.id) {
                        var i = findIndexOfShipWithId(ge.shipManager.ships, jo.ship.id);
                        ge.shipManager.ships[i] = jo.ship;
                    } else if (jo.cmd == "numbers") {
                        ge.ng.addNumbers(jo.numbers);
                    } else {
                        console.log('Server: ' + e.data);
                    }
                }
            })(this)
        }
    );
    return net;
}

function findIndexOfShipWithId(ships, id) {
    for (var i = 0; i < ships.length; i++) {
        if (ships[i].id == id) {
            return i;
        }
    }
    return -1;
}

GameEngine.prototype.setUpAudio = function (width, height) {
    var audioPlayer = new AudioPlayer(width, height);
    audioPlayer.addResource('fire', 'audio/missle.mp3', 0.2, false, false);
    audioPlayer.addResource('blast', 'audio/blast.mp3', 0.2, false, false);
    audioPlayer.addResource('music', 'audio/music.mp3', 0.3, true, true);
    return audioPlayer;
}

GameEngine.prototype.setUpImages = function () {
    this.spaceImg = new Image();
    this.spaceImg.src = 'img/ns1.jpg';
}

GameEngine.prototype.getTimeSpentAndUpdateTime = function () {
    var prevTime;
    prevTime = this.time;
    this.time = new Date().getTime();
    return this.time - prevTime;
}

requestAnimFrame = (function () {
    return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

GameEngine.prototype.loop = function () {
    requestAnimFrame((function (ge) {
        return function () {
            ge.loop()
        };
    })(this));
    var diffTime = this.getTimeSpentAndUpdateTime();

    this.context.fillStyle = 'white';
    this.context.strokeStyle = 'white';
    this.context.drawImage(this.spaceImg, 0, 0);

    this.drawHUD();
    if (this.time - this.pauseAndStart >= 3000) {
        this.scenario()
        if (diffTime > 0) {
            this.physics.tick(diffTime)
        }

        this.shipManager.isFired(this.time);
    }

    if (this.shipManager.myShip.shot) {
        this.context.fillStyle = "red";
        this.context.font = 32 + "pt Arial ";
        this.context.fillText("Game Over!", 300, 300);
    }

    this.context.lineWidth = 3;
    for (var i = 0; i < this.shipManager.ships.length; i++) {
        var ship = this.shipManager.ships[i];
        this.painter.paintTriAngle(ship, i);

    }
    return this;
}

GameEngine.prototype.drawHUD = function () {
    this.loopCount++;
    if (!this.shipManager.myShip.shot && this.time - this.timeLastHUDUpdate >= 1000) {
        this.fps = this.loopCount;
        this.loopCount = 0;
        this.timeLastHUDUpdate = this.time;
        this.points++;
    }
    this.context.fillStyle = "white";
    this.context.font = 16 + "pt Arial ";
    this.context.fillText("fps: " + this.fps + ", survived for: " + this.points, 10, 20);
}