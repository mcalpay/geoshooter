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
function Geo() {
}

Geo.prototype.findAngleWithAxis = function (ship) {
    var angle = Math.atan((ship.looksAt.y - ship.center.y) / (ship.looksAt.x - ship.center.x))
    if ((ship.looksAt.x - ship.center.x) < 0) {
        angle += Math.PI
    }
    return angle;
}

Geo.prototype.changeLooksAtWithDegree = function (ship, degree) {
    var angle = this.findAngleWithAxis(ship)

    var xDiff = (ship.looksAt.x - ship.center.x);
    var yDiff = (ship.looksAt.y - ship.center.y);

    var xR = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    xDiff = xR * Math.cos(angle + Math.PI * degree);
    yDiff = xR * Math.sin(angle + Math.PI * degree);

    ship.looksAt.x = xDiff + ship.center.x;
    ship.looksAt.y = yDiff + ship.center.y;
}

Geo.prototype.moveInLine = function (center, looksAt, r) {
    var xDiff = (looksAt.x - center.x);
    var yDiff = (looksAt.y - center.y);
    var moveLen = r;
    var targetLen = this.distance(center, looksAt);
    var xDiffScaled = xDiff * (moveLen / targetLen);
    var yDiffScaled = yDiff * (moveLen / targetLen);
    looksAt.x += xDiffScaled;
    looksAt.y += yDiffScaled;
    center.x += xDiffScaled;
    center.y += yDiffScaled;
}

Geo.prototype.distance = function (center, looksAt) {
    return Math.sqrt((center.x - looksAt.x) * (center.x - looksAt.x) +
        (center.y - looksAt.y) * (center.y - looksAt.y));
}