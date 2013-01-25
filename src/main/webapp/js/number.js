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
function NumberGenerator(net, requestThreshold, requestLength) {
    this.requestLength = requestLength;
    this.requestThreshold = requestThreshold;
    this.net = net;
    this.numbers = [];
    this.updatesFromNet = false;
}

NumberGenerator.prototype.init = function (numbers) {
    this.numbers = numbers;
}

NumberGenerator.prototype.addNumbers = function (numbers) {
    this.numbers = this.numbers.concat(numbers);
}

NumberGenerator.prototype.setUpdates = function (updates) {
    this.updatesFromNet = updates;
}

NumberGenerator.prototype.reset = function () {
    this.numbers = [];
}

NumberGenerator.prototype.next = function () {
    var num;
    if (this.numbers.length == 0) {
        num = Math.random();
    } else {
        num = this.numbers.pop();
        if (this.updatesFromNet && this.numbers.length < this.requestThreshold) {
            this.net.send({cmd:"numbers", length:this.requestLength});
        }
    }
    return num;
}