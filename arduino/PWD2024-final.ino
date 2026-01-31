#include <hd44780.h>

//#include <LiquidCrystal.h>

//#include <Adafruit_LiquidCrystal.h>

#include <Wire.h>
#include <hd44780.h>            // main hd44780 header
#include <hd44780ioClass/hd44780_I2Cexp.h> // i2c expander i/o class header
#include <ShiftRegister74HC595.h>
#include "SwitchManager.h"

hd44780_I2Cexp lcd; // declare lcd object: auto locate & config exapander chip
//Adafruit_LiquidCrystal lcd(0);


const int LCD_COLS = 20;
const int LCD_ROWS = 4;

const int GO_BUTTON = 11;
int buttonPressed = 0;


// This is the shift register object that runs the LEDs
ShiftRegister74HC595<1> sr(2, 3, 4);

SwitchManager goButton;

void welcomeScreen(){
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("Welcome to the Pack");
  lcd.setCursor(0,1);
  lcd.print("272 Pinewood Derby");
  lcd.setCursor(0,2);
  lcd.print("Use the USB or press");
  lcd.setCursor(0,3);
  lcd.print("the button to race");
}
 
void setup() { 
  if (Serial)
    Serial.begin(9600);

  pinMode(7, OUTPUT);
  digitalWrite(7, LOW);
  pinMode(8, INPUT);
  digitalWrite(8, HIGH);

  lcd.begin(LCD_COLS, LCD_ROWS);
  lcd.noLineWrap();
  lcd.noCursor();

  goButton.begin(GO_BUTTON, handleSwitches);

  welcomeScreen();
  
}

void lightBlink(int light, int count){
  sr.setAllLow();
  for (int i=0; i<count; i++){
    sr.set(light, HIGH);
    delay(100);
    sr.set(light, LOW);
    delay(100);
 
  }  
}

void lightFlash3(){
  for (int i=0; i<3; i++){
    sr.setAllLow();
    delay(100);
    sr.setAllHigh();
    delay(100);
    sr.setAllLow();
  }  
}

void lightChase(){
  for (int i=0; i<6; i++){
    sr.setAllLow();
    sr.set(i, HIGH);
    delay(100);
  }

  for (int i=5; i>=0; i--){
    sr.setAllLow();
    sr.set(i, HIGH);
    delay(100);
  }
}

void lightCount(int rev=0){
  if (rev){
     sr.setAllHigh();
     for (int i=5; i>=0; i--){
          sr.set(i, LOW);
          delay(500);
     }
  } else {
     sr.setAllLow();
     for (int i=0; i<6; i++){
          sr.set(i, HIGH);
          delay(500);
     }

  }
  
}

void lightCenterIn(){
  sr.setAllHigh();
  for (int i=0; i<3; i++){
    sr.set(i, LOW);
    sr.set(5-i, LOW);
    delay(1000);
  }
}

// Race running


unsigned long raceTime[6];
char raceDone[6];

unsigned long dnfTime;

void prepRace(){
  for (int i=0; i<6; i++){
     raceDone[i] = 0;
     raceTime[i] = 0;
  }
  dnfTime = 0;
  lcd.clear();
  lcd.print("Running race");
}

int allDone(){
  return raceDone[0] && raceDone[1] && raceDone[2] && raceDone[3] && raceDone[4] && raceDone[5];
}

int detectCar(int port){
  if (analogRead(A0 + port) < 100){
    return 1;
  } else {
    return 0;
  }
}

void launchGate(){
   // Trigger the solonoid
  digitalWrite(7, HIGH);
  delay(100);
  digitalWrite(7, LOW);
}

void runRace(){
  while (digitalRead(8) == 1){
    Serial.println("Waiting for gate to set");
  }

  prepRace();
  lightCount(-1);
  lightFlash3();

  // Trigger the solonoid
  launchGate();

  // Wait for the gate to drop; note you can manual trigger the drop here
  while (digitalRead(8) == 0){
    Serial.println("Waiting");
  }
  
  unsigned long startOfRace = millis();

  Serial.println("Go!");
  lcd.clear();
  lcd.print("Go!");


  unsigned long lastScan = 0;
  unsigned long maxLoop = 0;
  unsigned long minLoop = 10000;

  do {
    unsigned long now = millis();
    unsigned long mnow = micros();
    
    if (lastScan > 0){
      unsigned long loopTime = mnow - lastScan;
      if (loopTime > maxLoop)
         maxLoop = loopTime;
      if (loopTime < minLoop)
         minLoop = loopTime;
    }
    lastScan = mnow;
    
    for (int i=0; i<6; i++){
       if(!raceDone[i]){
          if (detectCar(i)){
            raceTime[i] = now - startOfRace;
            raceDone[i] = 1;
            if (dnfTime == 0) dnfTime = now + 5000;
            sr.set(i, HIGH);
          }
       }
    }
    if ((dnfTime > 0) && (now > dnfTime))
      for (int i=0; i<6; i++) raceDone[i] = 1;
  } while (!allDone());


  int winner = -1;
  unsigned long wintime = 100000L;

  lcd.clear();

  Serial.print("Race times:\n### [");
  for (int i=0; i<6; i++){
    int lcdr = i % 3 + 1;
    int lcdc = 0; if (i > 2) lcdc = 10;
    lcd.setCursor(lcdc, lcdr);
    lcd.print(i+1);
    lcd.print(" ");
    if (raceTime[i] > 0){
      lcd.print(raceTime[i]);
    } else {
      lcd.print("DNF");
    }
    if (i) Serial.print(", ");
    Serial.print(raceTime[i]);
    if ((raceTime[i] > 0) && (raceTime[i] < wintime)){
        wintime = raceTime[i];
        winner = i;
    }
  }

  Serial.println("]");
  sr.setAllLow();
  lightBlink(winner, 5);
  sr.set(winner, HIGH);

  Serial.print("Max loop time: ");
  Serial.print(maxLoop);
  Serial.println(" us");

  Serial.print("Min loop time: ");
  Serial.print(minLoop);
  Serial.println(" us");

  Serial.println("Race done!");

  // Need sorted list
  int ranklist[6];
  for (int i=0; i<6; i++) ranklist[i] = i;

  // Sort the rank list -- brute force bubble sort - 0 is DNF

  for (int x=0; x<6; x++){
    for (int y=x+1; y<6; y++){
      long timeA = raceTime[ranklist[x]];
      long timeB = raceTime[ranklist[y]];

      if (timeA == 0) timeA = 10000;
      if (timeB == 0) timeB = 10000;

      if (timeB < timeA){
        int A = ranklist[x];
        ranklist[x] = ranklist[y];
        ranklist[y] = A;

      }

    }

  }

  /*
  for (int I=0; I<6; I++){
     for (int j=0; j<5; j++){
         int swap = 0;
            if (raceTime[ranklist[j]] == 0){
              swap = 1;
            } else if (raceTime[ranklist[j]] > raceTime[ranklist[j+1]]){
              swap = 1;
            }

            if (swap == 1){
                int A = ranklist[j];
                ranklist[j] = ranklist[j+1];
                ranklist[j+1] = A;
            }
        }
    }
    */
    
    lcd.setCursor(0,0);
    lcd.print("Ranking ");
    for (int i=0; i<6; i++) {
      if (raceTime[ranklist[i]] == 0){
        lcd.print("*");
      } else {
        lcd.print(ranklist[i]+1);
      }
      lcd.print(" ");
    }
    
  
  
}

void
orangeButtonTest(){
  Serial.println("Start orange button test for 5 seconds");
  for (int i=0; i<500; i++){
    goButton.check();
    Serial.println(buttonPressed);
    delay(10);
  }
  Serial.println("Finish orange button test");
}

void
launchGateTest(){
  Serial.println("Start launch gate test for 5 seconds");
  for (int i=0; i<500; i++){
    Serial.println(digitalRead(8));
    delay(10);
  }
  Serial.println("Finish launch gate test");
}



String
getLine(){
  String rval = "";
  while(1){
    goButton.check();

    if (buttonPressed == 1) {
       buttonPressed = 0;
       return "race";
    }
    
    if (Serial.available()){
      char c = Serial.read();
      if (c == '\n') return rval;
      rval += c;
    }
  }
  
}

void handWave(unsigned long seconds){
  unsigned long now = millis();
  unsigned long done = now + seconds * 1000;

  Serial.print("Running hand wave from ");
  Serial.print(now);
  Serial.print(" until ");
  Serial.println(done);
  while (millis() < done){
    for (int i=0; i<6; i++){
       if (detectCar(i)){
           sr.setNoUpdate(i, HIGH);
       } else {
          sr.setNoUpdate(i, LOW);
       }
    }
    sr.updateRegisters();
  }
  
}

void testSequence(){
  Serial.println("Testing all lights (lighting from 1 -> 6)");
  lightCount();
  sr.setAllLow();
  lightFlash3();
  Serial.println("Testing all IR sensors (all should be over 400)");
  for (int i=0; i<6; i++){
    Serial.print("Lane 1: ");
    Serial.println(analogRead(A0 + i));
  }

  Serial.println("Starting handwave test (for 60 seconds)");
  handWave(60);
  Serial.println("All tests done");
  
}

void loop(){
  Serial.print(">>> ");;
  Serial.flush();
  String cmd = getLine();
  Serial.println(cmd);  

  if (cmd.startsWith("help")){
    Serial.println("help   - this screen");
    Serial.println("test   - test finish systems");
    Serial.println("launch - trigger launch gate");
    Serial.println("orange - test orange button");
    Serial.println("gate   - test launch gate sensor");
    Serial.println("race   - run a race");
  } else if (cmd.startsWith("test")){
     testSequence();
  } else if (cmd.startsWith("race")){
     runRace();
  } else if (cmd.startsWith("launch")){
    Serial.println("Testing launch gate");
    launchGate();
  } else if (cmd.startsWith("orange")){
    Serial.println("Testing orange button");
    orangeButtonTest();
  } else if (cmd.startsWith("gate")){
    Serial.println("Launch gate sensor test");
    launchGateTest();
  }
}

void loop3() {

  lightCenterIn();
  lightCount();
  lightCount(1);

  for (int i=0; i<3; i++)
    lightChase();

  lightFlash3();

  // setting all pins at the same time to either HIGH or LOW
  //sr.setAllHigh(); // set all pins HIGH
  //delay(500);
  
  sr.setAllLow(); // set all pins LOW
  //delay(500); 
  

  // setting single pins
  for (int i = 0; i < 8; i++) {
    
    sr.set(i, HIGH); // set single pin HIGH
    delay(500); 
  }
  
  
  // set all pins at once
  //uint8_t pinValues[] = { B10101010 }; 
  //sr.setAll(pinValues); 
  //delay(1000);

  
  // read pin (zero based, i.e. 6th pin)
  //uint8_t stateOfPin5 = sr.get(5);
  //sr.set(6, stateOfPin5);


  // set pins without immediate update
  //sr.setNoUpdate(0, HIGH);
  //sr.setNoUpdate(1, LOW);
  // at this point of time, pin 0 and 1 did not change yet
  //sr.updateRegisters(); // update the pins to the set values
}

void handleSwitches(const byte newState, const unsigned long interval, const byte whichPin){
  if (newState == 0){
    Serial.println("Button pressed");
    buttonPressed = 1;
  }
}
