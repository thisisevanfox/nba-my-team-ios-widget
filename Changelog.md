# Changelog 
## v1.6.0
### New features:
- Updated start year 2023 to show data for upcoming season

## v1.5.0
### Bugfixes:
- Fixed api for standings
- Fixed api for top scorers

## v1.4.0
### New features:
- Updated start year 2022 to show data for upcoming season

## v1.3.0
### New features:
- Updated start year 2021 to show data for upcoming season

### Bugfixes:
- Removed top scorers as api changed. Top scorers will return in future releases.

## v1.2.0
### New features:
- Added new setting CACHING_ACTIVE. For a few users of the widget, sometimes the message "Script not found" appeared. This was due to the caching of the logos and insufficient memory on the users' devices. If you get this error, set the new setting CACHING_ACTIVE from true to false.

## v1.1.0
### New features:
- Added new setting SHOW_HOME_TEAM_FIRST. As u/TwentyFour7 on reddit explained to me that in the US the syntax for a game always is "away team @ home team" I introduced this setting. As I live in Europe, where the home team always is mentioned first, the setting is default to the european way, so you have to set it to false if you want the US layout.

### Bugfixes:
- Fixed display of time in small widget. Widget won't crash if something goes wrong.
- Date is now displayed with two digits.

## v1  
Small (2x2) and medium (4x2) sized widgets are supported. Some features are not available in the small widget. I have written in the brackets after the features in which variant it is available.
                                                     
* Shows date and time of next game (local timezone) (Small + Medium)
* Shows city where the next game takes place (Small + Medium)
* Show live score of next game. "Live" depends on how often the widget on the homescreen updates itself. It is not possible to say exactly, when it updates. (Medium)
* Shows stats of both teams (wins, losses) (Small + Medium) 
* Shows standings of both teams (Small + Medium)
* Shows top scorer of your team and the opponent (Small + Medium)
* Shows next 4 games with date (Medium)
* Caches logos to save data volume (Small + Medium)  
* Supports light- and dark-mode (Small + Medium) 
* Supports [no-background.js](https://github.com/supermamon/scriptable-no-background) (Medium)
