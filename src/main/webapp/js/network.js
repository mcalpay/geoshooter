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
function Network(inito) {
    this.encode = inito.encode;
    this.decode = inito.decode;
    this.onopen = inito.onopen;
    this.onerror = inito.onerror;
    this.onmessage = inito.onmessage;
    this.url = inito.url;
}

Network.prototype.init = function () {
    this.connection = new WebSocket(this.url, ['text']);

    if (this.onopen) {
        this.connection.onopen = (function (net) {
            return function () {
                net.onopen();
            }
        })(this);
    }

    if (this.onerror) {
        this.connection.onerror = (function (net) {
            return function (error) {
                net.onerror(error);
            }
        })(this);
    } else {
        this.connection.onerror = function (error) {
            console.log("error on socket:", error);
        }
    }

    if (this.onmessage) {
        this.connection.onmessage = (function (net) {
            return function (e) {
                net.onmessage(net.decode(e.data));
            }
        })(this);
    }
}

Network.prototype.send = function (msg) {
    if (this.isConnectionOpen()) {
        this.connection.send(this.encode(msg));
        return true;
    }
    return false;
}

Network.prototype.isConnectionOpen = function () {
    return this.connection.readyState == 1;
}


