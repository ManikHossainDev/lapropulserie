'use client';

import { useEffect } from 'react';

export default function NovaChatbot() {
    useEffect(() => {
        const BUBBLE_SIZE = "350px";
        const BUBBLE_RADIUS = "24px";
        const BUBBLE_BOTTOM = "20px";
        const BUBBLE_RIGHT = "20px";

        const iframe = document.createElement("iframe");
        // iframe.src = "https://limova-web-sltj.onrender.com/embededChatbot?connectionId=3f4ea327-04bf-4f89-98da-c2810f575120";
        iframe.src = "https://limova-web-sltj.onrender.com/embededChatbot?connectionId=3f4ea327-04bf-4f89-98da-c2810f575120&mode=iframe";
        iframe.setAttribute("allow", "web-share");


        Object.assign(iframe.style, {
            position: "fixed",
            bottom: BUBBLE_BOTTOM,
            right: BUBBLE_RIGHT,
            border: "none",
            zIndex: "1000",
            width: '450px',
            height: '550px',
            borderRadius: BUBBLE_RADIUS,
            transition: "all 0.3s ease",
            //   boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            //   overflow: "hidden",
        });

        document.body.appendChild(iframe);

        function notifyViewport() {
            iframe.contentWindow?.postMessage(
                { parentViewport: window.innerWidth },
                "*"
            );
        }

        iframe.addEventListener("load", notifyViewport);
        window.addEventListener("resize", notifyViewport);

        function handleMessage(event) {
            const data = event.data;
            if (data && typeof data === "object") {
                if ("chatbotStyle" in data) {
                    Object.assign(iframe.style, data.chatbotStyle);
                }
                if ("requestViewport" in data) {
                    notifyViewport();
                }
            }
        }

        window.addEventListener("message", handleMessage);

        // Cleanup on unmount
        return () => {
            iframe.removeEventListener("load", notifyViewport);
            window.removeEventListener("resize", notifyViewport);
            window.removeEventListener("message", handleMessage);
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        };
    }, []);

    return null;
}