import { useEffect, useRef } from "react";
import mqtt from "mqtt";
import { useSTM32Store } from "../store/stm32Store";
import type { STM32Data } from "../types/stm32.types";

export function useSTM32() {
  const {
    setData,
    pushAdcHistory,
    pushCtrHistory,
    pushRtHistory,
    setConnectionError,
  } = useSTM32Store();
  const dataRef = useRef(useSTM32Store.getState().data);
  const wsRef = useRef<WebSocket | null>(null);

  // Selalu update dataRef saat store berubah
  useEffect(() => {
    return useSTM32Store.subscribe((state) => {
      dataRef.current = state.data;
    });
  }, []);

  const wsUrl = import.meta.env.VITE_WS_URL || "wss://broker.emqx.io:8084/mqtt";

  useEffect(() => {
    // ── MODE REAL (MQTT ke Broker Publik) ──
    const connect = () => {
      console.log("[MQTT] Connecting to", wsUrl);
      setConnectionError("Connecting to MQTT broker...");

      const options = {
        clientId: "web_" + Math.random().toString(16).substring(2, 10),
        keepalive: 60,
        clean: true,
        reconnectPeriod: 1000,
      };

      const client = mqtt.connect(wsUrl, options);

      // Buat wrapper seperti WebSocket agar bisa dikirim balik dari store (sendCommand)
      const fakeWs = {
        readyState: 0,
        send: (data: string) => {
          client.publish("proyek_blackpill/data_cmd", data);
          console.log("[MQTT] Sent cmd:", data);
        },
        close: () => client.end(),
      } as unknown as WebSocket;

      wsRef.current = fakeWs;
      useSTM32Store.getState().setWsRef(wsRef);

      client.on("connect", () => {
        console.log("[MQTT] Connected!");
        setConnectionError(null);
        Object.defineProperty(fakeWs, "readyState", {
          value: 1,
          writable: true,
        }); // 1 = WebSocket.OPEN
        client.subscribe("proyek_blackpill/data_sensor", (err) => {
          if (err) {
            console.error("[MQTT] Subscribe error:", err);
            setConnectionError("Gagal subscribe ke topik MQTT");
          } else {
            console.log("[MQTT] Subscribed to proyek_blackpill/data_sensor");
          }
        });
      });

      client.on("message", (_topic, message) => {
        try {
          const incoming: Partial<STM32Data> = JSON.parse(message.toString());
          // Cek apakah data ini valid object dan tidak null (minimal ada field yang bisa dibaca)
          if (!incoming || typeof incoming !== "object") {
            throw new Error("Format data tidak valid: " + message.toString());
          }

          const next: STM32Data = { ...dataRef.current, ...incoming };
          setData(next);

          if (next.adc !== undefined) pushAdcHistory(next.adc);
          if (next.counter !== undefined) pushCtrHistory(next.counter);
          if (next.reactionMs !== undefined) pushRtHistory(next.reactionMs);

          setConnectionError(null); // Clear error on successful parse
        } catch (e: unknown) {
          console.warn("[MQTT] Parse error:", e);
          const errMsg = e instanceof Error ? e.message : String(e);
          setConnectionError(`Gagal parse JSON: ${errMsg}`);
        }
      });

      client.on("close", () => {
        Object.defineProperty(fakeWs, "readyState", {
          value: 3,
          writable: true,
        }); // 3 = WebSocket.CLOSED
        console.log("[MQTT] Disconnected");
        setConnectionError("Terputus dari MQTT broker.");
      });

      client.on("error", (e) => {
        console.error("[MQTT] Error:", e);
        setConnectionError(`Error koneksi: ${e.message}`);
      });

      client.on("offline", () => {
        console.warn("[MQTT] Offline");
        setConnectionError(
          "MQTT Client sedang offline / tidak bisa mencapai broker.",
        );
      });

      return client;
    };

    const client = connect();
    return () => {
      client.end();
    };
  }, [
    wsUrl,
    setData,
    pushAdcHistory,
    pushCtrHistory,
    pushRtHistory,
    setConnectionError,
  ]);
}
