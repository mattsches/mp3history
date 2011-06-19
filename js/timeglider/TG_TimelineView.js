/*
 * Timeglider for Javascript / jQuery 
 * http://timeglider.com/jquery
 *
 * Copyright 2011, Mnemograph LLC
 * Licensed under the MIT open source license
 * http://timeglider.com/jquery/?p=license
 *
 */
 


/*
****************************************
timeglider.TimelineView
****************************************
*/
(function(tg){

 // MED below is a reference to the mediator reference
 // that will be passed into the main Constructor below
  var TG_Date = tg.TG_Date, 
      PL = "", MED = "", options = {}, $ = jQuery, intervals ={}, WIDGET_ID = "", CONTAINER, TICKS;

  // adding a screen display for anything needed
  debug.trace = function (stuff, goes) {
      $("#" + goes).text(stuff);
  }


  /*
  *  timeglider.TG_TimelineView
  *  
  *
  */
  tg.TG_TimelineView = function (widget, mediator) {
    
    
    var me = this;
    
    
      // vars declared in closure above
	    MED = mediator;
	    options = MED.options;
	    // core identifier to "uniquify"
      PL = "#" + widget._id;
      WIDGET_ID = widget._id;
      	    

	/* references specific to the instance (rather than timeglider) so
	   one can have more than one instance of the widget on a page */ 	      
	   this._views = {
    		PLACE:PL,
    		CONTAINER : PL + " .timeglider-container", 
    		TIMELINE_MENU : PL + " .timeglider-timeline-menu", 
    		TIMELINE_MENU_UL : PL + " .timeglider-timeline-menu ul", 
    		TIMELINE_LIST_BT : PL + " .timeglider-list-bt", 
    		SLIDER_CONTAINER : PL + " .timeglider-slider-container", 
    		SLIDER : PL + " .timeglider-slider", 
    		ZOOM_DISPLAY : PL + " .timeglider-zoomlevel-display",
    		TRUCK : PL + " .timeglider-truck", 
    		CENTERLINE : PL + " .timeglider-centerline", 
    		TICKS : PL + " .timeglider-ticks", 
    		HANDLE : PL + " .timeglider-handle",
    		FOOTER : PL + " .timeglider-footer",
    		FILTER_BT : PL + " .timeglider-filter-bt",
    		FILTER_BOX : PL + " .timeglider-filter-box",
    		TOOLS_BT : PL + " .timeglider-tools-bt"
	    }
	  
	  // shorthand for common elements
	  CONTAINER = this._views.CONTAINER;
	  TICKS = this._views.TICKS;
	
  /*  TEMPLATES FOR THINGS LIKE MODAL WINDOWS
  *   events themselves are non-templated and rendered in TG_Org.js
  *   as there are too many on-the-fly style attributes etc, and 
  *   the current theory is that templating would create lag
  *
  *
  */
  
	this._templates = {
	    // generated, appended on the fly, then removed
      event_modal: $.template( null, "<div class='tg-modal timeglider-ev-modal ui-widget-content' id='ev_${id}_modal'>" 
    	  + "<div class='close-button-remove'></div>" 
    	  + "<div class='startdate'>${startdate}</div>"
    	  + "<h4 id='title'>${title}</h4>"
    	  + "<p>{{html description}}</p>"
    	  + "<ul class='timeglider-ev-modal-links'>{{html links}}</ul>"
    	  + "</div>"),
    	  // <li><a target='_blank' href=''>link</a></li> removed from links ul above
    	  
    	// generated, appended on the fly, then removed
    	event_modal_video : $.template( null,
    	  "<div class='tg-modal timeglider-ev-video-modal ui-widget-content' id='${id}_modal'>"
    	  + "<div class='close-button-remove'></div>"
        + "<iframe width = '100%' height='300' src='${video}'></iframe></div>"),
        
      // generated, appended on the fly, then removed
      timeline_modal : $.template( null, "<div class='tg-modal timeglider-timeline-modal ui-widget-content' id='tl_${id}_modal'>" 
      	  + "<div class='close-button-remove'></div>"
      	  + "<h4 id='title'>${title}</h4>"
      	  + "<p>{{html description}}</p>"
      	  + "</div>"),
     
     // generated, appended on the fly, then removed
     filter_modal : $.template( null,
          "<div class='tg-modal timeglider-menu-modal timeglider-filter-box timeglider-menu-hidden'>"+
          "<div class='close-button'></div>"+
          "<h3>filter</h3>"+
          "<div class='timeglider-menu-modal-content'>"+
          "<div class='timeglider-formline'>show: "+
          "<input type='text' class='timeglider-filter-include'></div>"+
          "<div class='timeglider-formline'>hide: "+
          "<input type='text' class='timeglider-filter-exclude'></div>"+
          "<ul><li class='timeglider-filter-clear'>clear</li>"+
          "<li class='timeglider-filter-apply'>apply</li></ul></div>"+
           "<div class='timeglider-menu-modal-point-right'>"+
           "</div>"),
          
      timeline_list_modal : $.template( null,
          "<div class='timeglider-menu-modal timeglider-timeline-menu timeglider-menu-hidden'>"+
          "<div class='close-button'></div>"+
          "<h3>timelines</h3>"+
          "<div class='timeglider-menu-modal-content'><ul></ul></div>"+
          "<div class='timeglider-menu-modal-point-right'>"+
          "</div>"),
        
      legend_modal : $.template( null,
          "<div class='timeglider-menu-modal timeglider-legend timeglider-menu-hidden'  id='${id}_legend'>"+
          "<div class='timeglider-menu-modal-content'><ul id='${id}'>{{html legend_list}}</ul>"+
          "<div class='timeglider-close-button-small timeglider-legend-close'></div>"+
          "<div class='timeglider-legend-all'>all</div>"+
          "</div>"+
          "</div>")

    }


	$(CONTAINER).css("height", $(PL).height());
	
	this.basicFontSize = options.basic_fontsize;
	
	if (options.show_footer == false) {
	  $(this._views.FOOTER).css("display", "none");
  }

	this.dragSpeed = 0;
	this.dimensions = this.getWidgetDimensions();
	this.tickNum = 0;
	this.leftside = 0;
	this.rightside = 0;
	this.ticksHandleOffset = 0;	
	this.timeoout_id = 1;
	this.sliderActive = false;
	this.ztop = 1000;
	this.filterBoxActivated = false;
	
	// INITIAL CONSTRUCTION
	this.buildSlider();
	this.setupFilter();
	

  /* PUB-SUB "LISTENERS" SUBSCRIBERS */
  
  $.subscribe("mediator.timelineDataLoaded", function () {
      $(".timeglider-loading").fadeOut(500);     
  });
  
   	
	$.subscribe("mediator.ticksOffsetChange", function () {
		me.tickHangies();
		me.registerTitles();
		me.registerDragging();
	});
	
	
	$.subscribe("mediator.zoomLevelChange", function () {
		
		me.tickNum = 0;
		me.leftside = 0;
		
		var zl = MED.getZoomLevel();
		// if the slider isn't already at the given value change it
		$(me._views.SLIDER).slider("value", me.invSliderVal(zl));
    me.displayZoomLevel(zl);
    
    me.castTicks("zoomLevelChange");
		
	});
	
	/// This happens on a TOTAL REFRESH of 
	/// ticks, as when zooming; panning will load
	/// events of active timelines per tick	
	$.subscribe("mediator.ticksReadySignal", function (b) {
		  if (MED.ticksReady === true) {
			me.freshTimelines();
		} 
	});
	
	
	/*
    	Renews the timeline at current focus/zoom, but with
    	possibly different timeline/legend/etc parameters
    	! The only view method that responds directly to a model refresh()
	*/
	$.subscribe("mediator.refreshSignal", function () {
	  
  	me.tickNum = 0;
  	me.leftside = 0;
  	
		me.castTicks("refreshSignal");
	});


	// adding to or removing from ticksArray
	// DORMANT: necessary?
	$.subscribe( 'mediator.ticksArrayChange', function () {
		/*
    	SCAN OVER TICKS FOR ANY REASON?
		*/
	});
	
	
	// listen for focus date change
	// mainly if date is zipped-to rather than dragged
	$.subscribe("mediator.focusDateChange", function () {
		// 
	});
	
	
	// UPDATE TIMELINES MENU
	$.subscribe("mediator.timelineListChangeSignal", function (arg) {
    me.buildTimelineMenu();
	});
	

	$.subscribe("mediator.activeTimelinesChange", function () {
		
		$(me._views.TIMELINE_MENU_UL + " li").each(function () {
				var id = $(this).attr("id");
			    if ($.inArray(id, MED.activeTimelines) != -1) {
					$(this).addClass("activeTimeline");
				} else { 
					$(this).removeClass("activeTimeline");	
				}	
        }); // end each	
	});
	
	
  $.subscribe("mediator.filterChange", function () {
    // refresh is done inside MED -- no need to refresh here
	});
  /* END PUB-SUB SUBSCRIBERS */


	$(".timeglider-pan-buttons div").mousedown(function () {
	  var lr = $(this).attr("class"),
	      dir = (lr == "timeglider-pan-right") ? -30 : 30; 
	      me.intervalMachine("pan", {type:"set", fn: me.pan, args:[dir], intvl:30});
  }).mouseup(function () {
	    me.intervalMachine("pan", {type:"clear", fn: me.pan, callback: "resetTicksHandle"});
  }).mouseout(function () {
    	me.intervalMachine("pan", {type:"clear", fn: me.pan, callback: "resetTicksHandle"});
  });


  
	$(this._views.TRUCK)
		.dblclick(function(e) {
			 	var Cw = me.dimensions.container.width,
			    Cx = e.pageX - (me.dimensions.container.offset.left),
				  offMid = Cx - Cw/2,
			    secPerPx = MED.getZoomInfo().spp,
				  // don't need mouse_y yet :
				  //	var Cy = e.pageY - $(PLACEMENT).offset().top;
			    fdSec = MED.getFocusDate().sec,
				  dcSec = Math.floor(fdSec + (offMid * secPerPx)),
				  
				  clk = new TG_Date(dcSec),
				  foc = new TG_Date(fdSec);
				  
				
				debug.trace("DBLCLICK:" + foc.mo + "-" + foc.ye + " DBLCLICK:" + clk.mo + "-" + clk.ye, "note");	
				
		})			
		.bind('mousewheel', function(event, delta) {
						
			      var dir = Math.ceil(-1 * (delta * 3));
						var zl = MED.getZoomLevel();
						MED.setZoomLevel(zl += dir);
			      return false;
			            
		}); // end TRUCK EVENTS



	
	$(TICKS)
	  	.draggable({ axis: 'x',
			//start: function(event, ui) {
				/// 
			//},
			drag: function(event, ui) {
				// just report movement to model...
				MED.setTicksOffset($(this).position().left);
			},
		
			stop: function(event, ui) {
				me.resetTicksHandle();
				me.registerDragging();
    		
				// me.easeOutTicks();  
			}
			
		}) // end draggable
		.delegate(CONTAINER + " .timeglider-timeline-event", "click", function () { 
			// EVENT ON-CLICK !!!!!!
			var eid = $(this).attr("id"); 
			var ev = MED.eventPool[eid];
			 
		  if (ev.click_callback) {
		    
    		    var broken = ev.click_callback.split(".");
    		    var ns = broken[0];
		    
    		    if (broken.length == 2) {
    		      var fn = broken[1];
    		      window[ns][fn](ev);
    	      } else {
    	        window[ns](ev);
            }
		    
	    } else {
	          me.eventModal(eid);
      }
		  
		})	
		.delegate(".timeglider-timeline-event", "mouseover", function () { 
			var eid = $(this).attr("id"); 
			var ev = MED.eventPool[eid];
			debug.trace("hover, title:" + ev.title, "note"); 
			me.eventHover($(this), ev)
		})
		.delegate(".timeglider-timeline-event", "mouseout", function () { 
			var eid = $(this).attr("id"); 
			var ev = MED.eventPool[eid];
			debug.trace("hover, title:" + ev.title, "note"); 
			me.eventUnHover($(this), ev)
		})
		.delegate(".timeglider-event-collapsed", "hover", function () { 
			var eid = $(this).attr("id"); 
			var title = MED.eventPool[eid].title;
			debug.trace("collapsed, title:" + title, "note"); 
		});
		
	$(CONTAINER).delegate(".close-button-remove", "click", function () {
	  var parent_id = $(this).parent().attr("id");
	  $("#" + parent_id).remove();
	});
	
	$(CONTAINER).delegate(".timeglider-more-plus", "click", function () {
	  MED.zoom(-1);
	});
	
	$(CONTAINER + " .timeglider-legend-close").live("click", function () {
	  var $legend = $(CONTAINER + " .timeglider-legend");
	   $legend.fadeOut(300, function () { $legend.remove(); });
  });
  
  $(CONTAINER + " .timeglider-legend-all").live("click", function () {
    $(CONTAINER + " .timeglider-legend li").each(function () {
      $(this).removeClass("tg-legend-icon-selected");
    });
	  MED.setFilters({origin:"legend", icon: "all"});
  });

 

 $.tmpl(me._templates.timeline_list_modal,{}).appendTo(CONTAINER);
 $(me._views.TIMELINE_LIST_BT).click(function () {
		  $(me._views.TIMELINE_MENU).toggleClass("timeglider-menu-hidden")
		    .position({
        		my: "right bottom",
      			at: "right top",
      			of: $(me._views.TIMELINE_LIST_BT),
      			offset: "-8, -12"
          });
	});
	
	
	$(this._views.TIMELINE_MENU + " .close-button").live("click", function () {
		 $(me._views.TIMELINE_MENU).toggleClass("timeglider-menu-hidden")
	});
  
  /* SETTINGS BUSINESS */
  $(this._views.TOOLS_BT).click(function() {
    alert("I'm just a stand-in for the tools... ");
  }); 
 
	
	
	// TODO: make function displayCenterline()
	// TODO: simply append a centerline template rather than .css'ing it!
	if (MED.options.show_centerline === true) {
		$(this._views.CENTERLINE).css({"height":me.dimensions.container.height, "left": me.dimensions.container.centerx});
	} else {
		$(this._views.CENTERLINE).css({"display":"none"});
	}
	

	
	//// GESTURES  ////
	/* !!TODO    Still a FAIL in iPad ---- 
	   When actually doing something, Safari seems to 
	   ignore attempts at preventing default... 
	   
	   SCOPED IN CLOSURE, THESE ARE UNTESTABLE
	*/
	function gestureChange (e) {
		e.preventDefault ();
		if (MED.gesturing === false) {
			MED.gesturing = true;
			MED.gestureStartZoom = MED.getZoomLevel();
		}
	    var target = e.target;
		// constant spatial converter value
	    var g = (e.scale / 5)* MED.gestureStartZoom;
		  debug.trace("gesture zoom:" + g, "note");
		  MED.setZoomLevel(g);
	}


	function gestureEnd (e) {
		MED.gesturing = false;
	}

	if ($.support.touch) {   
	  // alert("widget:" + WIDGET_ID);
	  $("#" + WIDGET_ID).addTouch();
	  
	  var tgcompnt = document.getElementById(WIDGET_ID);
	  
	  tgcompnt.addEventListener("gesturestart", function (e) {
	    	  e.preventDefault();
	        $("#output").append("<br>gesture zoom:" + MED.getZoomLevel());
	    }, false);
	    
	    tgcompnt.addEventListener("gestureend", function (e) {
  	    	  e.preventDefault();
  	        $("#output").append("<br>gesture end:" + MED.getZoomLevel());
  	    }, false);
	  
	  
	  tgcompnt.addEventListener("gesturechange", function (e) {
    	    	  e.preventDefault();
    	    	  //var gLeft = e.touches.item(0).pageX;
    	    	  //var gRight = e.touches.item(1).pageX;
    	    	  var gLeft = "l", gRight = "r";
    	        $("#output").append("[" + gLeft + ":" + gRight + "]");
    	        
    	 }, false);
	    
	}

	
} 


tg.TG_TimelineView.prototype = {
	
	getWidgetDimensions : function () {
			
			var c = $(CONTAINER),
				w = c.width(),
				wc = Math.floor(w / 2) + 1,
				h = c.height(),
				hc = Math.floor(h/2),
				t_height = 30,
				lft = c.position().left,
				offset = c.offset(),
				f_height = (options.show_footer == true) ? $(this._views.FOOTER).height() : 0,
				t_top = h - f_height - t_height,
				// objects to return
				container = {"width":w, "height":h, "centerx":wc, "centery":hc, "left": lft, "offset": offset},
				footer = {"height":f_height},
				tick = {"top":t_top};
			
			return {container:container, tick:tick, footer:footer}
		  
	},
	
  scaleToImportance : function(imp, zoo) {
		    return imp / zoo;
	},
	
	displayZoomLevel : function(zl) {

	  if (zl > 0) {
	  var me=this;
	  if (options.display_zoom_level == true) {
 		    $(me._views.ZOOM_DISPLAY).text(zl);
	    }
    }
 	},
 	
 	
 	doSomething : function() {
 		    alert("FOO DO, viewer");
 	},
 	
 	
 	
	/* 
	PLUGIN!!
	*/
	intervalMachine : function (name, info) {
	  var me=this;
	  if (info.type === "clear") {
	    clearInterval(intervals[name]);
	    
	    if (info.callback) {
	      me[info.callback]();
      }
      
    } else {
      // run it 
	    intervals[name] = setInterval(function () {
	          info.fn.apply(me, info.args);
	        }, info.intvl);
    }
  },


  invSliderVal : function(v) {
  	return Math.abs(v - 101);
  },
  
  
  pan : function (dir) {
    
    var d = dir || 20;
    
    $t = $(TICKS),
    newPos = $t.position().left + d;
        
    $t.css({left:newPos});
    
    MED.setTicksOffset(newPos);
    
  },
  

  registerTitles : function () {
		
		var toff, w, tw, sw, pos, titx, 
		  $elem, env, tb, ti, relPos, tbWidth,
		  mo = $(CONTAINER).offset().left;
		
		
		$(".timeglider-event-spanning").each(
			function() {
			  // !TODO  needs optimizing of DOM "touching"
			 	toff = $(this).offset().left - mo;
				w = $(this).outerWidth();
				$elem = $(".timeglider-event-title",this);
				tw = $elem.outerWidth() + 5;
				sw = $elem.siblings(".timeglider-event-spanner").outerWidth();
				if (sw > tw) {
          if ((toff < 0) && (Math.abs(toff) < (w-tw))) {
            $elem.css({marginLeft:(-1 * toff)+5});
          } 
			  }
				
				// is offscreen == false: $(this).removeClass('timeglider-event-offscreen')
			 }
		);

		$(".tg-timeline-envelope").each(
				function () {
				  // !TODO  needs optimizing of DOM "touching"
					env = $(this).offset().left - mo;
					tb = $(".titleBar", this);
					ti = $(".titleBar .timeline-title", this);
					pos = tb.position().left;
				 	relPos = pos + env;
					tbWidth = tb.outerWidth();
					
					tw = tb.outerWidth();
					
				  titx = (-1 * relPos);
					
				 	if ( (relPos < 0) ) {
						ti.css({marginLeft:titx+5});
					} 
				}
		); 
	// whew! end register titles
	},
	
	
	registerDragging : function () {
	  /* 
			startSec --> the seconds-value of the
	    initial focus date on landing @ zoom level
		*/
		// TODO: See if we can throttle this to be only
		// once every 100ms....
		var startSec = MED.startSec,
		  tickPos = $(TICKS).position().left,
		  secPerPx = MED.getZoomInfo().spp,
		  newSec = startSec - (tickPos * secPerPx);
		  
		  var newD = new TG_Date(newSec);
		   		 
		  MED.setFocusDate(newD);
	},
	
  
  buildTimelineMenu : function () {
    
    var id, ta = MED.timelinePool, ta_ct = 0, me=this;
		
		    // cycle through menu
        $(me._views.TIMELINE_MENU_UL + " li").remove();
      	for (id in ta) {
      			if (ta.hasOwnProperty(id)) {
        			var t = ta[id];
        			$(me._views.TIMELINE_MENU_UL).append("<li class = 'timelineList' id='" + id + "'>" + t.title + "</li>");
        			$("li#" + id).click( function() { 
        			    MED.toggleTimeline($(this).attr("id"));
        			    });
      			} // end filter
      			ta_ct ++;
      	}
  },
  
	
	/* 
		Zoom slider is inverted value-wise from the normal jQuery UI slider
	  so we need to feed in and take out inverse values with invSliderVal()            
	*/
	buildSlider : function () {
	  var iz = MED.getZoomLevel();
	  
		if (options.min_zoom == options.max_zoom) {
		  // With a single zoom level, hide the zoom controller
  	  $(this._views.SLIDER_CONTAINER).css("display", "none");
  	  
    } else {
      
      if (options.display_zoom_level == true) {
    		var $zl = $("<div>").appendTo(this._views.SLIDER_CONTAINER).addClass("timeglider-zoomlevel-display");
    		$zl.html('&nbsp;');
    	}
      
		  var me = this,
		  init_zoom = me.invSliderVal(iz),
      hZoom = MED.max_zoom,
      lZoom = MED.min_zoom,
      sHeight = (1 + hZoom - lZoom) * 3;
	
		 	$(this._views.SLIDER)
			  .css("height", sHeight)
			  .slider({ 
  				steps: 100,
  				handle: $('.knob'),
  				animate:300,
				orientation: 'vertical',

				/* "min" here is really the _highest_ zoom value @ upside down */
  				min:me.invSliderVal(hZoom),

				/* "max" actually takes (i  nverse value of) low zoom level */
  				max:me.invSliderVal(lZoom),

  				value:init_zoom,

				start: function (e, ui) {
					// show zoom level legend
					me.sliderActive = true;
				},

				stop: function (e, ui) {
					// hide zoom level legend
					me.sliderActive = false;
				},

				change: function(e,ui){
      				// i.e. on-release handler
					    // possibly load throttled back events
  			}, 

				slide: function(e, ui) {
					// sets model zoom level to INVERSE of slider value
					MED.setZoomLevel(me.invSliderVal(ui.value));
				}
			});
			
		} // end--if min_zoom == max_zoom 
	},
	
	/*
	* Occurs when MOUSE-hovering over event
	*
	*/
	
	eventHover : function ($ev, ev_obj) {

    var me = this, 
        $hov = $(".timeglider-event-hover-info");
    
    // This works, but what if it has to sit on the bottom
    debug.log("hover display:" + ev_obj.date_display);
    if (ev_obj.date_display != "no") {
      $hov.position({
  	    my: "left bottom",
  	    at: "left top",
  	    of: $ev,
  	    offset: "1, -10",
  	    collision: "flip flip"}).text(ev_obj.startdateObj.format("D", true));
    }
	  	   
	  $ev.addClass("tg-event-hovered");
	   
	   
  },
	
	eventUnHover : function ($ev, ev_obj) {
	   $(".timeglider-event-hover-info").css("left", "-1000px");
	   $ev.removeClass("tg-event-hovered");
  },
  
  
  
  /* FILTER BOX SETUP */
  setupFilter : function () {
      var me=this;
      $.tmpl(me._templates.filter_modal,{}).appendTo(me._views.CONTAINER);
      
  	  $(me._views.FILTER_BT).click(function() {  

  	      var $bt = $(this), fbox = me._views.FILTER_BOX;

  	      // If it's never been opened, apply actions to the buttons, etc
  	      if (me.filterBoxActivated == false) {

  	        me.filterBoxActivated =true;

  	        var $filter_apply = $(fbox + " .timeglider-filter-apply"),
              $filter_close = $(".timeglider-filter-box .close-button"),
              $filter_clear = $(fbox + " .timeglider-filter-clear"),
              incl = "", excl = "";

  	          // set up listeners
  	          $filter_apply.click(function () {
  	            incl = $(fbox + " .timeglider-filter-include").val();
  	            excl = $(fbox + " .timeglider-filter-exclude").val();
  	            MED.setFilters({origin:"clude", include:incl, exclude:excl});
  	            $(fbox).toggleClass("timeglider-menu-shown");
              });

              $filter_close.click(function () {
                $(fbox).toggleClass("timeglider-menu-hidden");
              });

              $filter_clear.click(function () {
                MED.setFilters({origin:"clude", include:'', exclude:''});
                $(fbox + " .timeglider-filter-include").val('');
  	            $(fbox + " .timeglider-filter-exclude").val('');
                $(fbox).toggleClass("timeglider-menu-shown");
              });
              
              } // end if filterBoxActivated

              // open the box
  	          $(fbox)
  	            .toggleClass("timeglider-menu-hidden")
  	            .css("z-index", me.ztop++)
  	            .position({
          		    my: "right bottom",
        			    at: "right top",
        			    of: $bt,
        			    offset: "-8, -12"
              });

        }); // end FILTER_BT click

 }, // end setupFilter
  
  
	clearTicks : function () {
	  this.leftside = 0;
		this.tickNum = 0;
		$(TICKS)
		  .css("left", 0)
			.html("<div class='timeglider-handle'></div>");
	},


	/* 
	  The initial drawing of a full set of ticks, starting in the 
	  middle with a single, date-focused div with type:"init", after which
	  a left-right alternating loop fills out the width of the current frame
	*/
	castTicks : function (orig) {
	  	  	
	  this.clearTicks();
    
		var zLevel = MED.getZoomLevel(),
			fDate = MED.getFocusDate(),
			tickWidth = MED.getZoomInfo().width,
			twTotal = 0,
			ctr = this.dimensions.container.centerx,
			nTicks = Math.ceil(this.dimensions.container.width / tickWidth) + 4,
			leftright = 'l';
			
	
		MED.setTicksReady(false);
    
		// INITIAL TICK added  in center according to focus date provided
		this.addTick({"type":"init", "focus_date":fDate});
	
		// determine how many are necessary to fill (overfill) container
		
		// ALTERNATING L & R
		for (var i=1; i<=nTicks; i +=1) {
			this.addTick({"type":leftright});
			leftright = (leftright == "l") ? "r" : "l";
		}
		
		MED.setTicksReady(true);
	},
  
  
	
	/*
	* @param info {object} --object--> type: init|l|r focusDate: date object for init type
	*/											
	addTick : function (info) {
		  
			var mDays = 0, dist = 0, pos = 0, ctr = 0, 
			tperu = 0, serial = 0, shiftLeft = 0,
			tid = "", tickHtml = "", idRef = "", 
			$tickDiv = {}, tInfo = {}, pack = {}, label = {}, mInfo = {}, 
			tickUnit = MED.getZoomInfo().unit,
			tickWidth = MED.getZoomInfo().width,
			focusDate = MED.getFocusDate(),
			tick_top = parseInt(this.dimensions.tick.top),
			me = this,	
			serial = MED.addToTicksArray({type:info.type, unit:tickUnit}, focusDate),
			hours_html = "", hour_num=0, hour_label="";
						
		// adjust tick-width for months (mo)
  		if (tickUnit == "mo") {
  			// starts with tickWidth set for 28 days: How many px, days to add?
  			mInfo = TG_Date.getMonthAdj(serial, tickWidth);
  			tickWidth = mInfo.width;
  			mDays = mInfo.days;
			
  		} 

		this.tickNum ++;
		if (info.type == "init") {
			
		  shiftLeft = this.tickOffsetFromDate(MED.getZoomInfo(), MED.getFocusDate(), tickWidth);

			pos = Math.ceil(this.dimensions.container.centerx + shiftLeft);
						
			this.leftside = pos;
			this.rightside = (pos + tickWidth);
			
			
		} else if (info.type == "l") {
			pos = Math.floor(this.leftside - tickWidth);
			this.leftside = pos;
		} else if (info.type == "r") {
			pos = Math.floor(this.rightside);
			this.rightside += tickWidth;
		}
		
		// turn this into a function...
		MED.getTickBySerial(serial).width = tickWidth;
		MED.getTickBySerial(serial).left = pos;

		tid = this._views.PLACE + "_" + tickUnit + "_" + serial + "-" + this.tickNum;

		$tickDiv= $("<div class='timeglider-tick' id='" + tid + "'>"
		            + "<div class='timeglider-tick-label' id='label'></div></div>")
		  .appendTo(TICKS);
		
		$tickDiv.css({width:tickWidth, left:pos, top:tick_top});
						
		// GET TICK DIVS FOR unit AND width
		tInfo = this.getTickMarksInfo({unit:tickUnit, width:tickWidth});
		// if there's a value for month-days, us it, or use
		// tperu = (mDays > 0) ? mDays : tInfo.tperu;
		tperu = mDays || tInfo.tperu;				
			
		dist = tickWidth / tperu;

    // Add tick-lines or times when divisions are spaced wider than 5
    
		if (dist > 5) {
		
  			/* Raphael CANVAS for tick lines
  			   @param tid {string} dom-id-with-no-hash, width, height 
  			*/
  			
			  var lines = Raphael(tid, tickWidth, 30),
				c, l, xd, stk = '', ht = 10,
				downset = 20;
				
				
				
				for (l = 0; l < tperu; ++l) {
				  // xd is cross distance...
					xd = l * dist;
					stk += "M" + xd + " " + downset + " L" + xd + " " + (ht + downset);
					
					// gather 24 hours of the day
					if (tickUnit == "da" && dist > 16) {
					  hour_label = me.getHourLabelFromHour(hour_num, dist);
					  // set width below to subtract CSS padding-left
            hours_html += "<div class='timeglider-tick-hour-label' style='width:" + (dist - 4) + "px'>" + hour_label + "</div>";
            hour_num++;
  			  }

				}
		
				c = lines.path(stk);
				// !TODO --- add stroke color into options object
				c.attr({"stroke":"#333", "stroke-width":1});
	
			} // end dist > 5  if there's enough space between tickmarks
			
		// add hours gathered in loop above
		if (tickUnit == "da" && dist > 32) {
		  $tickDiv.append("<div style='position:absolute;top:14px;left:0'>" + hours_html + "</div>");
	  } 
		
		pack = {"unit":tickUnit, "width":tickWidth, "serial":serial};

		label = this.getDateLabelForTick(pack);
	
		// DO OTHER STUFF TO THE TICK, MAKE THE LABEL AN ACTIONABLE ELEMENT
		// SHOULD APPEND WHOLE LABEL + TICKLINES HERE
		$tickDiv.children("#label").text(label);

		return pack;
		/* end addTick */
	}, 
	
	getHourLabelFromHour : function (h24, width) {
	  var ampm = "", htxt = "", bagels = "";
	  
	  htxt = (h24 > 12) ? h24-12 : h24;
	  if (htxt == 0) htxt = 12;
	  
	  bagels = (width > 60) ? ":00" : "";
    ampm = (h24 > 11) ? " pm" : " am";
    
    return htxt + bagels + ampm;
	  
  },

	
	/* provides addTick() info for marks and for adj width for month or year */
	getTickMarksInfo : function (obj) {
		var tperu;
		switch (obj.unit) {
			case "da": 
				tperu = 24; 
				break;
			case "mo": 
			  // this is adjusted for different months later
				tperu = 30; 
				break;
			case "ye": 
				tperu = 12; 
				break;
			default: tperu = 10; 
		}
	
		return {"tperu":tperu};
	},
	
	/*
	*  getDateLabelForTick
	*  determines label for date unit in "ruler"
	*  @param obj {object} carries these values:
	                       {"unit":tickUnit, "width":tickWidth, "serial":serial}
	*
	*/
	getDateLabelForTick : function  (obj) {
		var i, me=this, ser = obj.serial, tw = obj.width;
	
		switch(obj.unit) {

      case "bill":
      	if (ser == 1) return "1";
        return (ser -1) + " bya";
        
      case "hundredmill":
      	if (ser == 1) return "1";
        return ((ser -1) * 100) + " mya";
        
      case "tenmill":
      	if (ser == 1) return "1";
        return ((ser -1) * 10) + " mya";
        		    
      case "mill":
    		if (ser == 1) return "1";
      	return (ser -1) + " mya";
      		    
      case "hundredthou":
  		  if (ser == 1) return "1";
    		return (ser -1) + "00,000";    
    		    
		  case "tenthou":
		    if (ser == 1) return "1";
  		  return (ser -1) + "0000";
 
		  case "thou": 
		    if (ser == 1) return "1";
		    return (ser -1) + "000";

		  case "ce": 
		    if (ser == 1) return "1";
		    return (ser -1) + "00";
		    
			case "de": 
				return ((ser -1) * 10) + "s";
			case "ye": 
				return ser; 
			case "mo": 
			   i = TG_Date.getDateFromMonthNum(ser);
			   if (tw < 120) {
			     return TG_Date.monthNamesAbbr[i.mo] + " " + i.ye; 
		     } else {
		       return TG_Date.monthNames[i.mo] + ", " + i.ye; 
	       }
				
				
			case "da": 
			  // COSTLY: test performance here on dragging
			  i = new TG_Date(TG_Date.getDateFromRD(ser));
			  if (tw < 120) {
				  return TG_Date.monthNamesAbbr[i.mo] + " " + i.da + ", " + i.ye;
		    } else {
		      return TG_Date.monthNames[i.mo] + " " + i.da + ", " + i.ye;
	      }
		
			default: return obj.unit + ":" + ser + ":" + tw;
		}
		
	},


	tickHangies : function () {
		var tPos = $(TICKS).position().left,
		    lHangie = this.leftside + tPos,
		    rHangie = this.rightside + tPos - this.dimensions.container.width,
		    tick, added = false,
		    me = this;
		
		if (lHangie > -100) {
			tick = this.addTick({"type":"l"});
			me.appendTimelines(tick);
		} else if (rHangie < 100) {
			tick = this.addTick({"type":"r"});
			me.appendTimelines(tick);
		}
	},
	

	/* tickUnit, fd */
	tickOffsetFromDate : function (zoominfo, fdate, tickwidth) {
				
		// switch unit, calculate width gain or loss.... or just loss!
		var w = tickwidth,
		    u = zoominfo.unit, p, prop;

		switch (u) {
			case "da": 
				// @4:30        4/24                30 / 1440
				//              .1666                .0201
				prop = ((fdate.ho) / 24) + ((fdate.mi) / 1440);
				p = w * prop;
				break;

			case "mo":
			  
				var mdn = TG_Date.getMonthDays(fdate.mo, fdate.ye);
			   
				prop = ((fdate.da -1) / mdn) + (fdate.ho / (24 * mdn)) + (fdate.mi / (1440 * mdn));
				p = w * prop;
				break;

			case "ye":
				prop = (((fdate.mo - 1) * 30) + fdate.da) / 365;
				p = w * prop;
				break;

			case "de": 
				// 
				// 1995
				prop = ((fdate.ye % 10) / 10) + (fdate.mo / 120);
				p = w * prop;
				break;

			case "ce": 
				prop = ((fdate.ye % 100) / 100) + (fdate.mo / 1200);
				p = w * prop;
				break;
			
			case "thou": 
				prop = ((fdate.ye % 1000) / 1000); //   + (fdate.ye / 1000) + (fdate.mo / 12000);
				p = w * prop;
				break;
				

			case "tenthou":  
			
				prop = ((fdate.ye % 10000) / 10000); //   + (fdate.ye / 1000) + (fdate.mo / 12000);
				p = w * prop;
				
				break;

			case "hundredthou": 
			
				prop = ((fdate.ye % 100000) / 100000); //   + (fdate.ye / 1000) + (fdate.mo / 12000);
				p = w * prop;
				
				break;

			default: p=0;

		}

		return -1 * p;
	},
	
	
  resetTicksHandle : function () {
		$(this._views.HANDLE).offset({"left":$(CONTAINER).offset().left});
	},
	

	easeOutTicks : function() {
		var me = this;
			if (Math.abs(this.dragSpeed) > 5) {
				// This works, but isn't great:offset fails to register
				// for new tim as it ends animation...
				// $('#TimegliderTicks').animate({left: '+=' + (5 * me.dragSpeed)}, 400, function() {
					debug.trace("ticks stopped!", "note");
					// });
			}
		
	},
	

	/*
	@param    obj with { tick  |  timeline }
	@return   array of event ids 
	*/
	getTimelineEventsByTick : function (obj) {
	  
		var unit = obj.tick.unit,
		  serial = obj.tick.serial,
		  hash = obj.timeline.dateHash,
		  spans = obj.timeline.spans;
		  	
		if (hash[unit][serial] && hash[unit][serial].length > 0) {
			return hash[unit][serial];
		} else {
			return 0;
		}
	},
	
	/* TODO! MOVE THIS TO MEDIATOR/TIMELINE MODEL!!!! */
	setTimelineProp : function (id, prop, value) {
		var tl = MED.timelinePool[id];
		tl[prop] = value;	
	},
	
	/* TODO! MOVE THIS TO MEDIATOR/TIMELINE MODEL!!!! */
	getTimelineProp : function (id, prop) {
		var tl = MED.timelinePool[id];
		return tl[prop];	
	},
	
	
	passesFilters : function (ev, zoomLevel) {
	   var ret = true,
	    ei = "", ea = [], e,
	    ii = "", ia = [], i;
	   
	   // filter by thresholds first
	   if  ((zoomLevel < ev.low_threshold) || (zoomLevel > ev.high_threshold)) {
	     return false;
     }
 
	   var incl = MED.filters.include;
 	   if (incl) {
 	      ia = incl.split(",");
 	      ret = false;
 	      // cycle through comma separated include keywords
 	      for (i=0; i<ia.length; i++) {
 	        ii = new RegExp($.trim(ia[i]), "i");
 	        if (ev.title.match(ii)) { ret = true; }
         }
      }

	   var excl = MED.filters.exclude;
	   if (excl) {
	      ea = excl.split(",");
	      for (e=0; e<ea.length; e++) {
	        ei = new RegExp($.trim(ea[e]), "i");
	        if (ev.title.match(ei)) { ret = false; }
        }
     }
     
     var ev_icon = ev.icon;
     if (MED.filters.legend.length > 0) {
       if ($.inArray(ev_icon, MED.filters.legend) == -1) {
         ret = false;
       }
     }
 
	   return ret;
  },
  
  
	
	/*
	ADDING EVENTS ON INITIAL SWEEP!
	invoked upon a fresh sweep of entire container, having added a set of ticks
		--- occurs on expand/collapse
		--- ticks are created afresh
	*/
	freshTimelines : function () {

		var t, i, tl, tu, ts, tick, tE, tl_ht, t_f, t_l,
			active = MED.activeTimelines,
			ticks = MED.ticksArray,
			borg = '',
			$title, $ev, 
			me = this,
			evid, ev,
			stuff = '', 
			cx = me.dimensions.container.centerx,
			cw = me.dimensions.container.width,
			foSec = MED.getFocusDate().sec,
			spp = MED.getZoomInfo().spp,
			zl = MED.getZoomInfo().level,
			tArr = [],
			idArr = [],
			// left and right scope
			half = Math.floor(spp * (cw/2)),
			lsec = foSec - half,
			rsec = foSec + half,
			spanin,
			legend_label = "",
			spanins = [],
			expCol, tl_top=0,
			cht = me.dimensions.container.height,
			ceiling = 0;
		//////////////////////////////////////////
		for (var a=0; a<active.length; a++) {

			// FOR EACH _ACTIVE_ TIMELINE...
			tl = MED.timelinePool[active[a]];
		
			expCol = tl.display;
			
			// TODO establish the 120 below in some kind of constant!
			// meanwhile: tl_top is the starting height of a loaded timeline 
			// set to 120 unless it's already been dragged
		  tl_top = (tl.top) ? parseInt(tl.top.replace("px", "")) : (cht-120); // sets up default
			legend_label = tl.legend.length > 0 ? "<span class='tg-timeline-legend-bt'>legend</span>" : ""; 
			
			// TIMELINE CONTAINER
			$tl = $("<div class='tg-timeline-envelope' id='" + tl.id
				+ "'><div class='titleBar'><div class='timeline-title'>"
			 	+ tl.title + "<div class='tg-timeline-env-buttons'>"
			 	+ "<span class='timeline-info'>info</span>"
			 	+ legend_label
			 	// + "<span class='expand-collapse'>expand/collapse</span>" 
			 	+ "</div></div></div></div>")
			 	.appendTo(TICKS);
			
			$tl.draggable({
				axis:"y",
				handle:".titleBar", 
				stop: function () {
					me.setTimelineProp(tl.id,"top", $(this).css("top"));
					MED.refresh();	
				}
			})
				.css("top", tl_top);
				
			tl_ht = $tl.height();
			
			$(CONTAINER + " .tg-timeline-envelope#" + tl.id + " .titleBar .expand-collapse").click(function () { 
					me.expandCollapseTimeline(tl.id );
			} );
			
			$(CONTAINER + " .tg-timeline-envelope#" + tl.id + " .titleBar .timeline-info").click(function () { 
  				me.timelineModal(tl.id);
  		} );
  		
  		$(CONTAINER + " .tg-timeline-envelope#" + tl.id + " .titleBar .tg-timeline-legend-bt").click(function () { 
    			me.legendModal(tl.id);
    	} );

			$title = $tl.children(".titleBar");
			t_f = cx + ((tl.bounds.first - foSec) / spp);
			t_l = cx + ((tl.bounds.last - foSec) / spp);
			$title.css({"top":tl_ht, "left":t_f, "width":(t_l-t_f)});

			/// for initial sweep display, setup fresh borg for organizing events
			if (expCol == "expanded") { tl.borg = borg = new timeglider.TG_Org(); }
 
			//cycle through ticks for hashed events
			for (var tx=0; tx<ticks.length; tx++) {
				tArr = this.getTimelineEventsByTick({tick:ticks[tx], timeline:tl});
		    $.merge(idArr, tArr);	
			}
			
			// detect if there are boundless spans (bridging, no start/end points)
      for (var sp1=0; sp1<tl.spans.length; sp1++) {
			  spanin = tl.spans[sp1];;
			  if (spanin.start < lsec && spanin.end > lsec) {
			    //not already in array
			    if ($.inArray(spanin.id, idArr) == -1) {
			      idArr.unshift(spanin.id);
		      }
		    }
		  }
	    
			// no need to reference individual tick
			stuff = this.compileTickEventsAsHtml(tl, idArr, 0, "sweep");
			// TODO: make 56 below part of layout constants collection
			ceiling = (tl.hasImagesAbove) ? tl_top - 56 : tl_top;
			
			if (expCol == "expanded") {
				stuff = borg.getHTML("sweep", ceiling);
				tl.borg = borg.getBorg();
			}
			
			if (stuff != "undefined") { $tl.append(stuff); }
			
			this.registerEventImages($tl);
			
		}// end for each timeline
		
		// initial title shift since it's not on-drag
		me.registerTitles();
		
	}, // ends freshTimelines()

  
  
  /*
  * appendTimelines
  * @param tick {Object} contains serial, time-unit, and more info
  *
  *
  */
	appendTimelines : function (tick) {
      
			var active = MED.activeTimelines, 
			    $tl, tl, tl_top, stuff = "",
			    me = this;
			    
			// FOR EACH TIMELINE...
			for (var a=0; a<active.length; a++) {

				tl = MED.timelinePool[active[a]];
        
				// get the events from timeline model hash
				idArr = this.getTimelineEventsByTick({tick:tick, timeline:tl});
				stuff = this.compileTickEventsAsHtml(tl, idArr, tick.serial, "append");
				 
				// borg it if it's expanded.
				if (tl.display == "expanded"){ 
						stuff = tl.borg.getHTML(tick.serial, tl.top);
				}

				$tl = $(".tg-timeline-envelope#" + tl.id).append(stuff);
				
				this.registerEventImages($tl);
					
		  } // end for in active timelines
					
	}, // end appendTimelines()
	
	
  
  // events array, MED, tl, borg, 
  // "sweep" vs tick.serial  (or fresh/append)
  compileTickEventsAsHtml : function (tl, idArr, tick_serial, btype) {
   
      var img_ht, posx = 0,
          cx = this.dimensions.container.centerx,
          expCol = tl.display,
          ht = $tl.height();
          stuff = "",
          foSec = MED.startSec, 
			    spp = MED.getZoomInfo().spp,
			    zl = MED.getZoomInfo().level,
			    buffer = 20, img_ht = 0,
			    borg = tl.borg,
			    block_arg = "sweep"; // default for initial load
			    
			if (btype == "append") {
          block_arg = tick_serial;
      }

      for (var i=0; i<idArr.length; i++) {

      	ev = MED.eventPool["ev_" + idArr[i]];

      	if (this.passesFilters(ev, zl) === true) {

      		posx = cx + ((ev.startdateObj.sec - foSec) / spp);

      		if (expCol == "expanded") {

      		  impq = (tl.size_importance !== false) ? this.scaleToImportance(ev.importance, zl) : 1;

      			ev.width = (ev.titleWidth * impq) + buffer;
      			ev.fontsize = this.basicFontSize * impq;
      			ev.left = posx; // will remain constant
            ev.spanwidth = 0;
            
      			if (ev.span == true) {
      			  ev.spanwidth = (ev.enddateObj.sec - ev.startdateObj.sec) / spp;
      			  if (ev.spanwidth > ev.width) { ev.width = ev.spanwidth; }
      			}
      			
      		  img_ht = 0;
      		  if (ev.image && ev.image.display_class === "layout") {
      		    img_ht = ev.image.height + 2;
      		    ev.width = (ev.image.width > ev.width) ? ev.image.width : ev.width;
      	    }

      			ev.height = Math.ceil(ev.fontsize) + img_ht;
      			ev.top = ht - ev.height;
            
            // block_arg is either "sweep" for existing ticks
            // or the serial number of the tick being added by dragging
      			borg.addBlock(ev, block_arg);
           
      	  } else if (expCol == "collapsed") {
      			stuff += "<div id='ev_" + ev.id + 
      			"' class='timeglider-event-collapsed' style='top:" + 
      			(ht-2) + "px;left:" +	posx + "px'></div>";
      	  }
        } // end if it passes filters

      }
      
      if (expCol == "collapsed") {
        return stuff;
      } else {
        // if expanded, "stuff" is actually 
        // being built into the borg already
        return "";
      }

  },
  
  /*
  * registerEventImages
  *  Events can have classes applied to their images; these routines
  *  take care of doing non-css-driven positioning after the layout
  *  has finished placing events in the tick sphere.
  *
  *
  */
	registerEventImages : function ($timeline) {
	  
	  $(".timeglider-event-image-bar").each(
		    function () {
		      $(this).position({
		        		my: "top",
        				at: "bottom",
        				of: $timeline,
        				offset: "0, 0"
	        }).css("left", 0);
	      }
      );
      
      $(".timeglider-event-image-above").each(
    		    function () {
    		      $(this).position({
    		        		my: "top",
            				at: "top",
            				of: $(CONTAINER),
            				offset: "0, 12"
    	        }).css("left", 0);
    	      }
        );
	  
  },
  
  
	expandCollapseTimeline : function (id) {
		var tl = MED.timelinePool[id];
		if (tl.display == "expanded") {
			tl.display = "collapsed";
		} else {
			tl.display = "expanded";
		}
		
		MED.refresh();
	},
  

  //////// MODALS 
  
  timelineModal : function (id) {
    
    $("#tl_" + id + "_modal").remove();
  
    var tl = MED.timelinePool[id], 
    me = this,
    templ_obj = {
  			  title:tl.title,
  			  description:tl.description,
  			  id:id
  		};
  		
  		
		 $.tmpl(me._templates.timeline_modal,templ_obj)
  			.appendTo(CONTAINER)
  			.css("z-index", me.ztop++)
	      .position({
      				my: "left top",
      				at: "left top",
      				of: (me._views.CONTAINER),
      				offset: "32, 32", // left, top
      				collision: "fit fit"
      	})
      	.draggable({stack: ".timeglider-modal"});
  
  },
  
  
  
	
  createEventLinksMenu : function (linkage) {
    if (!linkage) return "";
    
    var html = '', l = 0, lUrl = "", lLab="";
    
    if (typeof(linkage) == "string") {
      // single url string for link: use "link"
      html = "<li><a href='" + linkage + "' target='_blank'>link</a></li>"
    } else if (typeof(linkage) == "object"){
      // array of links with labels and urls
      for (l=0; l<linkage.length; l++) {
        lUrl = linkage[l].url;
        lLab = linkage[l].label;
        html += "<li><a href='" + lUrl + "' target='_blank'>" + lLab + "</a></li>"
      }
    }
    return html;
  },
  
  
  
	eventModal : function (eid) {
		// get position
        var modal = $("#ev_" + eid + "_modal");
        if (modal.has('div').length) {
            modal.remove();
            return;
        }
		
		var me = this,
		  $par = $("#" + eid),
		  modalTemplate = me._templates.event_modal;
		  ev = MED.eventPool[eid],
		  ev_img = (ev.image && ev.image.src) ? "<img src='" + ev.image.src + "'>" : "",
		  links = this.createEventLinksMenu(ev.link),
		  
		  templ_obj = { 
  			  title:ev.title,
  			  description:ev_img + ev.description,
  			  id:eid,
  			  startdate: ev.startdateObj.format("D", true),
  			  links: links,
  			  video: ev.video
  		}
		  
			if (ev.video) { 
       modalTemplate = me._templates.event_modal_video;
       templ_obj.video = ev.video;
			}
	
		  $.tmpl(modalTemplate,templ_obj)
  			.appendTo(TICKS)
			  .css("z-index", me.ztop++)
	      .position({
      				my: "right center",
      				at: "left center",
      				of: $par,
      				offset: "-12, -1", // left, top
      				collision: "flip fit"
      	})
      	.draggable()
      	.hover(function () { $(this).css("z-index", me.ztop++); });
	},
	
	
	legendModal : function (id) {
  /* only one legend at a time ?? */
  
    var tl = MED.timelinePool[id],
        leg = tl.legend,
        me = this, l, icon, title, html = "";
    
    for (l = 0; l < leg.length; l++) {
      icon = options.icon_folder + leg[l].icon;
      title = leg[l].title;
      html += "<li><img src='" + icon + "'>" + title + "</li>";
    }
   
    var templ_obj = {id:id, legend_list:html};
  
    $(CONTAINER + " .timeglider-legend").remove();
  		
  	$.tmpl(me._templates.legend_modal,templ_obj)
  			.appendTo(CONTAINER)
  			.css("z-index", me.ztop++)
      	.toggleClass("timeglider-menu-hidden")
      	.position({
      				my: "left top",
      				at: "left top",
      				of: (CONTAINER),
      				offset: "16, -4", // left, top
      				collision: "none none"
      	});

  		$(CONTAINER + " .timeglider-legend li").click(function() { 
  		    var legend_item_id = $(this).parent().attr("id");
  		    var icon = ($(this).children("img").attr("src"));
  		    $(this).toggleClass("tg-legend-icon-selected");
  		    MED.setFilters({origin:"legend", icon: icon});
  		});

  },
  
  
	
	parseHTMLTable : function(table_id) {
		var obj = {},
		now = +new Date(),
		keys = [];

		$('#' + table_id).find('tr').each(function(i){
			////////// each..
			var children = $(this).children(),
			row_obj;

			if ( i === 0 ) {
				keys = children.map(function(){
					return $(this).attr( 'class' ).replace( /^.*?\btg-(\S+)\b.*?$/, '$1' );
					}).get();

				} else {
					row_obj = {};

					children.each(function(i){
						row_obj[ keys[i] ] = $(this).text();
					});

					obj[ 'prefix' + now++ ] = row_obj;
				}
				/////////
			});
			return obj;
			
	}

} // end VIEW prototype



    /*
          zoomTree
          ****************
          there's no zoom level of 0, so we create an empty element @ 0

          This could eventually be a more flexible system so that a 1-100 
          value-scale could apply not to "5 hours to 10 billion years", but 
          rather to 1 month to 10 years. For now, it's static according to 
          a "universal" system.
    */
  
    tg.zoomTree = [
    {},
    {unit:"da", width:35000,level:1, label:"5 hours"},
    {unit:"da", width:17600,level:2, label:"7 hours"},
    {unit:"da", width:8800,level:3, label:"10 hours"},
    {unit:"da", width:4400,level:4, label:"12 hours"},
    {unit:"da", width:2200, level:5, label:"14 hours"},
    {unit:"da", width:1100, level:6, label:"17 hours"},
    {unit:"da", width:550, level:7, label:"22 hours"},
    {unit:"da", width:432, level:8, label:"1 DAY"},
    {unit:"da", width:343, level:9, label:"1.5 days"},
    {unit:"da", width:272, level:10, label:"2 days"},
    {unit:"da", width:216, level:11, label:"2.5 days"},
    {unit:"da", width:171, level:12, label:"3 days"},
    {unit:"da", width:136, level:13, label:"3.5 days"},
    {unit:"da", width:108, level:14, label:"4 days"},
    /* 108 * 30 = equiv to a 3240 month */
    {unit:"mo", width:2509, level:15, label:"6 days"},
    {unit:"mo", width:1945, level:16, label:"1 WEEK"},
    {unit:"mo", width:1508, level:17, label:"10 days"},
    {unit:"mo", width:1169, level:18, label:"2 weeks"},
    {unit:"mo", width:913, level:19, label:"2.5 weeks"},
    {unit:"mo", width:719, level:20, label:"3 weeks"},
    {unit:"mo", width:566, level:21, label:"3.5 weeks"},
    {unit:"mo", width:453, level:22, label:"1 MONTH"},
    {unit:"mo", width:362, level:23, label:"5.5 weeks"},
    {unit:"mo", width:290, level:24, label:"7 weeks"},
    {unit:"mo", width:232, level:25, label:"2 months"},
    {unit:"mo", width:186, level:26, label:"2.5 months"},
    {unit:"mo", width:148, level:27, label:"3 months"},
    {unit:"mo", width:119, level:28, label:"4 months"},
    {unit:"mo", width:95,  level:29, label:"5 months"},
    {unit:"mo", width:76,  level:30, label:"6 months"},
    /* 76 * 12 = equiv to a 912 year */
    {unit:"ye", width:723, level:31, label:"9 months"},
    {unit:"ye", width:573, level:32, label:"1 YEAR"},
    {unit:"ye", width:455, level:33, label:"1.25 years"},
    {unit:"ye", width:361, level:34, label:"1.5 years"},
    {unit:"ye", width:286, level:35, label:"2 years"},
    {unit:"ye", width:227, level:36, label:"2.5 years"},
    {unit:"ye", width:179, level:37, label:"3 years"},
    {unit:"ye", width:142, level:38, label:"4 years"},
    {unit:"ye", width:113,  level:39, label:"5 years"},
    {unit:"ye", width:89,  level:40, label:"6 years"},
    {unit:"de", width:705, level:41, label:"8 years"},
    {unit:"de", width:559, level:42, label:"10 years"},
    {unit:"de", width:443, level:43, label:"13 years"},

    {unit:"de", width:302, level:44, label:"16 years"},
    {unit:"de", width:240, level:45, label:"20 years"},
    {unit:"de", width:190, level:46, label:"25 years"},
    {unit:"de", width:150, level:47, label:"30 years"},
    {unit:"de", width:120, level:48, label:"40 years"},
    {unit:"de", width:95,  level:49, label:"50 years"},
    {unit:"de", width:76,  level:50, label:"65 years"},
    {unit:"ce", width:600, level:51, label:"80 years"},
    {unit:"ce", width:480, level:52, label:"100 years"},
    {unit:"ce", width:381, level:53, label:"130 years"},
    {unit:"ce", width:302, level:54, label:"160 years"},
    {unit:"ce", width:240, level:55, label:"200 years"},
    {unit:"ce", width:190, level:56, label:"250 years"},
    {unit:"ce", width:150, level:57, label:"300 years"},
    {unit:"ce", width:120, level:58, label:"400 years"},
    {unit:"ce", width:95,  level:59, label:"500 years"},
    {unit:"ce", width:76,  level:60, label:"600 years"},
    {unit:"thou", width:603, level:61, label:"1000 years"},
    {unit:"thou", width:478, level:62, label:"1200 years"},
    {unit:"thou", width:379, level:63, label:"1800 years"},
    {unit:"thou", width:301, level:64, label:"160 years"},
    {unit:"thou", width:239, level:65, label:"xxx years"},
    {unit:"thou", width:190, level:66, label:"xxx years"},
    {unit:"thou", width:150, level:67, label:"xxx years"},
    {unit:"thou", width:120, level:68, label:"xxx years"},
    {unit:"thou", width:95, level:69, label:"8,000 years"},
    {unit:"thou", width:76,  level:70, label:"10,000 years"},
    {unit:"tenthou", width:603, level:71, label:"15,000 years"},
    {unit:"tenthou", width:358, level:72, label:"20,000 years"},
    {unit:"tenthou", width:213, level:73, label:"30,000 years"},
    {unit:"tenthou", width:126, level:74, label:"60,000 years"},
    {unit:"tenthou", width:76, level:75, label:"100,000 years"},
    {unit:"hundredthou", width:603, level:76, label:"180,000 years"},
    {unit:"hundredthou", width:358, level:77, label:"300,000 years"},
    {unit:"hundredthou", width:213, level:78, label:"500,000 years"},
    {unit:"hundredthou", width:126, level:79, label:"800,000 years"},
    {unit:"hundredthou", width:76,  level:80, label:"1 million years"},
    {unit:"mill", width:603, level:81, label:"1.2 million years"},
    {unit:"mill", width:358, level:82, label:"2 million years"},
    {unit:"mill", width:213, level:83, label:"3 million years"},
    {unit:"mill", width:126, level:84, label:"5 million years"},
    {unit:"mill", width:76, level:85, label:"10 million years"},
    {unit:"tenmill", width:603, level:86, label:"15 million years"},
    {unit:"tenmill", width:358, level:87, label:"30 million years"},
    {unit:"tenmill", width:213, level:88, label:"50 million years"},
    {unit:"tenmill", width:126, level:89, label:"80 million years"},
    {unit:"tenmill", width:76,  level:90, label:"100 million years"},
    {unit:"hundredmill", width:603, level:91, label:"120 million years"},
    {unit:"hundredmill", width:358, level:92, label:"200 million years"},
    {unit:"hundredmill", width:213, level:93, label:"300 million years"},
    {unit:"hundredmill", width:126, level:94, label:"500 million years"},
    {unit:"hundredmill", width:76, level:95, label:"1 billion years"},
    {unit:"bill", width:603, level:96, label:"15 million years"},
    {unit:"bill", width:358, level:97, label:"30 million years"},
    {unit:"bill", width:213, level:98, label:"50 million years"},
    {unit:"bill", width:126, level:99, label:"80 million years"},
    {unit:"bill", width:76,  level:100, label:"100 billion years"}
    ];

    // immediately invokes to create extra information in zoom tree
    //
    tg.calculateSecPerPx = function (zt) {
      	for (var z=1; z<zt.length; z++) {
    			var zl = zt[z];
    			var sec = 0;
    			switch(zl.unit) {
    				case "da": sec =   86400; break;
    				case "mo": sec =   2419200; break; // assumes only 28 days per 
    				case "ye": sec =   31536000; break;
    				case "de": sec =   315360000; break;
    				case "ce": sec =   3153600000; break;
    				case "thou": sec =    31536000000; break;
    				case "tenthou": sec = 315360000000; break;
    				case "hundredthou": sec = 3153600000000; break;
    				case "mill": sec =    31536000000000; break;
    				case "tenmill": sec = 315360000000000; break;
    				case "hundredmill": sec = 3153600000000000; break;
    				case "bill": sec =31536000000000000; break;
    			}
    			// pixels
    			zl.spp = sec / parseInt(zl.width);
    			// trace ("level " + z + " unit:" + zl.unit.substr(0,2) + " sec:" + Math.floor(zl.spp));
    		}

    // call it right away to establish values
    }(tg.zoomTree);
    
    
    /* a div with id of "hiddenDiv" has to be pre-loaded */
    tg.getStringWidth  = function (str) {
      if (str) {
    		var ms = $("#timeglider-measure-span").html(str);
    		return ms.width();
  		}
    };
  
    
   

})(timeglider);
