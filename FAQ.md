

# Frequentley Asked Questions (FAQ)
### The widget doesn't show up properly on the homescreen.
Go to your homescreen, Click&Hold. Edit Homescreen. Right above there‘s a +. Click it. search Scriptable. Click it. Then you can swipe two times. The first option  is the small widget, when you swipe once you can add the medium one  (this is the one you need) and when swipe two times it's the big one. 

Does it say "Select script in widget configurator"? Then you have to "click & hold" -> "edit widget". Then choose for Script "NBA-MyTeam-Widget", for When Interacting "Run script".

### I get the following error: 'TypeError: undefined is not an object (evaluating 'oTeamData[MY_NBA_TEAM].simpleName')'      
Replace
```
const MY_NBA_TEAM = "ENTER_TEAM_ABBREVIATION_HERE";
```
with, e.g.
```
const MY_NBA_TEAM = "LAL";
```
if the Lakers are your team.

### I get the following error: 'Error on line ...: syntax error: unexpected EOF'
Make sure you copied the whole script from [here](https://raw.githubusercontent.com/thisisevanfox/nba-my-team-ios-widget/main/NBA-MyTeam-Widget.js).
Make sure you copy it until the following lines are marked:
```
/********************************************************
 ************* MAKE SURE TO COPY EVERYTHING *************
 *******************************************************/
```

### no-background doesn't work
1. Make sure no-background.js is installed properly: Just copy [this](https://raw.githubusercontent.com/supermamon/scriptable-no-background/master/no-background.js) as a seperate script "no-background".

2. After that, make sure you changed the following line in the NHL script from
```
const NO_BACKGROUND_INSTALLED = false;
```
to
```
const NO_BACKGROUND_INSTALLED = true;
```

### How to set light- or dark-mode?
Search the line
```
const DARK_MODE = Device.isUsingDarkAppearance();
```
This is setting uses the system color scheme.

Write the following for having dark-mode activated:
```
const DARK_MODE = true;
```

Write the following for having light-mode activated:
```
const DARK_MODE = false;
```
### I don't want to be spoilered. How to disable livescores and W-L-OTL stats, standings and top scorer?
For hiding livescores replace
```
const SHOW_LIVE_SCORES = true;
```
with
```
const SHOW_LIVE_SCORES = false;
```
For hiding W-L stats, standings and top scorer replace
```
const SHOW_STATS_AND_STANDINGS = true;
```
with
```
const SHOW_STATS_AND_STANDINGS = false;
```
### How to disable link to NBA page?
Replace
```
const WIDGET_URL = "http://nba.com";
```
with
```
const WIDGET_URL = "";
```

### How can I get future updates for this widget?
Just head over to [this](https://forms.gle/4SBmYLcVgzFak7SZ9) GoogleForm, type your email address and I'll send you an email when a new update is released.

### How to support the project?
As some users asked how to donate to the project I created this section:

Of course I won't take anything for the widget, but if you really want to donate, feel free to buy me a coffee via paypal.

<p align="center">
<a href="http://paypal.me/thisisevanfox" target="_blank"><img src="https://camo.githubusercontent.com/74865d9b3ad7b0a216f64653cee3d2027790220fb7b0302cf693e5a9e7c20c7a/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f70617970616c2d646f6e6174652d79656c6c6f772e737667" alt="Donate via Paypal" border="0" /></a>
</p>  
