// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: basketball-ball;

/********************************************************
 * script     : NBA-MyTeam-Widget.js
 * version    : 1.8.1
 * description: Widget for Scriptable.app, which shows
 *              the next games for your NBA team
 * author     : @thisisevanfox
 * support    : https://git.io/JtLOD
 * date       : 2024-10-22
 *******************************************************/

/********************************************************
 ******************** USER SETTINGS *********************
 ************ PLEASE MODIFY BEFORE FIRST RUN ************
 *******************************************************/

// Type the abbreviation of your NBA team here.
// ATL (Atlanta Hawks), BOS (Boston Celtics), BKN (Brooklyn Nets),
// CHA (Charlotte Hornets), CHI (Chicago Bulls), CLE (Cleveland Cavaliers),
// DAL (Dallas Mavericks), DEN (Denver Nuggets), DET (Detroit Pistons),
// GSW (Golden State Warriors), HOU (Houston Rockets), IND (Indiana Pacers),
// LAC (Los Angeles Clippers), LAL (Los Angeles Lakers), MEM (Memphis Grizzlies),
// MIA (Miami Heat), MIL (Milwaukee Bucks), MIN (Minnesota Timberwolves),
// NOP (New Orleans Pelicans), NYK (New York Knicks), OKC (Oklahoma City Thunder),
// ORL (Orlando Magic), PHI (Philadelphia 76ers), PHX (Phoenix Suns),
// POR (Portland Trail Blazers), SAC (Sacramento Kings), SAS (San Antonio Spurs),
// TOR (Toronto Raptors), UTA (Utah Jazz), WAS (Washington Wizards)
const MY_NBA_TEAM = "ENTER_TEAM_ABBREVIATION_HERE";

// Indicator if livescores should be shown.
// If you don't want to be spoilered set it to false.
// Default: true
const SHOW_LIVE_SCORES = true;

// Indicator if all scores and stats should be shown.
// If you don't want to be spoilered set it to false.
// Default: true
const SHOW_STATS_AND_STANDINGS = true;

// Indicator if the home team should show first (like it's common in Europe)
// Default: true (home team shows first, e.g. "home - away")
// false (away team shows first, e.g. "away @ home")
const SHOW_HOME_TEAM_FIRST = false;

// Start year of current season
// For season 2024-25, the value must be "2024"
// For season 2025-26, the value must be "2025"
const CURRENT_SEASON_START_YEAR = "2024";

// URL to nba app
// Default: "http://nba.com"
// If you don't want anything to open, type:
// const WIDGET_URL = "";
const WIDGET_URL = "http://nba.com";

// Set appearance of the widget. Default apperance is set to the system color scheme.
// Device.isUsingDarkAppearance() = System color scheme (default)
// true = Widget will be in dark mode.
// false = Widget will be in light mode.
const DARK_MODE = Device.isUsingDarkAppearance();

// Indicator if caching of logos is actived (saves datavolume)
// Default: true
const CACHING_ACTIVE = true;

// Indicator if no-background.js is installed
// Default: false
// @see: https://github.com/supermamon/scriptable-no-background
const NO_BACKGROUND_INSTALLED = false;

// Indicator if no-background.js should be active
// Only matters if NO_BACKGROUND_INSTALLED is true.
const NO_BACKGROUND_ACTIVE = true;

// Indicator if no-background.js should be active for whole widget
// No background for widget and no background for stacks in the widget
// Only matters if NO_BACKGROUND_INSTALLED is true.
const NO_BACKGROUND_FULL_ACTIVE = false;

/********************************************************
 ********************************************************
 *********** DO NOT CHANGE ANYTHING FROM HERE ***********
 ********************************************************
 *******************************************************/
const {
    transparent
} = NO_BACKGROUND_INSTALLED
     ? importModule("no-background")
     : emptyFunction();

const WIDGET_BACKGROUND = DARK_MODE ? new Color("gray") : new Color("#D6D6D6");
const STACK_BACKGROUND = DARK_MODE
     ? new Color("#1D1D1D")
     : new Color("#FFFFFF"); //Smaller Container Background

let oNbaWidget;
if (config.runsInWidget) {
    // The script runs inside a widget, so we pass our instance of ListWidget to be shown inside the widget on the Home Screen.
    if (config.widgetFamily === "small") {
        oNbaWidget = await createSmallWidget();
    }
    if (config.widgetFamily === "medium") {
        oNbaWidget = await createMediumWidget();
    }
    if (config.widgetFamily === "large") {
        oNbaWidget = await createLargeWidget();
    }
    Script.setWidget(oNbaWidget);
} else {
    // The script runs inside the app, so we preview the widget medium sized.
    oNbaWidget = await createMediumWidget();
    oNbaWidget.presentMedium();
    oNbaWidget = await createSmallWidget();
    oNbaWidget.presentSmall();
    oNbaWidget = await createLargeWidget();
    oNbaWidget.presentLarge();
}

/**
 * Creates small sized widget.
 *
 * @return {ListWidget}
 */
async function createSmallWidget() {
    // Initialise widget
    const oWidget = new ListWidget();
    oWidget.backgroundColor = DARK_MODE
         ? new Color("1D1D1D")
         : new Color("#D6D6D6");
    oWidget.setPadding(10, 10, 10, 10);
    if (WIDGET_URL.length > 0) {
        oWidget.url = WIDGET_URL;
    }

    await addSmallWidgetData(oWidget);

    return oWidget;
}

/**
 * Creates medium sized widget.
 *
 * @return {ListWidget}
 */
async function createMediumWidget() {
    // Initialise widget
    const oWidget = new ListWidget();
    if (NO_BACKGROUND_INSTALLED && NO_BACKGROUND_ACTIVE) {
        oWidget.backgroundImage = await transparent(Script.name());
    } else {
        oWidget.backgroundColor = WIDGET_BACKGROUND;
    }
    oWidget.setPadding(10, 10, 10, 10);
    if (WIDGET_URL.length > 0) {
        oWidget.url = WIDGET_URL;
    }

    await addMediumWidgetData(oWidget);

    return oWidget;
}

/**
 * Add data to small sized widget.
 *
 * @param {ListWidget} oWidget
 */
async function addSmallWidgetData(oWidget) {
    const oGameData = await prepareData();

    if (oGameData != null) {
        const oTeamData = getTeamData();
        const sMyTeam = oTeamData[MY_NBA_TEAM].abbreviation;
        let oMyTeam;
        let oOpponentTeam;
        if (oGameData.homeTeam.abbreviation == sMyTeam) {
            oMyTeam = oGameData.homeTeam;
            oOpponentTeam = oGameData.awayTeam;
        } else {
            oOpponentTeam = oGameData.homeTeam;
            oMyTeam = oGameData.awayTeam;
        }

        const oUpperStack = oWidget.addStack();
        oUpperStack.layoutHorizontally();

        const oUpperTextStack = oUpperStack.addStack();
        oUpperTextStack.layoutVertically();

        const dGameDate = new Date(oGameData.gameDate);
        const dLocalDate = dGameDate.toLocaleString([], {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
        const oGameDateText = oUpperTextStack.addText(
`${dLocalDate.split(",")[0]}`);
        oGameDateText.font = Font.boldSystemFont(11);
        oGameDateText.textColor = getColorForCurrentAppearance();

        if (!!dLocalDate.split(",")[1]) {
            const oGameTimeText = oUpperTextStack.addText(
`${dLocalDate.split(",")[1].trim()}`);
            oGameTimeText.font = Font.boldSystemFont(11);
            oGameTimeText.textColor = getColorForCurrentAppearance();
        }
        const oVenueText = oUpperTextStack.addText(`@ ${oGameData.venue}`);
        oVenueText.font = Font.boldSystemFont(11);
        oVenueText.textColor = getColorForCurrentAppearance();

        oUpperStack.addSpacer();

        const oOpponentLogoImage = await loadLogo(
                oOpponentTeam.logoLink,
                oOpponentTeam.abbreviation);
        const oOpponentLogo = oUpperStack.addImage(oOpponentLogoImage);
        oOpponentLogo.imageSize = new Size(40, 40);

        if (SHOW_STATS_AND_STANDINGS) {
            oWidget.addSpacer(4);

            const oOpponentTeamStatsText = oWidget.addText(
                    "W: " +
                    oOpponentTeam.record.wins +
                    " - L: " +
                    oOpponentTeam.record.losses);
            oOpponentTeamStatsText.font = Font.systemFont(11);
            oOpponentTeamStatsText.textColor = getColorForCurrentAppearance();

            const oOpponentTeamStandingsText = oWidget.addText(
                    "Conf.: " +
                    oOpponentTeam.record.confRank +
                    "." +
                    " | Div.: " +
                    oOpponentTeam.record.divRank +
                    ".");
            oOpponentTeamStandingsText.font = Font.systemFont(11);
            oOpponentTeamStandingsText.textColor = getColorForCurrentAppearance();

            if (oOpponentTeam.topscorer.name != null) {
                const oOpponentTeamTopScorerText = oWidget.addText(
`${oOpponentTeam.topscorer.name} (${oOpponentTeam.topscorer.value})`);
                oOpponentTeamTopScorerText.font = Font.systemFont(11);
                oOpponentTeamTopScorerText.textColor = getColorForCurrentAppearance();
            }
        }

        if (SHOW_STATS_AND_STANDINGS) {
            const oDivider = oWidget.addText(`___________________________`);
            oDivider.font = Font.boldSystemFont(6);
            oDivider.textColor = getColorForCurrentAppearance();

            oWidget.addSpacer(6);

            const oBottomStack = oWidget.addStack();
            oBottomStack.layoutHorizontally();

            const oBottomTextStack = oBottomStack.addStack();
            oBottomTextStack.layoutVertically();

            const oMyTeamStatsText = oBottomTextStack.addText(
                    "W: " + oMyTeam.record.wins + " - L: " + oMyTeam.record.losses);
            oMyTeamStatsText.font = Font.systemFont(9);
            oMyTeamStatsText.textColor = getColorForCurrentAppearance();

            const oMyTeamStandingsText = oBottomTextStack.addText(
                    "Conf.: " +
                    oMyTeam.record.confRank +
                    "." +
                    " | Div.: " +
                    oMyTeam.record.divRank +
                    ".");
            oMyTeamStandingsText.font = Font.systemFont(9);
            oMyTeamStandingsText.textColor = getColorForCurrentAppearance();

            if (oMyTeam.topscorer.name != null) {
                const oMyTeamTopScorerText = oBottomTextStack.addText(
`${oMyTeam.topscorer.name} (${oMyTeam.topscorer.value})`);
                oMyTeamTopScorerText.font = Font.systemFont(9);
                oMyTeamTopScorerText.textColor = getColorForCurrentAppearance();
            }

            oBottomStack.addSpacer();

            const oMyTeamLogoImage = await loadLogo(
                    oMyTeam.logoLink,
                    oMyTeam.abbreviation);
            const oMyTeamLogo = oBottomStack.addImage(oMyTeamLogoImage);
            oMyTeamLogo.imageSize = new Size(25, 25);
        }
    } else {
        const oHeadingText = oWidget.addText(`No upcoming games. Season ended.`);
        oHeadingText.font = Font.boldSystemFont(11);
        oHeadingText.textColor = getColorForCurrentAppearance();

        oWidget.addSpacer();
    }
}

/**
 * Add data to medium sized widget.
 *
 * @param {ListWidget} oWidget
 */
async function addMediumWidgetData(oWidget) {
    const oGameData = await prepareData();

    const oTopRow = oWidget.addStack();
    await setStackBackground(oTopRow);
    oTopRow.cornerRadius = 12;
    oTopRow.size = new Size(308, 15);
    oTopRow.setPadding(7, 7, 7, 7);
    oTopRow.layoutVertically();

    const oSpacerStack1 = oTopRow.addStack();
    oSpacerStack1.layoutHorizontally();
    oSpacerStack1.addSpacer();

    if (oGameData != null) {
        const oHeadingStack = oTopRow.addStack();
        oHeadingStack.layoutHorizontally();
        oHeadingStack.addSpacer();
        oHeadingStack.setPadding(7, 7, 7, 7);

        let oHeadingText;
        if (
            oGameData.gameStatus != undefined &&
            oGameData.gameStatus != "" &&
            oGameData.homeTeam.liveScore != "-" &&
            SHOW_LIVE_SCORES) {
            oHeadingText = oHeadingStack.addText(`${oGameData.gameStatus}`);
        } else {
            const dGameDate = new Date(oGameData.gameDate);
            const dLocalDate = dGameDate.toLocaleString([], {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            });
            oHeadingText = oHeadingStack.addText(
`${dLocalDate} @ ${oGameData.venue}`);
        }
        oHeadingText.font = Font.boldSystemFont(11);
        oHeadingText.textColor = getColorForCurrentAppearance();

        oHeadingStack.addSpacer();

        const oSpacerStack2 = oTopRow.addStack();
        oSpacerStack2.layoutHorizontally();
        oSpacerStack2.addSpacer();

        oWidget.addSpacer();

        const oNextGameStack = oWidget.addStack();
        oNextGameStack.layoutHorizontally();
        oNextGameStack.cornerRadius = 12;

        if (SHOW_HOME_TEAM_FIRST) {
            await addHomeTeamStack(oNextGameStack, oGameData);
            oNextGameStack.addSpacer();
            await addAwayTeamStack(oNextGameStack, oGameData);
        } else {
            await addAwayTeamStack(oNextGameStack, oGameData);
            oNextGameStack.addSpacer();
            await addHomeTeamStack(oNextGameStack, oGameData);
        }

        oWidget.addSpacer();

        const oFutureGamesStack = oWidget.addStack();
        oFutureGamesStack.layoutHorizontally();
        oFutureGamesStack.centerAlignContent();
        await setStackBackground(oFutureGamesStack);
        oFutureGamesStack.cornerRadius = 12;
        oFutureGamesStack.setPadding(3, 7, 3, 7);
        oFutureGamesStack.addSpacer();
        oFutureGamesStack.size = new Size(308, 0);

        for (let i = 0; i < oGameData.nextGames.length; i++) {
            const oNextGame = oGameData.nextGames[i];

            const oFutureGame = oFutureGamesStack.addStack();
            oFutureGame.layoutHorizontally();
            oFutureGame.addSpacer();

            const oFutureGameLogoImage = await loadLogo(
                    oNextGame.opponent.logoLink,
                    oNextGame.opponent.abbreviation);
            const oNextGameLogo = oFutureGame.addImage(oFutureGameLogoImage);
            oNextGameLogo.imageSize = new Size(15, 15);

            const dGameDate = new Date(oNextGame.gameDate);
            const dLocalDate = dGameDate.toLocaleString([], {
                month: "2-digit",
                day: "2-digit",
            });
            const oNextGameText = oFutureGame.addText(` ${dLocalDate}`);
            oNextGameText.font = Font.systemFont(11);
            oNextGameText.textColor = getColorForCurrentAppearance();

            oFutureGame.addSpacer();
        }

        oFutureGamesStack.addSpacer();
    } else {
        const oHeadingStack = oTopRow.addStack();
        oHeadingStack.layoutHorizontally();
        oHeadingStack.addSpacer();
        oHeadingStack.setPadding(7, 7, 7, 7);

        const oHeadingText = oHeadingStack.addText(
`No upcoming games. Season ended.`);
        oHeadingText.font = Font.boldSystemFont(11);
        oHeadingText.textColor = getColorForCurrentAppearance();

        oHeadingStack.addSpacer();

        const oSpacerStack2 = oTopRow.addStack();
        oSpacerStack2.layoutHorizontally();
        oSpacerStack2.addSpacer();

        oWidget.addSpacer();
    }
}

/**
 * Adds stack for home team to the medium sized widget.
 *
 * @param {Object} oNextGameStack
 * @param {Object} oGameData
 */
async function addHomeTeamStack(oNextGameStack, oGameData) {
    const oHomeTeamStack = oNextGameStack.addStack();
    oHomeTeamStack.layoutVertically();
    oHomeTeamStack.centerAlignContent();
    oHomeTeamStack.setPadding(7, 7, 7, 7);
    await setStackBackground(oHomeTeamStack);
    oHomeTeamStack.cornerRadius = 12;
    oHomeTeamStack.size = new Size(150, 0);

    const oHomeTeamLogoStack = oHomeTeamStack.addStack();
    oHomeTeamLogoStack.layoutHorizontally();

    const oHomeLogoImage = await loadLogo(
            oGameData.homeTeam.logoLink,
            oGameData.homeTeam.abbreviation);
    const oHomeLogo = oHomeTeamLogoStack.addImage(oHomeLogoImage);
    oHomeLogo.imageSize = new Size(40, 40);

    if (SHOW_LIVE_SCORES) {
        const iHomeTeamLiveScore = oGameData.homeTeam.liveScore;
        const iHomeTeamLiveScoreSpacer =
            iHomeTeamLiveScore < 99 || iHomeTeamLiveScore === "-" ? 45 : 25;
        oHomeTeamLogoStack.addSpacer(iHomeTeamLiveScoreSpacer);
        const oHomeTeamGoalsText = oHomeTeamLogoStack.addText(
`${iHomeTeamLiveScore}`);
        oHomeTeamGoalsText.font = Font.boldSystemFont(35);
        oHomeTeamGoalsText.textColor = getColorForCurrentAppearance();
    }

    if (SHOW_STATS_AND_STANDINGS) {
        const oHomeTeamStatsText = oHomeTeamStack.addText(
                "W: " +
                oGameData.homeTeam.record.wins +
                " - L: " +
                oGameData.homeTeam.record.losses);
        oHomeTeamStatsText.font = Font.systemFont(11);
        oHomeTeamStatsText.textColor = getColorForCurrentAppearance();

        const oHomeTeamStandingsText = oHomeTeamStack.addText(
                "Conference: " +
                oGameData.homeTeam.record.confRank +
                "." +
                " | Division: " +
                oGameData.homeTeam.record.divRank +
                ".");
        oHomeTeamStandingsText.font = Font.systemFont(9);
        oHomeTeamStandingsText.textColor = getColorForCurrentAppearance();

        if (oGameData.homeTeam.topscorer.name != null) {
            const oHomeTeamTopScorerText = oHomeTeamStack.addText(
`${oGameData.homeTeam.topscorer.name} (${oGameData.homeTeam.topscorer.value})`);
            oHomeTeamTopScorerText.centerAlignText();
            oHomeTeamTopScorerText.font = Font.systemFont(9);
            oHomeTeamTopScorerText.textColor = getColorForCurrentAppearance();
        }
    }
}

/**
 * Adds stack for away team to the medium sized widget.
 *
 * @param {Object} oNextGameStack
 * @param {Object} oGameData
 */
async function addAwayTeamStack(oNextGameStack, oGameData) {
    const oAwayTeamStack = oNextGameStack.addStack();
    oAwayTeamStack.layoutVertically();
    oAwayTeamStack.centerAlignContent();
    oAwayTeamStack.setPadding(7, 7, 7, 7);
    await setStackBackground(oAwayTeamStack);
    oAwayTeamStack.cornerRadius = 12;
    oAwayTeamStack.size = new Size(150, 0);

    const oAwayTeamLogoStack = oAwayTeamStack.addStack();
    oAwayTeamLogoStack.layoutHorizontally();

    const oAwayLogoImage = await loadLogo(
            oGameData.awayTeam.logoLink,
            oGameData.awayTeam.abbreviation);
    const oAwayLogo = oAwayTeamLogoStack.addImage(oAwayLogoImage);
    oAwayLogo.imageSize = new Size(40, 40);

    if (SHOW_LIVE_SCORES) {
        const iAwayTeamLiveScore = oGameData.awayTeam.liveScore;
        const iSpacer =
            iAwayTeamLiveScore < 99 || iAwayTeamLiveScore === "-" ? 45 : 25;
        oAwayTeamLogoStack.addSpacer(iSpacer);

        const oAwayTeamGoalsText = oAwayTeamLogoStack.addText(
`${iAwayTeamLiveScore}`);
        oAwayTeamGoalsText.font = Font.boldSystemFont(35);
        oAwayTeamGoalsText.textColor = getColorForCurrentAppearance();
    }

    if (SHOW_STATS_AND_STANDINGS) {
        const oAwayTeamStatsText = oAwayTeamStack.addText(
                "W: " +
                oGameData.awayTeam.record.wins +
                " - L: " +
                oGameData.awayTeam.record.losses);
        oAwayTeamStatsText.font = Font.systemFont(11);
        oAwayTeamStatsText.textColor = getColorForCurrentAppearance();

        const oAwayTeamStandingsText = oAwayTeamStack.addText(
                "Conference: " +
                oGameData.awayTeam.record.confRank +
                "." +
                " | Division: " +
                oGameData.awayTeam.record.divRank +
                ".");
        oAwayTeamStandingsText.font = Font.systemFont(9);
        oAwayTeamStandingsText.textColor = getColorForCurrentAppearance();

        if (oGameData.awayTeam.topscorer.name != null) {
            const oAwayTeamTopScorerText = oAwayTeamStack.addText(
`${oGameData.awayTeam.topscorer.name} (${oGameData.awayTeam.topscorer.value})`);
            oAwayTeamTopScorerText.font = Font.systemFont(9);
            oAwayTeamTopScorerText.textColor = getColorForCurrentAppearance();
        }
    }
}

/**
 * Prepares data.
 *
 * @return {Object[]}
 */
async function prepareData() {
    const oData = {
        gameDate: "",
        gameStatus: "",
        venue: "",
        nextGames: [],
        homeTeam: {
            abbreviation: "",
            logoLink: "",
            record: {
                wins: "",
                losses: "",
                confRank: "",
                divRank: "",
            },
            liveScore: "",
            topscorer: {
                name: null,
                value: "",
            },
        },
        awayTeam: {
            abbreviation: "",
            logoLink: "",
            record: {
                wins: "",
                losses: "",
                confRank: "",
                divRank: ""
            },
            liveScore: "",
            topscorer: {
                name: null,
                value: "",
            },
        },
    };

    try {
        const oTeamData = getTeamData();
        let aScheduleData = await fetchScheduleData(oTeamData);

        if (aScheduleData && aScheduleData.length > 0) {
            const oNextGame = aScheduleData[0];
        

            if (oNextGame != undefined) {
            
                const oHomeTeam = filterTeamDataById(oNextGame.h.tid, oTeamData);
                const oHomeTeamStandings = await fetchStandings(oHomeTeam);
            
            
                const oHomeTeamTopScorer = await fetchTopScorer(oHomeTeam);

                const oAwayTeam = filterTeamDataById(oNextGame.v.tid, oTeamData);
                const oAwayTeamStandings = await fetchStandings(oAwayTeam);
            
            
                const oAwayTeamTopScorer = await fetchTopScorer(oAwayTeam);

                oData.gameDate = oNextGame.utctm;
                oData.venue = oHomeTeam.location;
                oData.nextGames = getNextGames(aScheduleData, oTeamData);
                oData.homeTeam.abbreviation = oHomeTeam.abbreviation;
                oData.homeTeam.logoLink = oHomeTeam.logo;
                oData.homeTeam.record = {
                    wins: oHomeTeamStandings.win,
                    losses: oHomeTeamStandings.loss,
                    confRank: oHomeTeamStandings.confRank,
                    divRank: oHomeTeamStandings.divRank,
                };
                oData.awayTeam.abbreviation = oAwayTeam.abbreviation;
                oData.awayTeam.logoLink = oAwayTeam.logo;
                oData.awayTeam.record = {
                    wins: oAwayTeamStandings.win,
                    losses: oAwayTeamStandings.loss,
                    confRank: oAwayTeamStandings.confRank,
                    divRank: oAwayTeamStandings.divRank,
                };
                if (oHomeTeamTopScorer.name != null) {
                    oData.homeTeam.topscorer.name = oHomeTeamTopScorer.name;
                    oData.homeTeam.topscorer.value = oHomeTeamTopScorer.value;
                }
                if (oAwayTeamTopScorer.name != null) {
                    oData.awayTeam.topscorer.name = oAwayTeamTopScorer.name;
                    oData.awayTeam.topscorer.value = oAwayTeamTopScorer.value;
                }

                if (SHOW_LIVE_SCORES) {
                    const oLiveData = await fetchLiveData(oNextGame.gid, oNextGame.etm);
                    oData.homeTeam.liveScore = oLiveData.homeTeamScore;
                    oData.awayTeam.liveScore = oLiveData.awayTeamScore;
                    oData.gameStatus = oLiveData.statusText;
                }
            }
        } else {
            return null;
        }

        // Set up the file manager.
        const oFiles = FileManager.local();
    
        // Set up cache
        const sCachePath = oFiles.joinPath(oFiles.cacheDirectory(), 'nba_data.json');

        // Save data for later use.
        oFiles.writeString(sCachePath, JSON.stringify(oData))

        return oData;
    } catch (e) {
        // Set up the file manager.
        const oFiles = FileManager.local();

        // Set up cache
        const sCachePath = oFiles.joinPath(oFiles.cacheDirectory(), 'nba_data.json');

        // Read previously stored data.
        const oStoredData = oFiles.readString(sCachePath);
        return JSON.parse(oStoredData);
    }
}

/**
 * Filters team data by its id.
 *
 * @param {String} sTeamId
 * @param {Object} oTeamData
 * @return {Object}
 */
function filterTeamDataById(sTeamId, oTeamData) {
    for (let key in oTeamData) {
        if (oTeamData[key].id == sTeamId) {
            return oTeamData[key];
        }
    }

    return {};
}

/**
								
  
						  
							   
					 
   
												   
																		  
 

   
 * Returns next games.
 *
 * @param {Object[]} aGames
 * @param {Object} oTeamData
 * @return {Object[]}
 */
function getNextGames(aGames, oTeamData) {
    const sMyTeamId = oTeamData[MY_NBA_TEAM].id;
    const aNextGames = [];
    const iLength = aGames.length < 5 ? aGames.length : 5;

    for (let i = 1; i < iLength; i++) {
        let oData = {
            gameDate: "",
            opponent: {
                abbreviation: "",
                logoLink: "",
            },
        };

        const oGame = aGames[i];
        oData.gameDate = oGame.etm;

        if (oGame.h.tid == sMyTeamId) {
            const oAwayTeam = filterTeamDataById(oGame.v.tid, oTeamData);
            oData.opponent.abbreviation = oAwayTeam.abbreviation;
            oData.opponent.logoLink = oAwayTeam.logo;
        } else {
            const oHomeTeam = filterTeamDataById(oGame.h.tid, oTeamData);
            oData.opponent.abbreviation = oHomeTeam.abbreviation;
            oData.opponent.logoLink = oHomeTeam.logo;
        }

        aNextGames.push(oData);
    }

    return aNextGames;
}

/**
 * Fetches schedule data from NBA api.
 *
 * @param {Object} oTeamData
 * @return {Object[]}
 */
async function fetchScheduleData(oTeamData) {
    const sMyTeam = oTeamData[MY_NBA_TEAM].simpleName.toLowerCase();
    const sUrl = `https://data.nba.com/data/v2015/json/mobile_teams/nba/${CURRENT_SEASON_START_YEAR}/teams/${sMyTeam}_schedule.json`;
    const oRequest = new Request(sUrl);
    const oResponse = await oRequest.loadJSON();

    if (oResponse) {
        const dStartDate = new Date();

        // Games in Europe are after midnight, so subtract 6 hours
        dStartDate.setHours(dStartDate.getHours() - 6);

        const aAllGames = oResponse.gscd.g;
        const aNextGames = aAllGames.filter((game) => {
            const dDate = new Date(game.gdte);

            if (
                new Date(dDate.toDateString()) >= new Date(dStartDate.toDateString())) {
                game.utctm = game.gdtutc + "T" + game.utctm + ":00Z";
                return game;
            }
        });
        return aNextGames;
    }

    return [];
}

/**
										
  
					 
   
							   
															  
																								
									   
												
									 
 

   
 * Fetches current standings data from NBA api.
 *
 * @param {Object} oTeamData
 * @return {Object}
 */
async function fetchStandings(oTeamData) {
    const sUrl = `https://global.nba.com/statsm2/team/standing.json?locale=en&teamCode=${oTeamData.shortName}`;
    const oRequest = new Request(sUrl);
    const oResponse = await oRequest.loadJSON();
    if(oResponse?.payload?.team) {
        return {
            win: oResponse?.payload.team?.standings.wins,
            loss: oResponse?.payload.team?.standings.losses,
            confRank: oResponse?.payload.team?.standings.confRank,
            divRank: oResponse?.payload.team?.standings.divRank,
        };
    } else {
        return {
            win: "-",
            loss: "-",
            confRank: "-",
            divRank: "-",
        }
    }
}

/**
 * Fetches top scorer data from NBA api.
 *
 * @param {Object} oTeamData
 * @return {Object}
 */
async function fetchTopScorer(oTeamData) {
    const sUrl = `http://global.nba.com/statsm2/team/leader.json?locale=en&teamCode=${oTeamData.shortName}`;
    const oRequest = new Request(sUrl);
    const oTopScorers = await oRequest.loadJSON();

    let oResult = {
        name: null,
        value: "",
    };
    if (oTopScorers) {			   
        const oTopScorer = oTopScorers.payload.pointLeader?.players[0];
        oResult.name = oTopScorer?.profile.displayName ?? null;
        oResult.value = oTopScorer?.value ?? null;
    }

    return oResult;
}

/**
 * Fetches live standings data from NBA api.
 *
 * @param {string} sGameId
 * @return {Object}
 */
async function fetchLiveData(sGameId, sDate) {
    const sUrl = `https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json`;
    const oRequest = new Request(sUrl);
    const oLiveData = await oRequest.loadJSON();
    if (oLiveData !== undefined) {
        const aGamesToday = oLiveData.scoreboard.games;
        const oGameToday = aGamesToday.filter((game) => game.gameId == sGameId);
        if (oGameToday.length > 0) {
            const oGame = oGameToday[0];
            return {
                statusText: oGame.gameStatusText,
                homeTeamScore:
                oGame.period === 0 ? "-" : calculateScore(oGame.homeTeam.periods),
                awayTeamScore:
                oGame.period === 0 ? "-" : calculateScore(oGame.awayTeam.periods),
            };
        }
    }

    return {
        statusText: null,
        homeTeamScore: "-",
        awayTeamScore: "-",
    };
}

/**
 * Calculates score for live data.
 *
 * @param {Object[]} aPeriodScores
 * @return {Number}
 */
function calculateScore(aPeriodScores) {
    let iResultScore = 0;
    aPeriodScores.forEach(
        (oPeriodScore) => (iResultScore += parseInt(oPeriodScore.score)));
    return iResultScore;
}

/**
 * Loads image from thesportsdb.com or from local cache.
 *
 * @param {String} sImageUrl
 * @param {String} sTeamAbbreviation
 * @return {Object}
 */
async function loadLogo(sImageUrl, sTeamAbbreviation) {
    let oResult;
    if (CACHING_ACTIVE) {
        // Set up the file manager.
        const oFiles = FileManager.local();

        // Set up cache
        const sCachePath = oFiles.joinPath(
                oFiles.cacheDirectory(),
                sTeamAbbreviation + "_NBA");
        const bCacheExists = oFiles.fileExists(sCachePath);
        try {
            if (bCacheExists) {
                oResult = oFiles.readImage(sCachePath);
            } else {
                const oRequest = new Request(sImageUrl);
                oResult = await oRequest.loadImage();
                try {
                    oFiles.writeImage(sCachePath, oResult);
                    console.log("Created cache entry for logo of " + sTeamAbbreviation);
                } catch (e) {
                    console.log(e);
                }
            }
        } catch (oError) {
            console.error(oError);
            if (bCacheExists) {
                oResult = oFiles.readImage(sCachePath);
            } else {
                console.log("Fetching logo for " + sTeamAbbreviation + " failed.");
            }
        }
    } else {
        const oRequest = new Request(sImageUrl);
        oResult = await oRequest.loadImage();
    }

    return oResult;
}

/**
 * Sets background for stack.
 *
 * @param {String} oStack
 */
async function setStackBackground(oStack) {
    if (
        NO_BACKGROUND_INSTALLED &&
        NO_BACKGROUND_ACTIVE &&
        NO_BACKGROUND_FULL_ACTIVE) {
        oStack.backgroundImage = await transparent(Script.name());
    } else {
        oStack.backgroundColor = STACK_BACKGROUND;
    }
}

/**
 * Returns color object depending if dark mode is active or not.
 *
 * @return {Object}
 */
function getColorForCurrentAppearance() {
    return DARK_MODE ? Color.white() : Color.black();
}

/**
 * Placeholder function when no-background.js isn't installed.
 *
 * @return {Object}
 */
function emptyFunction() {
    // Silence
    return {};
}

/**
 * Returns static team data.
 *
 * @return {Object}
 */
function getTeamData() {
    return {
        ATL: {
            id: 1610612737,
            abbreviation: "ATL",
            teamName: "Atlanta Hawks",
            simpleName: "Hawks",
            shortName: "hawks",
            location: "Atlanta",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/cfcn1w1503741986.png/preview",
        },
        BOS: {
            id: 1610612738,
            abbreviation: "BOS",
            teamName: "Boston Celtics",
            simpleName: "Celtics",
            shortName: "celtics",
            location: "Boston",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/051sjd1537102179.png/preview",
        },
        BKN: {
            id: 1610612751,
            abbreviation: "BKN",
            teamName: "Brooklyn Nets",
            simpleName: "Nets",
            shortName: "nets",
            location: "Brooklyn",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/h0dwny1600552068.png/preview",
        },
        CHA: {
            id: 1610612766,
            abbreviation: "CHA",
            teamName: "Charlotte Hornets",
            simpleName: "Hornets",
            shortName: "hornets",
            location: "Charlotte",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/xqtvvp1422380623.png/preview",
        },
        CHI: {
            id: 1610612741,
            abbreviation: "CHI",
            teamName: "Chicago Bulls",
            simpleName: "Bulls",
            shortName: "bulls",
            location: "Chicago",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/yk7swg1547214677.png/preview",
        },
        CLE: {
            id: 1610612739,
            abbreviation: "CLE",
            teamName: "Cleveland Cavaliers",
            simpleName: "Cavaliers",
            shortName: "cavaliers",
            location: "Cleveland",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/a2pp4c1503741152.png/preview",
        },
        DAL: {
            id: 1610612742,
            abbreviation: "DAL",
            teamName: "Dallas Mavericks",
            simpleName: "Mavericks",
            shortName: "mavericks",
            location: "Dallas",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/yqrxrs1420568796.png/preview",
        },
        DEN: {
            id: 1610612743,
            abbreviation: "DEN",
            teamName: "Denver Nuggets",
            simpleName: "Nuggets",
            shortName: "nuggets",
            location: "Denver",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/8o8j5k1546016274.png/preview",
        },
        DET: {
            id: 1610612765,
            abbreviation: "DET",
            teamName: "Detroit Pistons",
            simpleName: "Pistons",
            shortName: "pistons",
            location: "Detroit",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/12612u1511101660.png/preview",
        },
        GSW: {
            id: 1610612744,
            abbreviation: "GSW",
            teamName: "Golden State Warriors",
            simpleName: "Warriors",
            shortName: "warriors",
            location: "Golden State",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/irobi61565197527.png/preview",
        },
        HOU: {
            id: 1610612745,
            abbreviation: "HOU",
            teamName: "Houston Rockets",
            simpleName: "Rockets",
            shortName: "rockets",
            location: "Houston",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/yezpho1597486052.png/preview",
        },
        IND: {
            id: 1610612754,
            abbreviation: "IND",
            teamName: "Indiana Pacers",
            simpleName: "Pacers",
            shortName: "pacers",
            location: "Indiana",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/v6jzgm1503741821.png/preview",
        },
        LAC: {
            id: 1610612746,
            abbreviation: "LAC",
            teamName: "Los Angeles Clippers",
            simpleName: "Clippers",
            shortName: "clippers",
            location: "Los Angeles",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/jv7tf21545916958.png/preview",
        },
        LAL: {
            id: 1610612747,
            abbreviation: "LAL",
            teamName: "Los Angeles Lakers",
            simpleName: "Lakers",
            shortName: "lakers",
            location: "Los Angeles",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/44ubym1511102073.png/preview",
        },
        MEM: {
            id: 1610612763,
            abbreviation: "MEM",
            teamName: "Memphis Grizzlies",
            simpleName: "Grizzlies",
            shortName: "grizzlies",
            location: "Memphis",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/m64v461565196789.png/preview",
        },
        MIA: {
            id: 1610612748,
            abbreviation: "MIA",
            teamName: "Miami Heat",
            simpleName: "Heat",
            shortName: "heat",
            location: "Miami",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/5v67x51547214763.png/preview",
        },
        MIL: {
            id: 1610612749,
            abbreviation: "MIL",
            teamName: "Milwaukee Bucks",
            simpleName: "Bucks",
            shortName: "bucks",
            location: "Milwaukee",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/qgyz6z1503742649.png/preview",
        },
        MIN: {
            id: 1610612750,
            abbreviation: "MIN",
            teamName: "Minnesota Timberwolves",
            simpleName: "Timberwolves",
            shortName: "timberwolves",
            location: "Minnesota",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/b6a05s1503742837.png/preview",
        },
        NOP: {
            id: 1610612740,
            abbreviation: "NOP",
            teamName: "New Orleans Pelicans",
            simpleName: "Pelicans",
            shortName: "pelicans",
            location: "New Orleans",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/f341s31523700397.png/preview",
        },
        NYK: {
            id: 1610612752,
            abbreviation: "NYK",
            teamName: "New York Knicks",
            simpleName: "Knicks",
            shortName: "knicks",
            location: "New York",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/wyhpuf1511810435.png/preview",
        },
        OKC: {
            id: 1610612760,
            abbreviation: "OKC",
            teamName: "Oklahoma City Thunder",
            simpleName: "Thunder",
            shortName: "thunder",
            location: "Oklahoma City",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/xpswpq1422575434.png/preview",
        },
        ORL: {
            id: 1610612753,
            abbreviation: "ORL",
            teamName: "Orlando Magic",
            simpleName: "Magic",
            shortName: "magic",
            location: "Orlando",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/txuyrr1422492990.png/preview",
        },
        PHI: {
            id: 1610612755,
            abbreviation: "PHI",
            teamName: "Philadelphia 76ers",
            simpleName: "76ers",
            shortName: "76ers",
            location: "Philadelphia",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/71545f1518464849.png/preview",
        },
        PHX: {
            id: 1610612756,
            abbreviation: "PHX",
            teamName: "Phoenix Suns",
            simpleName: "Suns",
            shortName: "suns",
            location: "Phoenix",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/qrtuxq1422919040.png/preview",
        },
        POR: {
            id: 1610612757,
            abbreviation: "POR",
            teamName: "Portland Trail Blazers",
            simpleName: "trail_blazers",
            shortName: "blazers",
            location: "Portland",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/mbtzin1520794112.png/preview",
        },
        SAC: {
            id: 1610612758,
            abbreviation: "SAC",
            teamName: "Sacramento Kings",
            simpleName: "Kings",
            shortName: "kings",
            location: "Sacramento",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/nf6jii1511465735.png/preview",
        },
        SAS: {
            id: 1610612759,
            abbreviation: "SAS",
            teamName: "San Antonio Spurs",
            simpleName: "Spurs",
            shortName: "spurs",
            location: "San Antonio",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/crit1q1511809636.png/preview",
        },
        TOR: {
            id: 1610612761,
            abbreviation: "TOR",
            teamName: "Toronto Raptors",
            simpleName: "Raptors",
            shortName: "raptors",
            location: "Toronto",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/gitpi61503743151.png/preview",
        },
        UTA: {
            id: 1610612762,
            abbreviation: "UTA",
            teamName: "Utah Jazz",
            simpleName: "Jazz",
            shortName: "jazz",
            location: "Utah",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/9p1e5j1572041084.png/preview",
        },
        WAS: {
            id: 1610612764,
            abbreviation: "WAS",
            teamName: "Washington Wizards",
            simpleName: "Wizards",
            shortName: "wizards",
            location: "Washington",
            logo:
            "https://r2.thesportsdb.com/images/media/team/badge/m2qhln1503743635.png/preview",
        },
    };
}

/**
 * Creates large sized widget.
 *
 * @return {ListWidget}
 */
async function createLargeWidget() {
    // Initialise widget
    const oWidget = new ListWidget();
    oWidget.setPadding(10, 10, 10, 10);
    oWidget.url =
        "https://github.com/thisisevanfox/nba-my-team-ios-widget/blob/main/Installation%20guide.md";

    const oHeadingStack = oWidget.addStack();
    oHeadingStack.layoutVertically();
    oHeadingStack.setPadding(7, 7, 7, 7);

    const oHeadingText = oHeadingStack.addText(
`Currently a large widget is not supported. Only small and medium size widgets are possible. Don't know how to get it? Click the widget to read to the installation instructions.`);
    oHeadingText.font = Font.systemFont(16);
    oHeadingText.textColor = Color.red();

    return oWidget;
}

/********************************************************
 ************* MAKE SURE TO COPY EVERYTHING *************
*******************************************************/
