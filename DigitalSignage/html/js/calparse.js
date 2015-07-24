/* 
  Calparse.js
  by Daniel Ma (danielghma@gmail.com)

  Written for the digital signage system at YWAM Kona
  4th qtr 2011
*/

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, curly:true, browser:true, jquery:true, maxerr:50 */
/*global google*/


/*
  Title: Calparse.js
  One file with all the classes, objects, and functions to run the DigitalSignage app (or http://gniux.uofnkona.edu/)

  About: Format Strings

  Description:
  Understanding how format strings work in Calparse.js is required to properly configure the DigitalSignage app

.

  The syntax of the special format strings used here allows for custom formatting of dates, titles, and descriptions                       

.

  Format strings consist of formatters in the form t(), d(), etc and sometimes with a format string inside the parentheses. Formatting within parentheses is processed using the DateJS <toString at http://code.google.com/p/datejs/wiki/FormatSpecifiers> method

  (start code)
  Format      Description             
  ----------- -------------------------       
  s(format)   The start time formatted 
  e(format)   The end time formatted 
  t()         The title
  d()         The description   

  \n          Newline
  |           For use in tables, divides <td> cells
  (end) 

  Examples:
  > "s(dddd, MMMM d at h:mm tt)"            -> "Monday, December 1 at 7:00 PM"
  > "s(dddd, MMMM d h:mm tt) - e(h:mm tt)"  -> "Monday, December 1 7:00 PM - 9:00 PM"
  > "t()|-|d()"                             -> "<td>Event Title</td><td>-</td><td>A Really cool event!</td>"
  > "s(h:mm) - e(h:mm tt)|-|t()"            -> "<td>7:00 - 9:00 PM</td><td>-</td><td>Event Title</td>"

  See Also:
  <DateJS Format Strings at http://code.google.com/p/datejs/wiki/FormatSpecifiers>    
*/

/*
  Object: tickers
  A global object containing all the tickers being used on the page. Key is the element, value is the object
*/

var tickers = {};

/*
  Function: appendScript
  Appends a javascript file to the <head> tag

  Parameters:

    url {String} - the url of the script to append (absolute or relative to index.html)
*/
function appendScript(url) {
  "use strict";
	var scriptTag = document.createElement("script");
	scriptTag.setAttribute("type", "text/javascript");
	scriptTag.setAttribute("src", url);
	document.getElementsByTagName("head")[0].appendChild(scriptTag);
}

/*
  Function: String.prototype.capitalize
  Capitalizes a string

  Usage:

  >  "tomorrow".capitalize -> "Tomorrow"
*/
String.prototype.capitalize = function () {
  "use strict";
  return this.replace(/(^|\s)([a-z])/g, function (m, p1, p2) {
    return p1 + p2.toUpperCase();
  });
};

/*
  Function: String.prototype.repeat
  Repeats a string

  Parameters:

    num {Integer} - the number of times to repeat the string

  Usage:

  >  "1".repeat(2) -> "11"
*/
String.prototype.repeat = function (num) {
  "use strict";
  return [num + 1].join(this);
};

/*
  Function: by_mealtime
  Sorting function to sort <Event>s by breakfast, lunch, dinner

  Usage:

  > events.sort(by_mealtime);
*/
var by_mealtime = function (a, b) { // array sorter
  // console.log("a: " + a.title + " b: " + b.title);
  "use strict";
  var vals = [a, b];
  for (var i = 0; i < vals.length; i ++) {
    switch (vals[i].title.toLowerCase()) {
    case "breakfast":
      vals[i] = 0;
      break;
    case "lunch":
      vals[i] = 1;
      break;
    case "dinner":
      vals[i] = 2;
      break;
    default:
      // nil
    }
  }
  // console.log(vals);

  return vals[0] - vals[1];
};

/*
  Function: by_time
  Sorting function to sort <Event>s by start time

  Usage:

  > events.sort(by_time);
*/
var by_time = function (a, b) { // array sorter
  // console.log("a: " + a.title + " b: " + b.title);
  "use strict";
  return a.start_time - b.start_time;
};

/*
  Class: Event
  A simple class that unifies the events from different sources

  Properties:

    title {String}        - the event's title
    start_time {Date}     - the event's starting time
    end_time {Date}       - the event's end time
    location {String}     - the event's location
    description {String}  - the event's description

  Constructor:

    Initializes an event object with any properties passed

  Parameters:

    opts {Object} - an object with attributes

      - *title {String}* the event's title (*required*)
      - *start_time {Date}* the event's starting time (defaults to today at 00:00)
      - *end_time {Date}* the event's end time (defaults to today at 23:59)
      - *location {String}* the event's location (defaults to an empty string)
      - *description {String}* the event's description (defaults to an empty string)

  Returns:

    A new <Event>

  Usage:

    > event = new Event(object)

  Example:

    (start code)
      start_time = Date.today().set({year: 2055, month: 1, day: 1, hour: 6, minute: 15});

      event = new Event({
        title: "Breakfast",
        start_time: start_time,
        end_time: start_time.add({hour: 1}),
        location: "Cafeteria",
        description: "Pancackes"
      });
    (end)
*/

function Event(opts) {
  "use strict";
  if (typeof (opts) !== "undefined") {
    this.title        = opts.title;
    this.start_time   = opts.start_time || Date.today();
    this.end_time     = opts.end_time || Date.today().set({hour: 23, minute: 59, second: 59});
    this.location     = opts.location || "";
    this.description  = opts.description || "";
    this.attachment   = opts.attachment;
  }
}

/*
  Class: Ticker
  A class that contains data and manages rotation for an <Event> ticker

  Properties:

    element {jQuery}      - the parent object of the ticker
    items {Array}         - an array of html strings that define the content of the ticker
    speed {Integer}       - the rotation speed of the ticker in milliseconds
    running {Boolean}     - whether or not the ticker is currently running
    currentItem {Integer} - an that points to the current item in the items array

  Constructor:

  Initializes an instance of the ticker, calls <this.setSize>, starts the ticker if it is opts.running is true, and adds the instance to the global tickers variable

  Parameters:

    opts {Object} - an object with attributes

      - *element {String}* a jQuery selector for the ticker's parent element (*required*)
      - *items {Array}* an array of html items to go in the ticker (defaults to an empty Array)
      - *speed {Integer}* the speed of the ticker in milliseconds (defaults to 10000) 
      - *running {Boolean}* whether or not the ticker should begin running immediately (defaults to false)

  Returns:

    A new <Ticker>

  Usage:

    > ticker = new Ticker(object)

  Example:

    A ticker with prepared content

    (start code)
      ticker = new Ticker({
        element: "#events .content",
        items: ["<h2>Free Cookies</h2>", "<h2>Expensive Cookies</h2>"],
        speed: 5000
      });
    (end)

    A ticker with generated html (this is how it's used in the code)

    (start code)
      var ticker = new Ticker({element: "#events .content"});

      for (var i = 0; i < events.length; i++) {
        var item = events[i];
        ticker.addItem(CalData.ticker_html(item, format, start_time, end_time));
      }
    (end)
*/
function Ticker(opts) {
  "use strict";

  /*

    Function: this.addItem
    Adds an item to the ticker. Used from within the <CalData> module to add generated <ticker_html> to a ticker

    Parameters:

      html {String} - a string of html content

    Example:

    > ticker.addItem("<p>Ticker item</p>")

  */  
  this.addItem = function (html) {
    this.element.append(html);
    this.items.push(html);
    this.setSize();
    if (!this.running) {
      this.start();
    }
  };

  /*

    Function: this.start
    Starts the ticker (if it is not running already)

    Example:

    > ticker.start()

  */  
  this.start = function () {
    // console.log("Starting the ticker")
    // console.log(this.element)
    // console.log(this.items)
    if (this.running) {
      clearInterval(this.interval);
    }
    // this.rotate();
    this.interval = setInterval(this.rotate, this.speed);
    this.running = true;
  };

  /*

    Function: this.stop
    Stops the ticker from rotating it's items

    Example:

    > ticker.stop()

  */
  this.stop = function () {
    clearInterval(this.interval);
    this.running = false;
  };

  /*

    Function: this.rotate
    Causes the ticker to rotate and display the next item

    Example:

    > ticker.rotate()

  */
  this.rotate = function () {
    // console.log("rotating");
    if (self.items.length > 1) {
      $(self.element.children()[self.currentItem]).fadeOut(function () {
        self.stepCurrentItem();

        $(self.element.children()[self.currentItem]).fadeIn();
      });
    } else {
      $(self.element.children()[0]).fadeIn();
      self.stop();
    }
  };

  /*

    Function: this.stepCurrentItem
    Increments the <Ticker>'s currentItem variable by 1

    Example:

    > ticker.stepCurrentItem()

  */
  this.stepCurrentItem = function () {
    this.currentItem += 1;

    if (this.currentItem > (this.items.length - 1)) {
      this.currentItem = 0;
    }
  };

  /*

    Function: this.setSize
    Causes the ticker to calculate and set the pixel height for itself and it's children

    Example:

    > ticker.setSize()

  */
  this.setSize = function () {
    var parentHeight = this.element.parent().outerHeight();
    // console.log("parentHeight = " + parentHeight)
    var siblingHeight = this.element.siblings().outerHeight();
    // console.log("siblingHeight = " + siblingHeight)
    var padding = this.element.outerHeight() - this.element.height();
    // console.log("padding = " + padding)
    this.tickerHeight = parentHeight - siblingHeight - padding;
    // console.log("this.tickerHeight = " + this.tickerHeight)

    // console.log(tickerHeight)

    // console.log(this.tickerHeight)
    // this.element //.css("height", "0px")
    //   .children().css("height", this.tickerHeight + "px")
    //   .find("img").css("height", this.tickerHeight - 20 + "px");

    this.element.find("img").css("height", this.tickerHeight + "px");
  };

  var self = this;

  if (typeof (opts) !== "undefined") {
    this.element      = $(opts.element);
    this.items        = opts.items || [];
    this.speed        = opts.speed || 10000;
    this.running      = opts.running || false;

    // just to define these. maybe javascript should use .h files :P
    this.currentItem  = 0;
    this.interval     = null;
    this.tickerHeight = 0;
  }

  this.setSize();
  if (this.running) {
    this.start();
  }
  if (typeof(tickers[opts.element]) !== "undefined") {
      tickers[opts.element].stop();
      delete(tickers[opts.element]);
  }
  tickers[opts.element] = this;
}

/* 
  Struct: videoPlayer
  The videoPlayer object manages playing and rotating videos on the display

  All properties can be set by calling <playVideos> in layout.js

  Properties:

    - *list {Array}* an array of the video files with extensions (defaults to ['1.webm', '2.webm'])
    - *path {String}* the folder with trailing slash where the videos are stored (defaults to "videos/")
    - *fnQueue {Array}* an array of functions pending for execution

*/
var videoPlayer = {
  list: ['1.webm', '2.webm'], // '3', '4', '5', '6', '7', '8', '9', '10'],
  path: "videos/",
  currentVideo: 0,
  element: null,
  // refresh: false,
  fnQueue: [],

  /*

    Function: playVideos
    Sets properties for the videoPlayer and begins the play loop

    Parameters: 

      opts {Object} - an object with the desired properties to overwrite

    Example:

    in layout.js

    > content: function() {videoPlayer.playVideos({path: "http://gniux.uofnkona.edu/videos/", list: ['1.m4v', '2.m4v', '3.m4v', '4.m4v']})}

  */
  playVideos: function (opts) {
    "use strict";
    if (typeof(opts) !== "undefined") {
      this.list = opts.list || this.list;
      this.path = opts.path || this.path;
    }
    $("#video .content").html("<video id='videoPlayer' src='" + this.path + this.list[0] + "' autoplay autobuffer />");

    var video = $("#video");
    var padding = video.children().outerHeight() - video.children().height();
    var maxHeight = video.outerHeight() - padding;
    this.element = $("#videoPlayer");
    this.element.css("max-height", maxHeight + "px").bind("ended", function () {
      videoPlayer.nextVideo();
    });
  }, 

  /* 

    Function: nextVideo
    Executes any pending functions in the fnQueue and plays the next video

    Example:

    > videoPlayer.nextVideo()

  */
  nextVideo: function () {
    "use strict";
    if (this.fnQueue.length > 0) { // if it's time to reload the page
      for (var i=0; i < this.fnQueue.length; i++) {
        this.fnQueue.pop()(); // double () to execute functions in queue
      }
    }
    this.currentVideo += 1;
    if (this.currentVideo >= this.list.length) {
      this.currentVideo = 0;
    }
    this.element.attr("src", this.path + this.list[this.currentVideo]);
    this.element[0].play();
  },

  /* 

    Function: queueFn
    Adds a function to the fnQueue to be executed after the current video is over

    Example:

      (start code)
        videoPlayer.queueFn(function() {
          layoutParser.loadData();
        })
      (end)

  */
  queueFn: function(callback) {
    "use strict";
    this.fnQueue.push(callback);
  }, 

  /* 

    Function: queueRefresh
    Queues a reload of the page when the current video is over

    Example:

    > videoPlayer.queueRefresh()

  */
  queueRefresh: function() {
    "use strict";
    this.fnQueue.push(function() {location.reload(true);});
  }
};

/* 

  Struct: layoutParser
  The layoutParser object contains methods for parsing layout.js and loading the data onto the screen

*/

var layoutParser = {
  output: "", 
  // layoutFnQueue: [],
  layout: {},

  /* 

    Function: parse
    Parses the layout variable defined in layout.js

    Executes <recursiveParse> on the layout array to insert all the html onto the screen, and executes <loadData> to fill the page with data

    Parameters:

      layout {Array} - the layout variable defined in layout.js

    Example:

    > layoutParser.parse(layout)

  */
  parse: function (layout) {
    "use strict";
    this.layout = layout;
    this.recursiveParse(layout, {id: layout[0].parent});

    $("div[data-height], div[data-width]").each(function(idx, el) {
      var element = $(el);
      var height  = element.attr("data-height");
      var width   = element.attr("data-width");
      var compute;

      if(typeof(height) !== "undefined") { // if there's data-height
        compute = (height/100 * (element.parent().height() - 1));
        element.height(compute + "px");
      } else {
        compute = (width/100 * (element.parent().width() - 1));
        element.width(compute + "px");
      }
    });

    // alert("are there stuff?")
    // $(".layout").layout();

    // $("#wrapper").append("<textarea cols=100 rows=100>" + this.output + "</textarea>")
    // $("#wrapper").css({width: "50%"}).layout({
    //   type: "flexgrid",
    //   hgap: 3,
    //   vgap: 3,
    //   rows: 1,
    //   columns: 2
    // }) //.children().layout();
    // for (var i = this.layoutFnQueue.length - 1; i >= 0; i--){
    //   $("#" + this.layoutFnQueue[i]).layout();
    // };
    // for (var i=0; i < this.layoutFnQueue.length; i++) {
    //   // eval(this.layoutFnQueue[i]);
    //   console.log("#" + this.layoutFnQueue[i] + ".layout()");
    //   $("#" + this.layoutFnQueue[i]).layout();
    // };
  },

  /* 
    Function: queueReloadData
    Sets the timer interval to reload the data on the page

    Called from app.js to reload data every 15 minutes

    Parameters:

      time {Integer} - the interval in milliseconds

    Example: 

    > videoPlayer.queueReloadData(15  * 60 * 100)

  */
  queueReloadData: function(time, exclude) {
    "use strict";
    setTimeout(function() {
      videoPlayer.queueFn(function() {layoutParser.loadData(layoutParser.layout, exclude);});
      // videoPlayer.queueFn(function() {Cocoa.log_("reload Data");});
    }, time);
    setTimeout(function() {
      layoutParser.queueReloadData(time);
    }, time);
  }, 

  /* 
    Function: loadData
    A recursive function to load the data from the content functions in layout.js onto the page

    Parameters:

      obj {Object} - the object to load the data for (defaults to layoutParser.layout)
      exclude {String or Array} - either single string or Array of ids to exclude from reloading (ex. "video")

  */
  loadData: function (obj, exclude) {
    "use strict";
    if (typeof(obj) === "undefined") {
      obj = this.layout;
    }
    if (typeof(exclude) === "undefined") {
      exclude = [];
    } else if (typeof(exclude) === "string") {
      exclude = [exclude];
    }
    for (var i = 0; i < obj.length; i++) {
      var object = obj[i];
      if (typeof(object.content) === "function") {
        if ($.inArray(object.id, exclude) === -1) {
//          console.log(object.id + " loading data");
          object.content();
        }
      } else if (typeof(object.content) === "object") {
//        console.log(object.id + " is an object");
//        console.log(object.content);
        this.loadData(object.content, exclude);
      }
    } // for()   

  }, 

  /* 
    Function: recursiveParse
    A private recursive function that reads the layout and inserts html onto the page

    Parameters:

      obj {Object} - the object to parse
      parent {Object} - the object's parent object

  */
  recursiveParse: function (obj, parent) {
    "use strict";
    // var tab = "  ";

    // if (typeof(level) === "undefined") {
    //   level = 0;
    // }

    for (var i = 0; i < obj.length; i++) {
      var object = obj[i];
      // console.log(tab.repeat(level) + object.id)
      var beforeContent = "";
      var afterContent  = "";
      var output = "";

      // wType = typeof(parent);
      // 
      // if (wType != "undefined") {
        // console.log(object.id + " has a parent!")

      var preWrap = "";
      var postWrap = "";
        // preWrap = "<" + tag + " id='" + object.id + "' " + wrapIn.sizeProp + "='" + object.size + "%'>";
      // if (typeof(object.content) === "object") {
      // var layout = {type:'grid', hgap: 3, vgap: 3};
      // layout[wrapIn.sizeProp] = 1

      preWrap = "<div id='" + object.id + "'"; // class='layout ";
      // preWrap += "" + JSON.stringify({layout: layout})
      preWrap += ">";
      postWrap = "</div>";
        // this.layoutFnQueue.push(object.id);
      // }
      beforeContent = preWrap + "<!-- !wrapin#" + object.id + "-->\n" + beforeContent;
      // console.log(beforeContent)
      afterContent += postWrap + "<!-- /wrapin#" + object.id + "-->\n";
        // console.log(afterContent)
      // }

      output += beforeContent;

      if (typeof(object.content) === "function") {
        // console.log(tab.repeat(level) + "recursiveParse-ing " + object.id);
        // console.log(wrapIn)
        // output += tab.repeat(level + 3) + "<!-- content of #" + object.id + " -->\n";
        // if (typeof(wrapIn) != "undefined") {
        //   this.layoutFnQueue.push('$("#' + object.id + '").layout({type: "grid", hgap: 3, vgap: 3, ' + wrapIn.sizeProp +': 1})');
        // }
        // output += tab.repeat(level + 3) + "\n";
        if (object.title) {
          output += "<h1>" + object.title + "</h1>";
        }
        output += "<div class='content'>" + object.id + "</div>\n";        
      }

      output += afterContent;

      // console.log("#" + parent.id + ".append(#" + object.id + ")")
      // console.log(output)

      $(output).appendTo("#" + parent.id).css(object.css || {});

      var element = $("#" + object.id);
      if (typeof(object.content) === "object") {
        if (object.orient === "horizontal") {
          element.attr("data-height", object.size);
          // element.addClass("layout {layout: {type: 'flexGrid', resize: false, rows: 1, columns: " + object.content.length + "}}");
          // element.addClass("layout {layout: {type: 'flexGrid', resize: false, rows: 1}}");
          element.addClass("hbox");
        } else {
          element.attr("data-width", object.size);
          // element.addClass("layout {layout: {type: 'flexGrid', hgap: 3, columns: 1, rows: " + object.content.length + "}}");
          // element.addClass("layout {layout: {type: 'flexGrid', resize: false, hgap: 3, columns: 1}}");
          element.addClass("vbox");
        }
        this.recursiveParse(object.content, object);
      } else {
        if (parent.orient === "horizontal") {
          element.attr("data-width", object.size || 100 / parent.content.length);
        } else {
          element.attr("data-height", object.size || 100 / parent.content.length);
        }
      }


      // console.log(tab.repeat(level) + "made it to the end of " + object.id)
    } // for()   
  }
};

/* 
  Struct: imdbAPI
  The imdbAPI object contains methods to get extra data from imdb for the Mauka Theater movie    
*/
var imdbAPI = {

  /* 

    Function: get_movie
    Searches imdb for data about the movie, updates the object if it finds a match, and executes a callback function on it

    Parameters:

      ev {Event} - an <Event> to search
      callback {Function} - a callback to execute on the event

  */
  get_movie: function (ev, callback) {
    "use strict";
    $.ajax({
      url : "http://www.imdbapi.com/",
      data: {t: ev.title},
      dataType : "jsonp",
      timeout : 10000,
      success: function (data) {
        // console.log(data.Title.toLowerCase() + " === " + ev.title.toLowerCase())
        if (data.hasOwnProperty("Title") && data.Title.toLowerCase() === ev.title.toLowerCase()) {
          // console.log(title);
          ev.attachment = data.Poster;
          ev.title = data.Title;
          ev.description = data.Plot;

          callback(ev);
        } else {
          // console.log("no match");
          callback(ev);
        }
      },
      error: function () {
        callback(ev);
      }
    });

    // ev.attachment = "http://ia.media-imdb.com/images/M/MV5BMjEzNjg1NTg2NV5BMl5BanBnXkFtZTYwNjY3MzQ5._V1._SX320.jpg";
    // ev.description = "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers."
    // callback(ev);
  }
};

/* 
  Struct: CalData
  The CalData object contains methods for outputting event data to html for presentation
*/

var CalData = {

  /*
    Function: write_table
    Writes event data into a table and inserts it onto the page

    Parameters:

      events {Array} - an array of events
      element {String} - a jQuery selector for the element that the table should be written into
      format {String} - a format string for how each event should be displayed

    Example:

    > CalData.write_table(event, "#events .content", "t()|-|d()")

    See Also:

      <Format Strings>
  */
  write_table: function (events, element, format) {
    "use strict";
    // Format: 
    // Start Time: s(hh:mm:t)
    // End Time: e(hh:mm:t)
    // Column break: |
    var start_time, end_time;

    var fmt = this.auto_format(format);

    format      = fmt[0];
    start_time  = fmt[1];
    end_time    = fmt[2];

    var html = "<table>";
    // console.log(data.feed);
    // console.log(element);
    if (events.length === 0) {
      $(element).html("No events");
      return;
    }
    for (var i = 0; i < events.length; i++) {
      var item = events[i];
      // var eventTitle = eventEntry.getTitle().getText();
      // console.log('Event title = ' + eventTitle);
      // console.log(html);
      // console.log(item);
      var newstr = "";
      // console.log(format)
      newstr = format.replace(/s\((.*?)\)/, item.start_time.toString(start_time));
      // console.log(newstr)
      newstr = newstr.replace(/e\((.*?)\)/, item.end_time.toString(end_time));
      // console.log(newstr);
      newstr = newstr.replace(/t\(\)/, item.title);
      // console.log(newstr)
      newstr = newstr.replace(/d\(\)/, item.description);
      newstr = newstr.replace(/\n/g, "<br/>");
      newstr = newstr.replace(/\|/g, "</td><td>");
      // console.log(newstr)
      // newstr = newstr.replace(/ /g, "&nbsp;");
      html += "<tr><td>" + newstr + "</td></tr>";
    }

    html += "</table>";

    // console.log(html);
    // console.log("$(" + element + ").append(" + html + ")")
    // console.log("putting table into" + element)
    $(element).html(html);
  },

  /*
    Function: ticker_html
    Generates html for a ticker item

    Parameters:

      item {Event} - an <Event> to generate html for
      format {String} - a format string for how to display the event data
      start_time {String} - a DateJS format string to display the start time
      end_time {String} - a DateJS format string to display the end time

    Returns:

      A string of html

    Example:

    > CalData.ticker_html(event, "s() - e()", "dddd, MMMM d\nh:mm tt", "h:mm tt")

    See Also:

      <Format Strings>

      <DateJS Format Strings at http://code.google.com/p/datejs/wiki/FormatSpecifiers>
  */
  ticker_html: function (item, format, start_time, end_time) {
    "use strict";
    var html = "";
    var timestr = "";
    // console.log("format = " + format)
    // console.log("start_time = " + start_time)
    timestr = format.replace(/s\(([\s\S]*?)\)/gm, item.start_time.toString(start_time));
    // console.log(newstr)
    timestr = timestr.replace(/e\(([\s\S]*?)\)/gm, item.end_time.toString(end_time));
    timestr = timestr.replace(/\n/g, "<br/>");
    // console.log(newstr);
    // newstr = newstr.replace(/t\(\)/, ev.title);
    // console.log(newstr)
    // newstr = newstr.replace(/d\(\)/, ev.description);
    // newstr = newstr.replace(/\n/g, "<br/>");
    // console.log(newstr)
    // newstr = newstr.replace(/ /g, "&nbsp;");
    html += "<div class='item' style='display: none'>";
    if (item.attachment) {
      html += "<img src='" + item.attachment + "' />";
    }
    html += "<div class='title'>" + item.title + "</div>";
    html += "<div class='time'>" + timestr + "</div>";
    html += "<div class='description'>" + item.description + "</div>";
    html += "</div>";

    return html;
  }, 

  /*
    Function: write_ticker
    Generates a <Ticker> (and ticker_html) and places it on the page

    Parameters:

      events {Array} - an array of events for display in the ticker
      element {String} - a jQuery selector for the object that will contain the ticker
      format {String} - a format string for displaying the data
      movies {Boolean} - a boolean to tell the function if the events are movies or not. If they are, CalData will use <imdbAPI> to search for extra data

    Example:

    > CalData.write_ticker(events, "#events .content", "s(dddd, MMMM d\nh:mm tt) - e(h:mm tt)")

    See Also:

      <Ticker>

      <Format Strings>

      <DateJS Format Strings at http://code.google.com/p/datejs/wiki/FormatSpecifiers>
  */
  write_ticker: function (events, element, format, movies) {
    "use strict";
    var start_time, end_time;
    var ticker = new Ticker({element: element});

    var fmt = this.auto_format(format);

    format      = fmt[0];
    start_time  = fmt[1];
    end_time    = fmt[2];

    $(element).addClass("ticker");
    // console.log(data.feed);
    // console.log(element);
    if (events.length === 0) {
      $(element).html("No events");
      return;
    } else {
      $(element).html("");
      for (var i = 0; i < events.length; i++) {
        var item = events[i];
        // if (movies === true) {
          // imdbAPI.get_movie(item, this.makeCallback(ticker, item, format, start_time, end_time));
        // } else {
          ticker.addItem(this.ticker_html(item, format, start_time, end_time));
        // }
      }
    } 
  }, 

  /*
    Function: write_movies
    Performs the same function as <write_ticker> but automatically sets movies to true

    Parameters:

      events {Array} - an array of events for display in the ticker
      element {String} - a jQuery selector for the object that will contain the ticker
      format {String} - a format string for displaying the data

    Example:

    > CalData.write_movies(events, "#theater .content", "s(dddd, MMMM d\nh:mm tt)")

    See Also:

      <Ticker>

      <Format Strings>

      <DateJS Format Strings at http://code.google.com/p/datejs/wiki/FormatSpecifiers>
  */
  write_movies: function (events, element, format) {
    "use strict";
    this.write_ticker(events, element, format, true);
  },

  auto_format: function (format) {
    "use strict";
    var start_time, end_time;

    if (typeof(format) === "undefined") {
      start_time  = "h:mm";
      end_time    = "h:mm";
      format      = "s() - e() &mdash; t()";
    } else {
      format.replace(/s\(([\s\S]*?)\)/m, "");
      start_time = RegExp.$1;
      format.replace(/e\(([\s\S]*?)\)/m, "");
      end_time = RegExp.$1;
    }

    return [format, start_time, end_time];
  },

  makeCallback: function (ticker, ev, format, start_time, end_time) {
    "use strict";
    return function () {
      ticker.addItem(CalData.ticker_html(ev, format, start_time, end_time));   
    }; 
  }
};

/*
  Class: YConnect
  Contains methods for fetching data from YWAM Connect and creating <Event>s

  Array: date_format
  A <DateJS format string at http://code.google.com/p/datejs/wiki/FormatSpecifiers> that specifies how the dates are returned from YWAM Connect. Set to "yyyy/MM/dd" and will only need to be changed if the YWAM Connect API changes
*/

var YConnect = {

  date_format: "yyyy/MM/dd", 

  /* 
    Function: get_calendar
    Fetches the event data and executes a callback

    Parameters:

      range {String} - defines what data should be returned. Can be either "today" or "tomorrow" (defaults to "today")
      callback {Function} - callback function called on the <Event> data

    Example:

      (start code)
        YConnect.get_calendar("today", function(data) {
          CalData.write_table(data, "#menu .content", "t()|-|d()");
        }
      (end)  

  */
  get_calendar: function (range, callback) {
    "use strict";
    var uri     = "http://api.ywamconnect.net/menu/get.php";
    var params  = {format: "json"};
    var query   = {};
    var events  = [];

    var today = Date.today();
    var time;

    switch (range) {
    case "today":
      time = today;
      break;
    case "tomorrow":
      time = today.addDays(1);
      break;
    // case "week":
    //   time = [today,
    //     today.clone().addDays(7)]
    //   break;
    // case "nextweek":
    //   time = [today.addDays(7),
    //     today.clone().addDays(7)]
    //   break;
    default:
      time = today;
    }

    // var multiple_days   = (time.length > 1);
    // var multiple_months;
    var parseable_days  = [];
    // console.log(events)

    // All the multiple_days code is on hold because it's unnecessary. Who needs multiple days worth of food data?
    // if (multiple_days) { // if time is more than just one day
    //   
    //   if (time[0].getMonth() === time[1].getMonth()) { // if both in the same month
    //     params.month  = time[0].getMonth() + 1;
    //     params.year   = time[0].getFullYear();
    //     queries       = [params];
    //     multiple_months = false;
    //     
    //     while(time[0].compareTo(time[1]) !== 1) { // while time[0] is before or equal to time[1]
    //       parseable_days.push(time[0].toString(this.date_format));
    //       time[0].addDays(1);
    //     }
    //   } else { // if multiple months
    //     queries[0] = $.extend({month: time[0].getMonth() + 1, year: time[0].getFullYear()}, params);
    //     queries[1] = $.extend({month: time[1].getMonth() + 1, year: time[1].getFullYear()}, params);
    //     multiple_months = true;
    //     parseable_days  = [[], []];
    //     var month       = time[0].getMonth();
    // 
    //     while(time[0].compareTo(time[1]) !== 1) { // while time[0] is before or equal to time[1]
    //       if (time[0].getMonth() === month) {
    //         parseable_days[0].push(time[0].toString(this.date_format));
    //       } else {
    //         parseable_days[1].push(time[0].toString(this.date_format));
    //       }
    //       time[0].addDays(1);
    //     }
    //   }      
    //   
    // } else { // if only one day
      // console.log(time[0])
      // console.log(time[0].getMonth() + 1)
    params.month  = time.getMonth() + 1;
    params.year   = time.getFullYear();
    query       = params;
    // console.log(queries)
    parseable_days = time.toString(this.date_format);
      // console.log(parseable_days);

    // };

    // Again, multiple_days is on hold.
    //     //   this.create_events(data, events);
    //     // }
    //   // }).then(
    //   //   function () {console.log(events)}
    //   // )
    //   var req = $.ajax({
    //       url : uri,
    //       data: queries[0],
    //       dataType : "jsonp",
    //       timeout : 10000
    //   });
    // 
    //   req.success(function (data) {
    //       // console.log('Yes! Success!');
    //       // console.log(data);
    //       for (var i = 0; i < parseable_days[0].length; i++) {
    //         // console.log("events = " + events);
    //         // console.log(data);
    //         // console.log(data.data[parseable_days[0][i]]);
    //         
    //         YConnect.create_events(data.data[parseable_days[0][i]], parseable_days[0][i], events);
    //       }
    //       
    //       CalData.write_table(events, $("#today .content"), "t()|&mdash;|d()")
    //   });
    // 
    //   req.error(function (data) {
    //       console.log('Oh noes!');
    //   });
    // } else {
    var req = $.ajax({
      url : uri,
      data: query,
      dataType : "jsonp",
      timeout : 10000
    });

    req.success(function (data) {
      // console.log('Yes! Success!');
      // console.log(data);
      data = data.data[parseable_days];
      // console.log(data);
      for (var item in data) {
        if (data.hasOwnProperty(item)) {
        // console.log(item + " is " + data[item]);
          events.push(new Event({
            title: item.toLowerCase().capitalize(),
            description: data[item]
          }));
        }
      }
      events = events.sort(by_mealtime);
      // console.log(events);
      callback(events);
    });

    req.error(function () {
        // console.log('Error getting data');
    });
    // }
  } //,

  // create_events: function (data, date, events) {
  //   "use strict";
  //   // console.log(data);
  //   for(var item in data) {
  //     // console.log(item + " is " + data[item]);
  //     events.push(new Event({
  //       title: item.toLowerCase().capitalize(),
  //       description: data[item]
  //     }));
  //   }
  // }, 
};

function setGAPIKey() {
  gapi.client.setApiKey(GCal.api_key);
}

/*
  Class: GCal
  Contains methods for fetching data from Google Calendar and creating <Event>s

*/

var GCal = {
  /*
    Object: service
    A google data service object for getting data from Google Calendar

    String: kona_schedule
    The id of the Kona Schedule calendar

    String: kona_events
    The id of the Kona Events calendar

    String: mauka_theater
    The id of the Mauka Theater calendar

    See Also:
    <Google Data Javascript API at http://code.google.com/p/google-api-javascript-client/>
  */

  api_key: 'AIzaSyBqESjcUQVHE1HDahqvSXZMpF3qR9P4OH8',
  kona_schedule: "or2b5kqjl58ndf8ien8atkcplg%40group.calendar.google.com",
  kona_events: "o2jfjbba7bcrhkk5p3scfqj7vc%40group.calendar.google.com",
  mauka_theater: "oebubbrli984mh257hd986td80%40group.calendar.google.com",

  /*
    Function: get_calendar
    Gets data from a Google calendar and executes a callback function

    Parameters:

      name {String} - the id of the calendar
      range {String} - determines the range of the events returned. Options are today (events between 00:00 and 23:59 today), tomorrow (events between 00:00 and 23:59 tomorrow), week (events between 00:00 today and 23:59 7 days from today), and upcoming (events from today at 00:00 and forward)
      callback {Function} - the callback function to execute
      failcount {Integer} - and internal parameter used to catch failures and reload the page if the fail count is too high

    Example:

      (start code)
      GCal.get_calendar(GCal.kona_events, "week", function(data) {
        CalData.write_ticker(data, "#events .content", "s(dddd, MMMM d\nh:mm tt) - e(h:mm tt)");
      });
      (end)
  */

  get_calendar: function (name, range, callback, failcount) {
    "use strict";
		if (typeof(failcount) === "undefined") {
			failcount = 0;
		}

    var startMin, startMax;

    // options = $.extend(this.default_opts, options);
    var today = Date.today();
    var time = [];

    switch (range) {
    case "today":
      time = [today];
      break;
    case "tomorrow":
      time = [today.addDays(1)];
      break;
    case "week":
      time = [today,
        today.clone().addDays(7)];
      break;
    case "upcoming":
      time = [today,
        false];
      break;
    default:
      // nil
    }

    if (time.length > 1) { // if time is more than just one day
      startMin = time[0];
      if (time[1]) {
        startMax = time[1].clone().set({hour: 23, minute: 59, second: 59});
      } else {
        startMax = null;
      }
    } else {
      startMin = time[0];
      startMax = time[0].clone().set({hour: 23, minute: 59, second: 59});
    }

    var events = [];

    var request = gapi.client.request({
      path: '/calendar/v3/calendars/' + name + '/events',
      params: {
        timeMin:      startMin.toISOString(),
        timeMax:      startMax.toISOString(),
        singleEvents: true,
        orderBy:      'startTime'
      }
    });

    request.then(function(data) {
      var entries = data.result.items;

      for (var i = 0; i < entries.length; i++) {
        var eventEntry = entries[i];
        // var eventTitle = eventEntry.getTitle().getText();
        // console.log('Event title = ' + eventTitle);
        events.push(new Event({
          title: eventEntry.summary,
          start_time: GCal.parse_google_date(eventEntry.start.dateTime),
          end_time: GCal.parse_google_date(eventEntry.end.dateTime),
          location: eventEntry.location,
          description: eventEntry.description
        }));
      }
      // console.log(events);
      // return events;
      callback(events);
    },
    function() {
      if (failcount >= 3) {
        videoPlayer.queueRefresh();
      } else {
        GCal.get_calendar(name, range, callback, failcount + 1);
      }
    }); // if there's a problem, you know i'll solve it (aka try again...)
  },

  /*
  Function: parse_google_date
  */

  parse_google_date: function(dateString) {
    return Date.parse(dateString.substring(0, 19));
  },

  /*
    Function: get_two_calendars
    Gets data from two Google calendars, combines the data, and executes a callback function

    Parameters:

      cal1 {String} - the id of the first calendar
      cal2 {String} - the id of the second calendar
      range {String} - determines the range of the events returned. Options are today (events between 00:00 and 23:59 today), tomorrow (events between 00:00 and 23:59 tomorrow), week (events between 00:00 today and 23:59 7 days from today), and upcoming (events from today at 00:00 and forward)
      callback {Function} - the callback function to execute

    Example:

      (start code)
      GCal.get_two_calendars(GCal.kona_events, GCal.kona_schedule, "today", function(data) {
        CalData.write_table(data, "#events-today .content", "s(h:mm) - e(h:mm tt)|-|t()")
      });
      (end)
  */

  get_two_calendars: function(cal1, cal2, range, callback) {
    "use strict";
    this.get_calendar(cal1, range, function(data1) {
      GCal.get_calendar(cal2, range, function(data2) {
        var mixData = $.merge(data1, data2);
        mixData = mixData.sort(by_time);
        callback(mixData);
      });
    });
  }
};
