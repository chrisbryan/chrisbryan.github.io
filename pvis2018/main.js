var step = 0,
map,
x,
map_scale_factor = 8,
map_zoom_factor_x,map_zoom_factor_y,
map_zoom_factor_2,map_zoom_factor_y2,
missile_data, r_size = 0.25, missile_block_clr = "red", missile_block_select_clr = "black";

var NK_clr = "maroon", SK_clr = "teal";

var color = d3.scale.category10();

function main(){
  d3.csv("missile.csv", function(missile)
  {
    missile_data = missile;
    map = new Datamap();
    d3.select(".datamap").attr("width",parseFloat(d3.select(".datamap").attr("width")) - 5).attr("height",parseFloat(d3.select(".datamap").attr("height")) - 5)
    step_0();
  })
};

function append_country_names_to_map(svg){
  // console.log(Datamap.prototype.worldTopo.objects.world.geometries);
  var countries = Datamap.prototype.worldTopo.objects.world.geometries;
  for (var i = 0; i < countries.length; i++) {
    console.log(countries[i].id, countries[i].properties.name);
    var country_path = document.getElementsByClassName(countries[i].id).getBoundingClientRect();

    var country_center = {
       x: country_path.left + country_path.width/2,
       y: country_path.top  + country_path.height/2
    };

    var text = svg.append("text")
        .attr("x", country_center.x)
        .attr("y", country_center.y);

    text.append("textPath")
        .attr("xlink:href",countries[i].id)
        .text(String(countries[i].properties.name));  }
};

function remove_all(){
  d3.selectAll(".map_group").transition().remove();
  d3.selectAll(".background_group").transition().remove();
  d3.selectAll(".datamap-arcs").remove();
  map.instance.arc([]);
  remove_bubbles();
  clear_timeline2_missile_histogram();

};

function zoom_into_korea(){
  // your starting size
  var baseWidth = 600;
    // getBBox() is a native SVG element method

    var bbox = d3.select(".PRK").node().getBBox();
        centroid = [bbox.x + bbox.width/2, bbox.y + bbox.height/2],
        zoomScaleFactor = baseWidth / bbox.width,
        zoomX = -centroid[0],
        zoomY = -centroid[1];

  // -3800, -1800
  map_zoom_factor_x = zoomX*7.5,map_zoom_factor_y = zoomY*7;
  map_zoom_factor_x2 = zoomX*9.5,map_zoom_factor_y2 = zoomY*9;
  map_scale_factor = 8;
  map.zoom._animate([map_zoom_factor_x, map_zoom_factor_y], map_scale_factor);
  enable_clicks();
};

function unzoom_into_korea(){
  map.zoom.reset();
  enable_clicks();
};

// Timeline vars
var tl2_missile_current_year = 1984;
var tl2_height = 150;
var tl2_width = 865;
var tl2_leftX = 15;
var tl2_rightX = 850;
var tl2_y = 50;
// var tl2_missile_leftX = tl2_leftX + 30;
// var tl2_missile_rightX = tl2_rightX - 70;
// var tl2_missileY = 200;

// var tl2_missileBlock_padding = 3;
var tl2_bar_height = 40;
var tl2_xScale = d3.scale.linear()
                  .range([ tl2_leftX, tl2_rightX ])
                  .domain([ new Date(1948, 1, 1), new Date(2018, 1, 1) ]);
var tl2_svg, tl2_dict, tl2_miss;
var timeline2_base_drawn = false;
var korean_war_drawn = false;
var dictators_drawn = false;
var missiles_timeline_drawn = false;

korean_war_color  = '#fb8072';
kim_il_sung_color = '#8dd3c7';
kim_jong_il_color = '#ffffb3';
kim_jong_un_color = '#b3de69';

function create_timeline2_base() {
    if(timeline2_base_drawn) {
      return;
    }
    timeline2_base_drawn = true;

    console.log("create_timeline2_base");
        tl2_svg = d3.select("#timeline2").append('svg').attr('class','timeline2_svg')
      .attr("width", tl2_width)
      .attr("height", tl2_height);
    tl2_svg.append('line')
      .transition()
      .attr('x1',tl2_leftX).attr('x2',tl2_leftX)
      .attr('y1',tl2_y-tl2_bar_height/2-5).attr('y2',tl2_y+tl2_bar_height/2+5)
      .style('stroke','black').style('stroke-width',.5);
    tl2_svg.append('line')
      .attr('x1',tl2_leftX).attr('x2',tl2_leftX)
      .attr('y1',tl2_y).attr('y2',tl2_y)
      .transition().delay(250).duration(1000)
      .attr('x2',tl2_rightX)
      .style('stroke','black').style('stroke-width',1);
    tl2_svg.append('line')
      .attr('x1',tl2_rightX).attr('x2',tl2_rightX)
      .attr('y1',tl2_y).attr('y2',tl2_y)
      .style('stroke','black').style('stroke-width',.5)
      .transition().delay(1250)
      .attr('y1',tl2_y-tl2_bar_height/2-5).attr('y2',tl2_y+tl2_bar_height/2+5);
    tl2_svg.append('text')
      .attr('x',tl2_leftX).attr('y',tl2_y + tl2_bar_height/2 + 20)
      .style("text-anchor", "middle").text('1948').style('opacity',0)
      .transition().delay(1250).duration(500).style('opacity',1);
    tl2_svg.append('text')
      .attr('x',tl2_rightX).attr('y',tl2_y  + tl2_bar_height/2 + 20)
      .style("text-anchor", "middle").text('2018').style('opacity',0)
      .transition().delay(1250).duration(500).style('opacity',1);
    tl2_miss2 = tl2_svg.append('g');
    tl2_dict = tl2_svg.append('g');
    draw_timeline2_korean_war();
  }

function draw_timeline2_korean_war() {
  if(korean_war_drawn == true) {
    return;
  }
  korean_war_drawn = true;

  tl2_svg.append('rect')
    .attr('x', tl2_xScale(new Date(1950, 06, 25)))
    .attr('y', tl2_y - tl2_bar_height/2+4)
    .attr('rx',5).attr('ry',5)
    .attr('class','timeline_img')
    .attr('width', 0)
    .attr('height',tl2_bar_height-8)
    .attr('fill', korean_war_color)
    .style('stroke','black')
    .style('stroke-width',.5)
    .on('mouseover', function(d) {
        var hover_text = `
          <img src="img/korean_war.jpg" style="float:right;width:200px;margin-left:10px;margin-bottom:5px;border:1px solid black">
          <span class='timeline_incident_header'><b>The Korean War</b> (1950-1953)</span><br>
          <p class='timeline_p'>
            Following a series of clashes along the border, on June 25, 1950
            North Korea invaded South Korea.
            The United Nations, with the United States as its principal force, came to
            the aid of South Korea. North Korea was supported by China, with Russia lending
            additional assistance.
          </p>
          <p class='timeline_p'>
            The fighting ended on July 27, 1953, when an armistice was signed. The agreement
            created the Korean Demilitarized Zone (DMZ) to separate the two countries.
            However, since no peace treaty was signed (and still has not been to this day),
            some sources still consider the two Koreas in a technical state of war.
          </p>
        `
        show_hover_text(hover_text);
    })
    .on('mouseout',function(d) {
      hide_hover_text();
    })
    .transition().duration(1000)
    .attr('width', tl2_xScale(new Date(1953, 07, 27) - tl2_xScale(new Date(1950, 06, 25))) - tl2_leftX*3);
  tl2_svg.append('line')
      .attr('x1',tl2_xScale(new Date(1952, 06, 1)))
      .attr('x2',tl2_xScale(new Date(1952, 06, 1)))
      .attr('y1',tl2_y+tl2_bar_height/2-5).attr('y2',tl2_y+tl2_bar_height/2-5)
      .style('stroke','black').style('stroke-width',1)
      .transition().delay(1000).duration(500)
      .attr('y2',tl2_y+tl2_bar_height/2+15);
  tl2_svg.append('text')
    .attr('x', tl2_xScale(new Date(1951, 01, 1) ) )
    .attr('y',tl2_y+tl2_bar_height/2 + 23)
    .text('1950').style('opacity',0)
    .style('font-size','10px').text('Korean War (1950-1953)')
    .transition().delay(1500).duration(1000).style('opacity',1)

}

function draw_timeline2_dictators() {
  if(dictators_drawn == true) {
    return;
  }
  dictators_drawn = true;

  tl2_dict.append('rect')
    .attr('x', tl2_xScale(new Date(1948, 1, 1)))
    .attr('y', tl2_y - tl2_bar_height/2)
    .attr('rx',5).attr('ry',5)
    .attr('class','timeline_img')
    .attr('width', 0)
    .attr('height',tl2_bar_height)
    .attr('fill', kim_il_sung_color)
    .style('stroke','black')
    .style('stroke-width',.5)
    .on('mouseover',function(d) {
      var hover_text = getLeaderText(1);
      show_hover_text(hover_text);
    })
    .on('mouseleave', function(d) {
      hide_hover_text();
    })
    .transition().duration(1000)
    .attr('width', tl2_xScale(new Date(1994, 07, 08) - tl2_xScale(new Date(1948, 01, 01))) - tl2_leftX);
  tl2_dict.append('text')
    .attr('class','timeline_img')
    .attr('x', tl2_xScale(new Date(1975, 07, 27) ) )
    .attr('y',tl2_y+4)
    .style("text-anchor", "middle").text('1950').style('opacity',0)
    .style('font-size','14px').text('Kim Il-Sung')
    .on('mouseover',function(d) {
      var hover_text = getLeaderText(1);
      show_hover_text(hover_text);
    })
    .transition().delay(1000).style('opacity',1);

  tl2_dict.append('line')
      .attr('x1',tl2_xScale(new Date(1994, 07, 08)))
      .attr('x2',tl2_xScale(new Date(1994, 07, 08)))
      .attr('y1',tl2_y-tl2_bar_height/2+5).attr('y2',tl2_y+tl2_bar_height/2+10)
      .style('stroke','black').style('stroke-width',.5);
  tl2_dict.append('text')
      .attr('x',tl2_xScale(new Date(1994, 07, 08)))
      .attr('y',tl2_y + tl2_bar_height/2 + 20).style('font-size','10px')
      .style("text-anchor", "middle").text('July 1994').style('opacity',0)
      // .transition().delay(1250).duration(500)
      .style('opacity',1);
  tl2_dict.append('line')
      .attr('x1',tl2_xScale(new Date(2011, 12, 17)))
      .attr('x2',tl2_xScale(new Date(2011, 12, 17)))
      .attr('y1',tl2_y-tl2_bar_height/2+5).attr('y2',tl2_y+tl2_bar_height/2+10)
      .style('stroke','black').style('stroke-width',.5);
  tl2_dict.append('text')
      .attr('x',tl2_xScale(new Date(2011, 12, 17)))
      .attr('y',tl2_y + tl2_bar_height/2 + 20).style('font-size','10px')
      .style("text-anchor", "middle").text('Dec 2011').style('opacity',0)
      // .transition().delay(1250).duration(500)
      .style('opacity',1);
  tl2_dict.append('rect')
    .attr('x', tl2_xScale(new Date(1994, 07, 09)))
    .attr('y', tl2_y - tl2_bar_height/2)
    .attr('rx',5).attr('ry',5)
    .attr('class','timeline_img')
    .attr('width', 0)
    .attr('height',tl2_bar_height)
    .attr('fill', kim_jong_il_color)
    .style('stroke','black')
    .style('stroke-width',.5)
    .on('mouseover',function(d) {
      var hover_text = getLeaderText(2);
      show_hover_text(hover_text);
    })
    .on('mouseleave',function(d) {
      hide_hover_text();
    })
    .transition().duration(1000)
    .attr('width', tl2_xScale(new Date(2011, 12, 17)) - tl2_xScale(new Date(1994, 07, 09)));
  tl2_dict.append('text')
    .attr('class','timeline_img')
    .attr('x', tl2_xScale(new Date(2003, 01, 01) ) )
    .attr('y',tl2_y+4)
    .style("text-anchor", "middle").style('opacity',0)
    .style('font-size','14px').text('Kim Jong-Il')
    .on('mouseover',function(d) {
      var hover_text = getLeaderText(2);
      show_hover_text(hover_text);
    })
    .transition().delay(1000).style('opacity',1)


  tl2_dict.append('rect')
    .attr('x', tl2_xScale(new Date(2011, 12, 18)))
    .attr('y', tl2_y - tl2_bar_height/2)
    .attr('rx',5).attr('ry',5)
    .attr('class','timeline_img')
    .attr('width', 0)
    .attr('height',tl2_bar_height)
    .attr('fill', kim_jong_un_color)
    .style('stroke','black')
    .style('stroke-width',.5)
    .on('mouseover',function(d) {
      var hover_text = getLeaderText(3);
      show_hover_text(hover_text);
    })
    .on('mouseleave',function(d) {
      hide_hover_text();
    })
    .transition().duration(1000)
    .attr('width', tl2_xScale(new Date(2018, 1, 1)) - tl2_xScale(new Date(2011, 12, 18)));
  tl2_dict.append('text')
    .attr('class','timeline_img')
    .attr('x', tl2_xScale(new Date(2015, 01, 01) ) )
    .attr('y',tl2_y-4)
    .style("text-anchor", "middle").style('opacity',0)
    .style('font-size','14px').text('Kim')
    .on('mouseover',function(d) {
      var hover_text = getLeaderText(3);
      show_hover_text(hover_text);
    })
    .transition().delay(1000).style('opacity',1)
  tl2_dict.append('text')
    .attr('class','timeline_img')
    .attr('x', tl2_xScale(new Date(2015, 01, 01) ) )
    .attr('y',tl2_y+10)
    .style("text-anchor", "middle").style('opacity',0)
    .style('font-size','14px').text('Jong-Un')
    .on('mouseover',function(d) {
      var hover_text = getLeaderText(3);
      show_hover_text(hover_text);
    })
    .transition().delay(1000).style('opacity',1)

}

function clear_timeline2_missile_histogram() {
  // d3.selectAll('.tl2_missile_rect_background').remove();
  // d3.selectAll('.tl2_missile_text_element').remove();
  // d3.selectAll('.missile_block').remove();
  // d3.select('#missile_year_circle').remove();
  // d3.select('#missile_year_descriptor_text').remove();
  // d3.select("#missile_timeline_svg").remove();
  $('#slider').fadeOut();
  d3.selectAll('.missile_block').transition().style('opacity',0).transition().delay(500).remove();
}

/*
 * Called on the missile slide, shows a histogram of missile launches based on the missile_data object
 */
function draw_timeline2_missile_histogram() {
  // console.log(missile_data);
  // SHOW THE JQUERY SLIDER
  $("#slider").fadeIn();

  // DRAW THE HISTOGRAM ON THE MAIN MAP
  var missile_leftX = 30; // these should line up with the #slider (vals in styles.css)
  var missile_histogram_width = 800;
  var missile_y = $("#map").height();
  var tl2_missile_xScale = d3.scale.linear()
                              .range([ missile_leftX, missile_leftX + missile_histogram_width ])
                              .domain([ 1984, 2017 ]);
  var missile_block_height = 6;
  missile_block_width = 15;

  var dd = d3.select(".datamap");
  dd.selectAll('.missile_block')
    .data(missile_data)
    .enter()
    .append('rect')
    .style('opacity','0')
    .attr('class','missile_block')
    .attr('id', function(d) { return 'missile_block_' + d.F1})
    .attr('x',function(d) {
      var d_date = new Date(d.Date);
      var d_year = d_date.getFullYear();
      var d_x = tl2_missile_xScale(+d_year);
      return d_x - missile_block_width/2;
    })
    .attr('y', function(d) {
      return missile_y - +d.YearCounter * missile_block_height;
    })
    .attr('width', missile_block_width)
    .attr('height', missile_block_height)
    .style('fill', 'darkgray')
    .style('stroke','black')
    .on('click',function(d) {
      // if we need to handle something when we click on these guys...do it here.
      // d3.selectAll('.missile_block').transition(250).style('fill','gray');

    })
      .transition()
      .delay(function(d) {
        return 500 + d.F1 * 5;
      })
      .style('opacity',1);


  // only draw the below stuff if it's the 1st time we've called this function
  if(missiles_timeline_drawn) {
    return;
  }
  missiles_timeline_drawn = true;

  // DRAW BOX ON THE MAIN TIMELINE
  tl2_miss2.append('rect')
    .attr('class', 'tl2_missile_rect_background')
    .attr('x', tl2_xScale(new Date(1984,1,1)) )
    .attr('y', tl2_y - tl2_bar_height/2 - 10)
    .attr('rx',7).attr('ry',7)
    .attr('width',0)
    .attr('height', tl2_bar_height + 15)
    .style('stroke','black')
    .style('fill','white')
    .transition().duration(750)
    .attr('width', tl2_xScale(new Date(2017,09,1)) - tl2_xScale(new Date(1984,1,1)));
  tl2_svg.append('line')
    .attr('x1',500).attr('x2',500)
    .attr('y1',tl2_y + tl2_bar_height/2 + 15).attr('y2',tl2_y - tl2_bar_height/2 - 10+tl2_bar_height+15)
    .style('stroke-width',1).style('stroke','black').style('opacity',0)
    .transition().duration(750)
    .style('opacity',1);
  tl2_svg.append('text')
    .attr('x', 330 )
    .attr('y',tl2_y + tl2_bar_height/2 + 25)
    .text('Period of Active Ballistic Missile Testing')
    .style('font-size','11px').style('opacity',0)
    .transition().delay(750).duration(500).style('opacity',1)
}

function step_0(){
  remove_all();
  unzoom_into_korea();
  change_caption();
  var g = d3.select("#map").append("g").attr("class","map_group");
  g.append("svg").attr("class","overlay_line_chart");
  g.append("h1").attr("class","splash-h").text("PacificVis Storytelling Contest 2018")
  .transition().style("opacity","1").duration(2000);
  g.append("p").attr("class","splash-p").text("North Korea: Real or Paper Tiger?")
  .transition().style("opacity","1").duration(2000);
  g.append("img").attr("class","splash-img").attr("src","img/pacvis_logo.png").moveToFront()
  .transition().style("opacity","1").duration(2000);
  g.append("p").attr("class","splash-authors").text("By Hide Shidara, Chris Bryan, Oh-Hyun Kwon, Kwan-Liu Ma")
    .transition().style("opacity","1").duration(2000);
  g.append("p").attr("class","splash-img-chrome-text").text("Please use with the latest Google Chrome Browser").moveToFront()
    .on("click",function(){
      // window.location.href='https://www.google.com/chrome/browser/desktop/index.html';
      window.open("https://www.google.com/chrome/browser/desktop/index.html");

    })
    .style("cursor","pointer")
    .transition().style("opacity","1").duration(2000);
  g.append("img").attr("class","splash-img-chrome").attr("src","img/chrome.png").moveToFront()
    .on("click",function(){
      window.open("https://www.google.com/chrome/browser/desktop/index.html")
    })
    .style("cursor","pointer")
    .transition().style("opacity","1").duration(2000);
};

function step_1(){
  create_timeline2_base();

  unzoom_into_korea();
  console.log("Step 1");
  remove_all();
  disable_clicks();
  change_caption();
  highlight_korea();
  create_time_axis();
  setTimeout(zoom_into_korea, 2000);
  setTimeout(highlight_split, 4000)
  // append_country_names_to_map(d3.select(".datamap"));

  function highlight_korea(){
    var original_col = d3.select('.PRK').style("fill");
    blink('.KOR',original_col,SK_clr);
    blink('.PRK',original_col,NK_clr);
  };

  function blink(id,original_col,color_end){
    d3.select(id)
      .transition().style("fill",color_end).duration(200)
      .transition().style("fill",original_col).duration(200)
      .transition().style("fill",color_end).duration(200)
      .transition().style("fill",original_col).duration(200)
      .transition().style("fill",color_end).duration(200)
      .transition().style("fill",original_col).duration(200)
      .transition().style("fill",color_end).duration(200)
      .transition().style("fill",original_col).duration(200)
      .transition().style("fill",color_end).duration(200);
  };

  function highlight_split(){
    blink_country(".KOR");
    blink_country(".PRK");
    // move_step_icon(new Date(1950, 1, 2),8*250);
  };

  function blink_country(id){
    d3.select(id)
      .transition().style("stroke-width","5px")
      .transition().style("stroke", "black")
      .transition().style("stroke", "white")
      .transition().style("stroke", "black")
      .transition().style("stroke", "white")
      .transition().style("stroke", "black")
      .transition().style("stroke-width","3px");
  };
};

function step_5(){
  remove_all();
  zoom_into_korea();
  change_caption();
  var g = d3.select("#map").append("g").attr("class","map_group");

  var top_button_g = g.append("div").attr("class","decision real_tiger_button")
  .style("opacity","0")
  .style("border-width","0px");

  top_button_g
    .transition()
    .style("border-width","1px")
    .style("opacity","0.8")
    .duration(2000);

  top_button_g
    .on("mouseover",function(){
      d3.select(this)
      .transition()
      .style("opacity","1");
      // console.log("real tiger");
    })
    .on("mousedown",function(){
      d3.select(this).attr("class","decision real_tiger_button click")
      .transition()
      .style("border", "solid white 5px");
    })
    .on("click",function(){
      step_is_visited[5]["user_chose_real_tiger_path"] = false;
      step_is_visited[5]["user_chose_paper_tiger_path"] = false;

      step_is_visited[5]["user_chose_real_tiger_path"] = true;
      go_to_step(6,false);
      // step_6_top();
    })
    .on("mouseup",function(){
      d3.select(this).attr("class","decision real_tiger_button click")
      .transition()
      .style("border", "solid #abdda4 5px");
    })
    .on("mouseleave",function(){
      d3.select(this)
      .transition()
      .style("opacity","0.8");
    })
    .append("h1").text("Paper Tiger").attr("class","real_tiger_button_text");


  var bottom_button_g = g.append("div").attr("class","decision paper_tiger_button")
  .style("opacity","0")
  .style("border-width","0px");

  bottom_button_g
    .transition()
    .style("border-width","1px")
    .style("opacity","0.8")
    .duration(2000);

  bottom_button_g
    .on("mouseover",function(){
      d3.select(this)
      .transition()
      .style("opacity","1");
    })
    .on("mousedown",function(){
      d3.select(this)
      .transition()
      .style("border", "solid white 5px");
    })
    .on("click",function(){
      step_is_visited[5]["user_chose_real_tiger_path"] = false;
      step_is_visited[5]["user_chose_paper_tiger_path"] = false;

      step_is_visited[5]["user_chose_paper_tiger_path"] = true;
      // step_6_bottom();
      go_to_step(6,false);

    })
    .on("mouseup",function(){
      d3.select(this)
      .transition()
      .style("border", "solid maroon 5px");
    })
    .on("mouseleave",function(){
      d3.select(this)
      .transition()
      .style("opacity","0.8");
    })
    .append("h1").text("Real Tiger").attr("class","real_tiger_button_text");

};

function step_2(){
  console.log("Step 2");
  remove_all();

  zoom_into_korea();
  change_caption();
  // move_step_icon(new Date(2017, 1, 2),8*250);

  var g = d3.select("#map").append("g").attr("class","map_group");
  setup_SK(g);
  setup_NK(g);

  //SETUP SK
  function setup_SK(g){
    for (var i = 1; i <= 4; i++) {
      create_annotation(g,i);
    }

    d3.selectAll(".annotation").transition().style("opacity","1").duration(8*250);

    d3.select("#interactions_descriptions")
      .append("div")
        .attr("class","annotation_info_view")
        .moveToFront()
        .append("span")
          .attr("class","header");

    function focus_on_SK(){
      d3.select(".PRK")
        .transition()
          .style("stroke-width","1px")
          .style("stroke", "white")
          .style("fill", "rgb(171, 221, 164)");

      d3.select(".KOR")
        .transition()
          .style("stroke-width","1px")
          .style("stroke", "white");
    };

    function create_annotation(map,num){
       map
         .append("div")
           .attr("class","SK annotation")
           .attr("id","ann-"+num)
           .style("opacity","0")
           .style("border-color",SK_clr)
           .moveToFront()
             .on("mouseover",function(){
               d3.select("#ann-"+num).attr("class","SK annotation hover");
               d3.select("#ann-"+num+"-text").attr("class","annotation-text hover");
               // set_annotation_info_view(num);
               focus_on_SK();
               var hover_text = "";

               if(num == 1){
                 hover_text = `
                  <span class='timeline_incident_header'>
                    <b>Cosmetics</b>
                  </span>
                  <br>
                  <p class='timeline_p'>
                    Known in international markets for quality and brand value,
                    South Korean is the fourth largest cosmetics exporter in the world
                    (behind France, the US, and Germany). In 2015, the industry was
                    valued at $11.6 billion (USD), and this is expected to grow
                    to over $13 billion by 2020. In the US alone, "K-Beauty" items
                    made over $225 million in sales.
                 </p>
                 `;
                 show_hover_text(hover_text);
               }
               else if(num == 2){
                 hover_text = `
                 <span class='timeline_incident_header'>
                  <b>Video Game Culture and E-Sports</b>
                  <br>
                </span>
                <p class='timeline_p'>
                 The video game market in South Korea is enormous,
                 projected to grow to $3 billion (USD) by 2022. South Korea was one of the first adopters of
                 "E-Sports," competitive team-sports based around video games such as
                 StarCraft and League of Legends.
                </p>
                `;
                 show_hover_text(hover_text);
               }
               else if(num == 3){
                 hover_text = `
                  <span class='timeline_incident_header'>
                    <b>Leaders in Industry and Technologies</b>
                    <br>
                  </span>
                  <p class='timeline_p'>
                    Seoul is home to many international companies,
                    including Samsung, LG, Hyundai, Kia, and SK Group.
                    Driven by a highly educated and skilled workforce,
                    the country ranks as East Asia's "most developed country" according
                    to the Human Development Index and is the
                    world's largest spender on R&D per GDP. In 2015, South Korea was named
                    the world's most innovative country in the Bloomberg Innovation Index.
                  </p>

                 `;
                 show_hover_text(hover_text);
               }
               else if(num == 4){
                 hover_text = `
                 <span class='timeline_incident_header'>
                 <b>Delicious Food</b>
                 <br>
                 Korean cuisine is very exotic and appeals to a particular type of palette. Meat, fish, vegetables are well seasoned and spiced to create exciting dishes that the family can enjoy together.
                 <br>

                 </span>
                 <br><p class='timeline_p'></p>
                 `;
                 show_hover_text(hover_text);
               }

             })
             .on("mouseleave",function(){
               d3.select("#ann-"+num).attr("class","SK annotation");
               d3.select("#ann-"+num+"-text").attr("class","annotation-text");
               // $(".annotation_info_view").empty();
               d3.select("#captions h3").style("opacity","1");
               d3.select("#narration").style("opacity","1");
               focus_on_penninsula();
               hide_hover_text();
             })
             .append("img")
               .attr("src",function(){
                 // if(num == 1) return "img/sk-music.png";
                 if(num == 1) return "img/sk-cosmetic.png";
                 else if(num == 2) return "img/sk-vg.png";
                 else if(num == 3) return "img/sk-tech3.png";
                 else if(num == 4) return "img/sk-food.png";
               });

        function set_annotation_info_view(n){
          d3.select("#captions h3").style("opacity","0.4")
          d3.select("#narration").style("opacity","0.4")

          $(".annotation_info_view").append($("<h4>").text(step_3_data[n-1]["header"]));
          $(".annotation_info_view").append($("<p>").text(step_3_data[n-1]["body"]));
          $(".annotation_info_view").append($("<a>").attr("href",caption_data[step-1]["link"]).text(step_3_data[n-1]["link"]));

        };
    };
  };

  //SETUP SK END

  //SETUP NK START

  function setup_NK(g){
    for (var i = 1; i <= 3; i++) create_annotations(i);
    d3.selectAll(".annotation").transition().style("opacity","1").duration(8*250);

    function create_annotations(num){
      d3.selectAll(".annotation").transition().remove();
      g
        .append("div")
          .attr("class","NK annotation")
          .attr("id","NK-ann-"+num)
          .style("opacity","0")
          .style("border-color",NK_clr)
          .moveToFront()
          .on("mouseover",function(){
            var hover_text = "";
            d3.select("#NK-ann-"+num).attr("class","NK annotation hover");
            d3.select("#NK-ann-"+num+"-text").attr("class","annotation-text hover");
            if(num == 1){
              hover_text = `
              <span class='timeline_incident_header'><b>Ballistic Missile and Nuclear Weapons Testing</b></span>
              <br>
              <p class='timeline_p'>
                North Korea's ballistic missile program has been active since 1984.
                In recent years, the pace of launches has increased,
                both in terms of medium and long-range rockets and underground nuclear tests.
                2017 saw North Korea's first suspected hydrogen test, and their desire to
                miniaturize warheads onto ICBMs capable of
                reaching the United States is well known. Despite pressure and sanctions from
                the internatinoal community (including China, their closest ally),
                the DPRK shows little inclination to slow down their weapons programs.
              </p>
              `;
            }
            else if(num == 3){
              hover_text = `
              <span class='timeline_incident_header'>
                <b>Displays of Military Strength</b>
              </span>
              <br>
              <p class='timeline_p'>
                <i>Songun</i> is the "military first" policy of North Korea. This means that the
                Korean People's Army is the central institution of society.
              </p>
              <p class='timeline_p'>
                Citizens are required to serve - 10 years for men and 7 for women - the longest mandatory
                service in the world. In 2016 there were over 5.89 million paramilitary personnel,
                making it the largest paramilitary organization on earth, and constituting over 25% of
                the country's population.
              </p>
              <p class='timeline_p'>
                Parades through the capital of Pyongyang commemerate national holidays
                and provide a chance for the country to show its strength and defiance.
                These normally include tanks, support vehicles, missiles, rockets, and troops marching
                in precise formations.
              </p>
              `;
            }
            else if(num == 2){
              hover_text = `
              <span class='timeline_incident_header'>
                <b>Kim Jong-un, the Face of a Regime</b>
              </span>
              <br>
              <p class='timeline_p'>
                North Korea styles itself as a self-reliant, socialist state that formally holds elections.
                That said, the three generations of the Kim family (Kim Il-Sung, Kim Jong-Il, and Kim Jong-Un)
                have ruled the country since 1948.
              </p>
              <p class='timeline_p'>
                The Workers' Party of Korea (WPK), led by Kim Jong-Un since 2011, holds power in the state.
                The concept of <i>Juche</i>, an ideology of national
                self-reliance and collectivism developed by Kim Il-Sung, was introduced in the 1970s.
                The means of production are owned by the state
                through state-run enterprises and collectivized farms.
              `;
            }
            show_hover_text(hover_text);
            focus_on_NK();
          })
          .on("mouseleave",function(){
            d3.select("#NK-ann-"+num).attr("class","NK annotation");
            d3.select("#NK-ann-"+num+"-text").attr("class","annotation-text");
            d3.select("#captions h3").style("opacity","1");
            d3.select("#narration").style("opacity","1");
            focus_on_penninsula();
            hide_hover_text();
          })
          .append("img")
            .attr("src",function(){
              if(i==1) return "img/nk-missile.png";
              if(i==2) return "img/nk-kim.png";
              if(i==3) return "img/nk-parade.png";
          });
      }

      function set_annotation_info_view(n){
        d3.select("#captions h3").style("opacity","0.4")
        d3.select("#narration").style("opacity","0.4")

        $(".annotation_info_view").append($("<h4>").text("We don't know."));
        $(".annotation_info_view").append($("<p>").text("Some text."));
        $(".annotation_info_view").append($("<a>").attr("href","www.google.com").text("www.google.com"));

      };
  };

  function focus_on_penninsula(){
    d3.select(".PRK")
      .transition()
        .style("stroke-width","1px")
        .style("stroke", "white")
        .style("fill", NK_clr);

    d3.select(".KOR")
      .transition()
        .style("stroke-width","1px")
        .style("stroke", "white")
        .style("fill", SK_clr);
  };

};


// Kim Il Sung == 1
// Kim Jong Il == 2
// Kim Jong Un == 3
function getLeaderText( i ) {
  if(i==1){
     return `
        <img src="img/kim_il_sung_portrait.jpg" style="float:right;width:150px;margin-left:10px;margin-bottom:5px;border:1px solid black">
        <span class='timeline_incident_header'>
          <b>Kim Il-Sung: First leader of North Korea</b> (1948-1994)
        </span><br>
        <p class='timeline_p'>
          After negotiatons for the reunification of the northern and southern zones of Korea failed,
          the Democratic People's Republic of Korea was established in the North on September 9, 1948.
        <p class='timeline_p'>
          Kim Il-Sung was proclaimed as premier and leader of the new country, a position which he held
          (as premier and president) until his death on July 8, 1994.<br><br>

        <p class='timeline_p'>
        </p>
    `
  }
  if(i==2){
    return `
    <img src="img/kim2-original.png" style="float:right;width:150px;margin-left:10px;margin-bottom:5px;border:1px solid black">
    <span class='timeline_incident_header'>
      <b>Kim Jong-il: A Legacy of Defiance</b> (1994-2011)
    </span>
    <br>
    <p class='timeline_p'>
      Kim succeeded his father in 1994, though he never took the title of President.
      Known as "Dear Leader," he was the first head of a communist state to inherit power.
    </p>
    <p class='timeline_p'>
      Reclusive and secretive, he rarely traveled except for trips to China. Even the
      place of his birth is subject to debate (some records claim the Soviet Union).
      At the time of his death from an apparent heart attack, Kim left a
      legacy of consistent defiance towards the international community, expanding the
      development of long-range ballistic missiles and starting (and then re-starting)
      the development of nuclear weapons, in addition to fostering the overall militarization
      of the population.
    </p>
    `;
  }
  if(i==3){
    return `
      <img src="img/kim_jong_un_icon.jpg"
           style="float:right;width:150px;margin-left:10px;margin-bottom:5px;border:1px solid black">
      <span class='timeline_incident_header'>
        <b>Kim Jong-un: Supreme Leader and Chairman</b> (2011-Present)
        <br>
      </span>
      <p class='timeline_p'>
          Kim Jong-un is the current supreme leader.
          The Chairman of the Workers' Party of Korea. He is the first North
          Korean leader to have been born after the country's founding.
      </p>
      <p class='timeline_p'>
        Rumored to have been educated in Europe, little is known about his personal life.
        In December of 2011, he assumed power a mere four hours after
        the death of his father, Kim Jong-il.
        Under him, the country's missile
        program appears to have made massive strides -
        they claim that they are in possession
        of several nuclear weapons including hydrogen bombs.
    </p>
    `;
  }
}

function step_6_bottom(){
  d3.select("#forward").attr("class","ui-button ui-widget ui-corner-all");
  remove_all();
  zoom_into_korea();
  change_caption();
  var g = d3.select("#map").append("g").attr("class","map_group");

  g.append("svg").attr("class","overlay_line_chart")
  .style("opacity","0")
  // .attr("transform","scale(10)")
  .transition()
  .style("opacity","0.8")
  // .attr("transform","scale(1)")
  .duration(2000);

  var line_chart_vars = create_line_chart([],2,g);

  var form = g.append("form").attr("class","mode-selection");
  form.append("label").attr("class","label-header");
  form.append("label").attr("class","group-label");
  form.append("input").attr("class","group-input").attr("type","radio").attr("name","mode").attr("value","NK").property('checked', true);
  form.append("label").attr("class","stack-label");
  form.append("input").attr("class","stack-input").attr("type","radio").attr("name","mode").attr("value","SK");

  $(".label-header").html(" Select Country: ");
  $(".group-label").text(" North Korea Only ");
  $(".stack-label").text(" North Korea and South Korea ");

  // setTimeout(function(){
  //   d3.select(".stack-label")
  //     .transition()
  //     .style("opacity","0")
  //     .duration(250)
  //     .transition()
  //     .style("opacity","1")
  //     .duration(250)
  //     .transition()
  //     .style("opacity","0")
  //     .duration(250)
  //     .transition()
  //     .style("opacity","1")
  //     .duration(250)
  //     .transition()
  //     .style("opacity","0")
  //     .duration(250)
  //     .transition()
  //     .style("opacity","1")
  //     .duration(250)
  //     .style("opacity","0")
  //     .duration(250)
  //     .transition()
  //     .style("opacity","1")
  //     .duration(250)
  //     .transition()
  //     .style("opacity","1")
  //     .duration(250)
  //     .transition()
  //     .style("opacity","1")
  //     .duration(250)
  //     .transition()
  //     .style("opacity","1")
  //     .duration(250)
  //     .transition()
  //     .style("opacity","1")
  //     .duration(250)
  //     .transition()
  //     .style("opacity","1")
  //     .duration(250);
  // },6000);

  function transition_line_chart(selection) {
    change();
    function change() {
      var t1;
      if(selection=="NK"){
        // line_chart_vars[0].domain([0, d3.max(NK_gdp_dataset, function(d){ return d.y; })]);
        line_chart_vars[0].domain([0, 16]);
        // line_chart_vars[1].domain([d3.min(NK_gdp_dataset, function(d){ return d.x; }), d3.max(NK_gdp_dataset, function(d){ return d.x; })]);
        // t1 = line_chart_vars[3].transition();
        line_chart_vars[3].select(".SKpath-text").transition().attr("transform", "translate(600,-12500)").duration(1000);
        line_chart_vars[3].select(".NKpath-text").transition().attr("transform", "translate(600,5)").duration(1000);

      }
      else{
        // line_chart_vars[0].domain([0, d3.max(SK_gdp_dataset, function(d){ return d.y; })]);
        line_chart_vars[0].domain([0, 1500]);
        line_chart_vars[3].select(".SKpath-text").transition().attr("transform", "translate(600,0)").duration(1000);
        line_chart_vars[3].select(".NKpath-text").transition().attr("transform", "translate(600,310)").duration(1000);

        // line_chart_vars[1].domain([d3.min(NK_gdp_dataset, function(d){ return d.x; }), d3.max(NK_gdp_dataset, function(d){ return d.x; })]);
      }
      // line_chart_vars[3].select(".NKpath-text").attr("transform", "translate(600,310)");
      // line_chart_vars[3].select(".SKpath-text").attr("transform", "translate(600,0)");

      t1 = line_chart_vars[3].transition().duration(1000);
      // t1.select(".y.axis").call(line_chart_vars[2]);
      // t1.select(".x.axis").call(line_chart_vars[7]);
      t1.selectAll(".SKline").attr("d", line_chart_vars[6]);
      t1.selectAll(".NKline").attr("d", line_chart_vars[6]);
      t1.selectAll(".y.axis").call(line_chart_vars[2]);
    };


    // function transform(d) {
    //   var l = line_chart_vars[4].getTotalLength();
    //   var p = line_chart_vars[4].getPointAtLength(l);
    //   return "translate(" + (p.x) + "," + (p.y) + ")";
    //   // return "translate(" + x(d.x) + "," + y(d.y) + ")";
    // };
  // };
    // d3.selectAll(".line").transition().remove();
    // d3.selectAll(".path-text").transition().remove();
    // var yScale;
    // if(selection == "NK"){
    //   yScale = line_chart_vars[0].domain([0, d3.max(NK_gdp_dataset, function(d){ return d.y; })]);
    // }
    // else{
    //   yScale = line_chart_vars[0].domain([0, d3.max(SK_gdp_dataset, function(d){ return d.y; })]);
    // }
    // var xScale = line_chart_vars[1];
    // var yAxis = line_chart_vars[2].scale(yScale);
    // d3.select(".y.axis")
    //         .transition().duration(1500).ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
    //         .call(yAxis);
    //
    // var line = d3.svg.line()
    //     .x(function(d) { return xScale(d.x); })
    //     .y(function(d) { return yScale(d.y); });
    //
    // setTimeout(function(){
    //   var svg = line_chart_vars[3];
    //   var SK_path = svg.append("path")
    //       .data([SK_gdp_dataset])
    //       .attr("class", "line")
    //       .attr("d", line);
    //
    //   var totalLength = SK_path.node().getTotalLength();
    //
    //   SK_path
    //     .attr("stroke-dasharray", totalLength + " " + totalLength)
    //     .attr("stroke-dashoffset", totalLength)
    //     .style("stroke",SK_clr)
    //     .transition()
    //       .duration(3000)
    //       .ease("linear")
    //       .attr("stroke-dashoffset", 0);
    //
    //   var NK_path = svg.append("path")
    //       .data([NK_gdp_dataset])
    //       .attr("class", "line")
    //       .attr("d", line);
    //
    //   totalLength = NK_path.node().getTotalLength();
    //
    //   NK_path
    //     .attr("stroke-dasharray", totalLength + " " + totalLength)
    //     .attr("stroke-dashoffset", totalLength)
    //     .style("stroke",NK_clr)
    //     .transition()
    //       .duration(3000)
    //       .ease("linear")
    //       .attr("stroke-dashoffset", 0);
    //
    //   var NK_text = svg.append("text")
    //   .attr("class","path-text")
    //   .attr("transform", "translate(0," + -100 / 3 + ")")
    //   .style("color",NK_clr)
    //   .style("stroke",NK_clr)
    //   .style("fill",NK_clr)
    //   .text("North Korea");
    //
    //   var SK_text = svg.append("text")
    //   .attr("class","path-text")
    //   .attr("transform", "translate(0," + -100 / 3 + ")")
    //   .style("color",SK_clr)
    //   .style("stroke",SK_clr)
    //   .style("fill",SK_clr)
    //   .text("South Korea");
    //
    //   transition(NK_text,NK_path);
    //   transition(SK_text,SK_path);
    //
    //   function transition(t,p) {
    //     t.transition()
    //         .duration(3000)
    //         .ease("linear")
    //         .attrTween("transform", translateAlong(p.node()));
    //         // .each("end", transition);
    //   }
    //
    //   // Returns an attrTween for translating along the specified path element.
    //   function translateAlong(path) {
    //     var l = path.getTotalLength();
    //     return function(d, i, a) {
    //       return function(t) {
    //         // console.log("this "+t)
    //         var p = path.getPointAtLength(t * l);
    //         return "translate(" + (p.x) + "," + (p.y) + ")";
    //         // return "translate(" + p.x + "," + p.y + ")";
    //       };
    //     };
    //   }
    // },2000);

  };

  function transitionNK() {
    transition_line_chart("NK");
  };

  function transitionSK() {
    transition_line_chart("SK");
  };

  d3.selectAll("input")
      .on("change", function () {
          if (this.value === "NK") transitionNK();
          else transitionSK();
      });

};

function step_3(){

  remove_all();
  zoom_into_korea();
  // focus_on_NK();
  draw_timeline2_dictators();
  change_caption();
  unselect_korea();
  unselect_korea();
  var g = d3.select("#map").append("g").attr("class","map_group");
  var div_g = g.append("svg").attr("class","portrait_background");

  div_g
    .style("opacity","0")
    .style("border-width","0px")
    .transition()
    .style("border-width","1px")
    .style("opacity","0.8")
    .duration(2000);

  for (var i = 1; i < 4 ; i++) {
    create_portrait(i,div_g,g);
  }
  // step_4_exit();

  function create_portrait(i,div_g,g){
    var img_div = g
      .append("div")
        .attr("class","portrait_container")
        .moveToFront()
        .style("position","absolute")
        .style("left", function(){
          if(i == 1) return "20px";
          else if(i == 2) return "320px";
          else if(i == 3) return "620px";
        })
        .style("opacity","1")
        .style("top", 0);



    d3.select(".portrait_background")
      .append("rect")
      .attr("x",10)
      // .attr("y",60)
      // .attr("x",function(){
      //   if(i == 1) return 10;
      //   else if(i == 2) return 310;
      //   else if(i == 3) return 610;
      // })
      .attr("y",60)
      .attr("height",380)
      // .attr("width",235)
      .attr("width",840)
      .attr("fill","white")
      .attr("stroke","black")
      .attr("fill-opacity",0)
      .moveToBack()
      .transition()
      .attr("fill-opacity",0.255)
      .duration(3000);

    img_div
      .append("img")
        .attr("class","portrait")
        .attr("id",i)
        .attr("src", "img/kim"+i+"-original.png")
        .style("border-color","black")
        .moveToFront()
        .on("mouseover", function(){
          var hover_text = "";
          d3.select(this).attr("class","portrait hover");
          var hover_text = getLeaderText(i);
          show_hover_text(hover_text);
        })
        .on("mouseleave", function(){
          d3.select(this).attr("class","portrait");
          hide_hover_text();
        });

    img_div
      .style("top", "2.5%")
      .style("opacity","0")
      .transition()
      .style("top", "15%")
      .style("opacity","1")
      .duration(2000);

      div_g
        .append("text").attr("class","text portrait_text_name")
          .attr("x", function(){
            if(i == 1) return 75;
            else if(i == 2) return 375;
            else if(i == 3) return 675;
          })
          .text(function(){
            if(i==1) return "Kim Il-sung";
            else if(i==2) return "Kim Jong-il";
            else if(i==3) return "Kim Jong-un";
          })
          .attr("y", 370+30)
          .transition()
          .style("opacity","1")
          .attr("y", 350+30)
          .duration(2000);
      div_g
        .append("text").attr("class","text portrait_text_yrs_lived")
          .attr("x", function(){
            if(i == 1) return 40;
            else if(i == 2) return 340;
            else if(i == 3) return 655;
          })
          .text(function(){
            if(i==1) return "Lived 10/15/1912 - 7/8/1994";
            else if(i==2) return "Lived 2/16/1941 - 12/17/2011";
            else if(i==3) return "Lived 1/8/1984 - Present";
          })
          .attr("y", 390+30)
          .transition()
          .style("opacity","1")
          .attr("y", 370+30)
          .duration(2000);
      div_g
        .append("text").attr("class","text portrait_text_yrs_ruled")
          .attr("x", function(){
            if(i == 1) return 70;
            else if(i == 2) return 370;
            else if(i == 3) return 670;
          })
          .text(function(){
            if(i==1) return "Ruled 1948 - 1994";
            else if(i==2) return "Ruled 1994 - 2011";
            else if(i==3) return "Ruling 2011 - Present";
          })
          .attr("y", 405+30)
          .transition()
          .style("opacity","1")
          .attr("y", 385+30)
          .duration(2000);
  };
};

// function step_4_exit(){
//
//   for (var i = 1; i < 4 ; i++) {
//     create_icons(i);
//   }
//
//   function create_icons(i){
//     var margin = {top: 40, right: 10, bottom: 5, left: 0};
//     var height = $(window).height()*.86 - margin.top - margin.bottom;
//     var img = d3.select("#background_to_map").append("g").attr("class","background_group")
//       .append("svg:image")
//         .attr("class","icons")
//         .attr("id",i)
//         .attr("xlink:href", "img/Kim"+i+".png")
//         // .attr("x","-100")
//         .attr("y",height - 40)
//         .moveToFront();
//
//     if(i==1){
//       img
//       .attr("x",x(new Date(1948, 1, 2)) - margin.left);
//       // .duration(3000);
//     }
//     else if(i==2){
//       img
//       .attr("x",x(new Date(1994, 1, 2)) - margin.left);
//       // .duration(3000);
//     }
//     else if (i==3) {
//       img
//       .attr("x",x(new Date(2011, 1, 2)) - margin.left);
//       // .duration(3000);
//     }
//   };
// };

function step_6_top(){
  d3.select("#forward").attr("class","ui-button ui-widget ui-corner-all");

  remove_all();
  zoom_into_korea();
  focus_on_NK();
  change_caption();
  // step_4_exit();
  unselect_korea();

  var g = d3.select("#map").append("g").attr("class","map_group");

  g.append("svg").attr("class","overlay_line_chart")
  .style("opacity","0")
  .style("border-width","0px")
  .transition()
  .style("border-width","1px")
  .style("opacity","0.8")
  .duration(2000);

  var video = append_video(g);
  var label = add_text_label(g);

  video
    .style("top","1%")
    .transition()
    .style("opacity","1")
    .style("top","10%")
    .duration(2000);

  label
    .transition()
    .style("opacity","1")
    .style("bottom","7%")
    .duration(2000);

  function append_video(g){
    var ret = g
      .append("img")
      .attr("class","kim_img")
      .attr("src","img/kim_speech.gif")
      .style("top","0%")
      .on("mouseover",function(){
        d3.select(this).attr("class","kim_img hover");
      })
      .on("mousedown",function(){
        d3.select(this).attr("class","kim_img hover click");
      })
      .on("mouseup",function(){
        d3.select(this).attr("class","kim_img hover");
      })
      .on("mouseleave",function(){
        d3.select(this).attr("class","kim_img");
      })
      .on("click",function(){
        window.open("https://www.youtube.com/watch?v=t2GgE_vYuyY");
      });
    return ret;
  };

  function add_text_label(g){
    var ret = g
      .append("text").attr("class","kim_img_text")
      .text("Scenes from Kim Jong Un's inaugural address in Pyongyang, 2011");
    return ret;
  };
};

// @drawRect - the svg element to draw the flower on (called "g" in function step_6)
// @xSpot - the horizontal spot that the flower centers on
// @xOffset - offset of the flower compared to the base, in pixels (0 == vertical)
// @yBase - the vertical spot where the flower's base is
// @height - the height of the flower's base. A negative value means it goes below the horizontal
// @color - the color of the flower (hex value)
// @radius - the size of the flower (ie, what the img will be sized to)
// @imgPath - the relative filepath of the image used in the flower (should be a square img)
// @highlightText - html text that is shown when highlighting over the image
function addFlower( drawRect, xSpot, xOffset, yBase, height, color, radius, imgPath, highlightText ) {

  drawRect.append('line')
    .attr('x1',xSpot).attr('x2',xSpot)
    .attr('y1',yBase).attr('y2',yBase - height)
    .style('stroke',color).style('stroke-width',2);
  drawRect.append('circle')
    .attr('cx',xSpot)
    .attr('cy',function() { return (height < 0 ? yBase - height + radius : yBase - height - radius); })
    .attr('r', radius + 3)
    .style('fill','white')
    .style('stroke',color)
    .style('stroke-width',3);
  drawRect.append('svg:image')
    .attr('class','timeline_img')
    .attr({
      width: radius*2,
      height:radius*2,
      'xlink:href': imgPath,
      x: xSpot - radius,
      y: ( height < 0 ? yBase - height  : yBase - height - radius * 2 )
    })
    .on('mouseover',function(d) {
      var himg = '<img src=\"'+imgPath+'\" class=\"timeline_hover_img\">';
      // console.log('@@ NEED TO SHOW THIS TEXT IN SIDEBAR --\n' + himg +  highlightText);
      show_hover_text(himg + highlightText);
    })
    .on('mouseleave',function(d) {
      hide_hover_text();
    });
}

function step_8_top(){
  remove_all();
  zoom_into_korea();
  unselect_korea();
  focus_on_NK();
  change_caption();
  var svg = d3.select("#map").append("g").attr("class","map_group")
    .append("svg").attr("class","timeline_svg"); // .timeline_svg in style.css

  var g = d3.selectAll(".timeline_svg").append('g');

  // width = [ 20, 825 ]
  // height =  [ 20, 470 ]
  //    118, 235, 352
  g.append('rect')
    .attr('id','chrischrischris')
    .attr('x', 20)
    .attr('y',20)
    .attr('width',865-40)
    .attr('height',510-40)
    .attr('opacity',.8)
    .attr('fill','white')
    .attr('stroke','black');


  var left_x = 30;
  var right_x = 805;
  var img_size = 60;
  var circle_padding = 5;
  var timeline_start = left_x + img_size + circle_padding*2+15;

  var nk_y = 80;
  var nk_color = NK_clr;
  var east_asia_y = 185;
  var east_asia_color = '#1b9e77';
  var un_y = 290;
  var un_color = '#e7298a';
  var usa_y = 395;
  var usa_color = '#7570b3'

    // AXIS STUFF
  var timeline_xScale = d3.scale.linear()
        .range([ timeline_start, right_x ])
        // new Date(year, month, day);
        .domain([ new Date(2006, 1, 1), new Date(2018, 1, 1) ]);
  var timeline_y1 = 40;
  var timeline_y2 = 460
  g.append('line').attr('class','timeline_axis_line')
    .attr('x1', timeline_start).attr('x2', timeline_start)
    .attr('y1',timeline_y1).attr('y2',timeline_y2);
  g.append('text')
    .attr('x',timeline_start).attr('y',timeline_y2+10)
    .style("text-anchor", "middle").style('opacity',.8)
    .text('2006');
  g.append('line').attr('class','timeline_axis_line')
    .attr('x1', right_x).attr('x2', right_x)
    .attr('y1',timeline_y1).attr('y2',timeline_y2);
  g.append('text')
    .attr('x',right_x).attr('y',timeline_y2+10)
    .style('opacity',.8).style("text-anchor", "middle")
    .text('2018');
  var year2008 = timeline_xScale(new Date(2008, 1, 1));
  g.append('line').attr('class','timeline_axis_line')
    .attr('x1', year2008).attr('x2', year2008)
    .attr('y1',timeline_y1).attr('y2',timeline_y2);
  g.append('text')
    .attr('x',year2008).attr('y',timeline_y2+10)
    .style('opacity',.8).style("text-anchor", "middle")
    .text('2008');
  var year2010 = timeline_xScale(new Date(2010, 1, 1));
  g.append('line').attr('class','timeline_axis_line')
    .attr('x1', year2010).attr('x2', year2010)
    .attr('y1',timeline_y1).attr('y2',timeline_y2);
  g.append('text')
    .attr('x',year2010).attr('y',timeline_y2+10)
    .style('opacity',.8).style("text-anchor", "middle")
    .text('2010');
  var year2012 = timeline_xScale(new Date(2012, 1, 1));
  g.append('line').attr('class','timeline_axis_line')
    .attr('x1', year2012).attr('x2', year2012)
    .attr('y1',timeline_y1).attr('y2',timeline_y2);
  g.append('text')
    .attr('x',year2012).attr('y',timeline_y2+10)
    .style('opacity',.8).style("text-anchor", "middle")
    .text('2012');
  var year2014 = timeline_xScale(new Date(2014, 1, 1));
  g.append('line').attr('class','timeline_axis_line')
    .attr('x1', year2014).attr('x2', year2014)
    .attr('y1',timeline_y1).attr('y2',timeline_y2);
  g.append('text')
    .attr('x',year2014).attr('y',timeline_y2+10)
    .style('opacity',.8).style("text-anchor", "middle")
    .text('2014');
  var year2016 = timeline_xScale(new Date(2016, 1, 1));
  g.append('line').attr('class','timeline_axis_line')
    .attr('x1', year2016).attr('x2', year2016)
    .attr('y1',timeline_y1).attr('y2',timeline_y2);
  g.append('text')
    .attr('x',year2016).attr('y',timeline_y2+10)
    .style('opacity',.8).style("text-anchor", "middle")
    .text('2016');


  var year2007 = timeline_xScale(new Date(2007, 1, 1));
  g.append('line').attr('class','timeline_axis_line')
    .attr('x1', year2007).attr('x2', year2007)
    .attr('y1',timeline_y1).attr('y2',timeline_y2).style('stroke-opacity',.3);
  var year2009 = timeline_xScale(new Date(2009, 1, 1));
  g.append('line').attr('class','timeline_axis_line')
    .attr('x1', year2009).attr('x2', year2009)
    .attr('y1',timeline_y1).attr('y2',timeline_y2).style('stroke-opacity',.3);
  var year2011 = timeline_xScale(new Date(2011, 1, 1));
  g.append('line').attr('class','timeline_axis_line')
    .attr('x1', year2011).attr('x2', year2011)
    .attr('y1',timeline_y1).attr('y2',timeline_y2).style('stroke-opacity',.3);
  var year2013 = timeline_xScale(new Date(2013, 1, 1));
  g.append('line').attr('class','timeline_axis_line')
    .attr('x1', year2013).attr('x2', year2013)
    .attr('y1',timeline_y1).attr('y2',timeline_y2).style('stroke-opacity',.3);
  var year2015 = timeline_xScale(new Date(2015, 1, 1));
  g.append('line').attr('class','timeline_axis_line')
    .attr('x1', year2015).attr('x2', year2015)
    .attr('y1',timeline_y1).attr('y2',timeline_y2).style('stroke-opacity',.3);
  var year2017 = timeline_xScale(new Date(2017, 1, 1));
  g.append('line').attr('class','timeline_axis_line')
    .attr('x1', year2017).attr('x2', year2017)
    .attr('y1',timeline_y1).attr('y2',timeline_y2).style('stroke-opacity',.3);



    // USA STUFF
  g.append('circle')
    .attr('cx',left_x + img_size/2 + circle_padding)
    .attr('cy',usa_y)
    .attr('r',img_size/2 + circle_padding)
    .style('fill','white')
    .style('stroke',usa_color)
    .style('stroke-width',6);
  g.append('svg:image')
    .attr({
      width:img_size,
      height:img_size,
      'xlink:href': 'img/usa_icon.png',
      x:left_x+circle_padding,
      y:usa_y-img_size/2
    });
  g.append('line')
    .attr('x1',left_x+img_size+circle_padding*2).attr('y1',usa_y)
    .attr('x2',right_x+10).attr('y2',usa_y)
    .attr('stroke',usa_color)
    .attr('stroke-width',4);
  g.append('circle')
    .attr('cx',right_x+10)
    .attr('cy',usa_y)
    .attr('r',4)
    .attr('fill',usa_color);

    // EAST ASIA STUFF
  g.append('circle')
    .attr('cx',left_x + img_size/2 + circle_padding)
    .attr('cy',east_asia_y)
    .attr('r',img_size/2 + circle_padding)
    .style('fill','white')
    .style('stroke',east_asia_color)
    .style('stroke-width',6);
  g.append('svg:image')
    .attr({
      width:img_size,
      height:img_size,
      'xlink:href': 'img/asia_2.png',
      x:left_x+circle_padding,
      y:east_asia_y-img_size/2
    });
  g.append('line')
    .attr('x1',left_x+img_size+circle_padding*2).attr('y1',east_asia_y)
    .attr('x2',right_x+10).attr('y2',east_asia_y)
    .attr('stroke',east_asia_color)
    .attr('stroke-width',4);
  g.append('circle')
    .attr('cx',right_x+10)
    .attr('cy',east_asia_y)
    .attr('r',4)
    .attr('fill',east_asia_color);

    // UNITED NATIONS STUFF
  g.append('circle')
    .attr('cx',left_x + img_size/2 + circle_padding)
    .attr('cy',un_y)
    .attr('r',img_size/2 + circle_padding)
    .style('fill','white')
    .style('stroke',un_color)
    .style('stroke-width',6);
  g.append('svg:image')
    .attr({
      width:img_size-5,
      height:img_size-5,
      'xlink:href': 'img/un_icon.png',
      x:left_x+circle_padding+2.5,
      y:un_y-img_size/2+5
    });
  g.append('line')
    .attr('x1',left_x+img_size+circle_padding*2).attr('y1',un_y)
    .attr('x2',right_x+10).attr('y2',un_y)
    .attr('stroke',un_color)
    .attr('stroke-width',4);
  g.append('circle')
    .attr('cx',right_x+10)
    .attr('cy',un_y)
    .attr('r',4)
    .attr('fill',un_color);

    // NORTH KOREA STUFF
  g.append('circle')
    .attr('cx',left_x + img_size/2 + circle_padding)
    .attr('cy',nk_y)
    .attr('r',img_size/2 + circle_padding)
    .style('fill','white')
    .style('stroke',nk_color)
    .style('stroke-width',6);
  g.append('svg:image')
    .attr({
      width:img_size,
      height:img_size,
      'xlink:href': 'img/nk_icon.png',
      x:left_x+circle_padding,
      y:nk_y-img_size/2
    });
  g.append('line')
    .attr('x1',left_x+img_size+circle_padding*2).attr('y1',nk_y)
    .attr('x2',right_x+10).attr('y2',nk_y)
    .attr('stroke',nk_color)
    .attr('stroke-width',4);
  g.append('circle')
    .attr('cx',right_x+10)
    .attr('cy',nk_y)
    .attr('r',4)
    .attr('fill',nk_color);




  // NK FLOWER
  // data sources
  /*
    In the credits, need to say something like, data sources and descriptions taken from:
      http://www.cnn.com/2017/01/20/asia/north-korea-nuclear-sanctions-timeline/index.html
      https://www.pbs.org/wgbh/frontline/article/the-u-s-and-north-korea-on-the-brink-a-timeline/
      http://thehill.com/homenews/administration/349088-timeline-trumps-relationship-with-north-korea
      http://www.bbc.com/news/world-asia-pacific-15278612
    Because we directly copy several descriptions (ie, don't want to come off as plagiarizing!)
  */
  // function addFlower( drawRect, xSpot, xOffset, yBase, height, color, radius, imgPath, highlightText ) {
  addFlower(g, timeline_xScale(new Date(2006, 10, 6)), 0, nk_y, 20, nk_color, 15, 'img/nuclear_icon.png',
      `<span class='timeline_incident_header'>
       <b>Date:</b> October 6, 2006<br>
       <b>Event:</b> North Korea\'s first nuclear test</span><br>
       <p class='timeline_p'>US intelligence esimates that the first North Korean nuclear test produces an explosion equal to
           less than 1 kiloton (equivalent to 1,000 tons of TNT). While only a fraction of the yield of the bombs
           used by the United States in World War II (over 15 kilotons each), the test demonstrated the
           country\'s resolve to advance its nuclear weapons program in defiance of the international community
           and its close regional ally, China.</p>`);
    addFlower(g, timeline_xScale(new Date(2007, 07, 18)), 0, nk_y, 15, nk_color, 12, 'img/lab_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> July 2007<br>
       <b>Event:</b> Shutdown of Yongbyon resaerch center</span><br>
       <p class='timeline_p'>
        North Korea shuts down nuclear facilities at the Yongbyon Nuclear
        Scientific Research Center in return for receiving 50,000 tons of
        heavy fuel oil as part of an aid package.
      </p>`);
    addFlower(g, timeline_xScale(new Date(2008, 08, 15)), 0, nk_y, -10, nk_color, 10, 'img/health_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> August 2008<br>
       <b>Event:</b> Kim Jong-il stroke</span><br>
       <p class='timeline_p'>
        The elder Kim Jong-il suffers a stroke. The New York Times reports in September that
        he was \"very ill and most likely suffered a stroke a few weeks ago, but
        United States intelligence authorities do not think his death is imminent.\"
      </p>`);
    addFlower(g, timeline_xScale(new Date(2008, 10, 15)), 0, nk_y, 15, nk_color, 10, 'img/lab_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> October 2008<br>
       <b>Event:</b> Access granted to Yongbyon site</span><br>
       <p class='timeline_p'>
        North Korea agrees to provide full access to Yongbyon nuclear site after
        the United States removes it as a State Sponsor of Terrorism.
      </p>`);
    // addFlower(g, timeline_xScale(new Date(2009, 11, 15)), 0, nk_y, -20, nk_color, 10, 'img/health_icon.png',
    //   `<b>Date:</b> November 2009<br>
    //    <b>Event:</b> <br>
    //    <p>
    //     North Korea's state-run news agency reports the reprocessing of 8,000 spent fuel
    //     rods is complete, garnering enough weapons-grade plutonium for one to two nuclear bombs.
    //   </p>`);
    // 2010 February -
    addFlower(g, timeline_xScale(new Date(2009, 05, 25)), 0, nk_y, 25, nk_color, 15, 'img/nuclear_icon.png',
      `<span class='timeline_incident_header'><b>Date: </b> May 25, 2009<br>
       <b>Event:</b> North Korea's second nuclear test</span><br>
       <p class='timeline_p'>
        Shortly after a US Geological Survey reports a 4.7 magnitude seismic disturbance at the DPRK\'s testing site.
        North Korea shortly announces it has tested a second nuclear weapon in an underground explosion.
        The yield of this weapon is estimated at 5.k kilotons.
       </p>`);
    addFlower(g, timeline_xScale(new Date(2010, 02, 15)), 0, nk_y, -20, nk_color, 10, 'img/money_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> February 2010<br>
       <b>Event:</b> Free market restrictions are relaxed</span><br>
       <p class='timeline_p'>
          Increased social unrest reportedly leads the government to relax free market restrictions
          after a 2009 currency revaluation wiped out many cash savings in the country.
      </p>`);
    addFlower(g, timeline_xScale(new Date(2010, 09, 15)), 0, nk_y, 15, nk_color, 15, 'img/kim_jong_un_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> September 2010<br>
       <b>Event:</b> Kim Jong-Un assumes senior positions</span><br>
       <p class='timeline_p'>
        Kim Jong-il's youngest son Kim Jong-un is appointed to senior political and military posts,
        fuelling speculation of a possible succession.
      </p>`);
    addFlower(g, timeline_xScale(new Date(2011, 12, 17)), 0, nk_y, 20, nk_color, 15, 'img/death_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> December 17, 2011<br>
       <b>Event:</b> Death of Kim Jong-il</span><br>
       <p class='timeline_p'>
        Kim Jong-il dies of a suspected heart attack on December 17, 2011, while traveling to an area outside
        of Pyongyang. Kim Jong-Un presides at funeral and takes over key posts by April.
      </p>`);
    addFlower(g, timeline_xScale(new Date(2012, 04, 12)), 0, nk_y, -10, nk_color, 10, 'img/satellite_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> April 12, 2012<br>
       <b>Event:</b> Failed satellite attempt</span><br>
       <p class='timeline_p'>
          A rocket launch, viewed internationally as a banned test of long-range Taepodong-2 missile technology,
          fails. North Korea says aim was to put a satellite into orbit to mark 100th birth anniversary of Kim Il-sung.
          The US, Japan and South Korea say it flew only for a short time before breaking up and crashing into
          waters off the Korean peninsula.
      </p>`);
    addFlower(g, timeline_xScale(new Date(2012, 12, 12)), 0, nk_y, -25, nk_color, 15, 'img/satellite_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> December 12, 2012<br>
       <b>Event:</b> North Korea's first successful satellite</span><br>
       <p class='timeline_p'>
          North Korea successfully launches an Unha-3 rocket, placing a satellite into
          orbit for the first time in its history.
      </p>`);
    addFlower(g, timeline_xScale(new Date(2013, 02, 13)), 0, nk_y, 40, nk_color, 12, 'img/nuclear_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> February 13, 2013<br>
       <b>Event:</b> North Korea's third nuclear test</span><br>
       <p class='timeline_p'>
          The first nuclear test under Kim Jong Un is carried out, estimated around 6-7 kilotons.
      </p>`);
    addFlower(g, timeline_xScale(new Date(2013, 04, 15)), 0, nk_y, 10, nk_color, 10, 'img/lab_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> Aprial 2013<br>
       <b>Event:</b> Yongbyon restart announcement</span><br>
       <p class='timeline_p'>
          North Korea says it will restart all facilities at its main Yongbyon nuclear complex and
          briefly withdraws its 53,000-strong workforce from the South-Korean-funded Kaesong joint
          industrial park stalling operations at 123 South Korean factories.
      </p>`);
    addFlower(g, timeline_xScale(new Date(2013, 09, 15)), 0, nk_y, -15, nk_color, 10, 'img/lab_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> September 15, 2015<br>
       <b>Event:</b> Yongbyon operational again</span><br>
       <p class='timeline_p'>
          North Korea confirms it has put its Yongbyon nuclear plant - mothballed in 2007 - back into operation.
      </p>`);
    addFlower(g, timeline_xScale(new Date(2013, 12, 12)), 0, nk_y, 15, nk_color, 12, 'img/death_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> December 12, 2013<br>
       <b>Event:</b> Kim Jong-Un's uncle is executed</span><br>
       <p class='timeline_p'>
          Kim Jong-un's uncle, Chang Song-thaek, is found guilty of attempting to overthrow the state
          and is summarily executed. This purge is seen as the biggest shake-up since the death of
          Kim Jong-il in 2011.
      </p>`);
    addFlower(g, timeline_xScale(new Date(2016, 05, 15)), 0, nk_y, -15, nk_color, 12, 'img/power_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> May 2016<br>
       <b>Event:</b> The Workers Party holds a rare congress</span><br>
       <p class='timeline_p'>
          The ruling Workers Party holds its first congress in almost 40 years,
          during which Kim Jong-un is elected leader of the party.
      </p>`);
    addFlower(g, timeline_xScale(new Date(2016, 01, 06)), 0, nk_y, 20, nk_color, 15, 'img/nuclear_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> January 06, 2016<br>
       <b>Event:</b> North Korea's fourth nuclear test</span><br>
       <p class='timeline_p'>
          North Korea claims a fourth nuclear test- this time a hydrogen bomb,
          though the US and other independent observers are not convinced.
          The explosive yield is though to be roughly 4 to 6 kilotons.
        </p>
        <p>On DPRK TV, Kim calls the test a \'spectacular success\' that will
        \'make the world... look up to our strong nuclear country.\'
      </p>`);
    addFlower(g, timeline_xScale(new Date(2016, 09, 09)), 0, nk_y, 10, nk_color, 10, 'img/nuclear_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> September 09, 2016<br>
       <b>Event:</b> North Korea's fifth nuclear test</span><br>
       <p class='timeline_p'>
          The fifth nuclear test by North Korea produces a blast equivalent to approximately 10-15 kilotons,
          double the test only 9 months prior and a magnitude larger than their first test a decade ago.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2017, 01, 15)), 0, nk_y, -30, nk_color, 10, 'img/rocket_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> January 2017<br>
       <b>Event:</b> North Korea claims they are close to developing nuclear-capable warheads</span><br>
       <p class='timeline_p'>
        Kim Jong-un says North Korea is in the final stages of
        developing long-range guided missiles capable of carrying nuclear warheads.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2017, 07, 15)), 0, nk_y, -15, nk_color, 10, 'img/rocket_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> July 2017<br>
       <b>Event:</b> North Korea fires test missile into the Sea of Japan</span><br>
       <p class='timeline_p'>
        Pyongyang test fires a long-range missile into the Sea of Japan.
        Some experts state the missile could potentially reach Alaska.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2017, 09, 03)), 0, nk_y, 22, nk_color, 20, 'img/nuclear_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> September 03, 2017<br>
       <b>Event:</b> North Korea's sixth nuclear test</span><br>
       <p class='timeline_p'>
          Almost a year after its last test, North Korea's sixth nuclear test is a possible hydrogen bomb
          (though others claim it is a type of boosted fission weapon). The US Geological Survey records a 6.3 magnitude
          seismic event, and the yield is estimated at over 70 kilotons (and potentially up to 250 kt),
          more than 10 times the 2016 tests.
      </p>`);

  // UN FLOWERS
  addFlower(g, timeline_xScale(new Date(2006, 7, 15)), 0, un_y, 10, un_color, 12, 'img/sanction_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> July 2006<br>
       <b>Event:</b> UN sanctions in response to ballistic missile testing</span><br>
       <p class='timeline_p'>After North Korea breaks its 1999 moratorium on testing medium- and long-range missiles
        (launching seven ballistic missiles, including a failed Taepo Dong-2 test),
        the UN imposes its first set of sanctions on the country,
        restricting all sales of "missle or missile-related" items and technology to it.
       </p>`);
  addFlower(g, timeline_xScale(new Date(2006, 10, 14)), 0, un_y, -20, un_color, 15, 'img/sanction_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> October 14, 2006<br>
       <b>Event:</b> UN response to DPRK's first nuclear test</span><br>
       <p class='timeline_p'>
          After North Korea's first nuclear test on October 6, 2006, the UN Security Council
          imposes a second set of sanctions, including the sale of items that may be used to assist their
          nuclear program, and military items such as aircraft, helicopters, and tanks, and demands it
          retract its 2003 withdrawal from the 1968 Nuclear Nonproliferation Treaty.
       </p>`);
  addFlower(g, timeline_xScale(new Date(2009, 10, 14)), 0, un_y, 20, un_color, 12, 'img/sanction_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> October 14, 2009<br>
       <b>Event:</b> UN response to DPRK's second nuclear test</span><br>
      <p class='timeline_p'>
        In response to the May 25, 2009 nuclear test by North Korea, the UN Security Council
        expresses \'gravest\' concern and expands sanctions to include most arms imports.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2013, 01, 22)), 0, un_y, -20, un_color, 12, 'img/sanction_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> January 22, 2013<br>
       <b>Event:</b> UN sanctions in response to DPRK satellite launch</span><br>
      <p class='timeline_p'>
        After North Korea launches the Unha-3 rocket (with a satellite) in December of 2012,
        officials and organizations related to the space program have their assets frozen.
        Travels bans are also extended.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2013, 03, 22)), 0, un_y, 15, un_color, 15, 'img/sanction_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> March 7, 2013<br>
       <b>Event:</b> UN sanctions in response to DPRK satellite launch</span><br>
      <p class='timeline_p'>
        In response to the February nuclear test, the UN Security Council condemns and places new sanctions on
        North Korea, extending asset freezes to more individuals, organizations, and goods, including luxury items
        like yachts and racing cars.</p>
        <p>
        Analysts predict it will be years before the country possesses the technology
        to deliver a nuclear warhead on a missile.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2016, 03, 02)), 0, un_y, 15, un_color, 12, 'img/sanction_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> March 02, 2016<br>
       <b>Event:</b> UN sanctions in response to fourth nuclear test</span><br>
      <p class='timeline_p'>
        The January nuclear test by North Korea (their fourth) prompts new sanctions, allowing states
        to search cargo heading into North Korea for any contraband.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2016, 11, 30)), 0, un_y, -15, un_color, 10, 'img/sanction_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> November 30, 2016<br>
       <b>Event:</b> UN's \"toughest sanctions ever\" in response to fifth nuclear test</span><br>
      <p class='timeline_p'>
        Called the \"toughest sanctions ever\" in response to the September nuclear test, new UN sanctions cut off
        North Korea exports of coal and other, non-ferrous metals (such as copper) by $800 million.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2017, 06, 02)), 0, un_y, 10, un_color, 10, 'img/sanction_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> June 2, 2017<br>
       <b>Event:</b> UN imposes targted sanctions</span><br>
      <p class='timeline_p'>
        In response to a series of ballistic missile tests conducted in the first half of 2016, the UN Security
        Council imposes a travel ban and freezes the assets of four entities and 14 officials associated with North Korea.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2017, 08, 05)), 0, un_y, -20, un_color, 10, 'img/sanction_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> August 5, 2017<br>
       <b>Event:</b> UN sanctions in response to ballistic missile testing</span><br>
      <p class='timeline_p'>
        In response to continued ballistic missile testing and violations of prior UN resolutins,
        the UN council unanimously passes new sanctions for primary exports, including coal,
        iron, lead, and seafood. Other revenue streams, including banks and joint ventures with foreign
        companies, are also targeted.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2017, 09, 02)), 0, un_y, 38, un_color, 12, 'img/sanction_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> September 2, 2017<br>
       <b>Event:</b> UN bans oil and textiles</span><br>
      <p class='timeline_p'>
        A week after North Korea's sixth nuclear test, fresh sanctions are unanimously passed by the UN Security
        Council, cutting oil imports and banning the sale of textiles.
      </p>
      <p>US ambassador Nikki Haley says that \"we are done trying to prod the regime to do the right thing. We are now
      trying to stop it from doing the wrong thing.\"
      </p>`);

  // ASIA FLOWERS

  addFlower(g, timeline_xScale(new Date(2007, 08, 15)), 0, east_asia_y, 25, east_asia_color, 13, 'img/sk_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> August 2007<br>
       <b>Event:</b> South Korea provides flood relief to DPRK</span><br>
      <p class='timeline_p'>
        On August 15, North Korea announces it has been hit extremely hard by floods after a week of
        torrential rain storms. Among many nations, South Korea announces it will send nearly $50
        million US dollars in aid after Pyongyang's rare appeal for relief from the outside world.
        </p>
        <p>
        In September, Kim Jong-il thanks the leaders of 11 countries for their help in flood relief, notably omitting
        South Korea.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2007, 10, 04)), 0, east_asia_y, -20, east_asia_color, 15, 'img/sk_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> October 2-4, 2007<br>
       <b>Event:</b> South Korea provides flood relief to DPRK</span><br>
      <p class='timeline_p'>
        The second Inter-Korean summit is held in Pyongyang (the first was held in 2000).
        South Korean President Roh Moo-hyun becomes the first South Korean leader to walk
        across the Demilitarized Zone separating North and South.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2008, 03, 15)), 0, east_asia_y, 10, east_asia_color, 12, 'img/sk_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> March 2008<br>
       <b>Event:</b> South Korean relations deteriorate</span><br>
      <p class='timeline_p'>
        North-South relations deteriorate sharply after new South Korean President
        Lee Myung-bak promises to take a harder line on North Korea.
        <p></p>
        Kim-Tae-young, the head of the South’s Joint Chiefs of Staff, additionally states
        that his military will strike suspected North Korean nuclear weapons sites
        if Pyongyang attempts to attack the South with atomic bombs. In response, North Korean officials
        threaten to reduce the South to \"ashes\" if South Korea makes the \"slightest move\"
        to attack.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2009, 01, 30)), 0, east_asia_y, 10, east_asia_color, 10, 'img/sk_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> January 30, 2009<br>
       <b>Event:</b> North Korea scraps agreements</span><br>
      <p class='timeline_p'>
        North Korea says it is scrapping all military and political deals
        with South Korea, accusing it of \"hostile intent\" and of pushing relations
        \"to the brink of war.\" This includes the mairtime border in the Yellow Sea, a
        disupted sea region and the site of several deadly naval skirmishes between 1999 and 2002.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2009, 08, 15)), 0, east_asia_y, 20, east_asia_color, 10, 'img/sk_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> August 2009<br>
       <b>Event:</b> North Korea makes conciliatory gestures</span><br>
       <p class='timeline_p'>
        North Korea makes conciliatory gestures to South Korea, sending a delegation to the funeral
        of former President Kim Dae-jung, releasing four South Korean fishermen,
        and agreeing to resume family reunions.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2010, 02, 23)), 0, east_asia_y, -15, east_asia_color, 12, 'img/china_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> February 23, 2010<br>
       <b>Event:</b> China and DPRK celebrate \"year of friendship\"</span><br>
       <p class='timeline_p'>
        Chinese President Hu Jintao and North Korean leader Kim Jong-il declare a
        \"year of friendship\" to mark 60 years of diplomatic relations between
        the two communist states.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2010, 03, 26)), 0, east_asia_y, 10, east_asia_color, 15, 'img/sk_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> March 26, 2010<br>
       <b>Event:</b> Sinking of <i>ROKS Cheonan</i></span><br>
       <p class='timeline_p'>
        The South Korean warship <i>ROKS Cheonan</i> is sunk
        near the maritime sea border in the Yellow Sea, killing 46 seamen.</p><p>
        A South Korean-led investigation (with the United States, United Kingdom, Canada, Australia, and Sweden)
        \"overwhelmingly\" concluded that a North Korean submarine had fired a torpedo on the ship.
        The DPRK denied responsibility.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2010, 11, 23)), 0, east_asia_y, 25, east_asia_color, 15, 'img/sk_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> November 23, 2010<br>
       <b>Event:</b> Cross-border clash with South Korea</span><br>
       <p class='timeline_p'>
        A cross-border clash near disputed maritime border results in the deaths
        of two South Korean marines. North Korea's military insists it did not
        open fire first and blames the South for the incident.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2013, 09, 23)), 0, east_asia_y, -25, east_asia_color, 12, 'img/china_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> September 2013<br>
       <b>Event:</b> China bans exports to DPRK</span><br>
       <p class='timeline_p'>
          North Korea's sole ally China bans the export to North Korea of items that could be used
          to make missiles or nuclear, chemical and biological weapons.
      </p>`);
    addFlower(g, timeline_xScale(new Date(2014, 03, 24)), 0, east_asia_y, 10, east_asia_color, 10, 'img/sk_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> March 2014<br>
       <b>Event:</b> Drones found in South Korea</span><br>
       <p class='timeline_p'>
          Two drones allegedly from North Korea are found in South Korea,
          sparking concerns about the north's intelligence gathering capabilities.
      </p>`);
    addFlower(g, timeline_xScale(new Date(2014, 10, 15)), 0, east_asia_y, 30, east_asia_color, 12, 'img/sk_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> October 2014<br>
       <b>Event:</b> Surprise visit to South Korea</span><br>
       <p class='timeline_p'>
          North Korean officials pay a surprise visit to South Korea and
          agree to resume formal talks that have been suspended since February.
      </p>`);
    addFlower(g, timeline_xScale(new Date(2015, 08, 15)), 0, east_asia_y, 10, east_asia_color, 10, 'img/sk_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> August 2015<br>
       <b>Event:</b> South Korea halts loudspeaker broadcasts</span><br>
       <p class='timeline_p'>
        South Korea halts loudspeaker propaganda broadcasts across the
        Demilitarised Zone after the North fires on them during annual
        US/South-Korean military exercises.</p><p>
        After North Korea's nuclear test in January 2016, the loudspeakers are switced back on.
      </p>`);
    addFlower(g, timeline_xScale(new Date(2017, 02, 13)), 0, east_asia_y, 15, east_asia_color, 12, 'img/malaysia_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> February 13, 2017<br>
       <b>Event:</b> Kim Jong-nam killed in Malaysia</span><br>
       <p class='timeline_p'>
        Kim Jong-un's estranged half-brother Kim Jong-nam - exiled since 2003 - is killed by a
        highly toxic nerve agent in Malaysia. Investigators suspect North Korean involvement.
      </p>`);
    addFlower(g, timeline_xScale(new Date(2016, 01, 06)), 0, east_asia_y, -20, east_asia_color, 12, 'img/china_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> January 06, 2016<br>
       <b>Event:</b> China responds to fourth nuclear test</span><br>
       <p class='timeline_p'>
        After North Korea’s fourth nuclear test, China says that it \"firmly opposes\"
        Pyongyang's actions. \"We strongly urge the DPRK side to remain committed
        to its denuclearisation commitment, and stop taking any actions that would
        make the situation worse,\" said foreign ministry spokeswoman Hua Chunying,
        using North Korea’s official name – the Democratic People's Republic of Korea.
      </p>`);
    addFlower(g, timeline_xScale(new Date(2017, 03, 15)), 0, east_asia_y, -38, east_asia_color, 8, 'img/china_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> March 2017<br>
       <b>Event:</b> China sends troops to DPRK border</span><br>
       <p class='timeline_p'>
        Beijing reportedly orders more than 150,000 troops - including medics -
        to the North Korean border amid fears that citizens could flee the hermit
        state if the US sends an airstrike. China is said to be preparing for a
        possible influx of refugees as tensions escalate between Washington and Pyongyang.</p><p>
        Chinese President Xi Jinping has called for a \"peaceful\" resolution to the dispute as
        China and the US flex their military muscles.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2017, 02, 23)), 0, east_asia_y, -10, east_asia_color, 8, 'img/china_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> February 23, 2017<br>
       <b>Event:</b> Pyongyang accusses China</span><br>
       <p class='timeline_p'>
        Pyongyang accuses China of \"dancing to the tune of the US\"
        after Beijing banned coal imports imports from North Korea after
        bowing to UN sanctions to put pressure on Kim Jong-un’s programme.
      </p>`);

  addFlower(g, timeline_xScale(new Date(2017, 08, 14)), 0, east_asia_y, -10, east_asia_color, 8, 'img/china_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> August 14, 2017<br>
       <b>Event:</b> China implements sanctions against North Korea</span><br>
       <p class='timeline_p'>
        China announces it plans to implement the UN sanctions
        against North Korea agreed earlier this month,
        banning imports of coal, minerals and sea food.
      </p>`);
  addFlower(g, timeline_xScale(new Date(2017, 08, 29)), 0, east_asia_y, 10, east_asia_color, 10, 'img/japan_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> August 29, 2017<br>
       <b>Event:</b> China implements sanctions against North Korea</span><br>
       <p class='timeline_p'>
        North Korea fires an intermediate range missile over northern Japan,
        prompting warnings to residents to take cover.
        The missile falls into the Pacific Ocean, but sharply raises tensions between the two countries.
      </p>`);

  addFlower(g, timeline_xScale(new Date(2018, 01, 10)), 0, east_asia_y, 35, east_asia_color, 15, 'img/sk_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> January 2018<br>
       <b>Event:</b> North and South Korea resume talks</span><br>
       <p class='timeline_p'>
        First talks in two years between North and South Koreas show signs
        of a thaw after heightened tension.
        The North says it will send a team to the Winter Olympics in the South.
      </p>`);

  // USA FLOWERS
  addFlower(g, timeline_xScale(new Date(2008, 10, 08)), 0, usa_y, -20, usa_color, 15, 'img/jail_icon.png',
    `<span class='timeline_incident_header'><b>Date:</b> October 08, 2008<br>
     <b>Event:</b> DPRK is removed from the US's state sponsors of terrorism list</span><br>
     <p class='timeline_p'>
        On October 8, 2017, President Bush removes North Korea from the
        State Sponsor of Terrorism list.
  </p>`);
  addFlower(g, timeline_xScale(new Date(2009, 01, 20)), 0, usa_y, 15, usa_color, 12, 'img/obama_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> January 20, 2009<br>
       <b>Event:</b> Obama inaguration</span><br>
       <p class='timeline_p'>
          Barack Obama is inagurated as US president, replacing George W Bush.
        </p>`);
  addFlower(g, timeline_xScale(new Date(2009, 08, 15)), 0, usa_y, -15, usa_color, 15, 'img/jail_icon.png',
    `<span class='timeline_incident_header'><b>Date:</b> August 2009<br>
     <b>Event:</b> American jouranlists freed</span><br>
     <p class='timeline_p'>North Korea frees American journalists Laura Ling and Euna Lee after former US President
        Bill Clinton facilitates their release. The pair was sentenced to 12 years hard labour
        for allegedly crossing the border illegally.
  </p>`);
  addFlower(g, timeline_xScale(new Date(2012, 02, 15)), 0, usa_y, 10, usa_color, 10, 'img/obama_icon.png',
    `<span class='timeline_incident_header'><b>Date:</b> Feburuary 2012<br>
     <b>Event:</b> Agreement with Obama administration</span><br>
     <p class='timeline_p'>North Korea and the Obama administration agree to a moratorium on nuclear
     and long-range missile tests.
  </p>`);
  addFlower(g, timeline_xScale(new Date(2012, 10, 15)), 0, usa_y, 15, usa_color, 15, 'img/rocket_icon.png',
    `<span class='timeline_incident_header'><b>Date:</b> August 2012<br>
     <b>Event:</b> North Korea claims it can hit the US mainland</span><br>
     <p class='timeline_p'>North Korea claims it has missiles than can hit the US mainland after South Korea and Washington
        announce a deal to extend the range of South Korea's ballistic missiles.
  </p>`);
  addFlower(g, timeline_xScale(new Date(2014, 12, 15)), 0, usa_y, 20, usa_color, 15, 'img/sony_icon.png',
    `<span class='timeline_incident_header'><b>Date:</b> December 2014<br>
     <b>Event:</b> The Sony Pictures hack</span><br>
     <p class='timeline_p'>North Korea and US exchange accusations of cyber-attacks over a Sony Pictures film called The Interview,
        which mocks Kim Jong-un, prompting new US sanctions the following month.
  </p>`);
  addFlower(g, timeline_xScale(new Date(2015, 12, 15)), 0, usa_y, -15, usa_color, 10, 'img/sanction_icon.png',
    `<span class='timeline_incident_header'><b>Date:</b> December 2015<br>
     <b>Event:</b> US sanctions</span><br>
     <p class='timeline_p'>The US imposes new sanctions on North Korea over weapons proliferation,
        targeting the army's Strategic Rocket Force, banks and shipping companies.
  </p>`);
  addFlower(g, timeline_xScale(new Date(2017, 08, 15)), 0, usa_y, -40, usa_color, 10, 'img/trump_icon.png',
    `<span class='timeline_incident_header'><b>Date:</b> August 2017<br>
     <b>Event:</b> Fire and fury comments during Trump speech</span><br>
     <p class='timeline_p'>Tension rises in war of words with US over North Korean threat to fire
     ballistic missiles near US Pacific territory of Guam. President Trump warns
     that he willl unleash “fire and fury” if Pyongyang continues with its threats against the U.S.
  </p>`);
  addFlower(g, timeline_xScale(new Date(2017, 01, 20)), 0, usa_y, 15, usa_color, 15, 'img/trump_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> January 20, 2017<br>
       <b>Event:</b> Trump inaguration</span><br>
       <p class='timeline_p'>
          Donald Trump is inagurated as US president, replacing Barack Obama.
        </p>`);
  addFlower(g, timeline_xScale(new Date(2017, 09, 15)), 0, usa_y, 10, usa_color, 10, 'img/trump_icon.png',
    `<span class='timeline_incident_header'><b>Date:</b> September 2017<br>
     <b>Event:</b> President Trump addresses the UN General Assembly</span><br>
     <p class='timeline_p'>In an address to the UN General Assembly, President Trump states that if the US is forced to defend itself
     or its allies, it would have \"no choice but to totally destroy North Korea,\" and refers to Kim Jong Un as
     \"rocket man\" who is \"on a suicide mission for himself and his regime.\"
  </p>`);
  addFlower(g, timeline_xScale(new Date(2017, 09, 21)), 0, usa_y, -10, usa_color, 10, 'img/kim_jong_un_icon.png',
      `<span class='timeline_incident_header'><b>Date:</b> September 21, 2017<br>
       <b>Event:</b> Kim's response to President Trump</span><br>
       <p class='timeline_p'>
          In a televised response to comments by President Trump at the UN General Assembly, Kim Jong Un calls the
          US President \"mentally deranged\" and warns he will \"pay dearly\" for threatening his country.
          He additionally states that Trump's comments \"have convinced me, rather than frightening or
          stopping me, that the path I chose is correct and that it is the one I have to follow to the last.\"
        </p>`);
  addFlower(g, timeline_xScale(new Date(2017, 11, 20)), 0, usa_y, 38, usa_color, 10, 'img/bomb_icon.png',
    `<span class='timeline_incident_header'><b>Date:</b> November 20, 2017<br>
     <b>Event:</b> DPRK is re-added the US's state sponsors of terrorism list</span><br>
     <p class='timeline_p'>On November 20, 2017, President Trump officially announces that North Korea is re-listed as a
        State Sponsor of Terrorism, joining Iran, Sudan, and Syria.
  </p>`);
};
// CHRIS CHRIS

var valMap = [1984,1986,1990,1991,1992,1993,1998,2006,2009,2012,2013,2014,2015,2016,2017];
// function remove_overlay(){
//   d3.selectAll(".missile_overlay").remove();
// };

// Get missile data points for the given year
function get_missile_data(yr){
  return missile_data.filter(function(d,i){
    var d_date = new Date(d.Date);
    return d_date.getFullYear() == yr;
  })
}
function format_missile_data(d){
  d.forEach(function(curr,i){
    curr["Facility Longitude"]
  })
}
function add_paths(data){
  var d = get_path_data(data);
  map.instance.arc( d, {strokeWidth: 0.5});
  d3.selectAll(".arc").each(function(){
    d3.select(this)
      .attr("transform","translate(0)");
  })
  // d3.selectAll(".arc")
  //   .attr("transform","translate(0)");

}
function get_path_data(d){
        var ret = [];
        d.forEach(function(curr,i){
          var obj = {}, origin = {}, destination = {};
          origin["longitude"]          = parseFloat(curr["Facility Longitude"]);
          origin["latitude"]           = parseFloat(curr["Facility Latitude"]);
          destination["longitude"]     = parseFloat(curr["Landing Longitude"]);
          destination["latitude"]      = parseFloat(curr["Landing Latitude"]);

          obj["origin"]                = origin;
          obj["destination"]           = destination;
          obj["id"]                    = "_"+curr["F1"] + "_path";
          obj["color"]                 = String(color(i));

          // obj["id"]                    = "_"+String(curr["F1"]);

          ret.push(obj);
        })
        return ret;
      };
function get_launch_site_data(d){
  var ret = [];
  d.forEach(function(curr,i){
    var obj = {};
    obj["longitude"]          = parseFloat(curr["Facility Longitude"]);
    obj["latitude"]           = parseFloat(curr["Facility Latitude"]);
    obj["Name"]               = curr["Facility Name"];
    // obj["Apogee"]           = curr["Apogee"];
    obj["Launch Time"]        = curr["Launch Time"];
    obj["Launch Date"]        = curr["Launch Date"];
    obj["Facility Location"]  = curr["Facility Location"];
    obj["radius"]             = parseFloat(r_size);
    obj["class"]              = "launch_sites";
    obj["id"]                 = "_"+String(curr["F1"]) + "_launch";
    obj["color"]              = String(color(i));

    // obj["id"]                 = "_"+String(curr["F1"]);
    ret.push(obj);
  })
  return ret;
}
function get_landing_site_data(d){
  var ret = [];
  d.forEach(function(curr,i){
    var obj = {};

    obj["longitude"]            = parseFloat(curr["Landing Longitude"]);
    obj["latitude"]             = parseFloat(curr["Landing Latitude"]);
    obj["Name"]                 = curr["Facility Name"];
    obj["Launch Time"]          = curr["Launch Time"];
    obj["Launch Date"]          = curr["Launch Date"];
    obj["Facility Location"]    = curr["Facility Location"];
    obj["radius"]               = parseFloat(r_size);
    obj["class"]                = "landing_sites";
    obj["id"]                   = "_"+String(curr["F1"]) + "_landing";
    // obj["id"]                   = "_"+String(curr["F1"]);
    obj["Confirmation Status"]  = curr["Confirmation Status"];
    obj["color"]                = String(color(i));

    ret.push(obj);
  })
  return ret;
}
function add_landing_sites(d){
  var data = get_landing_site_data(d)
  // draw bubbles for bombs
  map.instance.bubbles(data, {
  popupTemplate:function (geography, data) {
    return ['<div class="hoverinfo"><strong>' +  data["Name"] + '</strong>',
    '<br/>Launch Date: ' +  data["Launch Date"] + '',
    '<br/>Time of Launch: ' +  data["Launch Time"] + '',
    '</div>'].join('');
  }
  });
}
function add_launch_sites(d){
  var data = get_launch_site_data(d)
  // draw bubbles for bombs
  map.instance.bubbles(data, {
  popupTemplate:function (geography, data) {
    return ['<div class="hoverinfo"><strong>' +  data["Name"] + '</strong>',
    '<br/>Launch Date: ' +  data["Launch Date"] + '',
    '<br/>Time of Launch: ' +  data["Launch Time"] + '',
    '<br/>Location: ' +  data["Facility Location"] + '',
    '</div>'].join('');
    }
  })
}

// Chris3
// Called when the #slider value is changed.
// @val = the currently selected year (1984 - 2017)
function transform_slider_handle(){
  var y = parseFloat(d3.select(".ui-slider-handle").style("left"));
  var slider_width = parseFloat(d3.select("#slider").style("width"));
  // console.log("thisis the width "+slider_width);
  var body = document.querySelector('body');

  // console.log(parseFloat(body.clientWidth));
  // var offset = (parseFloat(body.clientWidth)/1440)*slider_width;
  var offset = (parseFloat(body.clientWidth)/1440);
  console.log("offset: " + offset);


  // d3.select(".ui-slider-handle").style("left", y + offset + "px");
  // $()
  // document.getElementsByClassName("ui-slider-handle").style.transform = "translateX(10px)";
  $('.ui-slider-handle').css({
    '-webkit-transform' : 'scale(' + ui.value + ')',
    '-moz-transform'    : 'scale(' + ui.value + ')',
    '-ms-transform'     : 'scale(' + ui.value + ')',
    '-o-transform'      : 'scale(' + ui.value + ')',
    'transform'         : 'scale(' + ui.value + ')'
  });
  // d3.select(".ui-slider-handle").attr("transform", "translate(100)");
};

function slider_bar_val_did_change(val,i){
  // console.log("sliden");
  // transform_slider_handle();
  val = parseFloat(val) + 1;
  zoom_map(val);
  // console.log(val);
  // console.log("Slider bar value changed to " + val + " " + i)
  d3.selectAll(".missile_overlay").remove();  // remove_overlay();
  remove_bubbles();

  var data = get_missile_data(val); // get missile data for the current year


  add_launch_sites(data);
  add_landing_sites(data);
  add_paths(data);

        d3.selectAll(".slider-histogram-block")
          .transition()
          .attr("fill",missile_block_clr);

        d3.selectAll("._"+String(valMap[i]))
          .transition()
          .attr("fill",missile_block_select_clr);
        // add_color();
        // }
  // d3.selectAll(".arc").attr("transform","translate(0)");
};

function zoom_map(yr){
  console.log("zoom");
  if(yr==1998){
      // your starting size
      var baseWidth = 600;
        // getBBox() is a native SVG element method

        var bbox = d3.select(".PRK").node().getBBox();
            centroid = [bbox.x + bbox.width/2, bbox.y + bbox.height/2],
            zoomScaleFactor = baseWidth / bbox.width,
            zoomX = -centroid[0],
            zoomY = -centroid[1];

      // -3800, -1800
      map_zoom_factor_x = zoomX*3.5,map_zoom_factor_y = zoomY*3;
      // map_zoom_factor_x2 = zoomX*9.5,map_zoom_factor_y2 = zoomY*9;
      map_scale_factor = 4;
      map.zoom._animate([zoomX*3.5, zoomY*3], 4);
  }
  else if(yr==2017){
      // your starting size
      var baseWidth = 600;
      // getBBox() is a native SVG element method

      var bbox = d3.select(".PRK").node().getBBox();
          centroid = [bbox.x + bbox.width/2, bbox.y + bbox.height/2],
          zoomScaleFactor = baseWidth / bbox.width,
          zoomX = -centroid[0],
          zoomY = -centroid[1];

    // -3800, -1800
    map_zoom_factor_x = zoomX*3.5,map_zoom_factor_y = zoomY*3;
    // map_zoom_factor_x2 = zoomX*9.5,map_zoom_factor_y2 = zoomY*9;
    map_scale_factor = 4;
    map.zoom._animate([zoomX*3.5, zoomY*3], 4);
  }
  else{
    zoom_into_korea();
  }
};


function step_7_top(){
  // console.log("step 6");
  console.log(map_scale_factor);

  remove_all();
  zoom_into_korea();
  unselect_korea();
  focus_on_NK();
  change_caption();
  draw_timeline2_missile_histogram();


  // 300ft is default apogee if the value is unknown or N/A or whatever.

    d3.selectAll(".NK_timeline_view").remove();
    d3.select(".datamap").transition().style("opacity","1").duration(8*250);

    function pull_slider_bar(){
      d3.select("#slider")
        .transition()
        .style("top",(parseFloat($(".time_axis").position().top) - 100) + "px")
        .style("opacity","1")
        .duration(3000);
    };

      function slider_bar_val_did_change(val,i,valMap){
        remove_overlay();
        remove_bubbles();
        var data = get_missile_data(String(valMap[i]));
        // if(data.length == 0) no_missile_data();
        // else{
        add_launch_sites(data);
        add_landing_sites(data);
        add_paths(data);

        d3.selectAll(".slider-histogram-block")
          .transition()
          .attr("fill",missile_block_clr);

        d3.selectAll("._"+String(valMap[i]))
          .transition()
          .attr("fill",missile_block_select_clr);
        // add_color();
        // }
      };

      function add_selection(){
        d3.selectAll(".launch_sites")
          .each(function(i){
            var num = String(this.id).replace('_launch','');
            d3.select(this)
              .on("mouseover",function(){
                console.log("mouseover");

              })
            d3.select("#_" + num + "_path")

            d3.select("#_" + num + "_landing")
              .style("fill", color(i))
              .style("stroke", clr_str);
          })
      }

      function animate_path(){
        // var x1 = parseFloat(d3.selectAll(".launch_sites").select("#16_launch").attr("cx"));
        // var y1 = parseFloat(d3.selectAll(".launch_sites").select("#16_launch").attr("cy"));
        //
        // var x2 = parseFloat(d3.selectAll(".landing_sites").select("#16_landing").attr("cx"));
        // var y2 = parseFloat(d3.selectAll(".landing_sites").select("#16_landing").attr("cy"));
        var x1 = parseFloat(d3.select(".launch_sites").attr("cx"));
        var y1 = parseFloat(d3.select(".launch_sites").attr("cy"));

        var x2 = parseFloat(d3.select(".landing_sites").attr("cx"));
        var y2 = parseFloat(d3.select(".landing_sites").attr("cy"));
        console.log(x1,y1,x2,y2);
        var points =  [
                      [x1,y1],
                      [x2,y2]
                      ];

        var path = d3.select(".datamaps-arc");

        d3.select(".datamap").selectAll(".point")
            .data(points)
          .enter().append("circle")
            .attr("r", 3)
            .attr("transform", function(d) { return "translate(" + (map_zoom_factor_x+parseFloat(d)) + "," + map_zoom_factor_y + ")" +","+ "scale("+map_scale_factor+")"; });
            // .attr("transform", function(d) { return "translate(" + d + ")"; });

        var circle = d3.select(".datamap").append("circle")
            .attr("r", 5)
            .attr("class","path_bubbles")
            .attr("transform", function(d) { return "translate(" + (map_zoom_factor_x+parseFloat(points[0])) + "," + map_zoom_factor_y + ")" +","+ "scale("+map_scale_factor+")"; });
            // .attr("transform", "translate(" + points[0] + ")");

        // transition();

        function transition() {
          circle.transition()
              .duration(10000)
              .attrTween("transform", translateAlong(path.node()))
              .each("end", transition);
        }

        // Returns an attrTween for translating along the specified path element.
        function translateAlong(path) {
          var l = path.getTotalLength();
          return function(d, i, a) {
            return function(t) {
              var p = path.getPointAtLength(t * l);
              return "translate(" + (map_zoom_factor_x+p.x) + "," + (map_zoom_factor_y+p.y) + ")";
              // return "translate(" + p.x + "," + p.y + ")";
            };
          };
        }
      };
}

function step_4(){
  remove_all();
  zoom_into_korea();
  change_caption();
  var map_g = d3.select("#map").append("g").attr("class","map_group");
  var g = map_g.append("svg").attr("class","overlay_line_chart");
  g.append("svg")
    .attr("id","survey-chart")
    .attr("width",800)
    .attr("height",410)
    .attr("x",0)
    .attr("y",50);

  // <form>
  //   <label>
  //       <input type="radio" name="mode" value="grouped">Grouped</label>
  //   <label>
  //       <input type="radio" name="mode" value="stacked" checked>Stacked</label>
  // </form>
  // <svg id="survey-chart" width="865" height="510"></svg>

  var form = map_g.append("form").attr("class","mode-selection");
  form.append("label").attr("class","label-header");
  form.append("label").attr("class","group-label");
  form.append("input").attr("class","group-input").attr("type","radio").attr("name","mode").attr("value","grouped");
  form.append("label").attr("class","stack-label");
  form.append("input").attr("class","stack-input").attr("type","radio").attr("name","mode").attr("value","stacked").property('checked', true);

  $(".label-header").html(" Organize bars by: ");
  $(".group-label").text(" Groups ");
  $(".stack-label").text(" Stacks ");

  var COUNTRIES = [
      'Australia',
      'Austria',
      'Bulgaria',
      'France',
      'Germany',
      'Hong Kong',
      'Italy',
      'Japan',
      'Pakistan',
      'Russia',
      'South Korea',
      'UK',
      'USA',
      'Vietnam'
  ];

  var CHOICES = [
      'Very Likely',
      'Fairly Likely',
      'Fairly Unlikely',
      'Very Unlikely',
      'Not familiar',
      "Not answered"
  ];

  var COLORS = [
      "#c7001e",
      "#f6a580",
      "#92c6db",
      "#086fad",
      "#cccccc",
      "#e8e8e8"
  ];

  d3.csv('nuke.csv', function (error, table) {
      table = table.filter(function (d) {
          return COUNTRIES.indexOf(d['Country']) !== -1;
      });

      var svg = d3.select('#survey-chart');
      var margin = { top: 0, right: 180, bottom: 35, left: 100 };
      var chart = d3.select('#survey-chart').append('g');
      var width = +svg.attr('width') - margin.left - margin.right;
      var height = +svg.attr('height') - margin.top - margin.bottom;

      chart.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      var data = d3.layout.stack()(CHOICES.map(function (choice) {
          return table.map(function (d) {
              return { x: d['Country'], y: +d[choice], answer: choice };
          });
      }));

      var yScale = d3.scale.ordinal()
          .domain(data[0].map(function (d) { return d.x; }))
          .rangeRoundBands([0, height], 0.2);

      var xScale = d3.scale.linear()
          .domain([0, d3.max(data, function (d) {
              return d3.max(d, function (d) { return d.y0 + d.y; });
          })])
          .range([0, width]);

      var groups = chart.selectAll('g.choice')
          .data(data)
          .enter().append('g')
          .attr('class', 'choice')
          .style('fill', function (d, i) { return COLORS[i]; });

      var rect = groups.selectAll("rect")
          .data(function (d) {
              return d;
          })
          .enter()
          .append("rect")
          .attr("y", function (d) { return yScale(d.x) + yScale.rangeBand() * 0.25; })
          .attr("x", function (d) { return xScale(d.y0); })
          .attr("width", function (d) { return xScale(d.y0 + d.y) - xScale(d.y0); })
          .attr("height", yScale.rangeBand() * 0.5);
      // TODO: add tooltip
      // .on("mouseover", function () { tooltip.style("display", null); })
      // .on("mouseout", function () { tooltip.style("display", "none"); })
      // .on("mousemove", function (d) {
      //     tooltip.select("text").text(d.y + "%");
      // });


      // Axis
      var xAxis = d3.svg.axis()
          .scale(xScale)
          .orient("bottom");

      var yAxis = d3.svg.axis()
          .scale(yScale)
          .orient("left")
          .ticks(5)
          .tickSize(-width, 0, 0)
          .tickFormat(function (d) { return d; });

      chart.append("g")
          .attr("class", "y axis")
          .call(yAxis);

      chart.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0, " + height + ")")
          .call(xAxis);

      // Legend
      var legend = chart.selectAll(".legend")
          .data(CHOICES)
          .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function (d, i) {
              return "translate(" + (width + 24) + "," + (i * 19 + 12) + ")";
          });

      legend.append("rect")
          .attr("x", 0)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", function (d, i) {
              return COLORS[i];
          });

      legend.append("text")
          .attr("x", 20)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "start")
          .text(function (d, i) { return d; });


      // Animation
      function transitionGrouped() {
          rect.transition()
              .duration(500)
              .delay(function (d, i) { return i * 10; })
              .attr("y", function (d, i) {
                  return yScale(d.x) + yScale.rangeBand() / CHOICES.length * CHOICES.indexOf(d.answer);
              })
              .attr("height", yScale.rangeBand() / CHOICES.length)
              .transition()
              .attr("x", function (d) { return 0; })
              .attr("width", function (d) { return xScale(d.y0 + d.y) - xScale(d.y0); })
      }

      function transitionStacked() {
          rect.transition()
              .duration(500)
              .delay(function (d, i) { return i * 10; })
              .attr("x", function (d) { return xScale(d.y0); })
              .attr("width", function (d) { return xScale(d.y0 + d.y) - xScale(d.y0); })
              .transition()
              .attr("y", function (d) { return yScale(d.x) + yScale.rangeBand() * 0.25; })
              .attr("height", yScale.rangeBand() * 0.5);
      }

      d3.selectAll("input")
          .on("change", function () {
              if (this.value === "grouped") transitionGrouped();
              else transitionStacked();
          });
  });



};

function step_7_bottom(){ // Conclusion
  remove_all();
  // zoom_into_korea();
  unzoom_into_korea();
  change_caption();
  var chart = d3.select("#map").append("g").attr("class","map_group").append("svg").attr("class","overlay_line_chart");

  d3.csv("country_pwrs.csv", function(data) {
    // console.log(data);
    ///////////////////////
    // Chart Size Setup
    var margin = { top: 15, right: 10, bottom: 60, left: 50 };

    var width = parseFloat(d3.select(".overlay_line_chart").style("width")) - margin.left - margin.right;
    var height = parseFloat(d3.select(".overlay_line_chart").style("height")) - margin.top - margin.bottom;

    // var chart = d3.select(".chart")
    //     .attr("width", 960)
    //     .attr("height", 500)
    //   .append("g")
    //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    ///////////////////////
    // Scales
    var x = d3.scale.ordinal()
        .domain(data.map(function(d) { return d['country']; }))
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
    // .domain([0, d3.max(data, function(d) { return d['ranking']; })])
        .domain([0,12])
        .range([height, 0]);

    ///////////////////////
    // Axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(0);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left").ticks(0);

    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+margin.left+"," + (height+margin.top) + ")")
        .call(xAxis)
          .selectAll("text")
          .attr('x','-8px')
          .attr('y','0px')
          .style('text-anchor','end')
          .attr("transform", "rotate(-60)");

    chart.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate("+margin.left+"," + margin.top + ")")
        .call(yAxis);
    chart.append("line")
        .attr('class', 'axis')
        .attr('x1',margin.left).attr('x2',margin.left+width-margin.right)
        .attr('y1',margin.top+height).attr('y2',margin.top+height)
        .style('stroke','black').style('stroke-weight',4)

    chart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 15)
        .attr("x",0 - 200)// (height * .5))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style('font-size','16px')
        .text("Quantitative Military Strength");
    chart.append('text')
        .attr('x',35).attr('y',margin.top)
        .style('text-anchor','end')
        .style('font-size','10px')
        .text('More');
    chart.append('text')
        .attr('x',35).attr('y',margin.top + height)
        .style('font-size','10px')
        .style('text-anchor','end')
        .text('Less');

    chart.append('text')
        .attr('x',370).attr('y',250)
        .style('opacity',0)
        .text('Orange indicates countries designated')
        .transition().delay(1500).duration(500)
        .style('opacity',1)
    chart.append('text')
        .attr('x',380).attr('y',270)
        .style('opacity',0)
        .text('as US State Sponsors of Terrorism.')
        .transition().delay(1500).duration(500)
        .style('opacity',1)
    chart.append('line')
        .attr('x1',450).attr('x2',450)
        .attr('y1', 335).attr('y2', 275).style('opacity',0).style('stroke','black')
        .transition().delay(1500).duration(500)
        .style('opacity',1)
      ///////////////////////
    // Title
    // chart.append("text")
    //   .text('Bar Chart!')
    //   .attr("text-anchor", "middle")
    //   .attr("class", "graph-title")
    //   .attr("y", -10)
    //   .attr("x", width / 2.0);

    ///////////////////////
    // Bars
    var bar = chart.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d['country']); })
        .attr("y", height)
        .attr("width", x.rangeBand())
        .attr("height", 0)
        .attr("transform", "translate("+margin.left+"," + margin.top + ")")
        .attr("fill",function(d,i){
          var c = d["country"]
          // if(c == "North Korea") return NK_clr;
          if(c == "North Korea" || c == "Iran" || c == "Syria" || c == "Sudan") return "#d95f02";
          return "#666666";
        });
    bar.transition()
        .duration(1500)
        .ease("elastic")
        .attr("y", function(d) { return y(d['ranking']) + margin.top; })
        .attr("height", function(d) { return height - y(d['ranking']) - margin.top; });

    ///////////////////////
    // Tooltips
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    bar.on("mouseover", function(d) {
          // console.log(d);
          var rank = 1;
          var score = 0;
          var flag = '';
          // var population = 'unknown';
          // var aircraft = 'unkown';
          // var tanks = 'unknown';
          // var naval = 'unknown';
          var countryName = d.country;

          switch(countryName) {
            case 'USA':
              rank = 1;
              score = 0.0857;
              flag = 'usa-flag.png';
              break;
            case 'Russia':
              rank = 2;
              score = 0.0929;
              flag = 'rus-flag.png'
              break;
            case 'China':
              rank = 3;
              score = 0.0945;
              flag = 'chn-flag.png'
              break;
            case 'India':
              rank = 4;
              score = 0.1593;
              flag = 'ind-flag.png';
              break;
            case 'Japan':
              rank = 7;
              score = 0.2137;
              flag = 'jpn-flag.png'
              break;
            case 'South Korea':
              rank = 12;
              score = 0.2741;
              flag = 'sk-flag.png'
              break;
            case 'Pakistan':
              rank = 13;
              score = 0.3287;
              flag = 'pak-flag.jpg';
              break;
            case 'Indonesia':
              rank = 14;
              score = 0.3347;
              flag = 'indonesia-flag.png';
              break;
            case 'Iran':
              rank = 21;
              score = 0.3933;
              flag = 'irn-flag.png'
              break;
            case 'North Korea':
              rank = 23;
              score = 0.4218;
              flag = 'PRK-flag.png';
              break;
            case 'Canada':
              rank = 26;
              score = 0.4381;
              flag = 'can-flag.png';
              break;
            case 'Myanmar':
              rank = 31;
              score = 0.5991;
              flag = 'myan-flag.png';
              break;
            case 'Malaysia':
              rank = 33;
              score = 0.6423;
              flag = 'malay-flag.jpg';
              break;
            case 'Syria':
              rank = 44;
              score = 0.7603;
              flag = 'syria-flag.png';
              break;
            case 'Sudan':
              rank = 71;
              score = 1.1777;
              flag = 'sudan-flag.png';
              break;
          }

          var hover_text = '' +
            '<img src="img/'+flag+'" class="small_flag">' +
            '<span class="timeline_incident_header"> ' +
              '<b>' + countryName + '</b><br>' + '</span>' +
              '<b>Worldwide Rank:</b> #' + rank + '<br>' +
              '<b>Normalized Score:</b> ' + (1.5-score) + '';
          show_hover_text(hover_text);
        })
        .on("mouseout", function(d) {
          hide_hover_text();
        });
  });

};

function step_8_bottom(){ // Conclusion
  remove_all();
  unzoom_into_korea();
  focus_on_NK();
  change_caption();
  // step_4_exit();
  unselect_korea();
  var g = d3.select("#map").append("g").attr("class","map_group");
  g.append("svg").attr("class","overlay_line_chart")
    .style("opacity","0")
    .style("border-width","0px")
    .transition()
    .style("border-width","1px")
    .style("opacity","0.8")
    .duration(2000);

  g.append("img")
    .attr("class","unity-img")
    .attr("src","img/unity.png")
    .style("opacity","0")
    .on('mouseover', function(d) {
      // <img src="img/korea_talks.jpg" style="float:right;width:200px;margin-left:10px;margin-bottom:5px;border:1px solid black">
        var hover_text = `
          <span class='timeline_incident_header'>Unified Olympics Delegation</span><br>
          <p class='timeline_p'>
            As a result of the January 9 talks, it was decided that North Korea will send
            athletes and performers to the 2018 Winter Olympics in South Korea.
            The two countries will march under a single \'united\' flag at the opening
            ceremonies (the last occurrence of this being the 2006 Asian Games),
            and agreed to field a joint team for women's ice hockey&ndash;
            the first time athletes from both Koreas will compte together at an
            Olympics games.
          </p>
          <p class='timeline_p'>
          </p>
        `
        show_hover_text(hover_text);
    })
    .on('mouseout',function(d) {
      hide_hover_text();
    })
    .transition()
    .style("opacity","1")
    .duration(2000);
  g.append("img")
    .attr("class","green_phone-img")
    .attr("src","img/green_phone.jpg")
    .style("opacity","0")
    .on('mouseover', function(d) {
      // <img src="img/korea_talks.jpg" style="float:right;width:200px;margin-left:10px;margin-bottom:5px;border:1px solid black">
        var hover_text = `
          <span class='timeline_incident_header'>Re-opening the Military Hotline</span><br>
          <p class='timeline_p'>
            As a result of the January 9 inter-Korean talks, the military hotline between
            the countries was re-opened.
          </p>
          <p class='timeline_p'>
            This direct line between the two countries, which had been severed since 2016,
            signaled a hopeful easing of military tensions between the countries. Serving
            as a key source of information transmission, the line serves as a first-line
            method for de-escalation and reduces the change of accidental military escalation.
          </p>
        `
        show_hover_text(hover_text);
    })
    .on('mouseout',function(d) {
      hide_hover_text();
    })
    .transition().delay(1500)
    .style("opacity","1")
    .duration(2000);
  g.append("img")
    .attr("class","korea-talks-img")
    .attr("src","img/korea_talks.jpg")
    .style("opacity","0")
    .on('mouseover', function(d) {
      // <img src="img/korea_talks.jpg" style="float:right;width:200px;margin-left:10px;margin-bottom:5px;border:1px solid black">
        var hover_text = `
          <span class='timeline_incident_header'>Kim Jong-Un's New Year Address</span><br>
          <p class='timeline_p'>
            In his annual New Year's address, Kim Jong-Un adopted an unusually conciliatory posture,
            stating his wish for \"peaceful resolution with our southern border,\" and declaring
            the use of nuclear weapons only as a defensive measure to the state's security.
          </p>
          <p class='timeline_p'>
            \"North and South must work together to alleviate the tensions and work together
            as people of the same heritage to find peace and stability,\" he said.
          </p>
        `
        show_hover_text(hover_text);
    })
    .on('mouseout',function(d) {
      hide_hover_text();
    })
    .transition().delay(1000)
    .style("opacity","1")
    .duration(2000);
  g.append("img")
    .attr("class","kim_2018_address-img")
    .attr("src","img/kim_2018_address.jpg")
    .style("opacity","0")
    .on('mouseover', function(d) {
      // <img src="img/korea_talks.jpg" style="float:right;width:200px;margin-left:10px;margin-bottom:5px;border:1px solid black">
        var hover_text = `
          <span class='timeline_incident_header'>January 9 Inter-Korean Talks</span><br>
          <p class='timeline_p'>
            North and South Korean officials met in \"truce village\" (in the DMZ) for the first time in
            over two years. Discussions concerned the Olympics Games to be hosted in Seoul, as well as
            ways to reduce tensions between the countries (especially along the DMZ border).
          </p>
          <p class='timeline_p'>
          </p>
        `
        show_hover_text(hover_text);
    })
    .on('mouseout',function(d) {
      hide_hover_text();
    })
    .transition().delay(500)
    .style("opacity","1")
    .duration(2000);

  // g.append("p")
  //   .attr("class","unity-img-caption")
  //   .text("Korea walking under a single flag in 2004 Opening Ceremony in Athens, Greece.")
  //   .style("opacity","0")
  //   .transition()
  //   .style("opacity","1")
  //   .duration(2000);

};

function step_9(){ // Credits
  remove_all();
  unzoom_into_korea();
  focus_on_NK();
  change_caption();
  // step_4_exit();
  unselect_korea();
  var g = d3.select("#map").append("g").attr("class","map_group");
  g.append("svg").attr("class","overlay_line_chart")
    .style("opacity","0")
    .style("border-width","0px")
    .transition()
    .style("border-width","1px")
    .style("opacity","0.8")
    .duration(2000);

  g.append("div").attr("id","conclusion_text");

  $("#conclusion_text").html("<span style='position:absolute; top:40%; left:10%; right:10%; font-size:25px;'>Has your perspective changed? Do you now consider North Korea to be a real threat or not? Go back to explore the other side of the argument.</span>");

  // g.append("img")
  //   .attr("class","logo_row_1 logo_1")
  //   .attr("src", "img/global_firepower_logo.png")
  //   .transition()
  //   .style("opacity","0.8")
  //   .duration(2000);
  //
  // g.append("img")
  //   .attr("class","logo_row_1 logo_2")
  //   .attr("src", "img/ap_images_logo.png")
  //   .transition()
  //   .style("opacity","0.8")
  //   .duration(2000);
  //
  // g.append("img")
  //   .attr("class","logo_row_1 logo_3")
  //   .attr("src", "img/bbc_logo.png")
  //   .transition()
  //   .style("opacity","0.8")
  //   .duration(2000);
  //
  // g.append("img")
  //   .attr("class","logo_row_1 logo_4")
  //   .attr("src", "img/bootstrap_logo.png")
  //   .transition()
  //   .style("opacity","0.8")
  //   .duration(2000);
  //
  //   g.append("img")
  //     .attr("class","logo_row_1 logo_5")
  //     .attr("src", "img/cnn_logo.png")
  //     .transition()
  //     .style("opacity","0.8")
  //     .duration(2000);


  // g.append("img")
  //   .attr("class","logo_row_2 logo_5")
  //   .attr("src", "img/datamaps_logo.png")
  //   .transition()
  //   .style("opacity","0.8")
  //   .duration(2000);

  // g.append("img")
  //   .attr("class","logo_row_2 logo_6")
  //   .attr("src", "img/bootstrap_logo.png")
  //   .transition()
  //   .style("opacity","0.8")
  //   .duration(2000);
  //
  // g.append("img")
  //   .attr("class","logo_row_2 logo_7")
  //   .attr("src", "img/datamaps_logo.png")
  //   .transition()
  //   .style("opacity","0.8")
  //   .duration(2000);
  //
  // g.append("img")
  //   .attr("class","logo_row_2 logo_8")
  //   .attr("src", "img/jquery_logo.png")
  //   .transition()
  //   .style("opacity","0.8")
  //   .duration(2000);
  //
  // g.append("img")
  //   .attr("class","logo_row_2 logo_9")
  //   .attr("src", "img/d3_logo.png")
  //   .transition()
  //   .style("opacity","0.8")
  //   .duration(2000);

  // g.append("img")
  //   .attr("class","logo_row_2 logo_10")
  //   .attr("src", "img/youtube_logo.png")
  //   .transition()
  //   .style("opacity","0.8")
  //   .duration(2000);

  // g.append("img")
  //   .attr("class","logo_row_3 logo_11")
  //   .attr("src", "img/opendata_soft_logo.png")
  //   .transition()
  //   .style("opacity","0.8")
  //   .duration(2000);
  //
  // g.append("img")
  //   .attr("class","logo_row_3 logo_12")
  //   .attr("src", "img/d3_logo.png")
  //   .transition()
  //   .style("opacity","0.8")
  //   .duration(2000);
  //
  // g.append("img")
  //   .attr("class","logo_row_3 logo_13")
  //   .attr("src", "img/wikimedia_logo.png")
  //   .transition()
  //   .style("opacity","0.8")
  //   .duration(2000);
  //
  // g.append("img")
  //   .attr("class","logo_row_3 logo_14")
  //   .attr("src", "img/wikipedia_logo.png")
  //   .transition()
  //   .style("opacity","0.8")
  //   .duration(2000);
  //
  // g.append("img")
  //   .attr("class","logo_row_3 logo_15")
  //   .attr("src", "img/world_flag_logo.png")
  //   .transition()
  //   .style("opacity","0.8")
  //   .duration(2000);

  // g.append("img")
  //   .attr("class","logo_row_2 logo_10")
  //   .attr("src", "img/youtube_logo.png")
  //   .transition()
  //   .style("opacity","0.8")
  //   .duration(2000);

    // var ul = g.append("ul").attr("class","sources-list");

    // var sources = ["candy","cheese","words","words","words","words","words","words","words","words","words","words","words","words"];
    // var d = []

    // sources.forEach(function(curr){
    //   draw(curr);
    // })

    // draw();
    //
    // function draw(){
    //   var p = ul.selectAll("li").data(sources)
    //   .enter()
    //   .append("li")
    //   .transition()
    //   .delay(function(d,i){ return 200*i; })
    //   .text(function(d,i){return '\u2022 ' + d;})
    //   .style("opacity","1")
    //   // .style("opacity","1")
    //   .duration(3000);
    // }
};

// function step_10(){ //credits
//   remove_all();
//   zoom_into_korea();
//   focus_on_NK();
//   change_caption();
//   step_4_exit();
//   unselect_korea();
//
//   d3.select("#map").append("g").attr("class","map_group")
//     .append("text");
//
// };

//  ******************************************************** //
//  ******************************************************** //
//  ******************************************************** //
//                                                           //
//                      LIBRARY OF CODE                      //
//                                                           //
//  ******************************************************** //
//  ******************************************************** //
//  ******************************************************** //

function select_missile_path(num){
  d3.selectAll(".launch_sites")
    .each(function(){
      if(String(this.id).includes(String(num)) == false){
        d3.select(this).transition().attr("opacity",0.4).style("opacity","0.4");
      }
    })
  d3.selectAll(".landing_sites")
    .each(function(){
      if(String(this.id).includes(String(num)) == false){
        d3.select(this).transition().attr("opacity",0.4).style("opacity","0.4");
      }
    })
  d3.selectAll(".datamaps-arc")
    .each(function(){
      if(String(this.id).includes(String(num)) == false){
        d3.select(this).transition().attr("opacity",0.4).style("opacity","0.4");
      }
    })
  d3.selectAll(".slider-histogram").each(function(){
    num = String(num).replace("_","");
    if( String(this.id).includes(String(num)) == false ){
      d3.select(this).transition().attr("opacity",0.2).style("opacity","0.2");
    }
  })
};

function unselect_all_missile_paths(){
  d3.selectAll(".launch_sites").transition().attr("opacity",1).style("opacity","1");
  d3.selectAll(".landing_sites").transition().attr("opacity",1).style("opacity","1");
  d3.selectAll(".datamaps-arc").transition().attr("opacity",1).style("opacity","1");
  d3.selectAll(".slider-histogram").transition().attr("opacity",0.6).style("opacity","0.6");
};

function unfocus_on_penninsula(){
  d3.select(".PRK")
    .transition()
      .style("stroke-width","1px")
      .style("stroke", "white")
      .style("fill", NK_clr);

  d3.select(".KOR")
    .transition()
      .style("stroke-width","1px")
      .style("stroke", "white")
      .style("fill", SK_clr);
};

function show_hover_text(str){
  hide_hover_text();

  var div = d3.select("#interactions_descriptions").append("g").attr("class","background_group");
  var container = div
    .append("div")
    .attr("class","hover-container");

  container
    .append("p")
    .html(str);

  container
    .transition()
    .style("opacity","1");

};

function show_hover_text_country(str,country_id,country_name){
  hide_hover_text();

  var div = d3.select("#interactions_descriptions").append("g").attr("class","background_group");
  var container = div
    .append("div")
    .attr("class","hover-container");

  container
    .append("img")
    .attr("class","hover-container-img-1")
    .attr("src",hover_over_countries_img[country_id][0]);

    // container
    //   .append("text")
    //   .attr("class","hover_over_countries_img")
    //   .text(country_name);

  container
    .append("p")
    .attr("class","hover-container-p")
    .html(str);

  container
    .transition()
    .style("opacity","1");
};

function hide_hover_text(){
  d3.selectAll(".hover-container").transition().remove();
};

function animate_highlight_timestep(svg,x,yr,height){
  if(d3.select("._"+yr).empty() == 0){
    d3.select("._"+yr).remove();
  }

  var rectangle = svg.append("rect")
    .attr("class","_"+yr)
    .attr("x", x(yr))
    .attr("y", 0)
    .attr("width", parseFloat(x(2014)) - parseFloat(x(2013)) )
    .attr("height", height)
    .attr("fill","steelblue")
    .style("opacity","0")
    .moveToBack()
    .transition()
    .style("opacity","0.4")
    .duration(500);
};

function create_gdp_line_chart(g,data){
  var margin = {top: 70, right: 85, bottom: 70, left: 85},
      width = parseFloat(d3.select("#map").style("width")) - margin.left - margin.right,
      height = parseFloat(d3.select("#map").style("height")) - margin.top - margin.bottom;

  var xScale = d3.scale.linear()
      .domain([d3.min(data, function(d){ return d.x; }), d3.max(data, function(d){ return d.x; })])
      .range([0, width]);

  var yScale = d3.scale.linear()
      .domain([0, d3.max(data, function(d){ return d.y; })])
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .innerTickSize(-height)
      .outerTickSize(0)
      .tickPadding(10)
      .tickFormat(d3.format("d"));

  var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")
      .innerTickSize(-width)
      .outerTickSize(0)
      .tickPadding(10);

  var line = d3.svg.line()
      .x(function(d) { return xScale(d.x); })
      .y(function(d) { return yScale(d.y); });

  var svg = g.append("svg").attr("class","line-chart-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .style("opacity","0")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)

    svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (-50) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text("GDP (Billions USD)")
        .style("font-size","20px");

    svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (width/2) +","+(height + 45)+")")  // centre below axis
        .text("Year")
        .style("font-size","20px");

    // axis labels
    svg
      .transition()
      .style("opacity","1")
      .duration(2000);

      var path = svg.append("path")
          .data([data])
          .attr("class", "line")
          .attr("d", line)
          .attr("opacity", 0)
          .style("stroke",NK_clr);

      setTimeout(function(){
        path
          .attr("opacity", 1);

        var totalLength = path.node().getTotalLength();

        path
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
            .duration(2000)
            .ease("linear")
            .attr("stroke-dashoffset", 0);
      },2000);

      var mouseUnderlay = svg.append("rect").attr({
          x: 0,
          y: 0,
          width: width,
          height: height,
          fill: "#fff"
          //transform: "translate(" + margin.left+ "," + margin.top + ")"
      });

      mouseUnderlay
        .attr("opacity","0");

      var circles = svg
          .append("circle")
          //.attr("opacity", 0)
          .attr("r", 6)
          .attr("fill", "black")
          .attr("cx",0)
          .attr("cy",265)
          .call(d3.behavior.drag()
            .on("dragstart", dragstarted)
            .on("drag", dragged)
            .on("dragend", dragended));

      function dragstarted(d) {
        d3.select(this)
          .transition()
          .attr("r", 10);
      }

      function dragged(d) {
        // d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
        var x = d3.mouse(this)[0];
        var valMap = [1984,1986,1990,1991,1992,1993,1998,2006,2009,2012,2013,2014,2015,2016,2017];

        valMap.forEach(function(curr,i){
          if(x >= xScale(curr)){
            animate_highlight_timestep(svg,xScale,curr,height);//svg,x,yr,height
          }
        })

        path.each(function (d, i) {
            var pathEl = this;
            var pathLength = pathEl.getTotalLength();
            var beginning = x, end = pathLength, target, pos;

            while (true) {
                target = Math.floor((beginning + end) / 2);
                pos = pathEl.getPointAtLength(target);
                if ((target === end || target === beginning) && pos.x !== x) {
                    break;
                }
                if (pos.x > x) {
                    end = target;
                } else if (pos.x < x) {
                    beginning = target;
                } else {
                    break; //position found
                }
            }

            circles.filter(function (d, index) {
                return i == index;
            })
                .attr("opacity", 1)
                .attr("cx", function(){
                  if(x <= 1){
                    return 0;
                  }
                  else if( x >= xScale(2017) - 30){
                    return xScale(2017) - 30;
                  }
                  else{
                    return x;
                  }
                })
                .attr("cy", function(){
                  if(x <= 1){
                    return 265;
                  }
                  else{
                    return pos.y;
                  }
                });
        });
      }

      function dragended(d) {
        d3.select(this)
          .transition()
          .attr("r", 6);
      }


      // mouseUnderlay.on("mousemove", function () {
      //     var x = d3.mouse(this)[0];
      //
      //     path.each(function (d, i) {
      //         var pathEl = this;
      //         var pathLength = pathEl.getTotalLength();
      //         var beginning = x, end = pathLength, target, pos;
      //
      //         while (true) {
      //             target = Math.floor((beginning + end) / 2);
      //             pos = pathEl.getPointAtLength(target);
      //             if ((target === end || target === beginning) && pos.x !== x) {
      //                 break;
      //             }
      //             if (pos.x > x) {
      //                 end = target;
      //             } else if (pos.x < x) {
      //                 beginning = target;
      //             } else {
      //                 break; //position found
      //             }
      //         }
      //
      //         circles.filter(function (d, index) {
      //             return i == index;
      //         })
      //             .attr("opacity", 1)
      //             .attr("cx", x)
      //             .attr("cy", pos.y);
      //     });
      // });


    return [svg,path,xScale,height];
};

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

function remove_bubbles(){
    d3.selectAll(".datamaps-bubble").remove();
};

function unselect_korea(){
  d3.select(".KOR")
    .transition()
      .style("stroke-width","0px")
      .style("stroke", "white")
      .style("fill", "rgb(171, 221, 164)");

  d3.select(".PRK")
    .transition()
      .style("stroke-width","0px")
      .style("stroke", "white")
      .style("fill", "rgb(171, 221, 164)");
};

function fade_in_2_sec(selection){
  selection
    .transition()
    .style("opacity","1")
    .duration(2000);
};

function fade_out_2_sec(selection){
  selection
    .transition()
    .style("opacity","0")
    .duration(2000);
};

function focus_on_NK(){
  d3.select(".KOR")
    .transition()
      .style("stroke-width","1px")
      .style("stroke", "white")
      .style("fill", "rgb(171, 221, 164)");

  d3.select(".PRK")
    .transition()
      .style("stroke-width","1px")
      .style("fill",NK_clr)
      .style("stroke", "white");
};

function create_line_chart(data,num_lines,g){
  var margin = {top: 90, right: 145, bottom: 90, left: 120},
      width = parseFloat(d3.select("#map").style("width")) - margin.left - margin.right,
      height = parseFloat(d3.select("#map").style("height")) - margin.top - margin.bottom;

  var xScale = d3.scale.linear()
      .domain([d3.min(SK_gdp_dataset, function(d){ return d.x; }), d3.max(SK_gdp_dataset, function(d){ return d.x; })])
      .range([0, width]);

  var yScale = d3.scale.linear()
      .domain([0, d3.max(NK_gdp_dataset, function(d){ return parseFloat(d.y); })])
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .innerTickSize(-height)
      .outerTickSize(0)
      .tickPadding(10)
      .tickFormat(d3.format("d"));

  var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")
      .innerTickSize(-width)
      .outerTickSize(0)
      .tickPadding(10);

  var line = d3.svg.line()
      .x(function(d) { return xScale(d.x); })
      .y(function(d) { return yScale(d.y); });

  var svg = g.append("svg").attr("class","line-chart-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .style("opacity","0")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)

    svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (-50) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text("GDP (Billions USD)")
        .style("font-size","20px");

    svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (width/2) +","+(height + 45)+")")  // centre below axis
        .text("Year")
        .style("font-size","20px");

    // axis labels
    svg
      .transition()
      .style("opacity","1")
      .duration(2000);
      var SK_path, NK_path;
      setTimeout(function(){

        SK_path = svg.append("path")
            .attr("class", "SKline")
            .data([SK_gdp_dataset])
            // .enter()
            .attr("d", line);

        var totalLength = SK_path.node().getTotalLength();

        SK_path
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .style("stroke",SK_clr)
          .transition()
            .duration(3000)
            .ease("linear")
            .attr("stroke-dashoffset", 0);

        NK_path = svg.append("path")
            .attr("class", "NKline")
            .data([NK_gdp_dataset])
            // .enter()
            .attr("d", line);

        totalLength = NK_path.node().getTotalLength();

        NK_path
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .style("stroke",NK_clr)
          .transition()
            .duration(3000)
            .ease("linear")
            .attr("stroke-dashoffset", 0);

        var NK_text = svg.append("text")
        .attr("class","NKpath-text")
        .attr("transform", "translate(0," + -100 / 3 + ")")
        .style("color",NK_clr)
        .style("stroke",NK_clr)
        .style("fill",NK_clr)
        .text("North Korea");

        var SK_text = svg.append("text")
        .attr("class","SKpath-text")
        .attr("transform", "translate(0," + -100 / 3 + ")")
        .style("color",SK_clr)
        .style("stroke",SK_clr)
        .style("fill",SK_clr)
        .text("South Korea");

        transition(NK_text,NK_path);
        transition(SK_text,SK_path);

        function transition(t,p) {
          t.transition()
              .duration(3000)
              .ease("linear")
              .attrTween("transform", translateAlong(p.node()));
              // .each("end", transition);
        }

        // Returns an attrTween for translating along the specified path element.
        function translateAlong(path) {
          var l = path.getTotalLength();
          return function(d, i, a) {
            return function(t) {
              // console.log("this "+t)
              var p = path.getPointAtLength(t * l);
              return "translate(" + (p.x) + "," + (p.y) + ")";
              // return "translate(" + p.x + "," + p.y + ")";
            };
          };
        }



      },3000);
    return [yScale,xScale,yAxis,svg,NK_path,SK_path,line,xAxis];
};

function step_1_to_step_2(){
  console.log("step 1 to step 2")
  disable_clicks();

  blink_country(".KOR");
  blink_country(".PRK");

  move_step_icon(new Date(1950, 1, 2),8*250);
  change_caption();
  enable_clicks();

  function blink_country(id){
    d3.select(id)
      .transition().style("stroke-width","5px")
      .transition().style("stroke", "black")
      .transition().style("stroke", "white")
      .transition().style("stroke", "black")
      .transition().style("stroke", "white")
      .transition().style("stroke", "black")
      .transition().style("stroke-width","3px");
  };
};

function change_caption(){
    d3.select("#captions")
      .transition()
      .style("opacity",0);

    d3.select("#interactions_descriptions")
      .transition()
      .style("opacity",0);

    setTimeout(function(){
      if(step_is_visited[5]["user_chose_real_tiger_path"] == true && (step==6 || step==7 || step==8)){
        switch(step){
          case 6:
            add_caption(6,7);
            break;
          case 7:
            add_caption(7,8);
            break;
          case 8:
            add_caption(8,10);
            break;
          default:
            return;
        }
        d3.select("#captions")
          .transition()
          .style("opacity",1);

        d3.select("#interactions_descriptions")
                .transition()
                .style("opacity",1);
        return;
      }
      if(step_is_visited[5]["user_chose_paper_tiger_path"] == true && (step==6 || step==7 || step==8)){
        switch(step){
          case 6:
            add_caption(6,6);
            break;
          case 7:
            add_caption(7,11);
            break;
          case 8:
            add_caption(8,12);
            break;
          default:
            return;
        }
        d3.select("#captions")
          .transition()
          .style("opacity",1);

        d3.select("#interactions_descriptions")
                .transition()
                .style("opacity",1);
        return;
      }
      // else{
      if(step != 0) {
        $('#captions h3').html("<span style='font-size:.7em;'>(" + step + ")</span> " + caption_data[step]["header"]);
      }
      else{
        $('#captions h3').text(caption_data[step]["header"]);
      }
      $('#captions #narration').html(caption_data[step]["narration"]);
      $('#captions #source').html(caption_data[step]["source"]);
      $('#interactions_descriptions #interactions_descriptions_text_1').text(caption_data[step]["interactions_1"]);
      $('#interactions_descriptions #interactions_descriptions_text_2').text(caption_data[step]["interactions_2"]);
      // }
      d3.select("#captions")
        .transition()
        .style("opacity",1);

      d3.select("#interactions_descriptions")
              .transition()
              .style("opacity",1);
    },250)

    // $('#captions a').attr("href",caption_data[step-1]["link"]);
    // $('#captions a').text(caption_data[step-1]["link"]);
  // }

  function add_annotation_text(div){
    div.append("span").attr("class","annotation-text").attr("id","ann-1-text").text("music, ");
    div.append("span").attr("class","annotation-text").attr("id","ann-2-text").text("innovation in cosmetics, ");
    div.append("span").attr("class","annotation-text").attr("id","ann-3-text").text("video game culture, ");
    div.append("span").attr("class","annotation-text").attr("id","ann-4-text").text("technology markets, ");
    div.append("span").attr("class","annotation-text").attr("id","ann-5-text").text("delicious cuisine, ");
  };
};

function add_caption(actual_step,step){
  if(step != 0) {
    $('#captions h3').html("<span style='font-size:.7em;'>(" + actual_step + ")</span> " + caption_data[step]["header"]);
  }
  else{
    $('#captions h3').text(caption_data[step]["header"]);
  }
  $('#captions #narration').html(caption_data[step]["narration"]);
  $('#captions #source').html(caption_data[step]["source"]);
  $('#interactions_descriptions #interactions_descriptions_text_1').text(caption_data[step]["interactions_1"]);
  $('#interactions_descriptions #interactions_descriptions_text_2').text(caption_data[step]["interactions_2"]);

}

function step_2_to_step_3(){
  // d3.selectAll(".map_group").remove();

  disable_clicks();
  change_caption();
  move_step_icon(new Date(2017, 1, 2),8*250);
  focus_on_SK();

  var map = d3.select("#map").append("g").attr("class","map_group");
  for (var i = 1; i <= 5; i++) {
    create_annotation(map,i);
  }
  d3.selectAll(".annotation").transition().style("opacity","1").duration(8*250);

  d3.select("#captions")
    .append("div")
      .attr("class","annotation_info_view")
      .moveToFront()
      .append("span")
        .attr("class","header");

  enable_clicks();

  function focus_on_SK(){
    d3.select(".PRK")
      .transition()
        .style("stroke-width","1px")
        .style("stroke", "white")
        .style("fill", "rgb(171, 221, 164)");

    d3.select(".KOR")
      .transition()
        .style("stroke-width","1px")
        .style("stroke", "white");
  };

   function create_annotation(map,num){
     map
       .append("div")
         .attr("class","annotation")
         .attr("id","ann-"+num)
         .style("opacity","0")
         .moveToFront()
         .append("img")
           .attr("src",function(){
             if(num == 1) return "img/sk-music.png";
             else if(num == 2) return "img/sk-cosmetic.png";
             else if(num == 3) return "img/sk-vg.png";
             else if(num == 4) return "img/sk-tech.png";
             else if(num == 5) return "img/sk-food.png";
           })
           .on("mouseover",function(){
             d3.select("#ann-"+num).attr("class","annotation hover");
             d3.select("#ann-"+num+"-text").attr("class","annotation-text hover");
             set_annotation_info_view(num);
           })
           .on("mouseleave",function(){
             d3.select("#ann-"+num).attr("class","annotation");
             d3.select("#ann-"+num+"-text").attr("class","annotation-text");
             $(".annotation_info_view").empty();
             d3.select("#captions h3").style("opacity","1")
             d3.select("#narration").style("opacity","1")
           });

      function set_annotation_info_view(n){
        d3.select("#captions h3").style("opacity","0.4")
        d3.select("#narration").style("opacity","0.4")

        $(".annotation_info_view").append($("<h4>").text(step_3_data[n-1]["header"]));
        $(".annotation_info_view").append($("<p>").text(step_3_data[n-1]["body"]));
        $(".annotation_info_view").append($("<a>").attr("href",caption_data[step-1]["link"]).text(step_3_data[n-1]["link"]));

      };
   };
};

function step_3_to_step_4(){
  disable_clicks();
  change_caption();
  focus_on_NK();
  for (var i = 1; i <= 5; i++) create_annotations(i);
  d3.selectAll(".annotation").transition().style("opacity","1").duration(8*250);
  enable_clicks();

  function focus_on_NK(){
    d3.select(".KOR")
      .transition()
        .style("stroke-width","1px")
        .style("stroke", "white")
        .style("fill", "rgb(171, 221, 164)")
        .duration(8*250);

    d3.select(".PRK")
      .transition()
        .style("stroke-width","1px")
        .style("fill","red")
        .style("stroke", "white")
        .duration(8*250);
  };

  function create_annotations(num){
    d3.selectAll(".annotation").transition().remove();
    d3.select("#map")
      .append("div")
        .attr("class","annotation")
        .attr("id","ann-"+num)
        .style("opacity","0")
        .moveToFront()
      .append("img")
        .attr("src","img/question.png")
        .on("mouseover",function(){
          d3.select("#ann-"+num).attr("class","annotation hover");
          d3.select("#ann-"+num+"-text").attr("class","annotation-text hover");
          set_annotation_info_view(num);
        })
        .on("mouseleave",function(){
          d3.select("#ann-"+num).attr("class","annotation");
          d3.select("#ann-"+num+"-text").attr("class","annotation-text");
          $(".annotation_info_view").empty();
          d3.select("#captions h3").style("opacity","1")
          d3.select("#narration").style("opacity","1")
        });
    }

    function set_annotation_info_view(n){
      d3.select("#captions h3").style("opacity","0.4")
      d3.select("#narration").style("opacity","0.4")

      $(".annotation_info_view").append($("<h4>").text("We don't know."));
      $(".annotation_info_view").append($("<p>").text("Some text."));
      $(".annotation_info_view").append($("<a>").attr("href","www.google.com").text("www.google.com"));

    };

};

function step_4_to_step_5(){
  change_caption();
  d3.selectAll(".annotation").remove();
  d3.selectAll(".annotation_info_view").remove();

  d3.select("#map").append("svg")
    .attr("class","NK_timeline_view")
    .moveToFront();

  d3.select(".datamap").transition().style("opacity","0.25")
  var w = parseFloat(d3.select("#map").attr("width"));

  d3.select("#background_to_map").style("width","100%")

  push_time_axis_out();
  create_info_view();
  create_timeline();
  add_hover_interactions_on_annotations();

  function add_hover_interactions_on_annotations(){

    d3.selectAll(".timeline_annotations").selectAll("text")
      .on("mouseover",function(){
        $(".annotations_info_view_title_date").text( '"'+ step_5_data[this.id]["title"] +'"' + " - " + step_5_data[this.id]["date"])
        // $(".annotations_info_view_title").text(step_5_data[this.id]["title"])
        $(".annotations_info_view_description").text(step_5_data[this.id]["description"])
        $(".annotations_info_view_gif").attr("src","img/giphy.gif")
        $('.annotations_info_view_link').attr("href",step_5_data[this.id]["link"]);
        $('.annotations_info_view_link').text(step_5_data[this.id]["link"]);
      })
      .on("mouseleave",function(){
        $(".annotations_info_view_title_date").text("")
        // $(".annotations_info_view_title").text("")
        $(".annotations_info_view_description").text("")
        $(".annotations_info_view_gif").attr("src","")
        $('.annotations_info_view_link').attr("href","");
        $('.annotations_info_view_link').text("");
      })
  };

  function push_time_axis_out(){
    d3.select(".time_axis")
      .transition()
      .attr("transform", "translate(" + (-time_axis_width - 50) + "," + (time_axis_height - time_axis_margin.bottom) + ")")
      .duration(3000);

    d3.selectAll(".icons")
      .transition()
      .attr("transform", "translate(" + (-time_axis_width - 50) + ")")
      .duration(3000);
  };

  function create_info_view(){
    var map = d3.select("#map");
    var container = map
      .append("div")
      .moveToFront()
      .attr("class","annotations_info_view container");

    container
      .append("h4")
      .attr("class","annotations_info_view_title_date")

    container
      .append("text")
      .attr("class","annotations_info_view_description")

    container
      .append("img")
      .attr("class","annotations_info_view_gif")

    container
      .append("a")
      .attr("class","annotations_info_view_link")
  };





  // delete #datamap, add a new timeline svg that sits at the bottom of the map
  function create_timeline(){

    var width = parseFloat(d3.select(".NK_timeline_view").style("width"))*4, height = parseFloat(d3.select(".NK_timeline_view").style("height"));
    var margin = {top: 40, right: 10, bottom: 5, left: 10};

    // time_axis_margin = margin,time_axis_width = width,time_axis_height = height;

    x = d3.time.scale()
      .domain([new Date(1991, 1, 1), new Date(2018, 2, 10)])
      .range([0, width - margin.left - margin.right]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .tickSize(2)
      .ticks(10)
      .tickFormat(d3.time.format("%Y"));

    var timeline = d3.select(".NK_timeline_view").append("g").moveToFront()
      .attr("class", "timeline");

    timeline
      .call(xAxis)
      .selectAll("text")
         .style("text-anchor", "end")
         .attr("font-size","10px")
         .attr("dx", "-.8em")
         .attr("dy", ".15em")
         .text("");

    var annotations = d3.select(".NK_timeline_view")
      .selectAll("timeline_annotations")
      .data(step_5_data)
      .enter()
      .append("g")
        .attr("class","timeline_annotations");

    annotations
      .append("text")
        .attr("class","timeline_annotations_title")
        .moveToFront()
        .attr("id",function(d,i){ return i; })
        .attr("x", function(d,i){
          var day = d["date"].substring(0, 2), month = d["date"].substring(3, 5), yr = d["date"].substring(6, 10);
          return x(new Date(parseInt(yr), parseInt(month), parseInt(day))) - margin.left;
        })
        .attr("y", 0)
        .style("text-anchor", function(d,i){
          if(d["date"] == "12/12/2013") return "start"
          if(d["date"] == "09/07/2013") return "end"
          if(d["date"] == "09/17/1991") return "start"
          if(d["date"] == "01/03/2018") return "end"
          if(d["date"] == "06/26/2008") return "end"
          if(d["date"] == "01/02/2016") return "start"
          return "middle"
        })
        .attr("font-size","12px")
        // .attr("dx", "-.8em")
        .attr("dy", function(d,i){
          if(i%2 == 0) return "-.25em"
          else return ".95em"
        })
        .text(function(d,i){ return d["title"]})

    annotations
      .append("text")
        .attr("class","timeline_annotations_date")
        .moveToFront()
        .attr("id",function(d,i){ return i; })
        .attr("x", function(d,i){
          var day = d["date"].substring(0, 2), month = d["date"].substring(3, 5), yr = d["date"].substring(6, 10);
          return x(new Date(parseInt(yr), parseInt(month), parseInt(day))) - margin.left;
        })
        .attr("y", 0)
        .style("text-anchor", function(d,i){
          if(d["date"] == "12/12/2013") return "start";
          if(d["date"] == "09/07/2013") return "end";
          if(d["date"] == "09/17/1991") return "start";
          if(d["date"] == "01/03/2018") return "end";
          if(d["date"] == "06/26/2008") return "end";
          if(d["date"] == "01/02/2016") return "start";
          return "middle";
        })
        .attr("font-size","12px")
        // .attr("dx", "-.8em")
        .attr("dy", function(d,i){
          if(i%2 == 0) return "-1.2em"
          else return "1.9em"
        })
        .text(function(d,i){return d["date"];});

      timeline.timeline_animate(width,height,margin,10)
      annotations.timeline_animate(width,height,margin,10)

      setTimeout( function(){
        timeline.timeline_center_on_screen(width,height,margin,3);
        annotations.timeline_center_on_screen(width,height,margin,3);
        d3.select(".annotations_info_view")
          .style("border-style","solid")
          .transition()
            .style("height","70%")
            .style("width","70%")
          .duration(3*1000);
      }, 10*1000 );
  };

};

function step_5_to_step_6(){
  change_caption();
  d3.select(".NK_timeline_view").transition().remove();
  d3.select(".annotations_info_view").transition().remove();

  d3.select("#map").append("svg")
    .attr("class","NK_timeline_view")
    .moveToFront();

  pull_time_axis_in();

  setTimeout( function(){
    move_step_icon(new Date(2011, 1, 2),8*250);
  }, 3000 );

  append_video();

  function append_video(){
    d3.select("#map")
      .append("img")
      .attr("class","kim_img")
      .attr("src","img/kim_speech.gif")
      .transition()
      .style("opacity","1")
      .duration(8*250);
    };

  function pull_time_axis_in(){
    d3.select(".time_axis")
      .transition()
      .attr("transform", "translate(" + (10) + "," + (time_axis_height - time_axis_margin.bottom) + ")")
      .duration(3000);

    d3.selectAll(".icons")
      .transition()
      .attr("transform", "translate(" + (10) + ")")
      .duration(3000);
  };
};

function step_6_to_step_7(){
  change_caption();

  d3.selectAll(".kim_img")
    .transition()
      .style("opacity","0")
    .duration(8*250)
    .remove();

  d3.selectAll(".NK_timeline_view").remove();

  d3.select("#map").append("svg")
    .attr("class","NK_timeline_view")
    .moveToFront();

  // append_gif_views(d3.select("#map"));

  function append_gif_views(div){
    for (var i = 1; i < 6; i++) {
      div
        .append("img")
        .attr("class","gif_view")
        .attr("id", i)
        .attr("src","img/kim_speech.gif")
        .transition()
        .style("opacity","1")
        .duration(8*250);
    }
  };
};

function step_7_to_step_8(){
  // 300ft is default apogee if the value is unknown or N/A or whatever.
  // console.log("step 8");
  // d3.selectAll(".NK_timeline_view").remove();
  // change_caption();
  // d3.select(".datamap").transition().style("opacity","1").duration(8*250);
  // add_slider_bar();
  // pull_slider_bar();
  // push_time_axis_out();
  //
  // function add_slider_bar(){
  //   d3.select("body")
  //     .append("div")
  //       .attr("id","slider")
  //       .style("top",$(".time_axis").position().top + "px")
  //       .style("left",$(".time_axis").position().left*3 + "px")
  //       .style("width", time_axis_width + "px");
  //
  //   // add_slider_bar_val();
  //
  //   $( function() {
  //     $( "#slider" ).slider({
  //         value:2017,
  //         min: 1984,
  //         max: 2017,
  //         step: 1,
  //         create: function( event, ui ) {
  //           setSliderTicks(event.target);
  //         },
  //         slide: function( event, ui ) {
  //           slider_bar_val_did_change(String(ui.value));
  //         }
  //       });
  //       $( "#slider_bar_val" ).val( $( "#slider" ).slider( "value" ) );
  //     });
  //   };

    // function slider_bar_val_did_change(val){
    //   remove_overlay();
    //   remove_bubbles();
    //   var data = get_missile_data(val);
    //   if(data.length == 0) no_missile_data();
    //   else{
    //     add_launch_sites(data);
    //     console.log(data);
    //     // add_landing_sites(data);
    //   }
    // };

    function add_launch_sites(d){
      var data = get_launch_site_data(d)
      // draw bubbles for bombs
      map.instance.bubbles(data, {
        popupTemplate:function (geography, data) {
          return ['<div class="hoverinfo"><strong>' +  data["Name"] + '</strong>',
          '<br/>Launch Date: ' +  data["Launch Date"] + '',
          '<br/>Time of Launch: ' +  data["Launch Time"] + '',
          '<br/>Location: ' +  data["Facility Location"] + '',
          '</div>'].join('');
        }
      });

      // d3.selectAll(".launch_sites")
      //   .style("fill","gray")
      //   .style("stroke-width","0");
    };

    function get_launch_site_data(d){
      var ret = [];
      d.forEach(function(curr,i){
        var obj = {};
        obj["longitude"]          = parseFloat(curr["Facility Longitude"]);
        obj["latitude"]           = parseFloat(curr["Facility Latitude"]);
        obj["Name"]               = curr["Facility Name"];
        // obj["Apogee"]           = curr["Apogee"];
        obj["Launch Time"]        = curr["Launch Time"];
        obj["Launch Date"]        = curr["Launch Date"];
        obj["Facility Location"]  = curr["Facility Location"];
        obj["radius"]             = parseFloat(1);
        obj["class"]              = "launch_sites";
        obj["id"]                 = String(curr["F1"]) + "_launch";
        ret.push(obj);
      })
      return ret;
    };

    function add_landing_sites(d){
      var data = get_landing_site_data(d)
      // draw bubbles for bombs
      map.instance.bubbles(data, {
        popupTemplate:function (geography, data) {
          return ['<div class="hoverinfo"><strong>' +  data["Name"] + '</strong>',
          '<br/>Launch Date: ' +  data["Launch Date"] + '',
          '<br/>Time of Launch: ' +  data["Launch Time"] + '',
          '<br/>Confirmation Status: ' +  data["Facility Location"] + '',
          '</div>'].join('');
        }
      });

      d3.selectAll(".landing_sites")
        .style("fill","purple")
        .style("stroke-width","0");
    };

    function get_landing_site_data(d){
      var ret = [];
      d.forEach(function(curr,i){
        var obj = {};
        console.log(get_landing_position(curr));

        obj["longitude"]            = parseFloat(curr["Facility Longitude"]);
        obj["latitude"]             = parseFloat(curr["Facility Latitude"]);
        obj["Name"]                 = curr["Facility Name"];
        // obj["Apogee"]           = curr["Apogee"];
        obj["Launch Time"]          = curr["Launch Time"];
        obj["Launch Date"]          = curr["Launch Date"];
        obj["Facility Location"]    = curr["Facility Location"];
        obj["radius"]               = parseFloat(1);
        obj["class"]                = "landing_sites";
        obj["id"]                   = String(curr["F1"]) + "_landing";
        obj["Confirmation Status"]  = curr["Confirmation Status"];
        ret.push(obj);
      })
      return ret;
    };

    function get_landing_position(d){

    };

    function remove_overlay(){
      d3.selectAll(".no_missiles_overlay").remove();
      d3.selectAll(".no_missiles_text").remove();
    };

    function remove_bubbles(){
        d3.selectAll(".datamaps-bubble").remove();
    };

    // function get_missile_data(yr){
    //   return missile_data.filter(function(curr,i){
    //     return (curr.Date.slice(-2) === yr.slice(-2))
    //   })
    //   // ret = format_missile_data(ret);
    // };

    function format_missile_data(d){
      d.forEach(function(curr,i){
        curr["Facility Longitude"]
      })
    };

    function no_missile_data(){
      d3.select("#map").append("svg")
        .attr("class","no_missiles_overlay")
        .moveToFront()
        .transition()
        .style("opacity","0.5")
        .duration(500);

      d3.select("#map")
        .append("p")
        .moveToFront()
        .attr("class","no_missiles_text")
        .text("No reported missile launches for this year.")
        .transition()
        .style("opacity","1")
        .duration(500);
    };

    function setSliderTicks(el) {
        var $slider =  $(el);
        var max =  $slider.slider("option", "max");
        var min =  $slider.slider("option", "min");
        var spacing =  100 / (max - min);

        $slider.find('.ui-slider-tick-mark').remove();
        for (var i = 1; i < max-min ; i++) {
          $('<span class="ui-slider-tick-mark"></span>').css('left', (spacing * i) +  '%').appendTo($slider);
        }
        for (var i = 0; i < max-min+1 ; i++) {
          // $('<span class="ui-slider-tick-mark_label">'+ String(i+1984) +'</span>').css('left', (spacing * i) - 1 +  '%').appendTo($slider);
          $('<span class="ui-slider-tick-mark_label">'+ "'" + String(i+1984).slice(-2) +'</span>').css('left', (spacing * i) - 0.75 +  '%').appendTo($slider);
        }
    };

    // function add_slider_bar_val(){
    //   d3.select("body")
    //     .append("input")
    //       .attr("id","slider_bar_val")
    //       .style("top",$(".time_axis").position().top - 25 + "px")
    //       .style("left",$(".time_axis").position().left*3 + "px")
    //       .style("width", 40 + "px");
    // };

    // function translate_slider_bar_val_to_year(val){
    //   return parseFloat(val + 1983);
    // };

    function push_time_axis_out(){
      d3.select(".time_axis")
        .transition()
        .attr("transform", "translate(" + (-time_axis_width - 50) + "," + (time_axis_height - time_axis_margin.bottom) + ")")
        .duration(3000);

      d3.selectAll(".icons")
        .transition()
        .attr("transform", "translate(" + (-time_axis_width - 50) + ")")
        .duration(3000);
    };

    function pull_slider_bar(){
      d3.select("#slider")
        .transition()
        .style("left",$(".time_axis").position().left + "px")
        .duration(3000);

      d3.select("#slider_bar_val")
        .transition()
        .style("left",$(".time_axis").position().left + "px")
        .duration(3000);
    };

    function zoom_into_NK(){
      map.zoom._animate([map_zoom_factor_x *1.2, map_zoom_factor_y*1.2], map_scale_factor + 2);
    };
};

// function step_7_to_step_8(){
//   console.log(missile_data);
//   d3.selectAll(".NK_timeline_view").remove();
//   append_spans_to_captions(d3.select("#captions"));
//   change_caption_for_this_step();
//
//   shrink_text(d3.select("#narration1"));
//   shrink_text(d3.select("#narration2"));
//   shrink_text(d3.select("#narration3"));
//
//
//   add_hover_interaction(d3.select("#narration1"));
//   add_hover_interaction(d3.select("#narration2"));
//   add_hover_interaction(d3.select("#narration3"));
//
//   d3.select(".datamap").transition().style("opacity","1").duration(8*250);
//
//   function append_spans_to_captions(div){
//     div
//       .append("p")
//       .attr("class","narration")
//       .attr("id","narration1");
//     div
//       .append("p")
//       .attr("class","narration")
//       .attr("id","narration2");
//
//     div
//       .append("p")
//       .attr("class","narration")
//       .attr("id","narration3");
//   };
//
//   function change_caption_for_this_step(){
//     $('#captions h3').text(step + ". " + caption_data[step-1]["header"])
//     $('#captions #narration').text("");
//     $('#captions #narration1').text(caption_data[step-1]["narration"]);
//     $('#captions #narration2').text(caption_data[step-1]["narration2"]);
//     $('#captions #narration3').text(caption_data[step-1]["narration3"]);
//     $('#captions a').attr("href",caption_data[step-1]["link"]);
//     $('#captions a').text(caption_data[step-1]["link"]);
//   };
//
//   function shrink_text(p){
//     p
//       .style("font-size","12px");
//   };
//
//   function add_hover_interaction(p){
//     p
//       .on("mouseover", function(){
//         d3.selectAll(".narration").attr("class","narration inactive");
//         d3.select(this).attr("class","narration active");
//
//         if(this.id == "narration1") narration_1_selected();
//         else if(this.id == "narration2") narration_2_selected();
//         else if(this.id == "narration3") narration_3_selected();
//
//       })
//       .on("mouseleave", function(){
//         d3.selectAll(".narration").attr("class","narration");
//         d3.selectAll(".narration.inactive").attr("class","narration");
//         d3.selectAll(".narration.active").attr("class","narration");
//         clear_map();
//       })
//   };
//
//   function narration_1_selected(){
//     create_bubbles();
//     create_rocket_path();
//   };
//   function narration_2_selected(){
//
//   };
//   function narration_3_selected(){
//
//   };
//
//   function create_bubbles(){
//     var bombs = [{
//         name: 'Tsar Bomba',
//         radius: 1,
//         yeild: 50000,
//         country: 'USSR',
//         fillKey: 'RUS',
//         significance: 'Largest thermonuclear weapon ever tested—scaled down from its initial 100 Mt design by 50%',
//         date: '1961-10-31',
//         latitude: 40.8499966,
//         longitude: 129.666664
//       }];
//     // draw bubbles for bombs
//     map.instance.bubbles(bombs, {
//         popupTemplate:function (geography, data) {
//                 return ['<div class="hoverinfo"><strong>' +  data.name + '</strong>',
//                 '<br/>Payload: ' +  data.yeild + ' kilotons',
//                 '<br/>Country: ' +  data.country + '',
//                 '<br/>Date: ' +  data.date + '',
//                 '</div>'].join('');
//         }
//     });
//
//     d3.selectAll(".datamaps-bubble")
//       .style("fill","black")
//       .style("stroke-width","0");
//
//
//   };
//
//   function create_rocket_path(){
//     // console.log();
//     var x = parseFloat(d3.select(".datamaps-bubble").attr("cx")), y = parseFloat(d3.select(".datamaps-bubble").attr("cy"));
//     console.log(d3.select(".datamaps-bubble").attr("cx"),d3.select(".datamaps-bubble").attr("cy"));
//     var data = [ { "x": x,   "y": y}, { "x": 0,  "y": 0}];
//
//     // var line = d3.svg.line()
//     //   .x(function(d) { return x(d.x); })
//     //   .y(function(d) { return y(d.y); })
//     //   .interpolate("basis");
//     //
//     // d3.select(".background_to_map").append("path")
//     //   .datum(data)
//     //   .attr("class", "rocket_path")
//     //   .attr("d", line)
//     //   .moveToFront()
//     //   .attr('stroke-width', function(d) { return "10"; })
//     //   .attr('stroke', function(d) { return "red"; });
//
//     var p = $( ".datamaps-bubble" );
//     var position = p.position();
//     console.log(position);
//
//     d3.select(".datamap").append("line")            // attach a line
//       .style("stroke", "black")                     // colour the line
//       .attr("x1", parseFloat(position.left))        // x position of the first end of the line
//       .attr("y1", parseFloat(position.top))         // y position of the first end of the line
//       .attr("x2", 0)                                // x position of the second end of the line
//       .attr("y2", 0);
//   };
//
//   function clear_map(){
//     // d3.selectAll(".datamaps-bubble").remove();
//     // d3.selectAll(".rocket_path").remove();
//   };
// };

function get_center_pos(id){
  var $this = $(id);
  var offset = $this.offset();
  var width = $this.width();
  var height = $this.height();

  var centerX = offset.left + width / 2;
  var centerY = offset.top + height / 2;
  return [centerX,centerY];
};

function move_step_icon(date,duration){
  d3.select("#step").transition().attr("x", x(date) - 10).duration(duration);
};

var time_axis_width,time_axis_height,time_axis_margin;

function create_time_axis(){

  var width = parseFloat(d3.select("#map").style("width"));
  // var height = parseFloat(d3.select("#background_to_map").style("height"));

  var margin = {top: 40, right: 10, bottom: 5, left: 0},
      // width = 960 - margin.left - margin.right,
      height = $(window).height()*.86 - margin.top - margin.bottom;

  time_axis_margin = margin,time_axis_width = width,time_axis_height = height;

  x = d3.time.scale()
    .domain([new Date(1945, 1, 2), new Date(2018, 1, 1)])
    .range([0, width - margin.left - margin.right]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .tickSize(2)
    .ticks(10)
    .tickFormat(d3.time.format("%Y"));
    // .orient("bottom");

  // x.domain(["1-Jan-1984","1-Jan-2018"]).nice();

  d3.select("#background_to_map").append("g")
    .attr("class", "time_axis")
    // .attr("transform", "translate(" + (-width - 50) + "," + (height - margin.bottom) + ")")
    // .transition()
    .attr("transform", "translate(" + (0 + margin.left) + "," + (height - margin.bottom) + ")")
    .attr("opacity",0)
    // .duration(3000)
    .call(xAxis);
    // .selectAll("text")
    //    .style("text-anchor", "end")
    //    .attr("font-size","10px")
    //    .attr("dx", "-.8em")
    //    .attr("dy", ".15em")
    //    .attr("transform", "rotate(-65)");

  // animate_create_time_scale();
  // var img = d3.select("#background_to_map")
  //   .append("svg:image")
  //     .attr("class","icons")
  //     .attr("id","step")
  //     .attr("xlink:href", "img/step.png")
  //     .attr("x","-100")
  //     .attr("y",height - 5 - 45)
  //     .moveToFront()
  //     // .transition()
  //     .attr("x",x(new Date(1945, 1, 2)) - margin.left);
        // .duration(3000);

  // for (var i = 1; i <4 ; i++) {
  //   create_icons(i);
  // }
  //
  // function create_icons(i){
  //
  //   var img = d3.select("#background_to_map")
  //     .append("svg:image")
  //       .attr("class","icons")
  //       .attr("id",i)
  //       .attr("xlink:href", "img/Kim"+i+".png")
  //       .attr("x","-100")
  //       .attr("y",height - 40)
  //       .moveToFront();
  //
  //   if(i==1){
  //     img
  //     .attr("x",x(new Date(1948, 1, 2)) - margin.left);
  //     // .duration(3000);
  //   }
  //   else if(i==2){
  //     img
  //     .attr("x",x(new Date(1994, 1, 2)) - margin.left);
  //     // .duration(3000);
  //   }
  //   else if (i==3) {
  //     img
  //     .attr("x",x(new Date(2011, 1, 2)) - margin.left);
  //     // .duration(3000);
  //   }
  // };

};

function disable_clicks(){
  d3.select("body").append("div").attr("class","overlay");
};

function enable_clicks(){
  d3.select(".overlay").remove();
};

function Zoom(args) {
  $.extend(this, {
    $buttons:   $(".zoom-button"),
    $info:      $("#zoom-info"),
    scale:      { max: 50, currentShift: 0 },
    $container: args.$container,
    datamap:    args.datamap
  });

  this.init();
}

Zoom.prototype.init = function() {
  var paths = this.datamap.svg.selectAll("path"),
      subunits = this.datamap.svg.selectAll(".datamaps-subunit");

  // preserve stroke thickness
  paths.style("vector-effect", "non-scaling-stroke");

  // disable click on drag end
  subunits.call(
    d3.behavior.drag().on("dragend", function() {
      d3.event.sourceEvent.stopPropagation();
    })
  );

  this.scale.set = this._getScalesArray();
  this.d3Zoom = d3.behavior.zoom().scaleExtent([ 1, this.scale.max ]);

  this._displayPercentage(1);
  this.listen();
};

Zoom.prototype.listen = function() {
  this.$buttons.off("click").on("click", this._handleClick.bind(this));

  this.datamap.svg
    .call(this.d3Zoom.on("zoom", this._handleScroll.bind(this)))
    .on("dblclick.zoom", null); // disable zoom on double-click
};

Zoom.prototype.reset = function() {
  this._shift("reset");
};

Zoom.prototype._handleScroll = function() {
  var translate = d3.event.translate,
      scale = d3.event.scale,
      limited = this._bound(translate, scale);

  this.scrolled = true;
  // console.log(limited);
  // this._update(limited.translate, limited.scale);
};

Zoom.prototype._handleClick = function(event) {
  // var direction = $(event.target).data("zoom");
  //
  // this._shift(direction);
};

Zoom.prototype._shift = function(direction) {
  var center = [ this.$container.width() / 2, this.$container.height() / 2 ],
      translate = this.d3Zoom.translate(), translate0 = [], l = [],
      view = {
        x: translate[0],
        y: translate[1],
        k: this.d3Zoom.scale()
      }, bounded;

  translate0 = [
    (center[0] - view.x) / view.k,
    (center[1] - view.y) / view.k
  ];

	if (direction == "reset") {
  	view.k = 1;
    this.scrolled = true;
  } else {
  	view.k = this._getNextScale(direction);
  }

l = [ translate0[0] * view.k + view.x, translate0[1] * view.k + view.y ];

  view.x += center[0] - l[0];
  view.y += center[1] - l[1];

  bounded = this._bound([ view.x, view.y ], view.k);

  this._animate(bounded.translate, bounded.scale);
};

Zoom.prototype._bound = function(translate, scale) {
  var width = this.$container.width(),
      height = this.$container.height();

  translate[0] = Math.min(
    (width / height)  * (scale - 1),
    Math.max( width * (1 - scale), translate[0] )
  );

  translate[1] = Math.min(0, Math.max(height * (1 - scale), translate[1]));

  return { translate: translate, scale: scale };
};

Zoom.prototype._update = function(translate, scale) {
  this.d3Zoom
    .translate(translate)
    .scale(scale);

  this.datamap.svg.selectAll("g")
    .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

  this._displayPercentage(scale);
};

function update(translate,scale){
  Zoom.d3Zoom
    .translate(translate)
    .scale(scale);

  Zoom.datamap.svg.selectAll("g")
    .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

  // Zoom._displayPercentage(scale);
};

Zoom.prototype._animate = function(translate, scale) {
  var _this = this,
      d3Zoom = this.d3Zoom;

  d3.transition().duration(1500).tween("zoom", function() {
    var iTranslate = d3.interpolate(d3Zoom.translate(), translate),
        iScale = d3.interpolate(d3Zoom.scale(), scale);

		return function(t) {
      // console.log(translate, scale);
      // console.log(iTranslate(t), iScale(t));
      _this._update(iTranslate(t), iScale(t));
    };
  });
};

Zoom.prototype._displayPercentage = function(scale) {
  var value;

  value = Math.round(Math.log(scale) / Math.log(this.scale.max) * 100);
  this.$info.text(value + "%");
};

Zoom.prototype._getScalesArray = function() {
  var array = [],
      scaleMaxLog = Math.log(this.scale.max);

  for (var i = 0; i <= 10; i++) {
    array.push(Math.pow(Math.E, 0.1 * i * scaleMaxLog));
  }

  return array;
};

Zoom.prototype._getNextScale = function(direction) {
  var scaleSet = this.scale.set,
      currentScale = this.d3Zoom.scale(),
      lastShift = scaleSet.length - 1,
      shift, temp = [];

  if (this.scrolled) {

    for (shift = 0; shift <= lastShift; shift++) {
      temp.push(Math.abs(scaleSet[shift] - currentScale));
    }

    shift = temp.indexOf(Math.min.apply(null, temp));

    if (currentScale >= scaleSet[shift] && shift < lastShift) {
      shift++;
    }

    if (direction == "out" && shift > 0) {
      shift--;
    }

    this.scrolled = false;

  } else {

    shift = this.scale.currentShift;

    if (direction == "out") {
      shift > 0 && shift--;
    } else {
      shift < lastShift && shift++;
    }
  }

  this.scale.currentShift = shift;

  return scaleSet[shift];
};

function Datamap() {
  console.log("new datamap initialized");
	this.$container = $("#map");
	this.instance = new Datamaps({
    scope: 'world',
    element: this.$container.get(0),
    projection: 'mercator',
    done: this._handleMapReady.bind(this)
	});
  this.instance.bubbles([
    // {centered: 'MEX', fillKey: 'Trouble', radius: 10},
    // {centered: 'CAN', fillKey: 'neato', radius: 5},
    // {centered: 'BRA', fillKey: 'neato', radius: 15},
    // {centered: 'USA', fillKey: 'Trouble', radius: 46},
    // {centered: 'JPN', fillKey: 'neato', radius: 2},
  ])
}

Datamap.prototype._handleMapReady = function(datamap) {
	this.zoom = new Zoom({
  	$container: this.$container,
  	datamap: datamap
  });
}

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};
d3.selection.prototype.timeline_animate = function(w,h,margin,duration){
  return this
      .attr("transform", "translate(" + (w/4) + "," + (h/2 - margin.bottom) + ")")
      .transition()
      .ease("sin")
      .attr("transform", "translate(" + (-w + margin.left) + "," + (h/2 - margin.bottom) + ")")
      .duration(duration*1000)
};
d3.selection.prototype.timeline_center_on_screen = function(w,h,margin,duration){
  return this
      .transition()
      .attr("transform", "translate(" + (0) + "," + (h - 50 - margin.bottom) + ") scale(0.25)")
      .duration(duration*1000)
};

// d3.selection.prototype.addText = function(text) {
//   return this.each(function(){
//     this.append("")
//   });
// };
