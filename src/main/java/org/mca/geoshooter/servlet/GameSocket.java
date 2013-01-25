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

import org.eclipse.jetty.websocket.WebSocket;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * User: malpay
 * Date: 07.01.2013
 * Time: 09:58
 */
public class GameSocket implements WebSocket, WebSocket.OnTextMessage {

    private Connection connection;

    private GameManager gameManager;

    private JSONObject ship;

    public GameSocket(GameManager gameManager) {
        this.gameManager = gameManager;
    }

    @Override
    public void onMessage(String msg) {
        try {
            JSONObject jo = new JSONObject(msg);
            String cmd = (String) jo.get("cmd");
            if(cmd.equals("new")) {
                this.ship = (JSONObject) jo.get("ship");
                gameManager.addSocket(this);
            } else if(cmd.equals("updateLooks")) {
                JSONObject joship = (JSONObject) jo.get("ship");
                if(ship.has("id")) {
                    joship.put("id",ship.get("id"));
                }
                this.ship = joship;
                gameManager.updatedLooks(this);
            } else if(cmd.equals("fire")) {
                JSONObject joship = (JSONObject) jo.get("ship");
                gameManager.fires(this, joship);
            } else if(cmd.equals("numbers")) {
                gameManager.numbers();
            } else {
                System.err.println("unhandled command: " + cmd);
            }
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void onOpen(Connection connection) {
        this.connection = connection;
    }

    @Override
    public void onClose(int closeCode, String msg) {
        gameManager.removeSocket(this);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        GameSocket that = (GameSocket) o;

        if (connection != null ? !connection.equals(that.connection) : that.connection != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return connection != null ? connection.hashCode() : 0;
    }

    public JSONObject getShip() {
        return ship;
    }

    public void addNewPlayerShip(JSONObject ship,List<Double> floats, boolean updatesNumbers) {
        try {
            JSONObject jo = new JSONObject();
            jo.put("cmd","addShip");
            ship.put("id",gameManager.getNextId());
            jo.put("ship",ship);
            jo.put("numbers",floats);
            jo.put("updatesNumbers",updatesNumbers);
            connection.sendMessage(jo.toString());
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    public void addNewShip(JSONObject ship) {
        try {
            JSONObject jo = new JSONObject();
            jo.put("cmd","addShip");
            ship.put("id",gameManager.getNextId());
            jo.put("ship",ship);
            connection.sendMessage(jo.toString());
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    public void updateLooksShip(JSONObject ship) {
        try {
            JSONObject jo = new JSONObject();
            jo.put("cmd","updateLooks");
            jo.put("ship",ship);
            connection.sendMessage(jo.toString());
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    public void removeShip(JSONObject ship) {
        try {
            JSONObject jo = new JSONObject();
            jo.put("cmd","remove");
            jo.put("ship",ship);
            connection.sendMessage(jo.toString());
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    public void setNumbers(List<Double> floats) {
        try {
            JSONObject jo = new JSONObject();
            jo.put("cmd","numbers");
            jo.put("numbers",floats);
            connection.sendMessage(jo.toString());
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }


}
