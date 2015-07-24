/*
Title: Layout.js
Layout.js is the configuration file for the DigitalSignage app. Each display can use it's own layout.js file to display seperate information in seperate ways

Basic Syntax:

  At it's most basic level, the layout variable is just an array of objects which will be inserted into an html page based on the object's content attribute

  > var layout = [{id: "wrapper"}]
  
Properties:
  *Required*
  
  id {String}                   - the html id of the object
  content {Array or Function}   - the content of the object. Either an array of children objects or a function that fills the object with data
  
  *Optional*
  
  css {Object}    - an object with css properties to be applied by <jQuery's css() method at http://api.jquery.com/css/>
  size {Integer}  - defines what percentage of it's parent the object should take (defaults to an even division between all siblings)
  title {String}  - title for a section
  
  *Required for the topmost object*

  parent {String} - the html id of the object's parent
  
  *Required for objects with children*
  
  orient {String} - either "horizontal" or "vertical".
                    Horizontal objects will lay out their children next to each other from left to right whereas vertical objects from top to bottom

Examples For Each Property:
  
  *id*
  
    > {id: "wrapper"} -> <div id="wrapper">...</div>
    
  *content*
    
    Many times, content will just be an array of children
    
    (start code)
      {id: "wrapper",
       content: [
         {id: "video"},
         {id: "events"}
       ]
      }
      ------------------
      <div id="wrapper">
        <div id="video">...</div>
        <div id="events">...</div>
      </div>
    (end)
    
    Other times it is actually a function that defines how every space should be filled
    
    There are three types of basic functions that will go here: *The video player, YWAM Connect data, and Google Calendar data*
    
    In order to use the video player, you must call the <videoPlayer.playVideos> function on an object with the id "video"
    
    (start code)
      {
        id: "video",
        content: function() {videoPlayer.playVideos({path: "http://gniux.uofnkona.edu/videos/", list: ['1.m4v', '2.m4v', '3.m4v', '4.m4v']})}
      }
    (end)
    
    For calendar data, you must write in a callback to write the data to the page using the *write_* methods defined in <CalData>
    
    .
    
    Each write_ method takes an *element* parameter. This should always take the form of "#(id of the object) .content"
    
    .

    To get data from *YWAM Connect*, use the methods defined in <YConnect>
    
    (start code)
      {
        id: "menu",
        content: function() {YConnect.get_calendar("today", function(data) {
          CalData.write_table(data, "#menu .content", "t()|-|d()");
        });}
      }
      ---------------------
      <div id="menu">
        <div class="content">
          <table>...</table>
        </div>
      </div>
    (end)
    
    To get data from *Google Calendar*, use the methods defined in <GCal>
    
    (start code)
      {
        id: "theater",
        content: function() {GCal.get_calendar(GCal.mauka_theater, "week", function(data) {
          CalData.write_movies(data, "#theater .content", "s(dddd, MMMM d\nh:mm tt)");
        });}
      }
      ---------------------
      <div id="theater">
        <div class="content">
          ...ticker with movies...
        </div>
      </div>
    (end)
    
  *css*
  
    (start code)
      {id: "bluebear", css: {
        margin: "30px"
      }}
      ---------------
      <div id="bluebear" style="margin: 30px">...</div>
    (end)
    
  *size*
  
    (start code)
      [
        {id: "left", size: 70},
        {id: "right", size: 30}
      ]
    
      +----------------------------------+
      |                       |          |
      |        #left          |  #right  |
      |                       |          |
      +----------------------------------+
    (end)
    
    (start code)
      [
        {id: "one", size: 33},
        {id: "two", size: 33},
        {id: "three", size: 33}
      ]
    
      +----------------------------------+
      |          |            |          |
      |  #one    |    #two    |  #three  |
      |          |            |          |
      +----------------------------------+
    (end)
    
  *title*
  
    (start code)
      {id: "events", title: "Tomorrow's Events"}
      -------------
      <div id="events">
        <h1>Tomorrow's Events</h1>
        <div class="content">...</div>
      </div>
    (end)
    
  *parent*

    > {parent: "body", id: "bluebear"} -> <div id="body"><div id="bluebear">...</div></div>
    
  *orient*
  
    (start code)
      {
        id: "wrapper",
        orient: "horizontal"
        content: [
          {id: "one"},
          {id: "two",
          {id: "three"}
        ]
      }
    
      +----------------------------------+
      |          |            |          |
      |  #one    |    #two    |  #three  |
      |          |            |          |
      +----------------------------------+
    (end)
    (start code)
      {
        id: "wrapper",
        orient: "vertical"
        content: [
          {id: "one"},
          {id: "two",
          {id: "three"}
        ]
      }
    
      +----------+
      |          |
      |   #one   |
      |          |
      |----------|
      |          |
      |   #two   |
      |          |
      |----------|
      |          |
      |  #three  |
      |          |
      +----------+
    (end)
    
Layout Examples:
  
  Horizontally oriented
  (start code)
    {
      id: "wrapper",
      orient: "horizontal"
      content: [
        {id: "left"},
        {
          id: "right",
          orient: "vertical",
          content: [
            {id: "cap"},
            {id: "bluebear"}
          ]
        }
      ]
    }
  
    +--------------------------+
    |             |            |
    |             |            |
    |             |   #cap     |
    |             |            |
    |             |            |
    |   #left     |------------|
    |             |            |
    |             |            |
    |             | #bluebear  |
    |             |            |
    |             |            |
    +--------------------------+
  (end)
  
  Vertical oriented
  (start code)
    {
      id: "wrapper",
      orient: "vertical"
      content: [
        {id: "top"},
        {
          id: "bottom",
          orient: "horizontal",
          content: [
            {id: "cap"},
            {id: "bluebear"}
          ]
        }
      ]
    }
  
    +--------------------------+
    |                          |
    |                          |
    |          #top            |
    |                          |
    |                          |
    |--------------------------|
    |            |             |
    |            |             |
    |    #cap    |  #bluebear  |
    |            |             |
    |            |             |
    +--------------------------+
  (end)
    
See Also:
  <jQuery's css() method at http://api.jquery.com/css/>
  
  <DateJS Format Strings at http://code.google.com/p/datejs/wiki/FormatSpecifiers>
  
  <Format Strings>
*/

var layout = [{
  id: "wrapper",
  parent: "body",
  css: {margin: "3em 0 0 0"},
  orient: "horizontal",
  content: [
    {
      id: "main",
      orient: "horizontal",
      content: [
        {
          id: "left",
          orient: "vertical",
          size: 69,
          content: [
            {
              id: "video",
              size: 70,
              content: function() {videoPlayer.playVideos({path: "http://gniux.uofnkona.edu/videos/", list: ['1.m4v', '2.m4v', '3.m4v', '4.m4v', '5.m4v', '6.m4v', '7.m4v', '8.m4v']})}
            },
            {
              id: "bottomrow",
              size: 30,
              orient: "horizontal",
              content: [
                {
                  id: "theater",
                  title: "Mauka Theater",
                  size: 50,
                  content: function() {GCal.get_calendar(GCal.mauka_theater, "week", function(data) {
    CalData.write_movies(data, "#theater .content", "s(dddd, MMMM d\nh:mm tt)");
    });}
                },
                {
                  id: "events",
                  size: 50,
                  title: "Upcoming Events",
                  content: function() {GCal.get_calendar('3dbt5d9qe5ct57f1ek1mvqh5qo%40group.calendar.google.com', "week", function(data) {
    CalData.write_ticker(data, "#events .content", "s(dddd, MMMM d\nh:mm tt) - e(h:mm tt)");
    });}
                }
              ]
            } // #bottomrow
          ]
        }, // #left
        {
          id: "separator",
          size: 1,
          content: function() {$("#separator .content").html("&nbsp;")}
        },
        {
          id: "right",
          orient: "vertical",
          size: 30,
          content: [
            {
              id: "menu",
              title: "Menu",
              size: 33,
              content: function() {YConnect.get_calendar("today", function(data) {
    CalData.write_table(data, "#menu .content", "t()|-|d()");
    });}
            },
            {
              id: "events-today",
              title: "Today's Schedule",
              size: 33,
              content: function() {
                GCal.get_calendar('3dbt5d9qe5ct57f1ek1mvqh5qo%40group.calendar.google.com', "today", function(data) {
                  CalData.write_table(data, "#events-today .content", "s(h:mm) - e(h:mm tt)|-|t()")
                });
              }
            },
            {
              id: "events-tomorrow",
              title: "Tomorrow's Schedule",
              size: 33, 
              content: function() {
                GCal.get_calendar('3dbt5d9qe5ct57f1ek1mvqh5qo%40group.calendar.google.com', "tomorrow", function(data) {
    CalData.write_table(data, "#events-tomorrow .content", "s(h:mm) - e(h:mm tt)|-|t()")
    }); }
            }
          ]
        } // #right
      ]
    } // #main
  ]
}] // #wrapper