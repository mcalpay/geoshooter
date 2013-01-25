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
package org.mca.geoshooter.servlet;

import org.json.JSONObject;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * User: malpay
 * Date: 08.01.2013
 * Time: 03:51
 */
public class GameManager implements Serializable {

    private int id = 1;

    private List<GameSocket> sockets = new CopyOnWriteArrayList<GameSocket>();

    private List<Double> numbers = new CopyOnWriteArrayList<Double>();

    public GameManager() {
    }

    private void generateNumbers(int len) {
        for (int i = 0; i < len; i++) {
            this.numbers.add(Math.random());
        }
    }

    public synchronized int getNextId() {
        return id++;
    }

    public void addSocket(GameSocket gameSocket) {
        sockets.add(gameSocket);
        generateNumbers(100);
        int i = 0;
        for (GameSocket other : sockets) {
            if (!gameSocket.equals(other)) {
                other.addNewPlayerShip(gameSocket.getShip(), numbers, i == 0);
                gameSocket.addNewPlayerShip(other.getShip(), numbers, false);
            }
        }

        gameSocket.setNumbers(numbers);
    }

    public void removeSocket(GameSocket gameSocket) {
        sockets.remove(gameSocket);
        for (GameSocket other : sockets) {
            if (!gameSocket.equals(other)) {
                other.removeShip(gameSocket.getShip());
            }
        }
    }

    public void updatedLooks(GameSocket gameSocket) {
        for (GameSocket other : sockets) {
            if (!gameSocket.equals(other)) {
                other.updateLooksShip(gameSocket.getShip());
            }
        }
    }

    public void fires(GameSocket gameSocket, JSONObject ship) {
        for (GameSocket other : sockets) {
            if (!gameSocket.equals(other)) {
                other.addNewShip(ship);
            }
        }
    }

    public void numbers() {
        generateNumbers(100);
        for (GameSocket other : sockets) {
            other.setNumbers(numbers);
        }
    }
}
