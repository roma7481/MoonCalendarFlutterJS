const suncalc = require('suncalc')
const lune = require('lune')
const moment = require('moment-timezone')
const _ = require('lodash')
const { interfaces } = require('mocha')

const isDayBetween = (start, end, day) => {
  return moment(day).startOf('day').isBetween(moment(start), moment(end)) ||
    moment(day).endOf('day').isBetween(moment(start), moment(end))
}

const daysRange = (startDate, numberOfDays) => {
  return _.map(_.range(0, numberOfDays + 1), i => moment(moment(startDate).startOf('day').add(i, 'days')))
}

const recentNewMoon = (date) => {
  let endOfDate = moment(date).endOf('day').toDate()
  let startOfDate = moment(date).startOf('day').toDate()

  let recentPhases = lune.phase_hunt(endOfDate)

  if (recentPhases.new_date > endOfDate) {
    recentPhases = lune.phase_hunt(startOfDate)
  }

  let newMoon = moment(recentPhases.new_date)
  return newMoon
}

const daysBetween = (start, end) => {
  return moment(end).endOf('day').diff(moment(start).startOf('day'), 'days')
}

const moonRises = (days, latitude, longitude) => {
  return _.chain(days)
    .map(day => suncalc.getMoonTimes(moment(day).toDate(), latitude, longitude).rise)
    .filter(rise => rise)
    .map(rise => moment(rise))
    .value()
}

var getDaysArray = function(start, end) {
  for(var arr=[],dt=new Date(start); dt<=end; dt.setDate(dt.getDate()+1)){
      arr.push(new Date(dt));
  }
  return arr;
};


const getYearLoonarDays = function(){
  var daylist = getDaysArray(new Date("2018-05-01"),new Date("2018-05-06"));

  var res = []

  for (i = 0; i < daylist.length; i ++ ) {
    // var formatedDate = moment(daylist[i]).tz(moment.tz.guess()).format('DD-MM-YYYY')
    var formatedDate = moment.tz(daylist[i], 'DD-MM-YYYY', 'Asia/Vladivostok');
    // console.log(formatedDate)
    // var date = moment.tz('11-06-2021', 'DD-MM-YYYY', moment.tz.guess());
    // console.log(date)
    lunarDays(formatedDate,latitude, longitude)
    // res.push(lunarDays(date,latitude, longitude))
  }
  // console.log(res)
}

const lunarDays = function(date, latitude, longitude){
  var res = getlunarDaysInternal(date, latitude, longitude);
  var resPrev = getPrevlunarDaysInternal(date, latitude, longitude);

  // return getMissingDays(res,resPrev);
  return getFormattedDays(getMissingDays(res,resPrev,date))
}

const getFormattedDays = function(res){
  var formattedDays = []
   
  for (let i = 0; i < res.length; i++) {
    formattedDays.push({
      // +2 because we started from 2 day
      number: res[i].number,
      start: res[i].start.valueOf(),
      end: res[i].end.valueOf()
    });
  }

  return formattedDays;
}

const getMissingDays = function(res,resPrev,date){
  var currentMoonDay = res[0];
  var newRes = [];

  let today = moment(date).startOf('day').toDate()

  if(currentMoonDay.number == 1){
    var prevMoonDay = resPrev[resPrev.length -1];

    if(today.getTime() < prevMoonDay.end && prevMoonDay.number != currentMoonDay.number){
      newRes.push(prevMoonDay);
    }

    var minutesDiff = currentMoonDay.start.diff(prevMoonDay.end, prevMoonDay);
    if(minutesDiff > 0
      && prevMoonDay.number != currentMoonDay.number){
      var missingDay = { 
        number: prevMoonDay.number + 1,
        start: prevMoonDay.end,
        end: currentMoonDay.start
      }
      newRes.push(missingDay);
    }
    
  } else if(currentMoonDay.number == 2){
    var prevMoonDay = resPrev[resPrev.length -1];
    if(prevMoonDay.number != 1){
      var minutesDiff = currentMoonDay.start.diff(prevMoonDay.end, prevMoonDay);
      if(minutesDiff > 0){
        var missingDay = { 
          number: 1,
          start: prevMoonDay.end,
          end: currentMoonDay.start
        }

        if(today.getTime() < prevMoonDay.end && prevMoonDay.number != currentMoonDay.number){
          newRes.push(prevMoonDay);
        }

        if(today.getTime() < missingDay.end){
          newRes.push(missingDay);
        }
      } else {
        var updatedTime = currentMoonDay.start.clone()
        updatedTime.add(-2, 'hours')

        var missingDay = { 
          number: 1,
          start: updatedTime,
          end: currentMoonDay.start
        }        

        if(today.getTime() < prevMoonDay.end && prevMoonDay.number != currentMoonDay.number){
          newRes.push({
            number: prevMoonDay.number,
            start: prevMoonDay.start,
            end: updatedTime
          });
        }

        if(today.getTime() < missingDay.end){
          newRes.push(missingDay);
        }
      }
    }
  }

  for (let i = 0; i < res.length; i++) {
    newRes.push(res[i]);
  }

  return newRes;
}

const getPrevlunarDaysInternal = function(date, latitude, longitude){
  var prevDate = moment(date).add(-1, 'd').toDate();
  return getlunarDaysInternal(prevDate, latitude, longitude);
}

const getlunarDaysInternal = function(date, latitude, longitude){
  let newMoon = recentNewMoon(date)
  let diffDays = daysBetween(newMoon, date)
  let initDate = moment(newMoon).startOf('day')

  // WE NEED CALCULATE CURRENT DAY + 2 for all moon days
  let days = daysRange(initDate, diffDays + 4)

  // check if first rist before new moon delete IT
  let rises = moonRises(days, latitude, longitude)
  if (moment(_.head(rises)).isSameOrBefore(newMoon)) {
    //rises.shift()
    rises = _.drop(rises)
  }
  let moonDays = [{
    number: 1,
    start: newMoon,
    end: _.head(rises)
  }]

  for (let i = 0; i < rises.length - 1; i++) {
    moonDays.push({
      // +2 because we started from 2 day
      number: i + 2,
      start: rises[i],
      end: rises[i + 1]
    })
  }
  let res = _.filter(moonDays, ({start, end}) => isDayBetween(start, end, date))
  return res;
}

const formatDate = function(date) {
  return ("0" + date.getDate()).slice(-2) + "-" + ("0"+(date.getMonth()+1)).slice(-2) + "-" +
  date.getFullYear();
}

//VLADIVOSTOK
// const latitude = 43.133248
// const longitude = 131.911298

//MOSCOW
// const latitude = 55.755826
// const longitude = 37.617300

//UFA
// const latitude = 54.73479099999999
// const longitude = 55.9578555

//SHAHTY
const latitude =  47.7086074
const longitude = 40.216038

//VLADIVOSTOK
// var date = moment.tz('11-06-2021', 'DD-MM-YYYY', 'Asia/Vladivostok');
// var date = moment.tz('07-09-2021', 'DD-MM-YYYY', 'Asia/Vladivostok');
// var date = moment.tz('13-12-2021', 'DD-MM-YYYY', 'Asia/Vladivostok');
// var date = moment.tz('09-07-2021', 'DD-MM-YYYY', 'Asia/Vladivostok');
// var date = moment.tz('15-05-2021', 'DD-MM-YYYY', 'Asia/Vladivostok');

//UFA
// var date = moment.tz('07-09-2021', 'DD-MM-YYYY', 'Asia/Yekaterinburg');

//MOSCOW
// var date = moment.tz('10-06-2021', 'DD-MM-YYYY', 'Europe/Moscow');
// var date = moment.tz('21-12-2021', 'DD-MM-YYYY', 'Europe/Moscow');
// var date = moment.tz('06-12-2021', 'DD-MM-YYYY', 'Europe/Moscow');
// var date = moment.tz('08-09-2021', 'DD-MM-YYYY', 'Europe/Moscow');
// var date = moment.tz('10-08-2021', 'DD-MM-YYYY', 'Europe/Moscow');
// var date = moment.tz('10-06-2021', 'DD-MM-YYYY', 'Europe/Moscow');
// var date = moment.tz('04-12-2021', 'DD-MM-YYYY', 'Europe/Moscow');
// var date = moment.tz('04-11-2021', 'DD-MM-YYYY', 'Europe/Moscow');
// var date = moment.tz('07-09-2021', 'DD-MM-YYYY', 'Europe/Moscow');






////////// NEW ////////////////

const allDaysInYear = (currentYear) => {
  var start = new Date(currentYear, 0, 1),
        end = new Date(currentYear, 11, 31),
        currentDate = new Date(start),
        datesBetween = []
    ;

    while (currentDate <= end) {
        datesBetween.push(formatDate(new Date(currentDate)));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return datesBetween;
}

const allLunarDaysInYear = (currentYear,timezone) => {
  var allYearDates = allDaysInYear(currentYear),
      lunarDates = []
    ;

  for (date of allYearDates){
    lunarDates.push(date,lunarDays(moment.tz(date, 'DD-MM-YYYY', timezone), latitude, longitude));
  }

  return lunarDates;
}

///////// NEW /////////////////



//SHAHTY
var date = moment.tz('30-07-2021', 'DD-MM-YYYY', 'America/toronto');
let res = lunarDays(date, latitude, longitude);
console.log(res)

console.log(allLunarDaysInYear(2019,'America/toronto'))

// TODO module.exports = lunarDays




