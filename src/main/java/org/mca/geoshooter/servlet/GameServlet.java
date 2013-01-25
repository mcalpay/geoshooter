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
import org.eclipse.jetty.websocket.WebSocketServlet;

import javax.servlet.http.HttpServletRequest;

/**
 * User: malpay
 * Date: 07.01.2013
 * Time: 09:57
 */
public class GameServlet extends WebSocketServlet {

    private GameManager gameManager = new GameManager();

    @Override
    public WebSocket doWebSocketConnect(HttpServletRequest httpServletRequest, String protocol) {
        return new GameSocket(gameManager);
    }

}
