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
function Painter(context) {
    this.context = context;
    this.geo = new Geo();
}

Painter.prototype.paintTriAngle = function (ship,i) {
    this.context.beginPath();

    var diffAngle = this.geo.findAngleWithAxis(ship);

    this.context.moveTo(ship.center.x + ship.radius * Math.cos(diffAngle),
        ship.center.y + ship.radius * Math.sin(diffAngle))

    this.context.lineTo(ship.center.x + ship.radius * Math.cos(Math.PI * 2 / 3 + diffAngle),
        ship.center.y + ship.radius * Math.sin(Math.PI * 2 / 3 + diffAngle))

    this.context.lineTo(ship.center.x + ship.radius * Math.cos(Math.PI * 4 / 3 + diffAngle),
        ship.center.y + ship.radius * Math.sin(Math.PI * 4 / 3 + diffAngle))

    this.context.closePath();
    var fs;
    if (ship.player && i == 0) {
        fs = "blue"
    } else if (ship.player) {
        fs = "red"
    } else {
        fs = "grey"
    }

    this.context.fillStyle = fs;

    this.context.fill();
    this.context.stroke();
}