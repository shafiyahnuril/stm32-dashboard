import serial
import paho.mqtt.client as mqtt
import time
import json

# --- PENGATURAN SERIAL ---
SERIAL_PORT = 'COM3'  # Ganti dengan nomor COM STM32 Anda
BAUD_RATE = 115200

# --- PENGATURAN MQTT ---
# Kita menggunakan EMQX, broker publik gratis yang sangat andal
MQTT_BROKER = 'broker.emqx.io'
MQTT_PORT = 1883
MQTT_TOPIC = 'proyek_blackpill/data_sensor'

print(f"Mencoba membuka {SERIAL_PORT}...")

try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    print(f"Berhasil terhubung ke STM32 di {SERIAL_PORT}")
except Exception as e:
    print(f"Gagal membuka port serial. Pastikan Serial Monitor ditutup!\nError: {e}")
    exit()

# Inisialisasi klien MQTT
client = mqtt.Client()

try:
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
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
            # Membaca data dari STM32
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            
            # Jika baris tidak kosong, kirim ke website
            if line:
                print(f"[Upload] {line}")
                client.publish(MQTT_TOPIC, line)
                
except KeyboardInterrupt:
    print("\nProgram dihentikan oleh pengguna.")
finally:
    ser.close()
    client.loop_stop()