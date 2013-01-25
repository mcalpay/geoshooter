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
function AudioPlayer(width,height, position) {
    this.context = new window.webkitAudioContext();
    this.resources = [];
    this.width = width;
    this.height = height;
    this.position = position;
}

AudioPlayer.prototype.setPosition= function(position) {
    this.position = position;
}

AudioPlayer.prototype.play = function(id,gainVol) {
    var holder = this.resources[id];
    var gnode = this.context.createGainNode();
    var source = this.context.createBufferSource();
    source.loop = holder.loop;
    source.buffer = holder.src;
    source.connect(gnode);
    gnode.connect(this.context.destination);
    if (gainVol) {
        gnode.gain.value = gainVol;
    } else {
        gnode.gain.value = holder.gain;
    }

    this.resources[id].source = source;
    source.noteOn(0);
    return this;
}

AudioPlayer.prototype.playPositional = function(id, src, gainVol) {
    var holder = this.resources[id];
    var gnode = this.context.createGainNode();
    var source = this.context.createBufferSource();
    source.buffer = holder.src;
    var panner = this.context.createPanner();

    panner.setPosition(src.x / this.width, src.y / this.height, 0);
    panner.connect(gnode);
    gnode.connect(this.context.destination);
    source.connect(panner);

    this.context.listener.setPosition(this.position.x / this.width, this.position.y / this.height, 0);
    if (gainVol) {
        gnode.gain.value = gainVol;
    } else {
        gnode.gain.value = holder.gain;
    }

    source.noteOn(0);
}

AudioPlayer.prototype.stop = function(id) {
    this.resources[id].source.noteOff(0);
}

AudioPlayer.prototype.addResource = function(id,url,gain,loop,playWhenReady) {
    this.resources[id] = {id:id,url:url,gain:gain,loop:loop,playWhenReady:playWhenReady};
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = (function(player,id){
        return function(ev) {
            player.context.decodeAudioData(ev.target.response,
                function (buffer) {
                    player.resources[id].src = buffer;
                    if (player.resources[id].playWhenReady) {
                        player.play(id);
                    }
                },
                function (err) {
                    console.log('Error decoding', err);
                }
            );
        };
    })(this,id);
    request.onerror = function (err) {
        console.log("error on http request",err);
    };
    request.send();
    return this;
}



