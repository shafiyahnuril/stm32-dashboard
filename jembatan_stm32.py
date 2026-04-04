import serial
import paho.mqtt.client as mqtt
import time
import json

# --- PENGATURAN SERIAL ---
SERIAL_PORT = 'COM3'  # Ganti dengan nomor COM STM32 Anda
BAUD_RATE = 115200

# --- PENGATURAN MQTT ---
MQTT_BROKER  = 'broker.emqx.io'
MQTT_PORT    = 1883
TOPIC_SENSOR = 'proyek_blackpill/data_sensor'
TOPIC_CMD    = 'proyek_blackpill/data_cmd'

print(f"Mencoba membuka {SERIAL_PORT}...")

try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    print(f"Berhasil terhubung ke STM32 di {SERIAL_PORT}")
except Exception as e:
    print(f"Gagal membuka port serial. Pastikan Serial Monitor ditutup!\nError: {e}")
    exit()

# --- Callback MQTT: saat terima command dari website, kirim ke STM32 via serial ---
def on_message(_client, _userdata, msg):
    try:
        payload = msg.payload.decode('utf-8').strip()
        print(f"[CMD] Terima dari web: {payload}")
        cmd = json.loads(payload)

        # Peta command web → karakter command STM32
        cmd_type = cmd.get("type", "")
        if cmd_type == "SET_MODE":
            mode = cmd.get("mode", 1)
            out = f"MODE:{mode}\n"
        elif cmd_type == "TRIGGER_ISR":
            out = "ISR\n"
        elif cmd_type == "LED_ALL_ON":
            out = "LED:FF\n"
        elif cmd_type == "LED_ALL_OFF":
            out = "LED:00\n"
        elif cmd_type == "RESET_STATS":
            out = "RESET\n"
        else:
            print(f"[CMD] Tipe command tidak dikenal: {cmd_type}")
            return

        ser.write(out.encode('utf-8'))
        print(f"[CMD] Dikirim ke STM32: {out.strip()}")
    except Exception as e:
        print(f"[CMD] Error memproses command: {e}")

# Inisialisasi klien MQTT
client = mqtt.Client()
client.on_message = on_message

try:
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.subscribe(TOPIC_CMD)  # Langganan topik command dari website
    client.loop_start()
    print(f"Berhasil terhubung ke Internet (MQTT Broker: {MQTT_BROKER})")
    print("Menunggu data dari STM32...\n" + "="*40)
except Exception as e:
    print(f"Gagal terhubung ke Internet: {e}")
    exit()

# Loop utama membaca Serial dan mengirim ke MQTT
try:
    while True:
        if ser.in_waiting > 0:
            line = ser.readline().decode('utf-8', errors='ignore').strip()

            if not line:
                continue

            # Hanya teruskan baris yang merupakan JSON valid ke MQTT
            # Baris non-JSON (misal: "RHYTHM,LEVEL:2,SCORE:340,..." dari game)
            # di-skip agar tidak menyebabkan parse error di dashboard
            if line.startswith('{'):
                print(f"[Upload] {line}")
                client.publish(TOPIC_SENSOR, line)
            else:
                # Abaikan output teks dari rhythm game / binary game
                print(f"[Skip]   {line}")

except KeyboardInterrupt:
    print("\nProgram dihentikan oleh pengguna.")
finally:
    ser.close()
    client.loop_stop()
