#include <OneWire.h>
#include <DallasTemperature.h>
#include <Streaming.h>
#include <ArduinoJson.h>

#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

#include "./BeerFridgeSecrets.h"

#define ONE_WIRE_BUS            D4      // DS18B20 pin
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature DS18B20(&oneWire);
char temperatureString[6];


byte mac[6];
ESP8266WebServer server ( 80 );

bool fridgeEnabled = false;
double SET_TEMP = 6.6;

const byte FRIDGE_PIN = 16;
bool fridgeIsOn = false;
unsigned int stateChangeTime = 0;
bool fridgeResting = false;
int MAX_RUN_TIME = 1 * 60 * 60 * 1000;
int MIN_RUN_TIME = 1 * 60 * 1000;
int MIN_OFF_TIME = 1 * 60 * 1000;

String messagesUrl = (String)beerFridgeHost + (String)"/messages";

String hostname = "beer-node";
int version = 0;

void setup() {
  Serial.begin(115200);

  pinMode(FRIDGE_PIN, OUTPUT);

  // setup WiFi
  setup_wifi();

  // setup OneWire bus
  DS18B20.begin();
}

void loop() {
  server.handleClient();

  float temperature = getTemperature();
  Serial.println(temperature);
  // convert temperature to a string with two digits before the comma and 2 digits for precision
  dtostrf(temperature, 2, 2, temperatureString);

  if (fridgeEnabled && temperature > SET_TEMP) {
    if (!fridgeIsOn) {
      if (millis() - stateChangeTime > MIN_OFF_TIME) {
        fridgeIsOn = true;
        fridgeResting = false;
        digitalWrite(FRIDGE_PIN, HIGH);
        stateChangeTime = millis();
      }
    } else if (millis() - stateChangeTime > MAX_RUN_TIME && !fridgeResting) {
      digitalWrite(FRIDGE_PIN, LOW);
      stateChangeTime = millis();
      fridgeResting = true;
    } else if (millis() - stateChangeTime > MIN_RUN_TIME && fridgeResting) {
      digitalWrite(FRIDGE_PIN, HIGH);
      fridgeResting = false;
      stateChangeTime = millis();
    }
  } else {
    if (fridgeIsOn && millis() - stateChangeTime > MIN_RUN_TIME) {
      digitalWrite(FRIDGE_PIN, LOW);
      fridgeResting = false;
      fridgeIsOn = false;
      stateChangeTime = millis();
    }
  }

  HTTPClient http;
  Serial.print("requesting: ");
  Serial.println(messagesUrl);
  http.begin(messagesUrl);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  String args;
  args += F("id=");
  args += macToString(mac);
  args += F("&version=");
  args += String(version);
  args += F("&temp=");
  args += String(temperature, 2);
  args += F("&state=");
  if (fridgeIsOn && !fridgeResting) {
    args += "ON";
  } else {
    args += "OFF";
  }

  Serial.println(http.POST(args));
  DynamicJsonBuffer jsonBuffer;
  JsonObject& root = jsonBuffer.parseObject(http.getString());
  if (root["version"]) {
    version = root["version"];
  }

  if (root["hostname"]) {
    const char* newHostname = root["hostname"];
    if ( MDNS.begin ( newHostname ) ) {
      hostname = newHostname;
      Serial.println ( "MDNS responder started" );
    }
  }

  if (root["targetTemperature"]) {
    SET_TEMP = root["targetTemperature"];
    Serial.print("Set the temp to: ");
    Serial.println(SET_TEMP);
  }
  http.end();

  delay(60000);
}

void setup_wifi() {
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  WiFi.macAddress(mac);

  if ( MDNS.begin ( hostname.c_str() ) ) {
    Serial.println ( "MDNS responder started" );
  }

  server.on("/configure", HTTP_POST, handleConfigure);
  server.begin();
}

void handleConfigure() {
  if (!server.hasArg("plain")) {
    server.send(500, "text/plain", "No body");
    return;
  }

  DynamicJsonBuffer jsonBuffer;
  JsonObject& config = jsonBuffer.parseObject(server.arg("plain"));
  if (!config.success()) {
    server.send(500, "text/plain", "Could not parse config\n");
  } else {
    fridgeEnabled = config["enabled"];
    if (fridgeEnabled) {
      SET_TEMP = config["setTemp"];
      Serial.print("Set the temp to: ");
      Serial.println(SET_TEMP);
    }
    server.send(200, "text/plain", "Ok\n");
  }
}

float getTemperature() {
  Serial << "Requesting DS18B20 temperature..." << endl;
  float temp;
  DS18B20.requestTemperatures();
  temp = DS18B20.getTempCByIndex(0);
  return temp;
}

String macToString(const unsigned char* mac) {
  char buf[20];
  snprintf(buf, sizeof(buf), "%02x:%02x:%02x:%02x:%02x:%02x",
           mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  return String(buf);
}
