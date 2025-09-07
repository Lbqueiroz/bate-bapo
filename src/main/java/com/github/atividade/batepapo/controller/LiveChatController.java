package com.github.atividade.batepapo.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;

import com.github.atividade.batepapo.dto.ChatInput;
import com.github.atividade.batepapo.dto.ChatOutpt;


@Controller
public class LiveChatController {


    @MessageMapping("/send-message")
    @SendTo("/topic/chatroom")
    public ChatOutpt sendMessage(ChatInput input) {
        return new ChatOutpt(
            HtmlUtils.htmlEscape(input.user() + ": " + input.message())
        );
    }

}