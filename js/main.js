function visibleWidth(){
   return window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth||0;
}
function visibleHeight(){
   return window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight||0;
}

$(document).ready(function(){
  $('#load').hide()



var csv_path = "preprocess/sample_table/"
//Files for alphabet and sequence data
var alpha_file = "alphabet_17-09-26.csv"; //without 'n'

//client table
//var csv_file = 'sample_200000_client_table_debenhams-progressive_2017-10-19_2017-11-22.csv'
//var csv_file = 'sample_1000000_client_table_debenhams-progressive_2017-10-19_2017-11-22.csv'

//var csv_file = 'sample_70_failedcheckout_session_table_debenhams-progressive_2017-10-19_2017-11-22.csv'
//debenhams data with myBeautyClub in eliterewards
//var csv_file = 'sample_200000_session_table_debenhams-progressive_2017-10-19_2017-11-22_1.csv'
//var csv_file = 'sample_1000000_session_table_debenhams-progressive_2017-10-19_2017-11-22_1.csv'

//debenhams data
//var csv_file = 'session_table_debenhams-progressive_2017-10-19_2017-11-20_sampling_1_over_80-1.csv'
//var csv_file = 'sample_1000000_session_table_debenhams-progressive_2017-10-19_2017-11-20.csv'
//var csv_file = 'sample_500000_session_table_debenhams-progressive_2017-10-19_2017-11-20.csv'
//var csv_file = 'sample_200000_session_table_debenhams-progressive_2017-10-19_2017-11-20.csv'


//all lancome data
//var csv_file = 'sample_1000000_session_table_lancome_2017-09-01_2017-11-08.csv'
//var csv_file = 'sample_500000_session_table_lancome_2017-09-01_2017-11-08.csv'
var csv_file = 'sample_100000_session_table_lancome_2017-09-01_2017-11-08.csv'


//with client ids
//var csv_file = "sample_500000_client_table_17-10-13.csv"
//with session ids
//var csv_file = "sample_100000_session_table_170926.csv"; //100K
//var csv_file = "sample_1000000_session_table_17-09-26.csv"; //1M
//var csv_file = "sample_1545395_session_table_17-09-26.csv"; //full dataset

var selectedFilter ={},
    new_selection = false,
    parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S.%L"),
    seq_data;

var dataset_name = csv_file.substring(0, csv_file.indexOf('.'))
dataset_name = 'D1_sample_1M'
 //dataset_name = 'D2_sample_200K'
$('#dataset_name').text('for ' + dataset_name)

//--------Setting up Action Hierarchy------>
var general= 'general_actions',
    grouped = 'pages_grouped',
    actions = 'action_strings'

var action_hierarchy = {},
    current_level,
    level = general;

hierarchy =
{ level: -1,
  children: [
    {
      action: 'appStart',
      level: 0
    },
    {
      action: 'appDisplayError',
      level:0
    },
    {
      action: 'offlineModeUsed',
      level:0
    },
    {
      action: 'addToCart',
      level: 0
    },
    {
      action: 'purchase',
      level:0
    },
    {
      action: 'removeFromCart',
      level:0
    },
    {
      action: 'search',
      level:0
    },
    {
      action: 'pageview',
      level:0,
      children: [
        {
          action: 'account_group',
          level: 1,
          children: [
            {
              action: 'pv_account',
              level:2
            },
            {
              action: 'pv_eliterewards',
              level:2
            },
            {
              action: 'pv_signin',
              level:2
            },
            {
              action: 'pv_register',
              level:2
            }
          ]
        },
        {
          action: 'browse_group',
          level:1,
          children: [
            {
              action: 'pv_plp',
              level:2
            },
            {
              action: 'pv_explore',
              level: 2 
            },
            {
              action: 'pv_home',
              level:2
            },
            {
              action: 'pv_pdp',
              level: 2
            },
            {
              action: 'pv_specialoffers',
              level: 2
            },
            {
              action: 'pv_search',
              level:2
            }
          ]
        },
        {
          action: 'cart_group',
          level: 1,
          children: [
            {
              action: 'pv_cart',
              level:2
            }
          ]
        },
        {
          action: 'checkout_group',
          level: 1,
          children: [
            {
              action: 'pv_checkout',
              level:2
            },
            {
              action: 'pv_confirmation',
              level: 2
            }
          ]
        },
        {
          action: 'info_group',
          level: 1,
          children: [
            {
              action: 'pv_policy',
              level:2
            },
            {
              action: 'pv_storeLocator',
              level: 2
            },
            {
              action: 'pv_other_info',
              level:2
            }
          ]
        }
        ,{
          action: 'other_group',
          level: 1,
          children: [
            {
              action: 'pv_other',
              level: 2
            }
          ]
        }
      ]
    }

  ]
}


//----->Get actions in each level of hierarchy
function iterate(current, depth, max_level, array, array2) {

  var children = current.children;
  if (children && (depth < max_level)){
    if(array2 &&(depth>-1)){
      var header = {
        header: current.action,
        level: depth
      }

      array2.push(header)
    }
    for (var i = 0, len = children.length; i < len; i++) {
      iterate(children[i], depth + 1, max_level, array, array2);
    }
  }else{
    if(array)
      array.push(current.action)

    if(array2){
      array2.push({action:current.action, id:current.action, level:depth})
    }

  }
}


function get_action_up_to_level(action_level, with_headers){
  var level = levels.indexOf(action_level)

  var actions_array = [],
      array_group_names = []
  
  // iterate({children:hierarchy}, -1, level, actions_array, array_group_names);
  iterate(hierarchy, -1, level, actions_array, array_group_names);

  var array = with_headers? array_group_names: actions_array

  return array
}


var levels = [general, grouped, actions]
action_hierarchy[general] = get_action_up_to_level(general)
action_hierarchy[grouped] = get_action_up_to_level(grouped)
action_hierarchy[actions] = get_action_up_to_level(actions)

console.log('action hierarchy', action_hierarchy)
current_level = action_hierarchy[level];

//------>Create action-parent array
var create_parent_array = function(o, arr){
     if(o.children != undefined){
        for(n in o.children){
            var child = o.children[n]
            if (child.action && o.action){
              child.parent = o.action;
              arr[child.action]= o.action
            }
            create_parent_array(o.children[n], arr);
        }
     }
}

function get_parent(action){

  if (!action) return 'none'
  
  if (!(action in parents)){
    return 'none'
  }

  return parents[action]

}

parents = {};
create_parent_array(hierarchy, parents)
console.log('parent array', parents)



//-------------> Action Colors ------->

//With New actions
var colors = {

  "addToCart": "#79EA85",
  "removeFromCart": "#EA0000",
  "purchase": "#00AC22",
  "search": "#f4d403",
  "pageview": "#0073B9",
  'offlineModeUsed': '#7F7F7F',
  // 'appStart': '#e0e0e0',
  'appStart': '#d8d6d6',
  "appDisplayError": "#000",
  // "start": "#999",
  // "exit": "#999",
  "start": "#636363",
  "exit": "#636363",
  "extra": 'black',
  'account_group': '#8C564B',
  'browse_group': '#1F77B4',
  'cart_group': '#E377C2',
  'checkout_group': '#9467BD',
  'info_group': '#FF7F0E',
  'other_group': '#7F7F7F',
  'pv_account': '#7b4419',
  'pv_eliterewards': '#b88665',
  'pv_signin': '#b94403',
  'pv_register': '#491a00',
  'pv_plp': '#4795e0',
  'pv_search': '#0199CB',
  'pv_explore':'#10eddc',
  'pv_home':'#10558a',
  'pv_pdp': '#99def9',
  'pv_specialoffers':'#399283',  
  'pv_cart': '#E377C2',
  'pv_checkout': '#9467BD',
  'pv_confirmation': '#C5B0D5',
  'pv_policy': '#FF7F0E',
  'pv_storeLocator': '#FFBB78',
  'pv_other_info': '#FE6E4B',
  'pv_other': '#C7C7C7'       
  
}

var color_id=0;
var scheme = d3.schemeCategory20
var taken_colors = [2,4,5,6]

function hexToRgb(hex) {

  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  rgb =  result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
  ]: null;

  return rgb

}
function get_foreground_color(color){
  var rgb = hexToRgb(color)
  if (rgb){

    var o = Math.round(((parseInt(rgb[0]) * 299) +
                  (parseInt(rgb[1]) * 587) +
                  (parseInt(rgb[2]) * 114)) / 1000);
    return (o > 140) ? 'black' : 'white';
  }else{
    console.log('null rgb for color:', color)
    return 'white'
  }

}

function color(action){
  if (!action) return 'none'
  
  if (!(action in colors)){
    //colors[action] = scheme(color_id)
    while(taken_colors.indexOf(color_id)>-1) color_id=color_id+1;
    colors[action] = scheme[color_id]
    color_id= (color_id ==19)? 0 : color_id+1;

  }

  return colors[action]

}


//---------->Time constants
var time_constants={
  'minutes':60,
  'hours': 60*60,
  'days': 60*60*24
}

var interval = 'hours'
  
// ====================== LOAD CSV FILE ============================ //

//------->Loading in alphabet and sequence files
d3.csv(csv_path+csv_file, function(error, data) {
  if (error) throw error;
  seq_data = data;

    d3.csv(alpha_file, function(error2, alpha_data) {
      if (error2) throw error2;
      
      seq_data.forEach(function(d){

        d.len = +d.len;
        d.index = +d.index;
        // d.start_index = +d.start_index;
        // d.end_index = +d.end_index;
        d.start = parseDate(d.start);
        d.end = parseDate(d.end);
        d.duration = d.end -d.start;
      });


      alphabet = {},
      alphabet_rev = {};
      alpha_data.forEach(function(d){
        alphabet[d.Action] = d.Character;
        alphabet_rev[d.Character] = d.Action
      })
      var start_c = '0',
          exit_c = '1';
      alphabet['start'] = start_c;
      alphabet['exit'] = exit_c;
      alphabet_rev[start_c] = 'start';
      alphabet_rev[exit_c] = 'exit';

      console.log('Alphabet: ', alphabet);
      console.log('first session', seq_data[0])

      data = seq_data;
      //data = client_data;
      console.log('NUMBER OF DATA POINTS', data.length)




      //------> create crossfilter instance and dimensions
      var seqs = crossfilter(data),
          all = seqs.groupAll(),

          len = seqs.dimension(function(d) {return d.len;}),
          l = seqs.dimension(function(d) {return d.len;}),
          lens = len.group(Math.floor),

          hour = seqs.dimension(function(d) {return d.start.getHours() + d.start.getMinutes()/60;}),
          h = seqs.dimension(function(d) {return d.start.getHours() + d.start.getMinutes()/60;}),
          hours = hour.group(Math.floor),

          weekday = seqs.dimension(function(d) {return d.start.getDay();}),
          weekday_filter = seqs.dimension(function(d) {return d.start.getDay();}),
          weekdays = weekday.group(Math.floor),
          
          start = seqs.dimension(function(d) {return d.start}),
          start_filter = seqs.dimension(function(d) {return d.start}),
          starts = start.group(d3.timeDay),

          duration = seqs.dimension(function(d) {return (d.end - d.start)/1000}),
          dur_filter = seqs.dimension(function(d) {return (d.end - d.start)/1000}),
          durations = duration.group(function(d){return Math.floor(d/time_constants[interval])}),

          //create dimension for each level of hierarchy
          general_strings = seqs.dimension(function(d) {return d[general]}),
          general_filter = seqs.dimension(function(d) {return d[general]}),
          general_strings2 = seqs.dimension(function(d) {return d[general]}),
          general_trans_strings = seqs.dimension(function(d) {return remove_duplicates(d[general])}),          

          grouped_strings = seqs.dimension(function(d) {return d[grouped]}),
          grouped_filter = seqs.dimension(function(d) {return d[grouped]}),
          grouped_strings2 = seqs.dimension(function(d) {return d[grouped]}),
          grouped_trans_strings = seqs.dimension(function(d) {return remove_duplicates(d[grouped])}),

          pages_strings = seqs.dimension(function(d) {return d[actions]}),
          pages_filter = seqs.dimension(function(d) {return d[actions]}),
          pages_strings2 = seqs.dimension(function(d) {return d[actions]}),
          pages_trans_strings = seqs.dimension(function(d) {return remove_duplicates(d[actions])}),

          action_strings = general_strings,
          action_filter = general_filter,
          action_strings2 = general_strings2,
          trans_strings = general_trans_strings,
          strings_grouped = action_strings2.group(),
          trans_grouped = trans_strings.group();

      totalActions = all.reduceSum(function(d){return d.len})
      totalseqs = all.reduceCount()
      console.log('total # of actions: ', totalActions.value())
      console.log('total # of seuences: ', totalseqs.value())

      //store dimensions for each level of hierachy
      var action_filter_dimensions = {};

      action_filter_dimensions[general] = {
          action_strings: general_strings, 
          action_filter: general_filter,
          action_strings2: general_strings2, 
          trans_strings: general_trans_strings
        }
      action_filter_dimensions[grouped]={
          action_strings: grouped_strings,
          action_filter: grouped_filter, 
          action_strings2: grouped_strings2, 
          trans_strings: grouped_trans_strings
        }
      action_filter_dimensions[actions] = {
          action_strings: pages_strings,
          action_filter: pages_filter, 
          action_strings2: pages_strings2, 
          trans_strings: pages_trans_strings
        }
   
      var dimensions = [len, l, hour, h, weekday, weekday_filter, start, start_filter, duration, dur_filter, general_strings, general_filter, general_strings2, general_trans_strings, grouped_strings, grouped_filter, grouped_strings2, grouped_trans_strings, pages_strings, pages_filter, pages_strings2, pages_trans_strings ]
      var OG_dimensions = dimensions.length;

      
      // -----> set up button and interaction functionality

      $('#dropdown .dropdown-menu').on({
          "click":function(e){
            e.stopPropagation();
          }
      });

      $('.dropdown-radio').find('input').change(function() {
        var dropdown = $(this).closest('.dropdown');
        var radioname = $(this).attr('name');
        var checked = 'input[name=' + radioname + ']:checked';
        
        //update the text
        var checkedtext = $(checked).closest('.dropdown-radio').text();
        dropdown.find('button').text( checkedtext );
      });

      $('.level_button').find('input').change(function() {
        var dropdown = $(this).closest('.dropdown');
        var radioname = $(this).attr('name');
        var checked = 'input[name=' + radioname + ']:checked';
        
        //update the text
        var checkedtext = $(checked).closest('.dropdown-radio').text();
        dropdown.find('button').text( checkedtext );
      });


      $('#general').click(function() {
          $('#load').show();
         
          change_level_button('#general')
          setTimeout(function() {
              change_level(general)
              $('#load').hide();
              
          }, 1000);
      });
      $('#grouped').click(function() {
          $('#load').show();
          change_level_button('#grouped')
          setTimeout(function() {
              change_level(grouped)
              $('#load').hide();
          }, 2000);
      });
      $('#pages').click(function() {
          $('#load').show();
          change_level_button('#pages')
          setTimeout(function() {
              change_level(actions)
              $('#load').hide();
          }, 3000);
      });

      $('.interval_button').click(function(){
        $('.interval_button').prop('disabled', false);
        $(this).prop('disabled', true);
        var t = $(this).text()
        change_time_interval(t)

      })

      $('#collapse_contains').on('shown.bs.collapse', function () {
        update_action_transition_graph()
      });

      $('#collapse_details').on('shown.bs.collapse', function () {
        print_sequences()
      });

      $('.info-toggle').click(function(){
        var panel= $(this)
        var panel_header = panel.parent()
        panel_header.toggleClass('no-padding')
        panel.find('.icon').toggleClass('icon-adjust')
      })
      
      $(".panel-left").resizable({
        handleSelector: ".splitter",
        resizeHeight: false,
        stop:function(event, ui){
          resize_windows()
        }
      });

      // d3.selectAll("#sequence_details")
      //   .on("click", print_sequences);


      d3.select("#range_button")
        .on("click", show_range_builder);
      //d3.select("#build_filter_button")
      d3.select("#filter_view")
        .on("click", show_filter_builder)
      d3.select("#partition_view")
        .on("click", show_partition_builder);
      d3.select("#contains_button")
        .on("click", show_contains_builder);
      d3.select("#remove_button")
        .on("click", remove_operation);
      d3.select("#clear_button")
        .on("click", clear_all);

      d3.select("#toggle_oManager")
        .on("click", toggle_operation_manager);
      d3.select("#close_oManager")
        .on("click", toggle_operation_manager);
      
      d3.select("#tree_info_button")
        .on("click", toggle_tree_info_view);
      d3.select("#path_button")
        .on("click", show_path_only);
      
      d3.select("#addPartition_button")
        .on("click", add_partition_bar);
      d3.select("#removePartition_button")
        .on("click", remove_partition_bar);
      d3.select("#applyPartition_button")
        .on("click", create_partition);

      d3.select("#full_range_opt")
        .on("click", update_to_full_range);
      d3.select("#current_range_opt")
        .on("click", update_to_current_range);
      d3.select("#applyFilter_button")
        .on("click", create_range_filter);
      d3.select("#range_not_button")
        .on("click", create_not_range_filter)
      
      d3.select("#add_node_button")
        .on("click", add_action_node);
      d3.select("#no_links_button")
        .on("click", no_links)
      d3.select("#apply_contains_operation")
        .on("click", apply_contains_filter)
      d3.select("#apply_funnel_button")
        .on("click", apply_funnel)
      d3.select("#remove_node_button")
        .on("click", remove_action_node)
      d3.select("#add_nonCons_link_button")
        .on("click", add_nonCons_link)
      d3.select("#add_cons_link_button")
        .on("click", add_cons_link)
      d3.select("#toggle_many_button")
        .on("click", toggle_one_or_many)
      d3.select("#contains_not_button")
        .on("click", create_not_filter)
      d3.select("#clear_pb_button")
        .on("click", clear_contains_builder)


      d3.select("#incoming_links")
        .on("click", update_to_incoming_links);
      d3.select("#outgoing_links")
        .on("click", update_to_outgoing_links);

      // d3.select("#print_sequences")
      //   .on("click", show_detailed_view);
      d3.select("#group_sequences")
        .on("click", group_sequences);
      d3.select("#transitionize_sequences")
        .on("click", transitionize_sequences);
      d3.select("#visify_sequences")
        .on("click", visify_sequences);
      d3.select("#include_character")
        .on("click", include_character);
      // d3.select("#close_detailed_view")
      //   .on("click", close_detailed_view);

      // function convertToCSV(objArray) {
      //       var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
      //       var str = '';

      //       for (var i = 0; i < array.length; i++) {
      //           var line = '';
      //           for (var index in array[i]) {
      //               if (line != '') line += ','

      //               line += array[i][index];
      //           }

      //           str += line + '\r\n';
      //       }

      //       return str;
      //   }

      function convertToCSV(objArray){
        const items = objArray.sort(function(a,b) {
          return a.index - b.index

        });
        const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
        const header = Object.keys(items[0])
        let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
        csv.unshift(header.join(','))
        csv = csv.join('\r\n')

        return csv
      }


      function download_segment_csv(data){
        csvContent = convertToCSV(data)
        download(csvContent, "segment.csv")
       

      }

      d3.select("#download_segment")
        .on("click", function(d) {
          console.log(dimensions[0].top(Infinity))
          //Going to be sorted by length (longest -> shortest)
          download_segment_csv(dimensions[0].top(Infinity))
        });

      var charts = [

            barChart()
            .dimension(duration)
            .filter_dimension(dur_filter)
            .dim_name('Duration (hours)')
            .category('time')
            .group(durations)
            .round(Math.round)
            .x(d3.scaleLinear()
            //.domain([0, 30 ])
            .rangeRound([0, 10])),

            barChart()
            .dimension(hour)
            .filter_dimension(h)
            .dim_name('Hour of the day')
            .category('time')
            .group(hours)
            .round(Math.round)
          .x(d3.scaleLinear()
            .domain([0, 24])
            .rangeRound([0, 240])),

          barChart()
            .dimension(weekday)
            .filter_dimension(weekday_filter)
            .dim_name('Weekday (Sunday:0)')
            .category('time')
            .group(weekdays)
            .round(Math.round)
          .x(d3.scaleLinear()
            .domain([0, 6])
            .rangeRound([0, 70])),

          barChart()
            .dimension(start)
            .filter_dimension(start_filter)
            .dim_name('Date')
            .category('time')
            .group(starts)
            .round(d3.timeDay.round)
          .x(d3.scaleTime()
            //.domain([new Date(2017, 0, 24), new Date(2017, 3, 3)])
             .rangeRound([0, 225])),

          barChart()
            .dimension(len)
            .filter_dimension(l)
            .dim_name('# of actions')
            .category('count')
            .group(lens)
            .round(Math.round)
            .x(d3.scaleLinear()
            //.domain([0, 30])
            .rangeRound([0, 140]))

      ]

      var OG_charts = charts.length


      var chart = d3.selectAll(".range_chart")
                    .data(charts)
      
      var all_charts = d3.selectAll(".range_chart")
                    .on('click', function(d) {
                 
                      update_selected_chart(d3.select(this));
                      
                    });
     
     

      var total_size = all.reduceCount().value(),
          original_size = total_size;
                   
      renderAll();


      
      

      function change_level(l){

        
        color_id =0
        level = l
        current_level = action_hierarchy[level]
        n_actions = current_level.length-2
        
        action_strings = action_filter_dimensions[level].action_strings
        action_strings2 = action_filter_dimensions[level].action_strings2
        trans_strings = action_filter_dimensions[level].trans_strings

        trans_grouped = trans_strings.group()
        strings_grouped = action_strings2.group()

        clear_contains_builder()
        update_action_transition_graph()
        populate_legend()
        populate_action_count_dropdown()
        update_action_list_data()
        clear_adjacency_chart_data()
        update_horizontal_chart_data()
        print_sequences()
      }
      
      function change_level_button(id){
        $('.level_button').prop('disabled', false);

        $(id).prop('disabled', true);
        //update the text
        var checkedtext = $(id).text();
        $('#level_label').text( checkedtext );
      }

      function change_time_interval(t){
        new_selection = true
        d3.select('#duration_chart').select('svg').remove();
        interval= t 
        
        var constant = time_constants[interval]

        durations = duration.group(function(d){return Math.floor(d/constant)});

        var dur_chart = charts[0]
        dur_chart.dim_name('Duration (' + t +')')
        dur_chart.group(durations)
        
        renderAll();
        //rerender_charts()
        new_selection=false
      }
      

      //======================= Node Link (Action Transition Graph) ==========================//
      var nl_graph_data = {nodes:[], links: []},
          nl_width = 250,
          nl_height= 250;

      var nl_svg = d3.select("#node_link").append("svg")
                      .attr("width", nl_width)
                      .attr("height", nl_height)


      var strokeScale = d3.scaleLinear().domain([0,100]).range([1,6]).clamp(true);
      var small = {}
          small[general] =5
          small[grouped]= 10
          small[actions] = 15
      
      var link_type = 'outgoing',
          hover_selection,
          hover_color= '#5e6063',
          positions = {};

      //----> actions at the bottom
       positions[general] = {
          'start': {x:197, y:90},
          'appStart': {x:197, y:124},
          'appDisplayError': {x:261,y:153},
          'offlineModeUsed':{x:135,y:153},
          'removeFromCart': {x:244, y:260},
          'addToCart': {x:139,y:260},
          'purchase':{x:276,y:220},
          'search':{x:108, y:220},
          'pageview': {x:193,y:192},
          'exit': {x:191, y:286}

        }

      positions[grouped] = {
          'start': {x:141, y:47},
          'appStart': {x:140, y:94},
          'appDisplayError': {x:256,y:112},
          'offlineModeUsed':{x:51,y:114},
          'removeFromCart': {x:211, y:350},
          'addToCart': {x:71,y:345},
          'purchase':{x:270,y:308},
          'search':{x:29, y:315},
          'exit': {x:130, y:368},
          'browse_group': {x:115, y:173},
          'cart_group': {x:213, y:260},
          'checkout_group': {x:269, y:198},
          'info_group': {x:36, y:256},
          'other_group': {x:33, y:194},
          'account_group': {x:198, y:175}
        }

      positions[actions] = {
          'start': {x:195, y:-290},
          'appStart': {x:184, y:-240},
          'appDisplayError': {x:321,y:-238},
          'offlineModeUsed':{x:58,y:-233},
          'removeFromCart': {x:317, y:176},
          'addToCart': {x:61,y:165},
          'purchase':{x:380,y:141},
          'search':{x:-1, y:138},
          'exit': {x:192, y:199},
          'pv_home': {x:101,y:-156},
          'pv_explore': {x:220,y:-96},
          'pv_specialoffers': {x:230,y:-155},
          'pv_search': {x:7,y:-141},
          'pv_plp': {x:172,y:-101},
          'pv_pdp': {x:54,y:-95},
          'pv_cart': {x:224,y:59},
          'pv_checkout': {x:376,y:20},
          'pv_confirmation': {x:388,y:60},
          'pv_signin': {x:412,y:-159},
          'pv_account': {x:341,y:-151},
          'pv_register': {x:404,y:-95},
          'pv_eliterewards': {x:347,y:-63},
          'pv_storeLocator': {x:59,y:39},
          'pv_policy': {x:106,y:77},
          'pv_other_info': {x:21,y:76},
          'pv_other': {x:-3,y:-26}


        }


      var nl_graph= cytoscape({
          container: document.querySelector('#cy'),
          boxSelectionEnabled: false,

          style: cytoscape.stylesheet()
            .selector('node')
              .css({
                'content': 'data(action)',
                'width': 18,
                'height': 18,
                'text-halign': 'center',
                'font-size': 12,
                'background-color':'data(color)'
              })
            .selector('edge')
              .css({
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
                'target-arrow-color': 'darkgray',
                'line-color': 'darkgray',
                'font-size': 12,
                'width': 1
                //'label': 'data(value)'
              })
            .selector('.selected')
              .css({
                
                'border-width': 2,
                'border-style': 'solid',
                'border-color': 'black'
              })
            .selector('.hover-selected')
              .css({
                
                'border-width': 2,
                'border-style': 'solid',
                'border-color': hover_color
              })
            .selector('.hover-mouseover')
              .css({
              'opacity':0.8,
              'text-opacity':1
            })
            .selector('.invisible')
              .css({
                'opacity': 0
              })
            .selector('.fake')
              .css({
                'opacity': 0
              })
            .selector('.faded')
              .css({
                'opacity': 0.2,
                'text-opacity': 0.25
              })
            .selector('.orphan')
              .css({
                'opacity': 0.5
              })
            .selector('$node > node')
              .css({
                'border-width': 0.5,
                'content': ' '

              })



        });;

      d3.select("#min_percent").on("input", function() {
        update_min_percent(+this.value);
      });

      function update_min_percent(d){
        set_min_percent(d)
        
        update_action_transition_edges(d)

      }

      function set_min_percent(d){
        d3.select("#min_percent-value").text(d);
        d3.select("#min_percent").property("value", d);

      }

      

      
      function update_action_transition_nodes(d){
        if (hover_selection){
          nl_graph.nodes('#'+hover_selection).removeClass('hover-selected')
        }
        if (d){
          hover_selection = d.action; 
          nl_graph.nodes('#'+hover_selection).addClass('hover-selected')
        }else{
          hover_selection=null;
        }

      }

    
      function update_action_transition_edges(min_percent){
        if(!arguments.length){ min_percent = d3.select("#min_percent").property("value")}
        //nl_graph.edges().addClass('visible')
        nl_graph.edges().removeClass('invisible')
        nl_graph.edges().removeClass('small')
        nl_graph.edges().removeClass('visible')

        nl_graph.edges(!'.fake').forEach(function(e){
          var data = e.data()

          var edge_value = data[link_type]

          if (edge_value){
            e.css('width', strokeScale(edge_value))
          }

          // if (data.invisible ){
          //   e.addClass('invisible')
          // }else 
          if (edge_value < min_percent){
            e.addClass('small')
            e.removeClass('faded')
            e.addClass('invisible')
          }
          else{
            if (!(data.invisible)){
              e.addClass('visible')
            }
          }
        })

        var node = nl_graph.nodes('.selected')

        if (node.length>0){
          nl_graph.nodes('.isChild').addClass('faded');
          nl_graph.edges('.visible').addClass('faded')

          nl_graph.edges('.fake').removeClass('faded')

          var neighborhood_edges = node.connectedEdges('.visible')
          var neighborhood_nodes = neighborhood_edges.connectedNodes();
          //neighborhood.removeClass('faded');
          neighborhood_edges.removeClass('faded');
          neighborhood_nodes.removeClass('faded');
        }
      }

     
      function update_to_incoming_links(){
        link_type = 'incoming'
        update_action_transition_edges()

      }

      function update_to_outgoing_links(){
        link_type = 'outgoing'
        update_action_transition_edges()

      }

      function draw_action_transition_graph(node_link_data){

        console.log('Drawing action transition graph', node_link_data)

        //$('#outgoing_links').prop('checked', true)
        //link_type = 'outgoing'
        
        //change size of graph depending on hierarchy level
        var size = (level == general)? 250: (level == grouped)? 300: 350;

        nl_width = size
        nl_height = size

        nl_svg.attr("width", nl_width)
                      .attr("height", nl_height)

        nl_graph.zoomingEnabled(true);

        $('#cy').css('height',nl_height);
        $('#cy').css('width', nl_width);

        nl_graph.resize()

        //remove all elements
        nl_graph.elements().remove()

        //create data for graph
        node_link_data.links.forEach(function(l,i){
          node_link_data.nodes.forEach(function(n){
            l.id = i;
            if (n.id == l.source) l.source = n;
            if (n.id == l.target) l.target = n;

          })

        })

        //add parent nodes
        if (level == grouped){
          nl_graph.add({group:"nodes", data:{ action: 'pageview', id:'pageview', color:'white'}})
        }else if (level == actions){
          nl_graph.add({group:"nodes", data:{action:'pageview', id:'pageview', color:'white'}})
          nl_graph.add({group:"nodes", data:{action:'account_group', id:'account_group', color:"white", parent:"pageview"}})
          nl_graph.add({group:"nodes", data:{action:'cart_group', id:'cart_group', color:"white", parent:"pageview"}})
          nl_graph.add({group:"nodes", data:{action:'checkout_group', id:'checkout_group', color:"white", parent:"pageview"}})
          nl_graph.add({group:"nodes", data:{action:'browse_group', id:'browse_group', color:"white", parent:"pageview"}})
          nl_graph.add({group:"nodes", data:{action:'other_group', id:'other_group', color:"white", parent:"pageview"}})
          nl_graph.add({group:"nodes", data:{action:'info_group', id:'info_group', color:"white", parent:"pageview"}})
        }

        var nodes = node_link_data.nodes.map(function(n){
          n.color = color(n.action)
          var node ={group:"nodes", data:n}

          if(n.action.includes('group')){
            n.parent = 'pageview'
          }
          if(n.action.includes('pv_')){
            n.parent = get_parent(n.action)
          }

          if (n.fx){
            n.size = 9;
            n.end = true;
            if (n.action == 'start')
              node.position = {x:nl_width/2, y:0}
            else if (n.action == 'exit')
              node.position = {x:nl_width/2, y:500}
            //node.position ={x:n.fx, y:n.fy}
          }

          if (level in positions){
            node.position = positions[level][n.action]
          }

          nl_graph.add(node)
          return node
        })


        var edges = node_link_data.links.map(function(e){
          var incoming = (e.into_target_percent >1)? e.into_target_percent: 1;
          var outgoing = (e.percent >1)? e.percent: 1; 
          var edge = {group:"edges", data:{source: e.source.id, target:e.target.id, value: outgoing, incoming:incoming, outgoing:outgoing}}

          nl_graph.add(edge)

          return edge

          })

        if (edges.length>0){
          nodes.forEach(function(n){

            edges.push({data:{source: 'start', target:n.data.id, value: 0, invisible:true}})
            edges.push({data:{source: n.data.id, target:'exit', value: 0, invisible:true}})
            nl_graph.add({group:"edges", data:{source: 'start', target:n.data.id, value: 0, invisible:true}})
            nl_graph.add({group: "edges", data:{source: n.data.id, target:'exit', value: 0, invisible:true}})
          })
        }

        set_min_percent(small[level])

        //set styling for edges
        nl_graph.edges().forEach(function(e){
          var data = e.data()
          var edge_value = data[link_type]

          if (edge_value){
            e.css('width', strokeScale(edge_value))
          }

          if (data.invisible ){
            e.addClass('fake')
          }else if (edge_value < small[level]){
            e.addClass('small')
            e.addClass('invisible')
          }else{
            e.addClass('visible')
          }
        })

        //set styling for nodes
        nl_graph.nodes('$node > node').forEach(function(n){
          var data = n.data();
          data.isParent = true;

          n.css('border-color', color(data.id))
        })
        
        nl_graph.nodes().forEach(function(d){
          var data = d.data();         
          var deg = d.connectedEdges('.visible').length;
          if(d.isParent()){
            d.addClass('isParent')
          }else{
            d.addClass('isChild')
            if (deg>0){
            d.addClass('hasEdges')
            d.removeClass('orphan')
            }else{
              d.removeClass('hasEdges')
              d.addClass('orphan')
            }
          }

          if (data.size){
            d.css('width', 9)
            d.css('height', 9)
          }

          if (!data.end){
            d.addClass('actions')
          }else{
            d.addClass('end')
          }

        })

        //Apply Layout

        //--------->FORCE DIRECTED LAYOUR
        // var layout  =nl_graph.layout({
        //         name: 'cola',
        //         flow: {"axis":"y", "left":"start", "right":"exit", "gap":500, "equality":"true"},
        //         unconstrIter: 7,
        //         userConstIter: 7,
        //         allConstIter: 7,
        //         avoidOverlap:true,
        //         //edgeLength:175, 
        //         edgeLength:150, 
        //         fit: true
                   
                

        //       })

        // //$('#cy').hide()
        // $('#load_chart').show()
        // layout.run()

        // layout.on('layoutstop', function(){
        //   resize()
        //   //relocate_orphans()
        //   //$('#cy').show()
        //   $('#load_chart').hide()

        // })

        // function resize(){
        //   nl_graph.zoomingEnabled(true);
        //   nl_graph.resize();
        //   nl_graph.fit(nl_graph.nodes('.hasEdges'))

        // }

        //------>PRESET LAYOUT
         var layout = nl_graph.layout({
          name: 'preset'
        })
        
        nl_graph.nodes().on('mouseover', function(e){
          var node = e.target,
              data = node.data()

          //node.css({'opacity': 0.8})
          node.addClass('hover-mouseover')
          $('html,body').css('cursor', 'pointer');

          
          for(var i=0; i<all_matches.length;i++){
            var m= all_matches[i]
            if (m.action == data.action){
              m.hoverSelected = true;
            }else{
              m.hoverSelected = false;
            }
          }

          update_horizontal_chart(all_matches)
        })

        //Add interactive functions to graph
        nl_graph.nodes().on('mouseout', function(e){
          var node = e.target;

          node.removeClass('hover-mouseover')
          $('html,body').css('cursor', 'default')
          
          all_matches.forEach(function(m){
            m.hoverSelected = false;
          })

          update_horizontal_chart(all_matches)
        })

        nl_graph.on('tap', 'node', function(e){

          var node = e.target;
          //var neighborhood = node.neighborhood(node.connectedEdges('.visible')).add(node);

          select_horizontal_action(node.data())
          var parent= nl_graph.nodes('.selectedParent')
            parent.css('border-width',0.5).css('content', ' ')


          if (node.isParent()){
            node.css('border-width', 5)
            node.css('content', node.data().action)
            node.addClass('selectedParent')
            node = node.descendants();

          }

          nl_graph.elements().removeClass('selected')
          nl_graph.nodes('.isChild').addClass('faded');
          nl_graph.edges('.visible').addClass('faded')

          var neighborhood_edges = node.connectedEdges('.visible')
          var neighborhood_nodes = neighborhood_edges.connectedNodes();
          //neighborhood.removeClass('faded');
          neighborhood_edges.removeClass('faded');
          neighborhood_nodes.removeClass('faded');
          node.addClass('selected')

        });

        nl_graph.on('tap', function(e){
          if( e.target === nl_graph ){
            nl_graph.elements().removeClass('faded');
            nl_graph.elements().removeClass('selected');
            
            nl_graph.edges('.small').removeClass('visible')
            nl_graph.edges('.small').addClass('invisible')

            var parent= nl_graph.nodes('.selectedParent')
            parent.css('border-width',0.5).css('content', ' ')
          }
        });

        //For Debugging and Positioning purposes
        // nl_graph.nodes().on('drag', (function(e){

        //   var node = e.target;
        //   console.log('Dragging', node.data().action);
        //   console.log('position', node.position())
        //   console.log('rendered position', node.renderedPosition())
        // }))

        //Fit graph to viewbox and disable zooming
        nl_graph.zoomingEnabled(true);
        nl_graph.fit(nl_graph.nodes())
        nl_graph.zoomingEnabled(false);

      }

      // ------> NODE LINK DATA

      function get_previous_char(str, char){
        var regex = '[^' + char + ']' + '(?=' + char + ')',
            re = new RegExp(regex, 'g'),
            matches = str.match(re);

        

        return matches;
      }

      function get_next_char(str, char){
        var regex = '' + char + '' + '([^' + char + '])' ,
            re = new RegExp(regex, 'g'),
            matches = str.match(re);

        
        new_matches = [];
        if (matches){
          matches.forEach(function(m){
            new_matches.push(m[1]);
          })
        }


        return new_matches;
      }



      function update_action_transition_graph(){
        
        var node_link_data;

        node_link_data = clear_node_link_data();
        //draw_action_transition_graph(node_link_data);

        node_link_data = update_node_link_data();
        draw_action_transition_graph(node_link_data);

      }

      function clear_node_link_data(){

        nl_graph_data.nodes = [];
        nl_graph_data.links = [];

        return nl_graph_data;


      }

      function update_link_data(action_string, links, pageFunction, reverse){

        var reverse = reverse || false;
        //create edges
        for ( var i =0; i < current_level.length; i++){
          var action = current_level[i],
              char = alphabet[action];

              source = action;

          //console.log('Action: '+ action + ' Char: ' + char);

          var matches = pageFunction(action_string, char);
          
            if (matches){ 
              var total_matches =  matches.length;
              counts = _.countBy(matches, function(char){
                return char;
              });

              for (var c in counts) {
                if (counts.hasOwnProperty(c)) {
                  var target = alphabet_rev[c],
                      count = counts[c];
                      value = count*100/total_matches;

                  if(!target){
                    console.log('target is null for character:', c)
                  }
                  
                  if (reverse){
                    var link = link_exists(links, target, source);
                    
                    if(link){
                      link.into_target_percent = value;
                      //link.into_target_count = count;
                    }else{
                      console.log('WEIRD! link not found for reverse')
                    }
                  }else{

                    links.push({source:source, target:target, percent:value, count:count});
                    
                  }
                }
              }
            }
        }

        return links;

        function link_exists(links, source, target){

          for (var i=0; i <links.length; i++){
            var l = links[i];
            if((l.source == source) && (l.target == target))
              return l;
          }

          return null;
          

        }
      }

      function update_node_link_data(){
        // var nl_nodes = [],
        //   nl_links = [];
        var action_string;
        

        var nodes =[],
            links = [];

         action_string = all.reduce(reduceAdd_concat, reduceRemove_concat, reduceInitial_concat).value().str;    
        //create nodes
        nodes.push({id:"start", action:"start",  fx: nl_width/2, fy: 0});
        nodes.push({id:"exit", action: "exit",  fx: nl_width/2, fy: nl_height});

        for ( var i =0; i < current_level.length; i++){
          var action = current_level[i];
          nodes.push({id:action, action:action});
        }

        current_level.push("start");

        update_link_data(action_string,links, get_next_char);
        current_level.pop();

        current_level.push("exit")
        update_link_data(action_string,links, get_previous_char, true);
        current_level.pop();


        nl_graph_data.nodes = nodes;
        nl_graph_data.links = links;




        return nl_graph_data;

        function reduceInitial_concat() {
            return {
                str: ''
            };
          }

        function reduceAdd_concat(p, v) {
            
            p.str = p.str + start_c + v[level] + exit_c;
          
          return p;

        }

        function reduceRemove_concat(p, v) {
          var index = p.str.length - (v[level].length + 2)

          p.str = p.str.substring(0, index)
          
          return p;

        }
        
        
      }


      function select_action_node(d){
        var links = nl_graph_data.links,
            before_links =[],
            after_links= [];
        if (selected_action_node){
          selected_action_node.selected = false;
        }
        selected_action_node = d;
        d.selected = true;

        update_action_list()
        update_adjacency_chart_data(links);
        update_horizontal_chart(all_matches)
        console.log("Selected action node: ", selected_action_node);

      }

      //============================== End of NODE LINK ================================= //

      

      // ===================== ADJACENCY CHART (butterfly chart) =========================//  

      var margin_ac = {top: 15, right: 15, bottom: 15, left: 15},
        adj_svg_height = 200,
        adj_svg_width = 240,
        width_ac = adj_svg_width - margin_ac.left - margin_ac.right,
        height_ac = adj_svg_height - margin_ac.top - margin_ac.bottom,
        adj_svg = d3.select("#adjacency_chart").append('svg')
                    .attr('width', adj_svg_width)
                    .attr('height', adj_svg_height)
        adjacency_chart = adj_svg.append("g")
                            .attr("transform", "translate(" + margin_ac.left + "," + margin_ac.top + ")");         


      var center_node = {
            x: (width_ac+8)/2,
            y: (height_ac+8)/2
          }
          
      var bar_width = 10,
          //bar_length = 200; **HORIZONTAL
          bar_length = height_ac,
          bar_len = d3.scaleLinear()
                .rangeRound([0, bar_length]),
          selected_adj_node,
          adj_chart_data = {nodes:[], links:[]};
                

      adjacency_chart.append("svg:defs").selectAll("marker")
            .data(["end"])      // Different link/path types can be defined here
          .enter().append("svg:marker")    // This section adds in the arrows
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 20)
            .attr("refY", 0)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .append("svg:path")
              .attr("d", "M0,-5L10,0L0,5")
              .attr("fill", "gray");
                        
      
      var node_radius = 8,
          end_radius = 4;
      // var node_spacing = 32;
      var label_spacing = 13
          node_spacing = (node_radius*2) + label_spacing + 3

      function clear_adjacency_chart_data(){
        if (selected_action_node)
          selected_action_node.selected =false;
        selected_action_node = null;
        adj_chart_data = {nodes:[], links:[]};
        update_adjacency_chart(adj_chart_data);
      }

      function update_adjacency_chart_data(links){

       
        var after_data={type:'after', actions:[], translate:(width_ac - bar_width)},
            before_data ={type:'before', actions:[], translate:0},
            node_data =[before_data, after_data],
            link_data =[],
            x0 = 0,
            total= 0

        if (selected_action_node.isParent){
          var after_actions ={},
              before_actions= {},
              after_total= 0,
              before_total=0;


          links.forEach(function(l){
            var source = l.source.action,
                target = l.target.action;
            if (get_parent(source) == selected_action_node.action){
              //after_links.push(l);
              if (!(target in after_actions))
                after_actions[target] =0;

              var count = l.count;
                
              after_actions[target] += count;
              after_total += count;


            }else if (get_parent(target) == selected_action_node.action){
              if (!(source in before_actions))
                before_actions[source] =0;
                
              before_actions[source] += l.count;
              before_total+= l.count;
            }
            

          })

          for (var a in after_actions){
            var count = after_actions[a]
            after_data.actions.push({action: a,  count:count, percent: count*100/after_total});
          }

          for (var a in before_actions){
            var count = before_actions[a]
            before_data.actions.push({action: a,  count:count, percent: count*100/before_total});
          }


        } else {

          //Gather information from node_link graph
          links.forEach(function(l){

            if (l.source.id == selected_action_node.id){
              //after_links.push(l);
              after_data.actions.push({action: l.target.action,  count:l.count, percent: l.percent});

            }else if (l.target.id == selected_action_node.id){
              //before_links.push(l);
              before_data.actions.push({action: l.source.action, count:l.count, percent: l.into_target_percent});
            }
            

          })
        }


        //create data for After and Before
        node_data.forEach(function(bar_data){

          var x0 = 0,
            total = 0,
            translate = bar_data.translate,
            data = bar_data.actions;


          //create data for nodes and bar
          data = data.sort(function(a,b) {return b.count - a.count});

          if (data.length>6) {
            var extra ={action:'extra', count:0, percent:0, actions:[]};

            for (var i=5; i<data.length; i++){
              var d = data[i];
              extra.count += d.count;
              extra.percent += d.percent;
              extra.actions.push(d)

            }


            data.length = 5
            data.push(extra)

          }


          data.forEach(function(d, i){
            //bar coordinates
            d.translate = translate;
            d.x0 =x0, 
            d.x1= x0+= +d.percent;
            total += d.count;

            //node coordinates
            d.x = (bar_data.type == 'before')? width_ac/7: width_ac*(6/7);
            d.y = ((height_ac - (data.length-1)*node_spacing)/2) + (node_spacing*i);

            if (bar_data.type == 'before'){
              link_data.push({source:d, target:center_node})
            }else{
              link_data.push({source:center_node, target:d})
            }

          })
          bar_data.total = total;

        })

        adj_chart_data.nodes = node_data;
        adj_chart_data.links = link_data;

        update_adjacency_chart(adj_chart_data);
        


      }

      function select_adj_node(d){
        if(d != selected_adj_node){
          if (selected_adj_node ){
            selected_adj_node.selected = false;
          }

          selected_adj_node = d;
          d.selected = true;
        }else{
          d.selected = !d.selected;
        }


        console.log('Selected adjacent node', selected_adj_node);
        update_adjacency_chart(adj_chart_data);

      }


      function update_adjacency_chart(chart_data){

        // if (selected_action_node){
          d3.select("#tooltip").classed("hidden", true);

         
          var link_data = chart_data.links,
            node_data = chart_data.nodes;
          


          bar_len.domain([0,100]);

             var bars = adjacency_chart
              .selectAll(".adjbar")
                  .remove()
                  .exit()
                  .data(node_data)
                  .enter().append("g")
                  .attr("class", "adjbar")
                  .attr("transform", function (d) { return "translate(" + d.translate + ",0)"; })


                  
          var bar= bars.selectAll("rect")
              .remove()
              .exit()
              .data(d =>d.actions)
           
           var bar_enter = bar.enter().append('g')
                            .classed('clickable', true)
                            .on("click", select_adj_node);


            bar_enter.append("rect")
                  .attr("y", function(d){
                      return bar_len(d.x0);
                  })
                  .attr("width", function(d){
                      return bar_width;
                  })
                  .attr("height", function(d){
                      d.height = bar_len(d.x1) - bar_len(d.x0)
                      return d.height;
                  })
                  .attr("fill", function(d) {
                    //return color(d.group);
                    return color(d.action);
                  });

            var bar_update = bar_enter.merge(bar);

            bars.selectAll('rect')
                    .attr('stroke', 'black')
                    .attr('stroke-width', 
                      function(d){return d.selected? 1:0.5}
                      )
                    .attr('stroke-dasharray', function(d, i) {
                      if (d.selected){
                        return '0';
                      }
                      else if (i==0){
                        return '0,' + (2*(bar_width+d.height));
                      }
                      else{
                        return bar_width +',' + (bar_width + 2*d.height);
                      } 
                      
                    })
                    //.attr('stroke', function(d){ return d.selected? "black": "none"})
                    // .each(populate_tooltip)
                    .each(tooltip)


          var links = adjacency_chart.selectAll(".adjlinks")
                      .remove()
                      .exit()
                      .data(link_data)
                      .enter()
                      .append("g")
                      .attr("class", "adjlinks")
     
            links.append("line")
               .attr("class", "link")
               .attr("x1", function(l) {return l.source.x})
               .attr("y1", function(l){return l.source.y})
               .attr("x2", function(l) {return l.target.x})
               .attr("y2", function(l){return l.target.y})
               .attr("marker-end", "url(#end)");

          adjacency_chart.selectAll('.center_node')
                          .remove()
                          .exit()

          if (selected_action_node){
            var adj_node = adjacency_chart.append("g")
                            .attr("class", "center_node")
                            .attr("transform", "translate(" + center_node.x + "," + center_node.y  + ")");

            adj_node.append("circle")
                //.attr("r",node_radius)
                .attr("r", function(d){

                    d = selected_action_node;
                    if(d.action == 'start' || d.action == 'exit')
                      return end_radius
                    else
                      return node_radius

                })
                .style("fill", 
                  //color(selected_action_node.group)
                  color(selected_action_node.action)
                )

            adj_node.append('text')
                .attr('dy', -(node_radius+1))
                .style("font-size", "10px")
                .style("text-anchor", "middle")
                .style('fill', 'black')
                .text(selected_action_node.action)


          }

         var adj_nodes = adjacency_chart.selectAll(".action")
                        .remove()
                        .exit()
                        .data(node_data)
                        .enter().append("g")
                        .attr("class", "action")

          var node = adj_nodes.selectAll("circle")
                            .remove()
                            .exit()
                            .data(d =>d.actions)
          var node_enter =  node.enter()
                            .append('g')
                            .attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")"})
                            .on("click", select_adj_node)
                            // .on("mouseover", select_adj_node)
                            // .on("mouseout", function(d){return select_adj_node(null);});

          node_enter.append("circle")
                //.attr("r",node_radius)
                .attr("r", function(d){
                  if(d.action == 'start' || d.action == 'exit')
                    return end_radius
                  else
                    return node_radius
                })
                .style("fill", function(d){ 
                  //return color(d.group)
                  return color(d.action);
                })

          node_enter.append('text')
                .attr('dy', function(d){
                  if(d.action == 'start' || d.action == 'exit')
                    return -(end_radius+1)
                  else
                    return -(node_radius+1)
                })
                .style("font-size", "10px")
                .style("text-anchor", "middle")
                .style('fill', 'black')
                .text(function(d){return d.action})

          var node_update = node_enter.merge(node);

          node_update.selectAll('circle')
                    .attr('stroke', function(d){ return d.selected? "black": "none"})

        // }

      }


      function tooltip(d){
        
        if (d.selected){
          var bar_position = d.translate
          //var xPosition = (d.translate == 0)? -65 :d.translate + bar_width;
          var xPosition = (d.translate == 0)? 0 :d.translate + bar_width;
          // var yPosition = bar_len(d.x0 +((d.x1-d.x0)/2)) 


          xPosition += margin_ac.left

          var data =[d]

          if (d.action == 'extra') data =data.concat(d.actions)
          
          var text = ''

          data.forEach(function(d, i){
            var t = d3.format(".1%")(d.percent/100) + ', ' + d3.format(",")(d.count);
            if (i>0) t = ' -' + d.action + ': ' + t;
            text = text + t + '<br/>'
          })

          
          d3.select("#tooltip")
              .style("left", xPosition + "px")
              //.style("top", yPosition + "px")
              .select("#value")
              .html(text);


          d3.select("#tooltip").classed("hidden", false);
          var yPosition = bar_len(d.x1) - $("#tooltip").height()
          d3.select("#tooltip")
              .style("top", yPosition + "px")

          if (d.translate==0){
            var xPosition = (-$("#tooltip").width()+ margin_ac.left)
             d3.select("#tooltip")
              .style("left", xPosition + "px")
          }

        }
        
        
      }

      function select_pattern_node(d){
        if (selected_pattern_node){
          selected_pattern_node.selected = false;
        }
        selected_pattern_node = d;
        d.selected = true;



      }

      

      // ========================== Pattern Builder ============================== //
      


      var pattern_data = {nodes:[], links: []},
          selected_pattern_node;

      var node_id = 0;
      var pressed= false,
          consecutive = false;

      function add_action_node(){

        if (selected_action_node){
          new_node = {
            action: selected_action_node.action,
            id: selected_action_node.id + node_id++
          }

          select_pattern_node(new_node);
          pattern_data.nodes.push(new_node);
          draw_pattern_graph(pattern_data);
        }
        else
          console.log('Please select node to add!')
      }

      function remove_action_node(d){
        //ONLY WORKS FOR FUNNEL
        if (selected_pattern_node){
          var nodes = pattern_data.nodes,
              links = pattern_data.links,
              idx = nodes.indexOf(selected_pattern_node);

          //assumes nodes and links were added in order
          nodes.splice(idx);

          for(var i=0; i<links.length; i++){
            var l = links[i];
            if (l.source == selected_pattern_node){
              idx = i;
              break;
            }
          }
          //if its not the first node, remove the previous incoming link
          if (idx>0)
            idx = idx-1;


          links.splice(idx);

          console.log('index of remove', idx);
          console.log('new nodes', pattern_data.nodes);

          select_pattern_node(nodes[idx])

          draw_pattern_graph(pattern_data);
        }else{
          alert('Please select node to remove!');
        }


      }

      function toggle_one_or_many(){


        var many = selected_pattern_node.many;
        
        selected_pattern_node.many = many? !many: true;

        draw_pattern_graph(pattern_data)
        

      }

      function create_not_filter(){
        //toggle_button_color("#contains_not_button")
        pattern_data.not =("not" in pattern_data)? !pattern_data.not : true;
        if($('#apply_funnel_button').is(':disabled'))
          $('#apply_funnel_button').prop('disabled', false);
        else
          $('#apply_funnel_button').prop('disabled', true);
        draw_pattern_graph(pattern_data)
      }

      function clear_contains_builder(){
        pattern_data = {
            nodes: [],
            links: [],
            not: false
        }
        $('#contains_not_button').prop('checked',false)
        $('#apply_funnel_button').prop('disabled', false);

        draw_pattern_graph(pattern_data)
      }

      function add_nonCons_link(){
        //toggle_button_color("#add_nonCons_link_button");
        consecutive = false;
        pressed = true;
        // d3.select("#add_nonCons_link_button").text(function(d){return pressed? 'Complete Pattern': 'Add Non-Consecutive Links'});

      }

      function add_cons_link(){
        //toggle_button_color("#add_cons_link_button");
        consecutive = true;
        pressed = true;
        // d3.select("#add_cons_link_button").text(function(d){return pressed? 'Complete Pattern': 'Add Consecutive Links'});

      }

      function no_links(){
        pressed = false;
      }


      var any_node = {
          action: null
      }

      // --------------> creating Contains Filter
      function copy_node(node){
        //var node_copy = JSON.parse(JSON.stringify(node))
        var node_copy = {}
        node_copy.action = node.action
        node_copy.value = node.value
        node_copy.id = node.id 
        node_copy.fx = node.x;
        node_copy.fy = node.y;
        node_copy.many = ("many" in node)? node.many: false;
        //node_copy.selected = false;

        return node_copy
      }

      function copy_link(link){
        var link_copy = {
            'source': link.source.id,
            'target': link.target.id,
            'value': 0.5,
            'consecutive': link.consecutive
        }
        return link_copy

      }

      function apply_funnel(){

        create_contains_filter(true)
      }

      function apply_contains_filter(){
        create_contains_filter(false)
      }



      function create_contains_filter(funnelize){

        $('#load').show();
        setTimeout(function() {

        reset_charts()


        var nodes = pattern_data.nodes,
            links = pattern_data.links,
            not = ("not" in pattern_data)? pattern_data.not: false;
            regex = '',
            chars= [],
            pattern =[],
            filters = [],
            parent = selected_segment,
            nodes_copy = [],
            links_copy = []
            

        console.log('nodes', nodes)
        console.log('links',links)

        // links.forEach(function(l){
        //   links_copy.push(copy_link(l))
        // })

        if (nodes[0].action != 'start'){
          regex = '.*';
          pattern.push(any_node)
        }

        nodes.forEach(function(n, i){
          nodes_copy.push(copy_node(n))
          var sep,
              c = alphabet[n.action],
              many = n.many | false;
          if (c == exit_c)
            c = '$';
          else if (c == start_c)
            c = '^';

          if( i>0){
            links_copy.push(copy_link(links[i-1]))
          }

          var pattern_node = {
              action: n.action,
              char: c,
              many: many
          }
          if( (n.action != 'start') && (n.action != 'exit')){
            pattern.push(pattern_node)
            chars.push(pattern_node.char); 
          }

          c = many? c+'+' : c;
          sep = links[i]? (links[i].consecutive? '': '.*'): (c=='$'? '':'.*')
          if (sep == '.*')
            pattern.push(any_node);
          regex = regex + c + sep;
          console.log('regex', regex);
          
          if (funnelize){

            if (i < (nodes.length-1)){
              var match = all.reduce(reduceAdd,reduceRemove, reduceInitial).value();



              if (match){
                var size = match.count,
                    filter = {},
                    //funnel = {char: chars.slice(), consecutive:consecutive};
                    funnel = chars.slice();

                if (not)
                  size = total_size - size;

                if(links[i].consecutive)
                  pattern.push(any_node)

                console.log('Regex used for sizing,' , regex)
                selectedFilter.chart = selected_chart;
                selectedFilter.size = size;
                selectedFilter.type = 'contains';
                selectedFilter.char = funnel;
                selectedFilter.regex = regex;
                selectedFilter.not = not;
                selectedFilter.chart = d3.select("#node_link");
                selectedFilter.pattern = pattern;
                //selectedFilter.dim = action_filter_dimensions[level]

                selectedFilter.pattern_data = {nodes: nodes_copy.slice(), links:links_copy.slice(), not:not};



                console.log('pattern created', pattern);
                console.log('creating filter:', selectedFilter);

                //selectedFilter.div = "action_strings";
                selectedFilter.div = level;

                var filter = create_filter(parent);
                parent = filter.children[0];

                if(links[i].consecutive)
                  pattern.pop()

              }
            }

          }


        })

        var match = all.reduce(reduceAdd,reduceRemove, reduceInitial).value();

          if (match){
            var size = match.count,
                filter = {},
                //funnel = {char: chars.slice(), consecutive:consecutive};
                funnel = chars.slice();

            if (not)
              size = total_size - size;

            console.log('Regex used for sizing,' , regex)
            selectedFilter.chart = selected_chart;
            selectedFilter.size = size;
            selectedFilter.chart = d3.select("#node_link");
            selectedFilter.type = 'contains';
            selectedFilter.char = funnel;
            selectedFilter.regex = regex;
            selectedFilter.not = not;
            selectedFilter.pattern = pattern;
            selectedFilter.pattern_data = {nodes: nodes_copy.slice(), links:links_copy.slice(), not:not};

            console.log('pattern created', pattern);
            console.log('creating filter:', selectedFilter);

            // selectedFilter.div = "action_strings";
            selectedFilter.div = level;

            var filter = create_filter(parent);

          }

          $('#load').hide();
        }, 500);
        

        function reduceInitial() {
          return {
              count: 0
          };
        }

        function reduceAdd(p, v) {
          if (v[level].match(regex))
            p.count = p.count + 1;
          
          return p;

        }

        function reduceRemove(p, v) {
          if (v[level].match(regex))
            p.count = p.count - 1;
          
          return p;

        }


      }

      function copy_pattern_data(data){
        var nodes_copy =[];
        data.nodes.forEach(function(n, i){
          nodes_copy.push(copy_node(n))
        })
        pattern_data = {nodes:nodes_copy, links:data.links.slice(), not:data.not}
        return pattern_data
      }


      var contains_not_color = '#94989e'
      // var contains_not_bg_color = '#c5c8cc'
      var contains_not_bg_color = "#b5b8bc"
      // "#bec2c6"
      // "#a1a4a8"
       // "#9fa3a8"
      // #a6a9ad

      // var pb_svg = d3.select('#pb_svg').append('svg')
      //               .attr('height', 400)
      var pb_height = 400;
      var pb_graph = cytoscape({
          container: document.querySelector('#pb_graph'),
          boxSelectionEnabled: false,
          maxZoom: 1.25,

          style: cytoscape.stylesheet()
            .selector('node')
              .css({
                'content': 'data(action)',
                'width': 18,
                'height': 18,
                'text-halign': 'center',
                'font-size': 12,
                'background-color':'data(color)'
              })
            .selector('edge')
              .css({
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
                'target-arrow-color': '#626468',
                'line-color': '#626468',
                'font-size': 12,
                'width': 1
                //'label': 'data(value)'
              })
            .selector('.dotted')
              .css({
                'line-style': 'dashed'
              })
            .selector('.end')
              .css({
                'width': 9,
                'height': 9
              })
            .selector('.many')
              .css({
                'border-width': 5,
                'border-color': 'data(color)',
                'background-color': 'black'
                // 'width': 9,
                // 'height': 9
              })
            .selector('.selected')
              .css({
                
                'border-width': 2,
                'border-style': 'solid',
                'border-color': 'black'
              })
            .selector('.faded')
              .css({
                'opacity': 0.25,
                'text-opacity': 0.25
              })
        });

      function draw_pattern_graph(node_link_data){
        //console.log('pattern DATA', node_link_data)
        
        pb_graph.zoomingEnabled(true);

        //var current_width = d3.select('#pb_graph').node().clientWidth,
        var current_width = $('#pb_graph').width()

        $('#pb_graph').css('height', pb_height);
        $('#pb_graph').css('width', current_width);
        pb_graph.resize()

        pb_graph.elements().remove()
        

        node_link_data.links.forEach(function(l,i){
          node_link_data.nodes.forEach(function(n){
            l.id = i;
            if (n.id == l.source) l.source = n;
            if (n.id == l.target) l.target = n;

          })

        })

        node_link_data.nodes.forEach(function(n){
          n.color = color(n.action)

          var node ={group:"nodes", data:n}

          pb_graph.add(node)
        })

        node_link_data.links.forEach(function(e){


          var value = (e.percent >1)? e.percent: 1; 

          var edge = {group:"edges", data:{source: e.source.id, target:e.target.id, consecutive:e.consecutive}}
          pb_graph.add(edge)

        })



        $('#pb_graph').css('height',pb_height);

        if(node_link_data.not){
          $('#pb_graph').css('background-color',contains_not_bg_color);
          $('#contains_not_button').prop('checked',true)
          $('#apply_funnel_button').prop('disabled', true);
        }
        else{
          $('#pb_graph').css('background-color',"");
          $('#contains_not_button').prop('checked',false)
          $('#apply_funnel_button').prop('disabled', false);
        }
        
        var layout = pb_graph.layout({
          name: 'dagre'
        })

        layout.run();

        pb_graph.edges().forEach(function(e){
          var data = e.data()

          if(!data.consecutive){
            e.addClass('dotted')
          }
        })

        pb_graph.nodes().forEach(function(n){
          var data = n.data()

          pb_graph.elements().removeClass('selected')
          if(data.selected)
            n.addClass('selected')

          if(data.many){
            n.addClass('many');
          }
          if((data.action=='start') || (data.action=='exit')){
            n.addClass('end');
          }
        })

        pb_graph.on('tap', 'node', function(e){



          var node = e.target;
          var neighborhood = node.neighborhood().add(node);



          select_pattern_node(node.data())

          pb_graph.elements().removeClass('selected')
          node.addClass('selected')
        });

        pb_graph.zoomingEnabled(false);
      }

      // ============================ Action List ============================ //

      var al_data = []
      $('#action_list').css('height', pb_height)
      var al_svg = d3.select("#action_list").append('svg')
                    .attr('width', 110)
                    .attr('height', pb_height)
                    .attr('transform', "translate(0,10)")
                    //.attr('height', 175)



      var al_actions = al_svg.append('g')
                        .attr("transform", "translate(" + (node_radius*2) + "," + ((node_radius*2)+2) + ")")
      
      update_action_list_data()

      function update_action_list_data(){
        var height = (current_level.length + 2)*node_spacing;
        al_svg.attr('height', height )
        
        //var data = current_level.map(function (action) { return { action: action, id: action}; });
        var data = get_action_up_to_level(level,true)
        
        data.unshift({action:'exit', id:'exit', level: 0})
        data.unshift({action:'start', id:'start', level:0})
        
        al_data = data;

        var height = (data.length + 2)*node_spacing;
        al_svg.attr('height', height )

        update_action_list()
      }

      function update_action_list(){

        // var data = current_level.map(function (action) { return { action: action, id: action}; });
        var data = al_data;

        var action = al_actions.selectAll('.action-list')
                            .remove()
                            .exit()
                            .data(data)
        var spacing = 0;
        var al_action = action.enter().append('g').attr('class', 'action-list')
        var action_enter = al_action.append('g')
                            .attr('class', function(d){return d.header? 'header': 'action'})
                            //.attr("transform", function(d, i){return "translate(" + 0 + "," + (node_radius*3)*i + ")" })
                            .attr("transform", function(d, i){
                              var hTranslate= d.level? d.level*(node_radius): 0;
                              var vTranslate =0;
                              if(i != 0){
                                vTranslate = d.header? (node_spacing/1.5): node_spacing
                              }
                              spacing+=vTranslate
                              return "translate(" + hTranslate + "," + spacing + ")"; 
                            })
                            
        al_actions.selectAll('.action')
                            .on("click", select_pattern_action_node)

        action_enter.append('circle')
              .attr("r", function(d){
                if(d.header)
                  return 0;
                else if(d.action == 'start' || d.action == 'exit')
                  return end_radius
                else
                  return node_radius
              })
              .attr('fill', function(d){return color(d.action);})

        action_enter.append('text')
            .style('fill', 'black')
            .style("font-size", "10px")
            //.style("text-anchor", "middle")
            .style("text-anchor", "left")
            .attr('dx', -(node_radius+2))
            .attr('dy', function (d){
              var dy = (d.header)? node_spacing/2: 0

              return dy -(node_radius+3);
              //node_radius/2 
              //node_radius
            }
              )
            .text(function(d) {
              var text = d.action? d.action: d.header;
              return text;
            })



        var action_update = action_enter.merge(action)

        action_update.selectAll('circle')
            .attr('stroke', function(d){ return d.selected? 'black': 'none'})


      }

      function select_pattern_action_node(d){

        select_action_node(d)

        if (pressed){
          
          if(pattern_data.nodes.length>0){
            //add link to previously added node
            previous_node_id = selected_pattern_node.id;
            add_action_node();
            current_node_id = selected_pattern_node.id;
            pattern_data.links.push({"source": previous_node_id, "target": current_node_id, "value": 0.5, "consecutive": consecutive});
            draw_pattern_graph(pattern_data);

          }else{
            add_action_node();
          }

        }else{
          clear_contains_builder()
          add_action_node()
        }

      }



      //========================== Detailed View ==================================//
      
      function remove_duplicates(str){
        return str.replace(/[^\w\s]|(.)(?=\1)/g, "");
      }


      var patterns = {};
      function find_patterns(str, patterns){
        var re = /(.+?)\1+/g;
        if(!patterns){
          patterns = {};
        }
        str = remove_duplicates(str);
        while (m = re.exec(str)){
          var patt = m[1],
              reps = m[0].length/m[1].length;

          if(patterns[patt]){
            patterns[patt].push(reps);
          }
          else{
            patterns[patt] = [reps];
          }


        } 
        return patterns

      }

      function find_all_patterns(){

        var p = all.reduce(reduceAdd, reduceRemove, reduceInitial).value().patterns
        var patts = Object.keys(p).map(function(key){
          return {key:key, value: p[key]};
        })
        patts.sort(function(p1, p2){ return p2.value.length - p1.value.length;})

        return patts

        function reduceInitial() {
          return {
              patterns: {}
          };
        }

        function reduceAdd(p, v) {
            p.patterns = find_patterns(v[level], p.patterns);
          
          return p;

        }

        function reduceRemove(p, v) {
          
          return p;

        }


      }
      var transitionized = false,
          grouped_seqs = true;
          visify = false,
          include_character = true;

      var details_data =[],
          count_width = 50,
          hsep = 6;

      var count_scale = d3.scaleLinear().range([1,count_width])
      var seq_svg = d3.select('#sequences_text').append('svg')
      var seq_details = seq_svg.append('g').attr('transform', 'translate(2,' + 20+ ')')
      var seq_counts = seq_details.append('g')

      var seqs_details = seq_details.append('g')
                    .attr('transform', 'translate(' + (count_width+hsep) + ',0)')


      
      function transitionize_sequences(){
        //toggle_button_color('#transitionize_button')
        transitionized = !transitionized
        print_sequences()
      }
      function visify_sequences(){
        //toggle_button_color('#transitionize_button')
        visify = !visify
        if(!visify){
          $('#include_character').prop('disabled', true)
        }else{
          $('#include_character').prop('disabled', false)
        }
        update_sequences()
      }
      function include_character(){
        //toggle_button_color('#transitionize_button')
        include_character = !include_character
        if(!include_character){
          $('#visify_sequences').prop('disabled', true)
        }else{
          $('#visify_sequences').prop('disabled', false)
        }
        update_sequences()
      }

      function group_sequences(){
        //toggle_button_color('#group_button')
        grouped_seqs = !grouped_seqs
        print_sequences()

      }

      var selected_sequence;
      function select_sequence(d){
        if(!selected_sequence){
             selected_sequence = d;
             d.selected = true;
          } 
          else {
             selected_sequence.selected = false;
             // update_sequences(selected_sequence);
             selected_sequence = d;
             d.selected = true;
             
          }

         seq_details.selectAll('.selection_rect')
                  .attr('stroke', function(d){return d.selected? 'black':'none'})


        create_pattern_from_sequence()

      }

      function create_pattern_from_sequence(){
        if (selected_sequence){
          clear_contains_builder()
          var nodes = [{action:'start', id:'start'+node_id++}],
              links = [],
              many = transitionized? true: false;
          var prev_id = nodes[0].id;
          
          selected_sequence.chars.forEach(function(c){
            var action = alphabet_rev[c],
                id =action+node_id++;
            nodes.push({
              action: action,
              id: id,
              many:many
            })
            links.push({
              source:prev_id,
              target:id,
              consecutive:true
            })

            prev_id = id;

          })
          var exit ={action:'exit', id:'exit'+node_id++}
          nodes.push(exit)
          links.push({
              source:prev_id,
              target:exit.id,
              consecutive:true
            })

          pattern_data.nodes = nodes
          pattern_data.links = links
          draw_pattern_graph(pattern_data)
        }
      }

      function update_sequences(){

         var w = transitionized ? 15: 11,
            h = 9,
              max_i=0,
              vsep =h+5;
        
        var seq = seqs_details.selectAll('.seq')
                          .remove()
                          .exit()
                          .data(details_data)
        var seq_enter = seq.enter().append('g')
                          .attr('class', 'seq')
                          .attr('transform', function(d,i){return 'translate(0,' + (i*vsep) +')'})
                          .on('click', select_sequence)


        if (visify){   
          var inc = 2
          seq_enter.append('rect')
                  .attr('class', 'selection_rect')
                  .attr('x',-(2+hsep +count_width))
                  .attr('y', -(h+((inc-2)/2)))
                  .attr('height', h+inc)
                  .attr('width', function(d){return (d.chars.length*(w+1))+4 +count_width+hsep})
                  .attr('stroke', function(d) {return d.selected?'darkgray':'none'})
                  .attr('fill', 'none')



          var seq_bar =  seq_enter.selectAll(".char_bar")
                    .remove()
                    .exit()
                    .data(d => d.chars)
           
          var seq_bar_enter = seq_bar.enter().append('g')
                            .attr('class', 'char_bar')
                            .attr('transform', function(d,i){
                              max_i  = i>max_i? i: max_i;
                              return 'translate(' + (w+1)*i +',' + 0 +')';
                            }) 

          seq_bar_enter.append("rect")
                .attr('y', -(h-1))
                .attr("width", function(d){
                    return w;
                })
                .attr("height", h)
                .attr("fill", function(d) {
                  return color(alphabet_rev[d]);
                })
                .attr("fill-opacity", '1')
                //.attr('stroke', function(d){return transitionized? 'black': 'none'})

          seq_bar_enter.append('text')
                .attr('x', w/2)
                .attr('class', 'seq_text')
                .style('text-anchor', 'middle')
                .text(function(d){
                  return include_character? (transitionized? d + '+':d) : '';
                  //return ''
                }) 
                .attr('fill', function(d){ 
                  var action = alphabet_rev[d];
                  return get_foreground_color(color(action))
                })
        } else{

          var seq_text = seq_enter.append('text')
                            .attr('class', 'seq_text')
                            .style('font-size', '12px')
                            .text(function(d){return d.seq;})   

        }

        var seq_update = seq_enter.merge(seq)

        

        var count = seq_counts.selectAll('.count')
                          .remove()
                          .exit()
                          .data(details_data)

        var count_enter = count.enter().append('g')
                            .attr('class', 'count')
                            .attr('transform', function(d,i){return 'translate(0,' + (i*vsep) +')'})

        var bar =  count_enter.selectAll("rect")
                  .remove()
                  .exit()
                  .data(d => d.count.data)
         
        var bar_enter = bar.enter().append('g')
                          .attr('transform', function(d,i){return 'translate(0,' + (-8) +')'})

        

        bar_enter.append("rect")
              .attr("x", function(d){
                  return count_scale(d.x0);
              })
              .attr("width", function(d){
                  return count_scale(d.x1-d.x0);
              })
              .attr("height", h)
              .attr("fill", function(d,i) {return (i==0)?'lightgray':'steelblue';})



        
        var count_text = count_enter.append('text')
                            .attr('class', 'count_text')
                            .text(function(d){return d.count.value;})

        var width =0,
            h = (details_data.length+1)*15,
            height = (h <200)? 200: h;
            //width= max_i*(w+1) +count_width + 50;
            
        if (visify){
          width= max_i*(w+1) +count_width + 50;

        }else{
          seq_svg.selectAll('.seq_text')
                  .each(function(){
                    var w = this.getComputedTextLength();
                    width = (w>width)? w: width;
                  })
        }

        width = (width < $('#sequences_text').width())? $('#sequences_text').width(): width;

        seq_svg.attr('width', width)
              .attr('height', height)

        $('#sequences_text').css('height', height)


      }

      function print_sequences(){
        details_data = [];
        var current_size = all.reduceCount().value()
        count_scale.domain([0, current_size])

        //var print_n = Infinity;
        var print_n = 1000;

        if($("#sequences").is(':visible')){

          if (grouped_seqs){
            var grouped = transitionized? trans_grouped.top(print_n): strings_grouped.top(print_n)
            //var grouped = trans_grouped.top(Infinity),
                text ="  #  | sequence" + " <br/>" + "___________"+ " <br/>";

            console.log(grouped)

            grouped.forEach(function(g){
              if(g.value != 0){
                text += ' ' + g.value + "  |  " + g.key + " <br/>"
                var count = {value: g.value, data: [{x0:0, x1:current_size-g.value}, {x0:current_size-g.value, x1:current_size}]}
                var seq = g.key;
                details_data.push({count:count, seq:seq, chars: seq.split('') })
              }
            })
          }else{
            var dimData = action_strings.top(print_n)
            var text = "";
            dimData.forEach(function(x){
              var seq = transitionized? remove_duplicates(x[level]): x[level];
              var count = {value: 1, data: [{x0:0, x1:current_size-1}, {x0:current_size-1, x1:current_size}]}
              details_data.push({count:count, seq:seq, chars: seq.split('')})

              text += seq + " <br/>";
            })
          }

          //$("#sequences").show()
          var width = d3.select('#sequences').node().clientWidth - 200
          $("#sequences_text").width(width).height(200)
         
          $("#sequences_text").css("font-size", "12px");
          //$("#sequences_text").html(text)

          if (details_data.length >5000) details_data.length = 5000;
          console.log('number of seq details', details_data.length)
          if (details_data.length >10000){
            visify = false
            $('#visify_sequences').prop('checked', false)
          }else{
            visify = true
            $('#visify_sequences').prop('checked', true)
          }
          update_sequences()

        }
      }
      //=========================== Builder Views ====================================//
      var active_builder_view = null,
          active_view = null;
      // function update_builder_view(view_id){
      //   view_id = view_id || null;
      //   active_builder_view = view_id;
      //   d3.selectAll(".builder")
      //     .style('display', function(d) {
      //       var id = d3.select(this).attr('id');
      //       if (id != active_builder_view)
      //         return 'none';
      //     });
      // }



       function update_range_builder_view(view_id){

        var id = '.nav-pills a[href="#' + view_id + '"]';
        
        $(id).tab('show')

        // view_id = view_id || null;
        // active_builder_view = view_id;
        // d3.selectAll(".range_builder")
        //   .style('display', function(d) {
        //     var id = d3.select(this).attr('id');
        //     if (id != active_builder_view)
        //       return 'none';
        //   });
      }

      //=========================== Info Views ====================================//

      function update_info_view(view_id){
        view_id = view_id || null;
        active_view = view_id;
        d3.selectAll(".info")
          .style('display', function(d) {
            var id = d3.select(this).attr('id');
            if (id != active_view)
              return 'none';
          });
      }

      //------------ Node view ------------- //

      var activeview;
      var text_object = [];

      function show_node_view(selected){
        var d = selected.data;
        update_info_view("info_view");
        if (d.value == 1){
          get_segment_info(selected);
        }else if(d.value == 0){
          get_filter_info(selected);
        }else if(d.value == 2){
          get_partition_info(selected);
        }

      }


      function update_text(view, text_format) {

        var selection = view.selectAll('.filterText')
                    .data(text_object)

        selection.enter()
          .append('text')
          .attr('class', 'filterText')
          .attr("dy", function(d,i){ return i+2 +"em";})
          .style("font-size", "10px")
          .style("text-anchor", "left")
          .style('fill', 'black')
          .text(text_format)

        selection.exit().remove();


      }

       var nv_margin = {top: 20, right:10, bottom: 20, left: 10},
        nv_width = 400 - nv_margin.right - nv_margin.left,
        nv_height = 200 - nv_margin.top - nv_margin.bottom;

      var operation;
      function update_builder_view(o){
        var id = '.nav-tabs a[href="#' + o.type + '"]',
            new_tab = $(id)

        operation = o;

        current_tab =  $("ul#operation_types li.active a")

        if (new_tab[0].id != current_tab[0].id){
          $(id).tab('show')
          $(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
            if (operation){
              show_builder(operation);
              
            }
            
          })

        }else{
          show_builder(operation);
         
        }

      }


      function show_builder(o){
        console.log('SHOWING BUILDER of ', selected)


        if (o.value != 1){

          if (o.value == 0){
            if (o.type == 'contains'){
              clear_contains_builder()
              pattern_data = o.pattern_data
              console.log('drawing builder for following pattern data', pattern_data)
              var copy = copy_pattern_data(pattern_data)
              draw_pattern_graph(copy) 
                
              
            }if (o.type == 'range'){

              update_range_builder_view("r_filter");
              update_filter_data(o)

            }
          } else {

            update_range_builder_view("r_partition");
            var thresholds = o.thresholds;
            update_partitions_data(thresholds.slice(0, thresholds.length -1))
          }


        }
        operation = null;
      }



      //----------- Filter View -------------- //
      var infoLength = 100,
          separation = 40,
          infoRange = [0,infoLength]
          infoScale = d3.scaleLinear().range(infoRange)

      var info_height = 150;

      var rLength = infoLength,
          rRange = [1, rLength],
          iView_hSep = 7;

      var rScale = d3.scaleLinear()
                    .domain([0, original_size])
                    .range(rRange)

      var infoDiv = d3.select('#info_view')

      var nv_svg = infoDiv
                      .append("svg")
                      // .attr("width", nv_width + nv_margin.left + nv_margin.right)
                      // .attr("height", nv_height + nv_margin.top + nv_margin.bottom)
                      //.attr("transform", "translate(" + b_margin.left + "," + b_margin.top + ")");
                      
      var info_view = nv_svg.append("g")
                        .attr("transform", "translate(" + nv_margin.left + "," + nv_margin.top + ")")

      var operation_result_view  = info_view.append("g")
                                  .attr('class', "operation_result_view")
                                  .attr("transform", "translate(" + iView_hSep  + "," + 0 + ")")

      var partition_results_view = info_view.append('g')
                      .attr('class', 'partition_results_view')
                      .attr("transform", "translate(" + iView_hSep  + "," + 0 + ")")

      var operation_view = operation_result_view.append('g')
                      .attr('class', 'operation_view')

      
                      

      var results_view = operation_result_view.append('g')
                      .attr("class", "results_view")
                      .attr("transform", "translate(" + (infoLength+ separation)  + "," + 0 + ")")

  

      var operation_data = [],
          results_data =[],
          info_data = {
            operation_data: operation_data,
            results_data: results_data,
            partition_data: []
            }
      
      //var size_colors = ['black', 'lightgray', 'white']
      //var size_colors = ['#333333', '#B3B3B3','#E6E6E6']
      var size_colors = ['#333333', '#CCCCCC','#E6E6E6']
      //'#e8eaef'

      function get_results_data(o, show_text){
        var result = o.results,
            max_size = original_size,
            out_size = result.out_size,
            in_size = result.in_size,
            result_data =[],
            size_data = [out_size, in_size, max_size],
            x0 = 0;
        

        size_data.forEach(function(s,i){
          x1 = rScale(s)
          result_data.push({
            x0:x0,
            x1: x1,
            color: size_colors[i]
          })
          x0 = x1;
        })

        result.total_size = max_size
        result.node_data = result_data;

        var size = d3.format(",")(out_size),
            rel = d3.format(".1%")(out_size/in_size),
            abs = d3.format(".1%")(out_size/max_size),
            show = show_text


        var labels = {text: ["# of seqs:", "% relative:", "% total:"], show:show},
            values = {text: [size, rel, abs], show:show}
        
        result.text_data = [labels, values]


        return result
      }

      function format_text(value){
        if (typeof value =='number'){
          return d3.format(",.1f")(value);
        }else
          return dateFormat(value);
      }

      function format_range_text(range){

        return '[' + format_text(range[0]) + ', ' + format_text(range[1]) +'[';
      }

      function format_contains_text(char){
        var actions = [];

        if (typeof(char)=='string')
          char = [char]

        
        char.forEach(function(c){
          var a = alphabet_rev[c]
          actions.push(a)
        })
      
        return actions;
      }

      function get_operation_data(o, show_all_text){
        var operation = copy_filter(o),
            operation_data,
            label_text =[],
            value_text =[];

        if (o.type == 'range'){
          infoScale = update_scale(o.range, infoRange)
          operation_data = create_range_filter_data(o, infoScale)
          label_text =['Chart: ', 'Domain: ', 'Filtered: ']
          var chart_div = o.div;
          if(chart_div.includes('duration') && o.interval)
            chart_div += '_' + o.interval;
          var value_text = [chart_div]
          var domain_range = format_range_text(o.range),
              filtered_range = format_range_text(o.extents)
          
          value_text.push(domain_range)
          if(o.not){

            //filtered_range = '~' + filtered_range
            var pos_ranges = convert_neg_to_pos_ranges(o.range, o.extents)
            pos_ranges.forEach(function(r){
              value_text.push(format_range_text(r))
            })
          }else{
            value_text.push(filtered_range)
          }

        } else if (o.type == 'contains'){
          operation_data = create_contains_filter_data(o, infoLength)

          label_text = o.not? ['Not Contains: ']: ['Contains: ']
          value_text = format_contains_text(o.char)
          

        }
        var labels = {text: label_text, show:show_all_text},
            values = {text: value_text, show:show_all_text}
        
        operation.text_data = [labels, values]

        operation.node_data = operation_data;

        return operation
      }

      function update_node_info_data(operations, show_all_text){
        var operation_data = [],
            results_data = [],
            show = show_all_text


        if(operations){
          var n = operations.length;


          operations.forEach(function(o,i){
            if ((i == (n-1)) && !show_all_text)
              show_all_text = true;

            var o_data = get_operation_data(o, show_all_text)
            operation_data.push(o_data)

            var r_data = get_results_data(o, show_all_text)
            results_data.push(r_data)

          })

        }

        info_data.operation_data= operation_data
        info_data.results_data = results_data

        return info_data
      }


      function get_filter_info(selected){
        var d = selected.data,
            operation = d.operation,
            chart = operation.chart,
            show_all_text = true;

        // update_selected_chart(chart);
        select_chart(chart)
        info_data.partition_data = [] 
        info_data = update_node_info_data([operation], show_all_text)

        update_node_info_view(info_data)

      }

      function get_partition_info(selected){

        var d = selected.data
            operation = d.operation,
            range = operation.current_range,
            chart = operation.chart,
            operations = operation.results,
            show_all_text = true,
            threshold_ranges = operation.threshold_ranges

        //update_selected_chart(chart);
        select_chart(chart)

        info_data = update_node_info_data(operations, show_all_text)


        infoScale = update_scale(range, infoRange) 
        partition_data = create_range_partition_data(threshold_ranges, infoScale);
        o_data = copy_filter(operation)
        o_data.node_data = partition_data


        var result_ranges =[],
            x0 = 0,
            x1 = 0;

        operations.forEach(function(o){
          x1 = x0 + o.size
          result_ranges.push([x0,x1])
          x0 = x1;  
        })

        var domain_range = [0, x1]

        infoScale = update_scale(domain_range, infoRange)
        result_data = create_range_partition_data(result_ranges, infoScale);
        r_data = copy_filter(operation)
        r_data.node_data = result_data

        info_data.partition_data = [o_data, r_data]

        console.log('info partition data', partition_data)
        console.log('result partition data', result_data)

        shown_idx = []
        for(var i=0; i < operations.length;i++){
          shown_idx.push(i)
        }

        update_node_info_view(info_data)
        
      }

      function get_segment_info(selected) {
        var d = selected.data,
            filters = d.filters,
            operations = d.operations,
            operation_data = [],
            results_data = [],
            show_all_text = false

        info_data.partition_data = []
        info_data = update_node_info_data(operations, show_all_text )
        var n_ops = info_data.operation_data.length
        shown_idx = (n_ops>0)?[n_ops -1]: []
        update_node_info_view(info_data)


      }

      var shown_idx =[]
      function show_operation_text(i){
        console.log('now show text of operation ' + i + ' with data: ')

        var idx = $.inArray(i, shown_idx)
        if (idx>-1){
          shown_idx.splice(idx, 1)
        }else{
          shown_idx.push(i)
          shown_idx.sort();
        }

        console.log('shown idx', shown_idx)

        info_data.operation_data[i].text_data.forEach(function(t){
          t.show = !t.show;
        })
        info_data.results_data[i].text_data.forEach(function(t){t.show=!t.show})
        update_node_info_view(info_data)

      }

      // var operation_info_bkgrd = '#f2f6ff';
      var operation_info_bkgrd = '#ffffff';

      function update_node_info_view(data){

        console.log('NODE INFO VIEW DATA', data)
        var n_operations = data.operation_data.length
        //var sep = sep |1;
        var sep = 1
        var max_vTranslate;


        // //Results View

        var vTranslate = (data.partition_data.length>0)? oWidth*3:0;

        
        var op_result_view = info_view.select('.operation_result_view')
                             .attr("transform", "translate(" + iView_hSep + "," + vTranslate + ")")


        //------------------------ PARTITION VIEW --------------------
        var pData = data.partition_data

        var presult = partition_results_view.selectAll(".presult")
          .remove()
          .exit()
          .data(pData);

        // Enter any new nodes at the parent's previous position.
        var presultEnter = presult.enter().append("g")
            .attr("class", "presult")
            .attr("transform", function(d, i) { return "translate(" + (i*(infoLength+ separation))  + "," + 0 + ")"; })
            .append("g")
            .attr('class', function(d,i){return (i==0)? 'range': 'none'})
            .on("click", function(d,i) {
              select_operation_node(d);
            })

        // presultEnter.append('rect')
        //     .attr("width", infoLength)
        //     .attr("height", oWidth)
        //     .attr("fill", 'none')
        //     .attr("stroke", "black")


      
        var bar =  presultEnter.selectAll("rect")
                  .remove()
                  .exit()
                  .data(d => d.node_data)
         
        var bar_enter = bar.enter().append('g')

        

        bar_enter.append("rect")
              .attr("x", function(d){
                  return d.x0;
              })
              .attr("width", function(d){
                  return (d.x1-d.x0);
              })
              .attr("height", oWidth)
              .attr("fill", function(d) {return d.highlighted? "steelblue": "white";})
              .attr("stroke", "black");

        var bar_update = bar_enter.merge(bar);


        
        //------------------------OPERATION SIDE ---------------
        oData = data.operation_data

        
        var operation = operation_view.selectAll(".operation")
            .remove()
            .exit()
            .data(oData);

        // Enter any new nodes at the parent's previous position.
        var operationEnter = operation.enter().append("g")
            .attr("class", function(d,i) {
              var last =   ((i !=0) && (i == (n_operations-1)))? ' last':'';
              return "operation" + last;
            })
            .attr("transform", function(d, i) {
                //spacing for the last result
                //var x = ((i !=0) && (i == (n_operations-1)))? 10:0;
                var x=0;
                var tt = 0;

                shown_idx.forEach(function(idx){
                  if (i ==idx){ tt+=5;}
                  if (i > idx){
                    var textData = oData[idx].text_data[1]
                    var text_height = textData.text.length
                    if(text_height < 3) text_height = 3;

                    tt += (text_height+1)*textHeight;
            
                  }
                })
                max_vTranslate = tt;

                return "translate(" + 0 + "," + (i*(oWidth + sep)+x+tt) + ")";
                })
            .on("dblclick", function(d,i) {
              //select_operation_node(d);
              show_operation_text(i);
            })
            .on("click", function(d,i) {
              select_operation_node(d);
            })

        operationEnter.append('rect')
                      .attr('transform', 'translate(' + (-oWidth - 7) +',' + -4 + ')')
                      .attr('width', 
                        nv_svg.style("width")
                        )
                      .attr('height', function(d,i){ 

                        var text_height = d.text_data[1].text.length
                        if(text_height < 3) text_height = 3;

                        var h = d.text_data[1].show? ((2 + text_height)*textHeight) : 0;

                        return h;
                      })
                      .attr('fill', operation_info_bkgrd)

        var operation_nodes = operationEnter.append('g')
                            .attr("class", function(d) { return d.type; })                  

        operation_nodes.append('rect')
            .attr("width", infoLength)
            .attr("height", oWidth)
            .attr("fill", 'none')
            .attr("stroke", "black")
          

        operationEnter.append('g')
            .attr("class", "info_text")

        //range nodes

        var range_nodes = info_view.selectAll(".range")

        var range_symbol = range_nodes.append('g')
                .attr("transform", function(d) { return "translate(" + (-oWidth -3) + "," + oWidth/2 + ")"; })

        range_symbol.append('circle')
                .attr('cx', oWidth/2)
                .attr('r', oWidth/2 + 1)
                .attr('fill', function(d){
                  if (d.category =='count'){
                    var div = d.div;
                    var action = div.substring(0, div.indexOf('_',3))
                    return color(action)
                  }else{
                    return 'none'
                  }
                })

        range_symbol.append("path")
                .attr('d', function(d){ 

                      var category = d.category;
                      if (category == 'time')
                        return clock_symbol(d);
                      else if (category == 'count')
                        return hash_symbol(d);

                    })
                .attr('fill', 'white')
                .attr('stroke', '#5c616b')

        var bar =  range_nodes.selectAll("rect")
                  .remove()
                  .exit()
                  .data(d => d.node_data)
         
        var bar_enter = bar.enter().append('g')

        

        bar_enter.append("rect")
              .attr("x", function(d){
                  return d.x0;
              })
              .attr("width", function(d){
                  return (d.x1-d.x0);
              })
              .attr("height", oWidth)
              .attr("fill", function(d) {return d.highlighted? "steelblue": "white";})
              .attr("stroke", "black");

        
        range_nodes.append('text')


        var bar_update = bar_enter.merge(bar);



        // contains nodes

        var contains_nodes = operationEnter.selectAll(".contains")


        contains_nodes.append('rect')
            .attr("width", infoLength)
            .attr("height", oWidth)
            
            .attr("fill", function(d){return d.not? contains_not_color: "white"})

        var circles = contains_nodes.append("g")
                      .attr("transform", function(d) { return "translate(" + oRadius + "," + oWidth/2 + ")"; });

        var circle = circles.selectAll("circle")
                      .remove()
                      .exit()
                      .data(d => d.node_data)

        var circle_enter =  circle.enter().append('g')           
        //var radius = (oWidth/2)-1;

        circle_enter.append('circle')
            .attr('r', oRadius)
            //.attr('cx', function(d,i){return i*oRadius*2})
            .attr('cx', function(d){return d.x})
            .attr('fill', function(d){
              return color(d.action);
              //return d.group? color(d.group): "none"
            })

        circle_enter.append('circle')
            .attr('r', 1)
            .attr('cx', function(d){return d.x})
            .attr('fill', function(d){ return d.many? 'black': 'none'})

        //---------------Results data ------------------------

        var rData = data.results_data

        var result = results_view.selectAll(".result")
            .remove()
            .exit()
            .data(rData);

        // Enter any new nodes at the parent's previous position.
        var resultEnter = result.enter().append("g")
            .attr("class", "result")
            .attr("transform", function(d, i) { 

              //spacing for the last result
              //var x = ((i !=0) && (i == (n_operations-1)))? 10:0;
              var x =0;
              var tt = 0;
              shown_idx.forEach(function(idx){
                  if (i ==idx){ tt+= 5}
                  if (i > idx){
                    var textData = oData[idx].text_data[1]
                    var text_height = textData.text.length
                    if(text_height < 3) text_height = 3;

                    tt += (text_height+1)*textHeight;
                  }
                })
              return "translate(" + 0 + "," + (i*(oWidth+sep)+x +tt)  + ")"; 
            })
            .on("dblclick", function(d,i) {
              //select_operation_node(d);
              show_operation_text(i);
            })
            .on("click", function(d,i) {
              select_operation_node(d);
            })



        resultEnter.append('rect')
            .attr("width", infoLength)
            .attr("height", oWidth)
            .attr("fill", 'none')
            //.attr("stroke", "black")

        var bar =  resultEnter.selectAll(".size_partition")
                  .remove()
                  .exit()
                  .data(d => d.node_data)
                  .attr('class', 'size_partition')
         
        var bar_enter = bar.enter().append('g')
                          .attr("transform", function(d) { return "translate(" + 0 + "," + oWidth/6 + ")"; })


        bar_enter.append("rect")
              .attr("x", function(d){
                  return d.x0;
              })
              .attr("width", function(d){
                  return d.x1-d.x0;
              })
              .attr("height", oWidth*(2/3))
              .attr("fill", function(d) {return d.color;})


        resultEnter.append('g')
          .attr("class", "info_text")


              //Format Text

        var info_text = operation_result_view.selectAll('.info_text')
                          .attr("transform", "translate(" + 1 + "," + -2 + ")")

        var iText = info_text.selectAll(".iText")
                      .remove()
                      .exit()
                      .data(d => d.text_data)
                      .attr("class", "iText")
                      



        var iTextEnter = iText.enter().append('g')
                          .attr("transform", function(d, i) { return "translate(" + (i*infoLength*0.55) + "," + 0 + ")"; })
                          .attr('class', function(d){return d.show?'show_text': 'no_text'})

        var show_texts = operation_result_view.selectAll(".show_text")

        var text = show_texts.selectAll(".text")
                      .remove()
                      .exit()
                      .data(d => d.text)
                      .attr('class', 'text')

        text.enter()
          .append('text')
          .attr("dy", function(d,i){ return i+3 +"em";})
          // .style("font-size", (textHeight-1)+"px")
          .style("font-size", "10px")
          .style("text-anchor", "left")
          .style('fill', 'black')
          .text(function(d) {return d;})
        var max_tHeight = 0

        nv_svg.selectAll(".info_text").each(function(d){
          var h = this.getBoundingClientRect().height
          max_tHeight = (h>max_tHeight)? h: max_tHeight;
        })

        var max_height = (n_operations +1)*(oWidth+sep) + max_tHeight +25 + max_vTranslate + vTranslate,
            svg_height = max_height > info_height? max_height : info_height;


        nv_svg.attr('height', svg_height)

      }

             

      var dateFormat = d3.timeFormat("%b %e, %y")
      var tree_info_view = false

      function toggle_operation_manager(){
        if($('#operation_manager').hasClass('open'))
        {  
    
          $('#toggle_oManager').removeClass('hidden')
          $('#operation_manager').removeClass('open');
          $('#operation_manager').addClass('hidden');
          $('#tree_view').width('40%')
          $('#sequence_attributes').width('60%')

        }
        else
        {
          $('#toggle_oManager').addClass('hidden')
          $('#operation_manager').width('30%')
          $('#operation_manager').addClass('open');
          $('#operation_manager').removeClass('hidden');
          $('#tree_view').width('20%')
          $('#sequence_attributes').width('50%')
        }

        resize_windows()

      }

      function toggle_panel(){
        if ($('#show_hide_icon').hasClass('glyphicon-chevron-down')){
          $('#show_hide_icon').removeClass('glyphicon-chevron-down')
          $('#show_hide_icon').addClass('glyphicon-chevron-right')

        }else{

          $('#show_hide_icon').addClass('glyphicon-chevron-down')
          $('#show_hide_icon').removeClass('glyphicon-chevron-right')

        }
        
      }

      function toggle_tree_info_view(){
        tree_info_view = !tree_info_view
        d3.select('#tree_info_view').style('display', function(d){return tree_info_view? null: 'none'})

        

      }

      function show_contains_builder(){

         $('#contains_button').on('shown.bs.tab', function () {
        update_action_list()
        draw_pattern_graph(pattern_data);
      });
        

      }

      function show_range_builder() {

        show_filter_builder()


      }
      function show_partition_builder() {

        update_partitions_data();
      }

      function show_filter_builder(){

        // console.log('active range', selected_chart.data()[0].active_range())
        update_filter_data()
      }

      $('#partition_view').on('shown.bs.tab', function () {
          update_partitions_data()
      });

      $('#filter_view').on('shown.bs.tab', function () {
          update_filter_data()
      });

      function create_range_filter(){

        $('#load').show();
        setTimeout(function() {

          if (partitions){
            
            var value1 = partitions[2].value,
                value2 = partitions[1].value,
                value1 = isNaN(parseFloat(value1))? value1: parseFloat(value1),
                value2 = isNaN(parseFloat(value2))? value2: parseFloat(value2),
                extents = [value1, value2],
                not = partitions[1].colored? false: true;

            var selected_chart_data = selected_chart.data()[0];
            if (selected_chart_data.div_id().includes("duration")){
              size_extents = extents.map(function(e){return e*time_constants[interval];})
              selectedFilter.interval = interval

            }else{
              size_extents = extents
            }
            console.log(' Creating range filter with following extents: ' + extents)
            
            var groups = selected_chart.data()[0].group().all()
            var count = 0;

            groups.forEach(function(g){
              if (g.key>=extents[0] && g.key<extents[1]){
                count += g.value;
              }
            })

            // var dimension = selected_chart.data()[0].dimension()
            // dimension.filterAll()
            // dimension.filterRange(size_extents);

            // var size = all.reduceCount().value()
            // if (size != count){
            //   alert('COUNTING DIDNT WORK! count: ' + count + ' size: ' + size)
            // }
            var size = count;


            var prev_size = selected_segment.data.size;

            

            size = not? (prev_size - size): size
            
            selectedFilter.size = size;
            selectedFilter.extents = extents;
            selectedFilter.not = not;
            selectedFilter.chart = selected_chart;
            selectedFilter.div = selected_chart_data.div_id();
            selectedFilter.current_range = selected_chart_data.current_range();
            selectedFilter.range = selected_chart_data.range();
            selectedFilter.category = selected_chart_data.category();
            selectedFilter.type = 'range';

            if(selectedFilter.div.includes('count_chart') ){
              var x = $('#'+selectedFilter.div).find('.close')
              x.prop('disabled', true)
            }

            create_filter()

          }
          $('#load').hide();
        }, 500);


      }

      function create_not_range_filter(){
        //toggle_button_color('#range_not_button')

        partitions.forEach(function(p){
          p.colored = !p.colored
        })

        update_filter_view(false)
      }

      // ------------ Filter Builder ------------------- //
      var partition_width = 5,
            partition_height = 25;

      var b_margin = {top: 20, right:25, bottom: 10, left: 25},
        b_width = 400 - b_margin.right - b_margin.left,
        b_height = 130 - b_margin.top - b_margin.bottom,
        b_range= [0, b_width],
        builder_range,
        partitions =[],
        partitions_data =[],
        extents_data = {}, 
        range_axis,
        rangeHeight = partition_height/2;

      var range_end_input = d3.selectAll("#range_end_value")
      var range_start_input = d3.selectAll("#range_start_value")


      function set_range_end(value){
        console.log('going to set the range end')
        console.log(range_end_bar)
        range_end_bar.value = value;
        range_end_bar.x = builder_range(value);
        extents_data.extents[1] = value;
        update_partition_bars(partitions);
        update_filter_view()
        

      }

      function set_range_start(value){
        console.log('going to set the range start')
        
        range_start_bar.value = value;
        range_start_bar.x = builder_range(value);
        extents_data.extents[0] = value;
        update_partition_bars(partitions);
        update_filter_view()
        

      }

      var partition_input = d3.selectAll("#partition_value")
                

      partition_input.on("input", function(){
              set_partition_value(this.value);
              })

      range_start_input.on("input", function(){
                            set_range_start(this.value)
                  
                          })
      range_end_input.on("input", function(){
              set_range_end(this.value);
              })

       var fb_svg = d3.select("#build_filter_view")
                      .append("svg")
                      .attr("height", b_height)
                      // .attr("width", b_width + b_margin.left + b_margin.right)
                      // .attr("height", b_height + b_margin.top + b_margin.bottom),
                      //.attr("transform", "translate(" + b_margin.left + "," + b_margin.top + ")");
                      
          filter_view = fb_svg.append("g")
                        .attr("transform", "translate(" + b_margin.left + "," + b_margin.top + ")"),

          filter_range = filter_view.append("g")
                        .attr("transform", "translate(" + 0 + "," + b_height*0.35 + ")")
                        .attr("class", "range_bar"),
          ranges = filter_range.append('g')
                        .attr("transform", "translate(" + 0 + "," + -rangeHeight + ")");

      //var partitions = []


      function update_filter_data(o){
        partitions = []
        var domain_range = o? o.current_range: null;
        update_builder_range(domain_range)
        
        //o.not

        if (selected_chart && selected_chart.data()[0]){

          active_range = selected_chart? selected_chart.data()[0].active_range(): null;

          

          if (builder_range){
            var extents = o? o.extents: active_range

            var not = o? o.not: $('#range_not_button').is(':checked')? true: false;

            extents_data = {extents:extents, not:not}
         
          }

          update_filter_view()

        }
        

      } 

      function create_filter_data(scale, extents, not){
        partitions = []
        var max_value = scale.domain()[1],
            value = not? true:false;

    
          partitions.push( {value: max_value , colored: value, x: scale(max_value), hide:true})
          partitions.push( {value: extents[1], id: 'end', colored: !value, x:scale(extents[1])})
          partitions.push( {value: extents[0], id:'start', colored: value, x:scale(extents[0])})

          range_end_bar= partitions[1]
          range_end_input.property("value", range_end_bar.value)
          range_start_bar= partitions[2]
          range_start_input.property("value", range_start_bar.value)
      }
      


      function update_filter_view(_){

        if ((selected_chart && selected_chart.data()[0].range()) && extents_data.extents !=null || partitions.length>0){
          $('#select_chart_warning').hide()
        
          if(!arguments.length){
            create_filter_data(builder_range, extents_data.extents, extents_data.not)
          }

          get_range_ends_data()

          var end = ranges.selectAll('.end')
                    .remove()
                    .exit()
              
        

          var end = ranges.selectAll('.end')
                    .remove()
                    .exit()
                    .data(rangeEnds)

          end.enter().append('rect')
                  .attr('class', 'end')
                  .attr('x', function(d){return d;})
                  .attr('width', end_len)
                  .attr('height', rangeHeight)
                  .attr('fill', 'darkgray')
            
          data = partitions


          var range = ranges.selectAll('.range')
                        .remove()
                        .exit()
                        .data(data)
          var range_enter = range.enter().append('g')
                        .attr('class', 'range')

          range_enter.append('rect')
              .attr('width', function(d) {return d.x})
              .attr('height', rangeHeight)
              .attr('stroke', 'black')
              .attr('fill', function(d){return d.colored? 'steelblue': 'white'})

          var range_update = range_enter.merge(range)

          range_update.selectAll('rect')
              .attr('width', function(d){return d.x})

          update_partition_bars(partitions)

          filter_range.call(range_axis);
        }else{
          $('#select_chart_warning').show()
        }
        
      }

      


      //------------ Partition view ------- //

      var builderDiv = d3.select("#info_view")

      var b_svg = d3.select("#build_partition_view")
                      .append("svg")
                      .attr("height", b_height)

          partition_view = b_svg.append("g")
                        .attr("transform", "translate(" + b_margin.left + "," + -b_margin.top/3 + ")");


      var selected_partition_bar,
          range_end_bar,
          range_start_bar,
          barId= 1,
          range_bar = partition_view.append("g")
            .attr("transform", "translate(" + 0 + "," + b_height/2 +")")
            .attr("class", "range_bar")

          range_bar_axis = range_bar.append("g")
                .attr("class", "axis"),

          partitions = [];


      function set_partition_value(value){
        if (selected_partition_bar){
          console.log('selected partition bar', selected_partition_bar)
          selected_partition_bar.value = value;
          selected_partition_bar.x = builder_range(value);
          update_partition_bars(partitions);
          //update_filter_view()
        }else {
          alert('Select partition bar first');
        }

      }
      function add_partition_bar(x_location){
        x_location = x_location || 0;
        //artitions.forEach(function(p){p.selected = false;})
        var new_partition = {'id': barId++, 'x': x_location, 'value': builder_range.invert(x_location)}
        select_partition_bar(new_partition);
        partitions.push(new_partition);
        update_partition_bars(partitions);

      }

      function remove_partition_bar(){
        var remove_index;

        console.log('the selected partition', selected_partition_bar)

        for(var i = 0; i < partitions.length; i++){
          var p = partitions[i];
          if (p.id == selected_partition_bar.id)
            remove_index = i;
        }

        if (remove_index > -1){
          partitions.splice(remove_index,1);
          update_partition_bars(partitions);
        }else {
          alert('Please select partition bar to remove')
        }

       
        $('#removePartition_button').prop('disabled', true);
        partition_input.property("value","")


      }

      function select_partition_bar(d){
        $('#removePartition_button').prop('disabled', false);

        if (selected_partition_bar)
            selected_partition_bar.selected = false;
          selected_partition_bar = d;
          d.selected = true;
          //partition_input.attr('value', selected_partition_bar.value);
          partition_input.property("value", selected_partition_bar.value)
          update_partition_bars(partitions);
          partition_input.property("value", selected_partition_bar.value )
      }

      function update_partition_bars(data) {


        d3.selectAll(".partition").remove(); 

        var range_bars = d3.selectAll('.range_bar')
        var range_partition = range_bars.selectAll('g.partition')
                                  .data(data)
                                  .enter()
                                  .append('g')
                                  .attr('class', 'partition')
                                  // .attr("transform", function(d) { return "translate(" + d.x + "," + 0 + ")"; })
                                  .call(d3.drag()
                                    .on("start", dragstarted)
                                    .on("drag", dragged)
                                    .on("end", dragended));

        range_partition.append('g')
            .attr('class', function(d){return d.hide? 'hidden': 'visible'})

        visible_partition = range_bars.selectAll('.visible')
        

        visible_partition.append('rect')
        .attr('class', 'partition')
        .attr('width', partition_width)
        .attr('height', partition_height)
        .attr('x', function(d){return d.x})
        .attr('y', -(partition_height/2))
        .attr('stroke', function(d) { return d.selected? 'black' : 'none' })
        .on('click', select_partition_bar)
        
        visible_partition.append('text')
          .attr("dy", ".15em")
          .attr("y", function(d) { return -(partition_height/2)-3; })
          .attr('x', function(d){return d.x})
          .attr('dx', function(d){
            if (!(isNaN(parseFloat(d.value)))){
              return (d.id == "start")? partition_width: 0;
            }
            else{
              return 0;
            }
          })
          .style("font-size", "13px")
          .style("fill", "black")
          //.style("text-anchor", "middle")
          .style("text-anchor", function(d){
            if (!(isNaN(parseFloat(d.value)))){
              return (d.id == "start")? "end": (d.id == "end")? "start": "middle";
            }
            else{
              return "middle"
            }
          })
          .text(function(d) { 
              var value = builder_range.invert(d.x);
              return format_text(value)
            })

        function dragstarted(d) {
          d3.select(this).raise().classed("active", true);
        }

        function dragged(d) {
          if (!d.selected){
            select_partition_bar(d);
          }
          var event = d3.event.x;
          var x_loc = event;
          if (event < 0)
            x_loc = 0;
          else if (event > b_width)
            x_loc = b_width;

          if (typeof builder_range.domain()[0] == 'number'){
            x_loc = builder_range(Math.round(builder_range.invert(x_loc)));
          }

          d3.select(this).select("rect").attr("x", function(d)  {return d.x = x_loc;});
          d3.select(this).select("text")
              .text(function(d) {
                d.value = builder_range.invert(d.x)
                return format_text(d.value)
              })
              .attr("x", function(d)  {return d.x = x_loc;});

           
           
           range_start_input.property("value", range_start_bar.value)
           range_end_input.property("value", range_end_bar.value)
           partition_input.property("value", selected_partition_bar.value);

          if( $("#build_filter_view").is(':visible')){
            extents_data.extents = [range_start_bar.value, range_end_bar.value]
            update_filter_view(false)
          }
        }

        function dragended(d) {
          d3.select(this).classed("active", false);
        }

      }


      function select_operation_node(o){
        update_selected_chart(o.chart)
        update_builder_view(o)
      }
      var initialRange = false;
      var fullRange = true,
          rangeEnds = [],
          end_len = 15;

      function update_to_full_range(){
        var range = selected_chart.data()[0].range()
        fullRange= true
        update_builder_range(range)
        var not = $('#range_not_button').is(':checked')? true: false
        extents_data = {extents:[partitions[2].value, partitions[1].value], not:not}
        // create_filter_data(builder_range, [partitions[2].value, partitions[1].value], not )
        update_filter_view()

      }

      function update_to_current_range(){
        fullRange = false
        var range = selected_chart.data()[0].current_range()
        update_builder_range(range)
        get_range_ends_data()

        var not = $('#range_not_button').is(':checked')? true: false
        extents_data = {extents:[partitions[2].value, partitions[1].value], not:not}
        //create_filter_data(builder_range, [partitions[2].value, partitions[1].value], not )
        update_filter_view()

      }

      function get_range_ends_data(){
        check_range()
        rangeEnds = [];
        var full_range = selected_chart.data()[0].range()
        var current_range = selected_chart.data()[0].current_range()
        if (!fullRange){
          if (typeof(full_range[0]) == 'number'){
            if (full_range[0]!=current_range[0]){
              rangeEnds.push(-end_len)
            }
            if(full_range[1]!=current_range[1]){
              rangeEnds.push(builder_range.range()[1])
            }

          }else{
            if (full_range[0].getTime()!=current_range[0].getTime()){
              rangeEnds.push(-end_len)
            }
            if (full_range[1].getTime()!=current_range[1].getTime()){
              rangeEnds.push(builder_range.range()[1])
            }
          }

        }
      }

     function check_range(){
        var full_range = selected_chart.data()[0].range()
        var current_range = selected_chart.data()[0].current_range()

        if (typeof(full_range[0]) == 'number'){
          if (full_range[0]==current_range[0] && full_range[1]==current_range[1]){
            fullRange = true;
          }

        }else{
          if (full_range[0].getTime()==current_range[0].getTime() && full_range[1].getTime()==current_range[1].getTime()){
            fullRange = true;
          }
        }

      }


      function update_builder_range(domain_range){
        if (selected_chart && selected_chart.data()[0]){

         //selected_chart.call(selected_chart.data()[0]);
         //var current_range = domain_range? domain_range : selected_chart.data()[0].range();
         var current_range = domain_range? domain_range : selected_chart.data()[0].current_range();

          if (current_range){

            builder_range = update_scale(current_range, b_range)
            range_axis = d3.axisBottom(builder_range)
                        .ticks(5) 
            return builder_range
          }

        }

        return null;

      }


      function update_partition_view(thresholds){

        partitions =[]

        partitions_data.forEach(function(p){
                add_partition_bar(builder_range(p))
              })

      }

      function update_partitions_data(thresholds){

       //render selected chart
        partitions_data = []


       if ((selected_chart && selected_chart.data()[0])|| partitions.length>0){
        $('#select_chart_warning2').hide()

         //selected_chart.call(selected_chart.data()[0]);
         var current_range = selected_chart.data()[0].current_range();


          if (current_range){

            update_builder_range(current_range)

            range_bar_axis.call(range_axis);


            if (builder_range){
              partitions_data = thresholds? thresholds: [builder_range.invert(b_width/3), builder_range.invert(b_width*2/3)]
              
              update_partition_view()
            }

          }

       }else{

        $('#select_chart_warning2').show()
       }

      }

      //----------- end of partition view ----------//


      //--------------- BAR CHARTS ----------------------- //

      var selected_leftover_bar;

      function update_selected_leftover(div){

        if (selected_leftover_bar)
          selected_leftover_bar.style("stroke", 'none' );
        selected_leftover_bar = div;
        selected_leftover_bar.style("stroke", "black" );
      }

      function update_selected_chart(div) {


        fullRange = initialRange;

        select_chart(div)
        if( $("#build_filter_view").is(':visible')){
          update_filter_data()
          $('#range_not_button').prop('checked', false);
        }
        else if ($("#build_partition_view").is(':visible')){
          update_partitions_data()
        }

      }

      function select_chart(div){
        if (selected_chart){
          selected_chart.style("background-color", "white" );
          selected_chart.select('.close').style('display', 'none')
        }
        selected_chart = div;
        selected_chart.style("background-color", "lightyellow" );


        selected_chart.select('.close').style('display', null)
      }

      function render(method) {
        d3.select(this).call(method);
      }

      function renderAll() {
        chart.each(render);
        
      }

      function rerender_charts(){
        d3.selectAll(".range_chart").selectAll('.modifiable_charts').remove()

        chart = d3.selectAll(".range_chart")
             .data(charts)

        chart.exit().remove()


        renderAll();

      }


      window.filter = filters => {
        filters.forEach((d, i) => { charts[i].filter(d); });
        renderAll();
      };

      window.reset = function(i) {
        if(charts[i]){
          charts[i].filter(null);
          selectedFilter={};
          renderAll();
        }
      };


      function get_x_limit(groups, yScale, xScale) {

        for (var i= groups.length -1 ; i >= 0 ; i--){
          var grp = groups[i];
          var pixels = yScale(0) - yScale(grp.value);

          if (pixels > 1){
            var x_domain_max;
            if (i == groups.length -1){
              x_domain_max = null;
              
              console.log('x domain', xScale.domain())
              console.log('key', grp.key)
              if (typeof(grp.key) == 'number'){
                if(grp.key < (xScale.domain()[1]-2))
                  x_domain_max = grp.key+1
                else
                  x_domain_max = xScale.domain()[1];
              }
            }
            else
              x_domain_max = grp.key + 2;
            break;
          }

        }

        return (x_domain_max >30)? 30: x_domain_max;
      }
      
      function reduce_leftover_count(x_max, groups){
        var leftover_count = 0;

        if (x_max){
          x_max = x_max - 1;
          var idx = groups.length-1;
          grp = groups[idx];

          while (grp.key > x_max){
            leftover_count = leftover_count + grp.value
            idx = idx - 1;
            grp = groups[idx]; 
          }

          return leftover_count;

        } 

        return 0;
      }

    function get_current_range(groups){
      var idx = 0,
          n = groups.length,
          grp = groups[idx];

      while (grp.value == 0 && idx < (n-1)){
        //x_min = grp.key;
        idx = idx+1;
        grp = groups[idx];
      }
      var min = grp? grp.key : groups[0].key;



      var idx = n-1;
          grp2 = groups[idx];

      while (idx > 0 && grp2.value==0){
        // x_max = grp.key;
        idx = idx - 1;
        grp2 = groups[idx]; 
      }
      var max = grp2? grp2.key: groups[0].key;
      return [min, max];
    }

    function add_one(range){
      var range_max = range[1]
      if (typeof(range_max) == 'number'){
        range_max = range_max +1;
      }else{
        newDate = new Date(range_max)
        newDate.setDate(newDate.getDate() + 1); 

        range_max = newDate
      }

      return [range[0], range_max]
    }

    var max_id;

    function barChart() {
        if (!barChart.id) barChart.id = 0;

        var margin = {top: 10, right: 13, bottom: 35, left: 60},
            x,
            y = d3.scaleLinear().range([100, 0]),
            id = barChart.id++,
            axis = d3.axisBottom(),
            axisY = d3.axisLeft(),
            brush = d3.brushX(),
            fixedDomain,
            x_domain_max,
            x_max,
            x_min,
            div_id,
            brushDirty,
            leftover_count,
            dim_name,
            active_range,
            category,
            range,
            current_range,
            dimension,
            filter_dimension,
            group,
            round;
        
        max_id = id;

        function chart(div) {
          var width = x.range()[1],
             height = y.range()[0];

          brush.extent([[0,0], [width, height]]);
          
          
          div.each(function() {
            var div = d3.select(this)

            
            var g = div.select("g");



            // Create the skeletal chart.
            if (g.empty()) {
              
              //fix leftover/axis
              //console.log(div_id)
              y.domain([0, group.top(1)[0].value]);

              
              x_max = group.all()[group.all().length-1].key;
              x_min = group.all()[0].key;
              range = add_one([x_min,x_max]);

              //x.domain(range)
              
              
              x_domain_max = get_x_limit(group.all(), y, x);
                //x.domain(range)
              if (x_domain_max){
                x.domain([x.domain()[0], x_domain_max]);
                x.range([0, x_domain_max*10])

                width = x.range()[1];
                brush.extent([[0,0], [width, height]]);
                margin.right = 30;
                
                if (x_domain_max < 6)
                  axis.ticks(x_domain_max);
                else{
                  axis.ticks(6)
                }
                                 
              }
              
              axis.scale(x);

              console.log('x axis range', x.domain())

              
              
              //remove if change date chart range back to 300
              if (typeof(x_min) != 'number'){
                width = x.range()[1];
                brush.extent([[0,0], [width, height]]);
                axis.ticks(4)
                axis.scale(x)

              }


              div.select(".title").append("a")
                  .attr("href", "javascript:reset(" + id + ")")
                  .attr("class", "reset")
                  .text("reset")
                  .style("display", "none");



              g = div.append("svg")
                  .attr('class', function(d){return fixedDomain? null: 'modifiable_charts'})
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              

              leftover_x = width + margin.right - 18
              var leftover_bar = g.append('g')
                                  .attr('transform','translate('+ 0 + ",0)")
              leftover_bar.append("rect")
                      .attr("class", "leftovers")
                      .attr("id", "leftovers")
                      .attr('x', leftover_x)
                      // .attr("y", height - leftover_height)
                      // .attr("height", leftover_height)
                      .attr("width", 9)
                      .on("click", function(d) {

                        update_selected_chart(div);
                        update_selected_leftover(d3.select(this))

                        var extents = [x_domain_max, x_max+1];
    
                        active_range= extents;
                        update_filter_data();
                      })
              leftover_bar.append("text")
                .attr("class", "leftover_text")
                .attr("y", height+2)
                .attr("x", leftover_x + 1)
                .attr("dy", "1em")
                .style("text-anchor", "left")
                .style("font-size", "10px")
                .style("fill","black")
                .text(function(d) { return x_domain_max? ">" : "";});


              g.append("clipPath")
                  .attr("id", "clip-" + id)
                .append("rect")
                  .attr("width", width)
                  .attr("height", height);

              

              g.selectAll(".bar")
                  .data(["background", "foreground"])
                .enter().append("path")
                  .attr("class", function(d) {return d + " bar"; })
                  .datum(group.all());

              g.selectAll(".foreground.bar")
                  .attr("clip-path", "url(#clip-" + id + ")");

              g.append("g")
                  .attr("class", "axis")
                  .attr("transform", "translate(0," + height + ")")
                  .call(axis);


              g.append("g")
                  .attr("class", "axisY")
                  .call(axisY);
              //set up y axis title
              g.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x",0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", "10px")
                .style("fill","black")
                .text("# of Sequences"); 

              //set up x axis title
              g.append("text")             
                .attr("transform",
                      "translate(" + (width/2) + " ," + 
                                     (height + margin.top + 20) + ")")
                .style("font-size", "10px")
                .style("text-anchor", "middle")
                .style("fill","black")
                .text(dim_name);


              //Initialize the brush component with pretty resize handles.
              var gBrush = g.append("g").attr("class", "brush").call(brush);

              gBrush.selectAll('.handle--custom')
                .data([{ type: 'w' }, { type: 'e' }])
                .enter().append('path')
                  .attr('class', 'brush-handle')
                  .attr('cursor', 'ew-resize')
                  .attr('d', resizePath)
                  .style('display', 'none');
            }

            

            if (brushDirty !== false) {
              const filterVal = brushDirty;
              brushDirty = false;

              div.select('.title a').style('display', d3.brushSelection(div) ? null : 'none');

              if (!filterVal) {
                g.call(brush);

                g.selectAll(`#clip-${id} rect`)
                  .attr('x', 0)
                  .attr('width', width);

                g.selectAll('.brush-handle').style('display', 'none');
                renderAll();
              } else {
                const range = filterVal.map(x);
                brush.move(gBrush, range);
              }
            }





            var leftover_count = reduce_leftover_count(x_domain_max, group.all());
            

            current_range = add_one(get_current_range(group.all()));
            div_id = div.attr("id");


            if (new_selection){

                y_max = group.top(1)[0].value;
                new_y_max = leftover_count > y_max ? leftover_count : y_max;

                y.domain([0, new_y_max]);
                t1 = g.transition().duration(1000);
                
                t1.selectAll(".bar").attr("d", barPath);
                t1.selectAll(".axisY").call(axisY);

                if (x_domain_max){
                  t1.select('#leftovers')
                    .attr("height", height - y(leftover_count))
                    .attr("y", y(leftover_count))

                }

              } else {

                g.selectAll(".bar").attr("d", barPath);
                if (x_domain_max){
                  g.select('#leftovers')
                    .attr("height", height - y(leftover_count))
                    .attr("y", y(leftover_count));
                }
                
              }
              


            
          });

          function leftoverPath(leftover_height){
            return "M" + (width+18) + "," + height + "V" + y(leftover_height) + "h" + 9 + "V" + height;
          }

          function barPath(groups) {
            var path = [],
                i = -1,
                n = groups.length,
                d;

            bar_width = 9;

            // if (typeof x.domain()[1] == "number"){
            //   n_groups = x.domain()[1];
            //   bar_width = Math.floor(x.range()[1]/n_groups) -0.05 
            // }
            // else
            //   bar_width = 8;
            //   //n_groups = n;
            // ;

            if (typeof x.domain()[1] != "number"){
              bar_width = Math.floor(width/n) + 1
            }
            
            while (++i < n) {
              d = groups[i];
              //path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
              if (x_domain_max){
                if (d.key < x_domain_max)
                  path.push("M", x(d.key), ",", height, "V", y(d.value), "h" + bar_width + "V", height);
              } else {
                path.push("M", x(d.key), ",", height, "V", y(d.value), "h" + bar_width + "V", height);
              }
            }

            return path.join("");
          }

          function resizePath(d) {
            var e = +(d == "e"),
                x = e ? 1 : -1,
                y = height / 3;
            return "M" + (.5 * x) + "," + y
                + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
                + "V" + (2 * y - 6)
                + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
                + "Z"
                + "M" + (2.5 * x) + "," + (y + 8)
                + "V" + (2 * y - 8)
                + "M" + (4.5 * x) + "," + (y + 8)
                + "V" + (2 * y - 8);
          }
        }

        brush.on("start.chart", function() {
          var div = d3.select(this.parentNode.parentNode.parentNode);
          update_selected_chart(div);
          div.select(".title a").style("display", null);
          // selectedDiv = div.attr('id');
          reset_charts(id);
        });

        brush.on('brush.chart', function () {
          const g = d3.select(this.parentNode);
          const brushRange = d3.event.selection || d3.brushSelection(this); // attempt to read brush range
          const xRange = x && x.range(); // attempt to read range from x scale
          let activeRange = brushRange || xRange; // default to x range if no brush range available
          
          const hasRange = activeRange &&
            activeRange.length === 2 &&
            !isNaN(activeRange[0]) &&
            !isNaN(activeRange[1]);

          if (!hasRange) return; // quit early if we don't have a valid range

          // calculate current brush extents using x scale
          let extents = activeRange.map(x.invert);


          // if rounding fn supplied, then snap to rounded extents
          // and move brush rect to reflect rounded range bounds if it was set by user interaction
          if (round) {
            extents = extents.map(round);
            activeRange = extents.map(x);

            if (
              d3.event.sourceEvent &&
              d3.event.sourceEvent.type === 'mousemove'
            ) {
              d3.select(this).call(brush.move, activeRange);
            }
          }

          // move brush handles to start and end of range
          g.selectAll('.brush-handle')
            .style('display', null)
            .attr('transform', (d, i) => `translate(${activeRange[i]}, 0)`);

          // resize sliding window to reflect updated range
          c = g.select(`#clip-${id} rect`)
            .attr('x', activeRange[0])
            .attr('width', activeRange[1] - activeRange[0]);



          // filter the active dimension to the range extents

      
          dimension.filterRange(extents);
          
          active_range = extents;
          if( $("#build_filter_view").is(':visible')){
            update_filter_data()
          }

          // re-render the other charts accordingly
          renderAll();
        });


         brush.on('end.chart', function () {
          // reset corresponding filter if the brush selection was cleared
          // (e.g. user "clicked off" the active range)
          // console.log('all ids but', id)
          // reset_charts(id);
          if (!d3.brushSelection(this)) {
            reset(id);
            selectedFilter = {};

            active_range= current_range;
            if( $("#build_filter_view").is(':visible')){
              update_filter_data()
            }
          }

        });

        chart.margin = function(_) {
          if (!arguments.length) return margin;
          margin = _;
          return chart;
        };

        chart.x = function(_) {
          fixedDomain = (!((_.domain()[0] == 0) && (_.domain()[1]== 1)))

          if (!arguments.length) return x;
          x = _;
          //if (!fixedDomain){
          x_max = group.all()[group.all().length-1].key;
          x_min = group.all()[0].key;
          range = add_one([x_min,x_max]);

          x.domain(range)
              
          //}
          axis.scale(x);
          axisY.scale(y).ticks(6);
          return chart;
        };

        chart.y = function(_) {
          if (!arguments.length) return y;
          y = _;
          return chart;
        };
        
        chart.dim_name = function(_) {
          if (!arguments.length) return dim_name;
          dim_name = _;
          return chart;
        };

        chart.category = function(_) {
          if (!arguments.length) return category;
          category = _;
          return chart;
        };

        chart.id = function(_) {
          if (!arguments.length) return id;
          id = _;
          return chart;
        };

        chart.dimension = function(_) {
          if (!arguments.length) return dimension;
          dimension = _;
          return chart;
        };

        chart.filter_dimension = function(_) {
          if (!arguments.length) return filter_dimension;
          filter_dimension = _;
          return chart;
        };

        chart.filter = _ => {
          if (!_) {
            dimension.filterAll();
            //filter_dimension.filterAll();
          }
          brushDirty = _;
          return chart;
        };

        chart.group = function(_) {
          if (!arguments.length) return group;
          group = _;
          return chart;
        };

        chart.round = function(_) {
          if (!arguments.length) return round;
          round = _;
          return chart;
        };

        chart.gBrush = () => gBrush;

        chart.range = () => range;

        chart.div_id = () => div_id;
        

        chart.current_range = function(_) {
          if (!arguments.length) return current_range;
          current_range = _;
          return chart;
        };

        chart.active_range = function(_) {
          if (!active_range)
            active_range = current_range
          if (!arguments.length) return active_range;
          active_range = _;
          return chart;
        };



        return chart;
      }


    function group_count(d, thresholds) {
      
      thresholds = thresholds || [10, 2, 1, 0];

      var index = 0;
      t = thresholds[index];
      while (d < t){
        index = index + 1;
        t = thresholds[index];
      }
      
      return thresholds[index];
    }

    // ======================= ANALYSIS PATH VIEW (TREE VIEW) ==========================

    var margin = {top: 20, right:20, bottom: 20, left: 20},
        width = 400 - margin.right - margin.left,
        height = 750 - margin.top - margin.bottom;

    var RECT_W_max = 105,
        RECT_W_min = 5,
        RECT_H = 20,
        DEPTH = 35;


    var data0 = [
        { "name": "Root", "parent": "null", "visible":1, "value":-1},
        { "name" : "Segment A", "parent":"Root", "value":1, "visible":1}
        ];

    total_size = all.reduceCount().value();
    data0[1].size = total_size;
    original_size = data0[1].size;

    wScale = d3.scaleLinear().domain([0,total_size]).range([RECT_W_min, RECT_W_max]);

    //var data = JSON.parse(JSON.stringify(original_data));
    original_data = JSON.stringify(data0)
    data = JSON.parse(original_data)

    var treeData = [];

    unflatten(treeData, data);


    // ************** Generate the tree diagram  *****************
    //var buttons = d3.select("#buttons")


        
    var i = 0,
        //duration = 750,
        //duration = 0,
        root;

    var tree = d3.tree()
          .size([width, height]);

    var treeDiv = d3.select('#tree')

    var t_svg = d3.select('#tree').append("svg")
              .attr('width', "100%")
              .attr('height', "100%")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var selected,
        selected_segment,
        selected_chart,
        //current_range,
        selected_action_node;



    size = 1000;
    root = d3.hierarchy(treeData[0], function(d) { return d.children; })
    root.x0 = height / 2;
    root.y0 = 0;

    
    function resize_windows(){
      resize_tree()
      resize_builder()
      resize_sequence_details()

      nl_graph.resize()
    }

    function resize_sequence_details(){
      var width = d3.select('#sequences').node().clientWidth - 200;
      $("#sequences_text").width(width)
    }

    function resize_builder(){
        var width = builderDiv.node().clientWidth

        b_width = width - b_margin.right - b_margin.left

        b_range = [0,b_width]

        update_builder_range()

         p_width = (width< 235)? width: width-230
        //p_width = (0.25*width <100)? width-110: 0.75*width

        fb_svg
            .attr("width", width)

        b_svg
            .attr("width", width)

        nv_svg
            .attr("width", width)


        $('#pb_graph').css('width', p_width).css('height', pb_height);

        infoLength = width*(3/7),
        separation = width/7 - 20,
        translation = infoLength + separation;

        infoRange = [0,infoLength]
        rScale.range([1,infoLength])

        d3.selectAll('.results_view').remove()

        results_view = operation_result_view.append('g')
                      .attr("class", "results_view")
                      .attr("transform", "translate(" + translation  + "," + 0 + ")")

        show_node_view(selected)
        draw_pattern_graph(pattern_data)

        if( $("#build_filter_view").is(':visible'))
          update_filter_view()
        else if ($("#build_partition_view").is(':visible')){
          update_partition_view()
        }
        
      }


    d3.select(self.frameElement).style("height", "500px");


    //-------------------- FUNCTIONS ---------------------

      function unflatten(treeData, data) {
          
          var dataMap = data.reduce(function(map, node) {
              map[node.name] = node;
              return map;
          }, {});

          data.forEach(function(node) {
           // add to parent
           var parent = dataMap[node.parent];
           if (parent) {
            // create child array if it doesn't exist
            (parent.children || (parent.children = []))
             // add node to child array
             .push(node);
           } else {
            // parent is null or missing
            treeData.push(node);
           }
          });
      }

      
      function resize_tree(){
        var width = d3.select('#tree').node().clientWidth,
            height = 2000

        //t_svg.attr("width", width)

        tree.size([width-(oLength/2), height]);

        root.x0 = height / 2;
        root.y0 = 0;

        update(root)
      }


      function update(source) {

        //console.log('UPDATING');
        // Compute the new tree layout.
        var treeData = tree(root);
        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);


        // Normalize for fixed-depth. Each layer is same distant apart
        nodes.forEach(function(d) { d.y = d.depth * DEPTH; });

        // Update the nodes…
        var node = t_svg.selectAll("g.node")
            .data(nodes, function(d) {return d.id || (d.id = ++i); });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + source.x0 + "," + source.y0 + ")"; })
            //.on("dblclick", hide_children)
            .on("click", function(d){
              if (d.value == 1){
                $('#load').show();
                setTimeout(function() {
                    select_node(d)
                    $('#load').hide();
                }, 500);
              }else{
                select_node(d);
              }
            })

            //.on("dblclick", filter_partition);

            
        nodeEnter.append('g')
                .attr("class", function(d) {
                  if (d.value ==1) return "segment";
                  else if (d.value==-1) return "root";
                  else return "operation"; 
                  //return d.value==1 || d.value==-1? "segment": "operation"
                })
        //nodeEnter.each(create_nodes)
        var root_node = nodeEnter.selectAll(".root")

        root_node.append('circle')
                .attr('r',  2.5)
                .attr('fill', 'black')

        // root_node.append("path")
        //          .each(format_nodes)

        var segment_nodes = nodeEnter.selectAll(".segment")

        segment_nodes.append("path")
                .attr('d', create_rect_path)
                .attr('fill', "lightgray" )
        // segment_nodes.append("path")
        //          .each(format_nodes)

        segment_nodes.append("text")
          .attr("dy", ".15em")
          .attr("y", function(d) { return d.children ? -0 : 0; })
          .style("font-size", "10px")
          .style("text-anchor", "middle")
          .text(function(d) { return d.data.size? d3.format(",")(d.data.size): ''; });
        

        var operation_nodes = nodeEnter.selectAll(".operation")
                                  .attr("transform", function(d) { return "translate(" + -oLength/2 + "," + -oWidth/2 + ")"; });


        operation_nodes.append('g')
                  .attr("class", function(d) {return d.data.operation.type})

        operation_nodes.append('rect')
            .attr("width", oLength)
            .attr("height", oWidth)
            .attr("fill", 'none')
            .attr("stroke", "gray")

        var range_nodes = operation_nodes.selectAll(".range")

        var range_symbol = range_nodes.append('g')
                .attr("transform", function(d) { return "translate(" + (-oWidth -3) + "," + oWidth/2 + ")"; })

        range_symbol.append('circle')
                .attr('cx', oWidth/2)
                .attr('r', oWidth/2 + 1)
                .attr('fill', function(d){
                  var data = d.data.operation;
                  if (data.category =='count'){
                    var div = data.div;
                    var action = div.substring(0, div.indexOf('_', 3))
                    console.log(action)
                    return color(action)
                  }else{
                    return 'none'
                  }
                })

        range_symbol.append("path")
                //.attr("transform", function(d) { return "translate(" + (-oWidth -1) + "," + oWidth/2 + ")"; })
                .attr('d', function(d){ 

                      var category = d.data.operation.category;
                      if (category == 'time')
                        return clock_symbol(d.data.operation);
                      else if (category == 'count')
                        return hash_symbol(d);

                    })
                .attr('fill', 'white')
                .attr('stroke', '#5c616b')

        var bar =  range_nodes.selectAll("rect")
                  .remove()
                  .exit()
                  .data(d => d.data.node_data)
         
        var bar_enter = bar.enter().append('g')

        

        bar_enter.append("rect")
              .attr("x", function(d){
                  return d.x0;
              })
              .attr("width", function(d){
                  return d.x1-d.x0;
              })
              .attr("height", oWidth)
              .attr("fill", function(d) {return d.highlighted? "steelblue": "white";})
              .attr("stroke", "#ccc");

        var bar_update = bar_enter.merge(bar);

        var contains_nodes = operation_nodes.selectAll(".contains")


        contains_nodes.append('rect')
            .attr("width", oLength)
            .attr("height", oWidth)
            
            .attr("fill", function(d){return d.data.operation.not? contains_not_color: "white"})

        var circles = contains_nodes.append("g")
                      .attr("transform", function(d) { return "translate(" + oRadius + "," + oWidth/2 + ")"; });

        var circle = circles.selectAll("circle")
                      .remove()
                      .exit()
                      .data(d => d.data.node_data)

        var circle_enter =  circle.enter().append('g')           
        //var radius = (oWidth/2)-1;

        circle_enter.append('circle')
            .attr('r', oRadius)
            //.attr('cx', function(d,i){return i*oRadius*2})
            .attr('cx', function(d){return d.x})
            .attr('fill', function(d){
              return color(d.action);
              //return d.group? color(d.group): "none"
            })
            //.attr('stroke', 'gray')

        circle_enter.append('circle')
            .attr('r', 1)
            .attr('cx', function(d){return d.x})
            .attr('fill', function(d){ return d.many? 'black': 'none'})

        // Transition nodes to their new position.
        var nodeUpdate = nodeEnter.merge(node);


        nodeUpdate.transition()
            //.duration(duration)
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


        nodeUpdate.selectAll('path')
              .style("stroke", function(d) { return d.selected ? "black" : 'lightgray';})
        nodeUpdate.selectAll('.segment').selectAll('path')
              .style("fill", function(d){return d.selected_segment? "lightblue": "lightgray"})

        nodeUpdate.selectAll('rect')
              .style("stroke", function(d) { return d.selected ? "black" : 'gray';})
              .style("stroke-width", function(d){return d.selected? "2px": "1px";})

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            //.duration(duration)
            .attr("transform", function(d) { return "translate(" + source.x + "," + source.y + ")"; })
            .remove();


        // Update the links…
        var link = t_svg.selectAll("path.link")
            .data(links, function(d) { return d.id; });

        link.style("opacity", function(d){
                  if(!d.data.visible && !d.children)
                      return 0;
                  else
                      return 1;
                  });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
              var o = {x: source.x0, y: source.y0};
              return diagonal(o,o);
            })

        var linkUpdate = linkEnter.merge(link);
        // Transition links to their new position.

        linkUpdate.transition()
            // .duration(function(d) {
            //                 return duration;
            //           })
            .attr("d", function(d){return diagonal(d, d.parent)})

        // Transition exiting nodes to the parent's new position.
        var linkExit = link.exit().transition()
            //.duration(duration)
            .attr("d", function(d) {
              var o = {x: source.x, y: source.y};
              return diagonal(o,o);
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
          d.x0 = d.x;
          d.y0 = d.y;
        });
      }

      function hash_symbol(){
        var size = oWidth*0.75;

        //return 'M' + (-size/2) + ',' + (-size/2) +
        return 'M' + oWidth/2 + ',' + (-size/2) +
        'l' + (-size/4) + ',' + size +
        'm0' + size/3 + ',' + 0 +
        'l' + size/4 + ',' + -size +
        'm0' + size/5 + ',' + size/3 +
        'l' + -size + ',0' +
        'm0' + 0 + ',' + size/3 +
        'l' + size + ',0' 
      ;
      }


      function clock_symbol(o){
        
        var size = oWidth*0.75,
            r = size/2,
            pad = r/4,
            len = r - pad,
            sym_len = r*1.5,
            sym_y = -sym_len/2;
            t = r+pad*2
            //t = -(r + pad + sym_len/2)

        var clock = 'M' + 0 + ',' + 0 +
        ' m' + (-r) + ',0' +
        ' a' + r + ',' + r + ' 0 1,0' + (r * 2) + ',0' +
        ' a' + r + ',' + r + ' 0 1,0' + (-(r * 2)) + ',0'+
          
        'M' + 0 + ',' + (-len) +
        'l' + 0 + ',' + len + ' ' + len + ',0';

        if (o.div.includes('hour'))
          return clock + 
          'M' + t + ',' + sym_y +
          'l' + 0 + ',' + sym_len +
          'm0' + 0 + ',' + -sym_len/2 +
          'l' + sym_len/2 + ',' + 0 +
          'm0' + 0 + -sym_len/2 +
          'l' + 0 + ',' + sym_len  ;
        else if(o.div.includes('date'))
          return clock +
          'M' + t + ',' + sym_y +
          'l' + 0 + ',' + sym_len +
          'q' + (pad*6.5) + ',' + -(sym_len/4) + ' ' + 0 + ',' + -sym_len;
        else if (o.div.includes('duration'))
          return clock +
          'M' + t + ',' + sym_y +
          'l' + 0 + ',' + sym_len +
          'l' + sym_len/2 + ',' + 0;
        else
          return clock; 
      }


      function diagonal(s, d) {

        var t = s.data? (s.data.translate_x | 0): 0;

        return "M" + s.x + "," + s.y
             + "C" + s.x + "," + (s.y + d.y) / 2
             + " " + (d.x + t) + "," +  (s.y + d.y) / 2
             + " " + (d.x + t) + "," + d.y;
      }



      // Toggle children on click.
      function hide_children(d) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d);
      }

      function format_nodes(d, i) {

          d = d.data
          n = node_types[d.value];

          if (d.visible) 
            size = n.size;
          else
            size = 0;

          shape = n.shape;

          d3.select(this)
              .attr("d", function(d) { return d.value==1? create_rect_path(d):
                           d3.symbol().size(size).type(d3.symbolCircle)

                          ();
                        })
              //.style("stroke", function(d) { return d.selected ? "black" : n.stroke;})
              .style("fill", n.fill)
              //.style("stroke-width", n.stroke_width);


      }

      function reset_charts(exception){

        if (!arguments.length)
          exception = -1;

        for(var i=0; i<= max_id; i++){
          if (i != exception){
            reset(i);
          } 
        }

      }

      function reset_filters() {

        console.log('Reseting All Filters')

        selectedFilter={}

        dimensions.forEach(function(d){
          d.filterAll()

        })

        renderAll()

      }

      function isSameExtents(ext1, ext2){
        return (ext1[0]==ext2[0]) && (ext1[1]==ext2[1])
      }

      function isSameFilter(f1,f2){
        if ((f1.type == f2.type) && (f1.div == f2.div)){
          if (f1.type == 'contains'){
            return (f1.regex == f2.regex)
          }else if (f1.type == 'range'){
            if ((f1.extents.neg.length == f2.extents.neg.length) && (f1.extents.pos.length == f2.extents.pos.length)){
                if(isSameExtents(f1.extents.pos, f2.extents.pos)){
                    for (var i =0; i < f1.extents.neg.length; i++){
                      var ext1 = f1.extents.neg[i],
                          ext2 = f2.extents.neg[i]

                      if (!isSameExtents(ext1, ext2)){
                        return false;
                      }
                    }
                  return true;
                }
            }

            
          }
        }

        return false

      }

      function reset_dimensions(reset_list){
        reset_list.forEach(function(f){
          if (f.type == 'contains'){
             // Object.values(action_filter_dimensions[f.div]).forEach(function(d){
             //    d.filterAll();
             // })
             //action_filter_dimensions[f.div].action_strings.filterAll()
             action_filter_dimensions[f.div][f.filterDim].filterAll()
          }else if(f.type == 'range'){
            var current_chart = f.chart.data()[0];
            current_chart.filter_dimension().filterAll();
            current_chart.dimension().filterAll();
          }
        })

      }

      var prev_selected;

      // function apply_filters(selected){

      //   var reset_list = [],
      //       filter_list = [];

      //   // var in_size = all.reduceCount().value()
      //   // console.log('initial size', in_size)
        
      //   if( prev_selected && new_filters){
      //     var old_filters = prev_selected.data.filters;
      //     var new_filters = selected.data.filters;

      //     old_filters.forEach(function(o){
      //       var found = false;
      //       for (var i =0; i< new_filters.length;i++){
      //         var n = new_filters[i]
      //         if (isSameFilter(o,n)){
      //           found = true;
      //           break;
      //         }
      //       }
      //       if (!found)
      //         reset_list.push(o)
      //     })

      //     new_filters.forEach(function(n){
      //       var found = false;
      //       for (var i =0; i< old_filters.length;i++){
      //         var o = old_filters[i]
      //         if (isSameFilter(o,n)){
      //           found = true;
      //           break;
      //         }
      //       }
      //       if (!found)
      //         filter_list.push(n)
      //     })

      //     console.log('reset_list', reset_list)
      //     console.log('filter_list', filter_list)
      //     reset_dimensions(reset_list)
      //     selected_filters = filter_list


      //   }


      //   else{
      //     reset_filters();
      //     selected_filters = selected.data.filters;
      //   }

      //   if(selected_filters) {

      //     console.log('SELECTED FILTERS', selected_filters);

      //     selected_filters.forEach(function(f){
      //       type = f.type;

      //       if (type == 'range') {
            
      //         var div = f.div;
      //         var extents = f.extents;

      //         current_chart = f.chart.data()[0];
      //         dim = current_chart.filter_dimension();
      //         reset(current_chart.id());

      //         if (extents){
      //           console.log('extents to filter', extents)

      //           dim.filterFunction(function(d){
      //             var inRange = true;
      //             if (extents.pos)
      //               inRange= inRange && (d >= extents.pos[0]) && (d < extents.pos[1]);

      //             extents.neg.forEach(function(ext){
      //               inRange = inRange && !((d>=ext[0]) && (d< ext[1]));

      //             })

      //             return inRange;
      //           })
      //         }
      //         else
      //           dim.filterExact(null);

      //       } else if (type == 'contains'){

      //         dim = action_filter_dimensions[f.div].action_strings
      //         char_regex = f.regex;
      //         console.log('CHAR REGEX', char_regex);
      //         dim.filterFunction(function(d){
      //             return d.match(char_regex);

      //         });
              
      //       }
      //       var filtered_size = all.reduceCount().value()
      //       console.log('filtered-size', filtered_size );
      //       // f.in_size = in_size;
      //       // f.out_size = filtered_size;
            

      //     })
      //     //renderAll();
      //     rerender_charts()
      //     prev_selected = selected
          
      //   }


      // }

       function apply_filters(selected){

        console.log('APP;LYING FILTERS WITH 2 ACTION DIMENSIONS')

        var reset_list = [],
            filter_list = [];
        var new_filters = selected.data.filters;
        
            
        // var in_size = all.reduceCount().value()
        // console.log('initial size', in_size)
        
        if( prev_selected && prev_selected.data.filters && new_filters){
          var old_filters = prev_selected.data.filters,
              all_old_filters = old_filters.range.concat(old_filters.contains)
            

          all_old_filters.forEach(function(o){

              var found = false;
              filter_group = (o.type == 'contains')? new_filters.contains: new_filters.range;
              for (var i =0; i< filter_group.length;i++){
                var n = filter_group[i]
                if (isSameFilter(o,n)){
                  found = true;
                  break;
                }
              }
              if (!found)
                reset_list.push(o)
          })

          all_new_filters = new_filters.range.concat(new_filters.contains);

          all_new_filters.forEach(function(n){
            var found = false;
            filter_group = (n.type == 'contains')? old_filters.contains: old_filters.range;
            for (var i =0; i< filter_group.length;i++){
              var o = filter_group[i]
              if (isSameFilter(o,n)){
                found = true;
                break;
              }
            }
            if (!found)
              filter_list.push(n)
          })

          console.log('old filter list', all_old_filters)
          console.log('new filter list', all_new_filters)

          console.log('reset_list', reset_list)
          console.log('filter_list', filter_list)
          reset_dimensions(reset_list)
          selected_filters = filter_list


        }


        else{
          reset_filters();

          selected_filters = new_filters? new_filters.range.concat(new_filters.contains): [];
        }

        if(selected_filters) {

          console.log('SELECTED FILTERS', selected_filters);

          selected_filters.forEach(function(f){
            type = f.type;

            if (type == 'range') {
            
              var div = f.div;
              var extents = f.extents;

              current_chart = f.chart.data()[0];
              dim = current_chart.filter_dimension();
              reset(current_chart.id());

              if (extents){
                console.log('extents to filter', extents)

                dim.filterFunction(function(d){
                  var inRange = true;
                  if (extents.pos)
                    inRange= inRange && (d >= extents.pos[0]) && (d < extents.pos[1]);

                  extents.neg.forEach(function(ext){
                    inRange = inRange && !((d>=ext[0]) && (d< ext[1]));

                  })

                  return inRange;
                })
              }
              else
                dim.filterExact(null);

            } else if (type == 'contains'){

              //dim = action_filter_dimensions[f.div].action_strings
              dim = action_filter_dimensions[f.div][f.filterDim]
              char_regex = f.regex;
              console.log('CHAR REGEX', char_regex);
              dim.filterFunction(function(d){
                  return d.match(char_regex);

              });
              
            }
            var filtered_size = all.reduceCount().value()
            console.log('filtered-size', filtered_size );
            // f.in_size = in_size;
            // f.out_size = filtered_size;
            

          })
          //renderAll();
          rerender_charts()
          prev_selected = selected
          
        }


      }

      function select_node(d){

        if (d != selected){

           if(!selected){
               selected = d;
               d.selected = true;
            } 
            else {
               selected.selected = false;
               update(selected);
               selected = d;
               d.selected = true;
               
            }


            console.log("Selected node: ", selected);

            show_node_view(selected);
          
            // var patterns = find_all_patterns();
            // console.log('Patterns', patterns)

            if (selected.data.value == 1) {

              
              $('#remove_button').prop('disabled',true)
              if (!selected_segment){
                selected_segment = selected;
                selected.selected_segment = true;
              }else{
                selected_segment.selected_segment = false;
                update(selected_segment);
                selected_segment = d;
                d.selected_segment = true;
              }

              update_info_view("info_view");
              new_selection = true;
            
              apply_filters(selected)

              new_selection = false;
              console.log('The current selection has ' + selected.data.size + ' sequences!' );
              update_action_transition_graph();
              update_horizontal_chart_data();
              clear_adjacency_chart_data();
              print_sequences();

              var filtered_size = all.reduceCount().value()
              console.log('filtered-size', filtered_size );
              if (filtered_size != selected.data.size)  {
                alert('filtered size is not correct! pre-calculated size: ' + selected.data.size + ' filtered-size: ' +filtered_size  )
              }

              


            } else {
              update_builder_view(selected.data.operation);
              $('#remove_button').prop('disabled',false)
            }

           
            update(selected);
            resize_windows()

        }
      }

      function add_child_node(d, node_obj, display) {

        var display = !display;
        if (d.children == null) {
            d.children = [];
          }

        node_obj.visible = 1;

        id = ++i;
        new_node = d3.hierarchy(node_obj);
        new_node.depth = d.depth + 1;
        new_node.height = d.height;
        new_node.parent = d;
        new_node.id = id;

        if (display)
          d.children.push(new_node);
        else{
          d.not_children = [];
          d.not_children.push(new_node);
        }


        return new_node;
        
      }


      //====================== CONTAINS CHART (horizontal chart) ==================
      var char,
          axis_translate = node_radius*2;
      var n_actions = current_level.length -2
      //var hc_svg_height = (n_actions>10)? (n_actions*15 +margin_hc.top +margin_hc.bottom):200;
      var margin_hc = {top: 20, right: 0, bottom: 20, left: 110},
        hc_svg_height = (n_actions>10)? (n_actions*16 +margin_hc.top +margin_hc.bottom):200,
        hc_svg_width =  250,
        width_hc = hc_svg_width - margin_hc.left - margin_hc.right,
        height_hc = hc_svg_height - margin_hc.top - margin_hc.bottom,
        
        hc_svg = d3.select("#contains_action_chart").append('svg')
                    .attr('width', hc_svg_width)
                    .attr('height', hc_svg_height)
        horizontal_chart = hc_svg.append("g")
                            .attr("transform", "translate(" + (margin_hc.left-axis_translate) + "," + margin_hc.top + ")");

        var x_hc = d3.scaleLinear()
                .rangeRound([0, width_hc]);

        var y_hc = d3.scaleBand()
                .rangeRound([0, height_hc])
                .paddingInner(0.1);

        var z_hc = d3.scaleOrdinal()
            .range(['steelblue', '#dee2e8'])

        var yAxis_hc = d3.axisLeft(y_hc);


      function update_horizontal_chart_data() {

        hc_svg_height = (n_actions>10)? (n_actions*((node_radius*2)+3) +margin_hc.top +margin_hc.bottom):200
        height_hc = hc_svg_height - margin_hc.top - margin_hc.bottom
        hc_svg.attr('height', hc_svg_height)
        y_hc.rangeRound([0,height_hc])
        total_size = all.reduceCount().value();  
        all_matches = [];
        for(var char_key in alphabet_rev){
          char = char_key;
          matches = all.reduce(reduceAdd, reduceRemove, reduceInitial).value(); 
          
          if (matches){
            action = alphabet_rev[char_key];
            
            abs_matches = matches.count;
            //if char_key in current level of hierarchy!
            
            if (current_level.includes(action)) {
              percent_matches = abs_matches*100/total_size;
              
              m = { 'action': action, 'id':action, 'char': char_key, 'abs': abs_matches, 'percent': percent_matches, 'not_percent': 100-percent_matches}
              all_matches.push(m);
             }

          }
          
        }

        
        all_matches.sort(function(a,b) {return b.abs - a.abs;});

        var data = all_matches,
            keys = ["percent", "not_percent"];

        z_hc.domain(keys);

        data.forEach(function (d) {
            var x0 = 0;
            d.percents = z_hc.domain().map(function (name) { return { name: name, value: d.abs, x0: x0, x1: x0 += +d[name] }; });
            d.total = d.percents[d.percents.length - 1].x1;

        });


        //data.sort(function (a, b) { return b.total - a.total; });

        x_hc.domain([0,100]);
        y_hc.domain(data.map(function(d){return d.action;
            })
        );
        
        //update_horizontal_chart(all_matches);
        update_horizontal_chart(data)


        function reduceInitial() {
          return {
              count: 0
          };
        }

        function reduceAdd(p, v) {
          if (v[level].includes(char))
            p.count = p.count + 1;
          
          return p;

        }

        function reduceRemove(p, v) {
          if (v[level].includes(char))
            p.count = p.count - 1;
          
          return p;

        }
      }

      function select_horizontal_action(d){
        select_action_node(d);
        if (!d.isParent){
          clear_contains_builder();
          add_action_node()
        }


      }

      function update_horizontal_chart(data){
             
                 //drawing chart
        var row = horizontal_chart
            .selectAll("g")
                .remove()
                .exit()
                .data(data)
                

        var row_enter = row.enter().append("g")
                .classed('clickable', true)
                .attr("transform", function (d) { return "translate(" + axis_translate + "," + y_hc(d.action) + ")"; })
                //.on('click', select_horizontal_action)
                


        var node = row_enter.append('circle')
                .attr("transform", function (d) { return "translate("+ -((axis_translate + 8)/2) +"," + y_hc.bandwidth()/2 + ")"; })
                .attr("r", node_radius)
                .attr("fill", function(d){ return color(d.action)})
                


                
        var bar_enter = row_enter.selectAll("rect")
              .remove()
              .exit()
              .data(d => d.percents)
              .enter();


        bar_enter.append("rect")
              .attr("x", function(d){
                  return x_hc(d.x0);
              })
              .attr("height", function(d){
                  return y_hc.bandwidth();
              })
              .attr("width", function(d){
                  return x_hc(d.x1) - x_hc(d.x0);
              })
              .attr("fill", function(d) {return z_hc(d.name);});

        bar_enter.append("text")
            .attr('class', 'title')
            .text(function(d) {
                  abs = d.value;
                 value = d.x1 - d.x0;
                 eligible = (d.name == "percent") && (value >= 0);
                 // var percent = d3.format(",.0%")(value/100)
                 var percent = d3.format(",.2f")(value).slice(0,-3) + '%'
                 return  eligible ? d3.format(',')(abs) + ', ' + percent : ""; 
               })
            .attr("x", function(d) {

              if ((d.x1-d.x0) > 50) //text in bar
                return x_hc(d.x0)+(x_hc(d.x1) - x_hc(d.x0))/2 - 10;
              else //text outside bar
                return x_hc(d.x1 + 1);
            })
            .attr("y", y_hc.bandwidth()*3/4)
            .style("fill", function(d){ return ((d.x1-d.x0)>50)? 'white': 'black'});

        row_enter
          .on("click", function(d) {
            select_horizontal_action(d)
            selectedFilter.div = level;
            selectedFilter.chart = d3.select("#contains_action_chart");
            selectedFilter.char = d.char;
            selectedFilter.regex = '.*' + d.char + '.*';
            selectedFilter.size = d.abs;
            selectedFilter.type = 'contains'; 
            //selectedFilter.dim = action_filter_dimensions[level]
            selectedFilter.pattern = [any_node, {action:alphabet_rev[d.char], char:d.char, many:false}, any_node]

          })
          .on('mouseover', function(d){
            var row = d3.select(this)
            row.selectAll('circle').style('opacity', '0.8')
            row.selectAll('rect').style('opacity', '0.8')
            update_action_transition_nodes(d);
          })
          .on('mouseout', function(d){
            var row = d3.select(this)
            row.selectAll('circle').style('opacity', '1')
            row.selectAll('rect').style('opacity', '1')
            update_action_transition_nodes(null);
          })

        row_enter.append("rect")
            .attr("class", "outer_box")
            .attr("x", x_hc(0))
            .attr("height", function(d){
                    return y_hc.bandwidth()
                })
            .attr("width", x_hc(100))
            .attr("fill", "none");

        var row_update = row_enter.merge(row)

        row_update.selectAll('circle')
            //.style('stroke', function(d){return d.selected? 'black': 'none'})
            .style('stroke', function(d){return d.hoverSelected? hover_color: d.selected? 'black': 'none'})
        row_update.select('.outer_box')
            //.style('stroke', function(d){return d.selected? 'black': 'none'})
            .style('stroke', function(d){return d.hoverSelected? hover_color: d.selected? 'black': 'none'})


        horizontal_chart.append('g').attr("class", "noAxis")
                    .call(yAxis_hc)

      }

      function update_thresholds(){

        console.log('current partitions', partitions);
        console.log('current x-range domain', builder_range.domain());
        var x_min = builder_range.domain()[0]
        var isNumber = false;
        if (typeof x_min == 'number')
          isNumber = true;
        new_thresholds = [builder_range.domain()[0]]
        partitions.forEach(function(p) {
          var value = isNumber? parseFloat(p.value) : p.value;

          new_thresholds.push(value);
        })
        thresholds = new_thresholds.sort(function(a, b){return b-a});
        console.log('updated thresholds', thresholds);
      }


      function create_partition() {
        
        if (selected && selected_chart) {
          $('#load').show()
          setTimeout(function() {

            update_thresholds();
            

            var d = selected_segment,
                dim,
                dims;

            chart_id = selected_chart.attr('id');
            var selected_chart_data = selected_chart.data()[0],
                range = selected_chart_data.range(),
                current_range =selected_chart_data.current_range(),
                dim = selected_chart_data.dimension()
                //dims = selected_chart_data.group()

            if(chart_id.includes('count_chart') ){
              var x = $('#'+chart_id).find('.close')
              x.prop('disabled', true)
            }

            update_oScale(range);

            var info_range = range, //range used for info view
                node_range = current_range //range used for workflow view,
                category = selected_chart.data()[0].category()

            var node_data,
                threshold_ranges =[],
                results = [],
                operation = {
                  'type': 'range',
                  'action': 'partition',
                  'value': 2,
                  'category': category,
                  'thresholds': thresholds.slice(),
                  'div': chart_id,
                  'chart': selected_chart,
                  'results': results,
                  'range': range,
                  'current_range': current_range
                };

            name = 'NEW Partition!';
            partition_data = { 'name': name,
                         'value': 2,
                         'operation': operation
                       };

            max_key = current_range[1]

            partition_node = add_child_node(d, partition_data);
            var t_constant = time_constants[interval];
            if(chart_id.includes('duration')){
              size_thresholds = thresholds.map(function(t){return t*t_constant;})
              max_key = max_key*t_constant;
            }else{
              size_thresholds = thresholds
            }
            console.log('thresholds for grouping', thresholds)
            console.log('Number of seqs: ', all.reduceCount().value())
            groups = dim.group(function(d) {
                return group_count(d, size_thresholds);
              }).all()

            partition = {};
            partition.div = chart_id;
            //partition.groups = groups;

            //max_key = dims[dims.length-1].key;
            

            d_filters = d.data.filters;
            d_size = d.data.size;

            low_bound = 0;

            // partition_data.partitions = [];
            
            partition_data.fullSize = d_size;

            var filter = { 
                  chart: selected_chart,
                  div: chart_id,
                  type: 'range',
                  category: category,
                  range: info_range,
                  value: 0


              }
            
            for (var i = 0; i < groups.length; i++) {
              g = groups[i];
              low_bound = g.key;
              next = groups[i+1];
              if (next)
                high_bound = next.key;
              else
                high_bound = max_key;
              
              size = g.value;
              
              oScale = update_scale(node_range, oRange)

              if(chart_id.includes('duration')){
                low_bound = low_bound/t_constant;
                high_bound =high_bound/t_constant;
                filter.interval = interval
              }

              extents = [low_bound, high_bound];

              var translate_x = oScale(low_bound) + ((oScale(high_bound)-oScale(low_bound))/2) - (oLength)/2;
              

              threshold_ranges.push(extents);
              filter.extents = extents;
              filter.size = size;


              var filter_data = get_filter_data_for_segment(d, filter),
                  filter_copy = filter_data.filter,
                  filters = filter_data.agg_filters,
                  operations = filter_data.operations;
              

              results.push(filter_copy);

              name = 'NEW SEGMENT!'
              segment_data = { 'name': name,
                         'value': 1,
                         'filters': filters,
                         'operations': operations,
                         'size': size,
                         'translate_x': translate_x
                       };

              segment_node = add_child_node(partition_node, segment_data);

            }
            
            partition_data.operation.threshold_ranges = threshold_ranges
            oScale = update_scale(node_range, oRange)
            partition_data.node_data = create_range_partition_data(threshold_ranges, oScale);

            update(d);
            $('#load').hide();
          }, 500);
        } else {
          if (!selected)
            alert('Segment was not selected!');
          else
            alert('Please choose range to filter!');
        } 
      }

      function update_extents(old_extents, new_extents, not){

        var not = not? true: false,
            updated_extents ={'pos':[], 'neg':[]};

        updated_extents.pos = old_extents.pos;
        updated_extents.neg = old_extents.neg.slice();

        if(not){
          updated_extents.neg.push(new_extents);
        }else{

          var old = old_extents.pos;
          if (old){ 
            min = old[0] < new_extents[0] ? old : new_extents;
            max = min == old ? new_extents : old;

            if (min[1] < max[0])
              updated_extents.pos = null;
            else
              updated_extents.pos = [max[0], (min[1]< max[1]? min[1]: max[1])];
          }else{
            updated_extents.pos = new_extents;
          }
        }
        console.log('UPDATED EXTENTS', updated_extents);
        return updated_extents

      }

     
      function create_action_regex(regexes){
        s = '^'

        regexes.pos.forEach( function(r){
          s = s + '(?=' + r + ')';
        })

        if (regexes.neg.length>0){
          s = s + '(?!(';
          
          regexes.neg.forEach( function(c){

              s = s + c + '|';
          })
          s = s.slice(0,-1);
          s = s + '))';
        }

        s = s + '.*$';

        console.log('action regex created: ', s);

        return s;

      }

      var oLength = 50,
          oWidth = 10,
          textHeight = 13,
          oRange = [0,oLength],
          oScale,
          oRadius = 3.5;

      function update_oScale(range){

        if(typeof range[0] == "number")
          oScale = d3.scaleLinear().range(oRange)
        else
          oScale = d3.scaleTime().range(oRange)

        oScale.domain(range);

      }

      function update_scale(domain_range, range){

        if(typeof domain_range[0] == "number")
          scale = d3.scaleLinear()
        else
          scale = d3.scaleTime()

        scale.clamp(true)
        scale.range(range)
        scale.domain(domain_range);

        return scale

      }

      function convert_neg_to_pos_ranges(full_range, filtered_range){

        var ranges = []

        if (full_range[0] != filtered_range[0])
          ranges.push([full_range[0], filtered_range[0]])

        if (full_range[1] != filtered_range[1])
          ranges.push([filtered_range[1], full_range[1]])

        if (ranges.length == 0)
          ranges.push(full_range)

        return ranges
      }



      function create_contains_filter_data(filter, max_length){
        var node_data = [],
            pattern = filter.pattern,
            n = pattern.length,
            count = 0;


        pattern.forEach(function(p){
          count += p.action? 0: 1;
        })

        var n_nodes = n-count,
            total_whitespace = max_length -(oRadius*2*n_nodes);
            space = count? total_whitespace/count: total_whitespace,
            adjust =0,
            x=0;

        if (space<0){
          adjust= total_whitespace/(n_nodes-1),
          space= 0;

        }


        pattern.forEach(function(p){

          if(p.action){
            p.x = x;
            node_data.push(p);
            x +=  (oRadius*2)+ adjust;
          }else{
            x +=space;
          }
          
          
        })


        return node_data
      }


      function create_range_filter_data(filter, scale){
        
        if (filter.not)
          $('#range_not_button').prop('checked', true);
        else
          $('#range_not_button').prop('checked', false);

        var value = filter.not? true: false,
            range = filter.range,
            extents = filter.extents,
            node_data = [];

        scale.clamp(true);

        if (range[0] != extents[0])
          node_data.push({
            x0: scale(range[0]),
            x1: scale(extents[0]),
            highlighted: value

          });

        node_data.push({
          x0: scale(extents[0]),
          x1: scale(extents[1]),
          highlighted: !value

        })

        if (range[1] != extents[1])
          node_data.push({
            x0: scale(extents[1]),
            x1: scale(range[1]),
            highlighted: value

          });

        return node_data
      }

      function create_range_partition_data(thresholds, scale){
        var node_data = [];

        //update_oScale(range);
        scale.clamp(true);

        thresholds.forEach(function(t){
          node_data.push({
            x0: scale(t[0]),
            x1: scale(t[1]),
            highlighted: false
          })

        })

        return node_data


      }


      function show_not_filter(){

        if(selected && selected.data.value==0){
          var d= selected;

          d.children.push(d.not_children[0]);

          update(selected);

        }else{
          alert('Please select filter')
        }
      }


      function create_agg_filter_set(old_set, new_filter) {

        console.log('aggregate set with contains and range arrays')
      
        var old_filter,
            foundFilter=false,
            chart_div = new_filter.div,
            //filters = old_set? old_set.slice(): [];
            filters =  {'contains': [], 'range': []}

        var filter = {};
        
        filter.div = chart_div;
        filter.type = new_filter.type
        filter.not = new_filter.not? true: false;
        filter.chart = new_filter.chart;
        filter.in_size = new_filter.results.in_size
        filter.out_size = new_filter.results.out_size


        if (old_set){
          filters.contains = old_set.contains.slice()
          filters.range = old_set.range.slice()
        }

        if (filter.type == 'contains'){

          //determine which action filter dimension to use
          var containsFilters = filters.contains
          if (containsFilters.length == 0){
            filter.filterDim = 'action_strings'
            foundFilter = false;
          }else if (containsFilters.length == 2){
            foundFilter = true;
            old_filter= containsFilters[1]
            containsFilters.splice(1,1)
          }else{
            var f1 = containsFilters[0]
            if ((f1.in_size - f1.out_size) > original_size/2){
              console.log('adding second dimension!')
              foundFilter = false
              filter.filterDim = 'action_filter'
            }else{
              foundFilter = true
              old_filter = containsFilters[0]
              containsFilters.splice(0,1)
            }
          }


          filter.regexes ={};
          filter.regexes.pos =[],
          filter.regexes.neg =[],
          filter.chars ={
            pos: [],
            neg: []
          };

          if (foundFilter){
            filter.in_size = old_filter.in_size;
            filter.filterDim = old_filter.filterDim;
            filter.regexes.pos = old_filter.regexes.pos.slice();
            filter.regexes.neg = old_filter.regexes.neg.slice();
            filter.chars.pos = old_filter.chars.pos.slice();
            filter.chars.neg = old_filter.chars.neg.slice();
              
          }

          if (new_filter.not){
            filter.chars.neg.push(new_filter.char);
            filter.regexes.neg.push(new_filter.regex);
          }else{
            filter.chars.pos.push(new_filter.char);
            filter.regexes.pos.push(new_filter.regex);
          }
          filter.regex = create_action_regex(filter.regexes);
          filter.char = new_filter.char;

          console.log('REGEXES', filter.regexes);

          containsFilters.push(filter)

        } else if (filter.type == 'range'){
          var rangeFilters = filters.range;
          var remove_index;
          for( var i = 0; i < rangeFilters.length; i++){
            var f = rangeFilters[i];
            if ((f.div == chart_div)){
              old_filter = f;
              foundFilter = true;
              remove_index = i;
              break;
            }
          }
          if (remove_index !=null){
            rangeFilters.splice(remove_index, 1);
            filter.in_size = old_filter.in_size
          }

          if (foundFilter){

            filter.extents = update_extents(old_filter.extents, new_filter.extents, new_filter.not);
          }
          else {
            filter.extents ={},
            filter.extents.neg =[],
            filter.extents.pos = null;

            if(new_filter.not){
              filter.extents.neg.push(new_filter.extents);
            } else{
              filter.extents.pos = new_filter.extents;
            }
            
          }
          rangeFilters.push(filter)
        }

        console.log('--------->AGGREGATED FILTER SET ', filters)
        
        return filters
      }


      // function create_agg_filter_set(old_set, new_filter) {
      
      //   var old_filter,
      //       foundFilter=false,
      //       chart_div = new_filter.div,
      //       filters = old_set? old_set.slice(): [];

      //   var filter = {};
        
      //   filter.div = chart_div;
      //   filter.type = new_filter.type
      //   filter.not = new_filter.not? true: false;
      //   filter.chart = new_filter.chart;
      //   filter.in_size = new_filter.results.in_size
      //   filter.out_size = new_filter.results.out_size

        
      //   var remove_index;
      //   for( var i = 0; i < filters.length; i++){
      //     var f = filters[i];
      //     if ((f.div == chart_div)){
      //       old_filter = f;
      //       foundFilter = true;
      //       remove_index = i;
      //       break;
      //     }
      //   }

      //   if (foundFilter){

      //     filters.splice(remove_index, 1);
      //     filter.in_size = old_filter.in_size
      //   }

        
      //   filters.push(filter);
        

      //   if (new_filter.type == 'range') {

          
      //     filter.type = 'range';

      //     if (foundFilter){

      //       filter.extents = update_extents(old_filter.extents, new_filter.extents, new_filter.not);
      //     }
      //     else {
      //       filter.extents ={},
      //       filter.extents.neg =[],
      //       filter.extents.pos = null;

      //       if(new_filter.not){
      //         filter.extents.neg.push(new_filter.extents);
      //       } else{
      //         filter.extents.pos = new_filter.extents;
      //       }
            
      //     }

          
          
      //   } else if(new_filter.type == 'contains') {
      //     filter.regexes ={};
      //     filter.regexes.pos =[],
      //     filter.regexes.neg =[],
      //     filter.chars ={
      //       pos: [],
      //       neg: []
      //     };

      //     if (foundFilter){
      //       filter.regexes.pos = old_filter.regexes.pos.slice();
      //       filter.regexes.neg = old_filter.regexes.neg.slice();
      //       filter.chars.pos = old_filter.chars.pos.slice();
      //       filter.chars.neg = old_filter.chars.neg.slice();
              
      //     }

      //     if (new_filter.not){
      //       filter.chars.neg.push(new_filter.char);
      //       filter.regexes.neg.push(new_filter.regex);
      //     }else{
      //       filter.chars.pos.push(new_filter.char);
      //       filter.regexes.pos.push(new_filter.regex);
      //     }
      //     filter.regex = create_action_regex(filter.regexes);
      //     filter.char = new_filter.char;
      //     filter.type = 'contains';
      //     console.log('REGEXES', filter.regexes);
      //   }


      //   return filters
      // }


      function add_filter_to_set(old_set, new_filter_copy){
        var filters = old_set? old_set.slice(): []
            //filter_copy = copy_filter(new_filter)

        filters.push(new_filter_copy)

        return filters
      }


      function copy_filter(filter){
        var filter_copy = JSON.parse(JSON.stringify(filter))

        filter_copy.not = filter.not | false;
        filter_copy.chart = filter.chart;
        filter_copy.dim = filter.dim;

        if (filter.extents)
          filter_copy.extents = filter.extents.slice()

        if(filter.range)
          filter_copy.range = filter.range.slice()

        if(filter.current_range)
          filter_copy.current_range = filter.current_range.slice()

        return filter_copy
      }

      function get_filter_data_for_segment(selected_segment, new_filter){
        var d = selected_segment.data,
            filter_copy = copy_filter(new_filter);

        filter_copy.results = { in_size: d.size, out_size: filter_copy.size}

        var operations = add_filter_to_set(d.operations, filter_copy)

        var filter_copy2 = copy_filter(new_filter)
        if(new_filter.div && new_filter.div.includes('duration')){
          filter_copy2.extents = filter_copy2.extents.map(function(e){return e*time_constants[interval];})
        }

        filter_copy2.results = { in_size: d.size, out_size: filter_copy.size}

        var    agg_filters = create_agg_filter_set(d.filters, filter_copy2)



        return { filter: filter_copy,
                agg_filters: agg_filters,
                operations: operations}
      }

      function create_filter(parent_segment) {

        // $('#load').show();
        // setTimeout(function() {
                   
          var d = parent_segment || selected_segment;

          if (d && selectedFilter.type && d.data.value==1) {
            // var d_filters = d.data.filters,
            //     d_operations = d.data.operations,
            var node_data=[],
                translate_x = 0;
                

            

            if(selectedFilter.type =='range'){
              oScale = update_scale(selectedFilter.range, oRange)
              node_data = create_range_filter_data(selectedFilter, oScale)
              for(var i=0; i <node_data.length;i++){
                var nd = node_data[i];
                if (nd.highlighted){
                  translate_x = nd.x0 + (nd.x1-nd.x0)/2 - oLength/2
                }
              }
            }
            else if(selectedFilter.type == 'contains'){
              node_data = create_contains_filter_data(selectedFilter, oLength)
              node_data = selectedFilter.pattern
            }

            var filter_data = get_filter_data_for_segment(d, selectedFilter),
                filter_copy = filter_data.filter, 
                operations = filter_data.operations,
                filters = filter_data.agg_filters;

            console.log('selected filter div', selectedFilter.div)
            
            console.log('Filter Data', filter_data)

            prev_size = d.data.size;
            size = selectedFilter.size;


           
            filter_copy.action = 'filter';
            filter_copy.value = 0;

            name = 'NEW Filter!';
            filter_data = { 'name': name,
                         'value': 0,
                         'operation': filter_copy,
                         'node_data': node_data

                       };

            filter_node = add_child_node(d, filter_data);
            

            var segment_data = { 'name': name,
                         'value': 1,
                         'operations': operations,
                         'filters': filters,
                         'size': size,
                         'prev_size': d.data.size,
                         'translate_x': translate_x
                       };

            var segment_node = add_child_node(filter_node, segment_data);

            update(d);

            selectedFilter = {};

            return filter_node;
            
          } else {
            if (!selected_segment)
              alert('Segment was not selected!');
            else if (d.value != 1)
              alert('Can only filter segments!')
            else
              alert('Please choose range to filter!');

          }

        //   $('#load').hide();
        // }, 500);  

      }


      function clear_all(){

        var segment = root.children[0]
        segment.children=null;
        reset_filters()
        
        update(segment);
        select_node(segment);

        $('#count_charts').find('.close').removeAttr('disabled')
      }


      function remove_operation(){


        d = selected

        if (d.parent && d.parent.children && d.data.value !=1){
          $('#remove_button').prop('disabled',true) 
          console.log('removing ' + d.data.name);
          d.parent.children.forEach( function(n){
            if (n.id == d.id){
              nodeToDelete = n;

            }

          });
          console.log('node :', nodeToDelete);
          if (nodeToDelete){
              d.parent.children = _.without(d.parent.children, nodeToDelete);
              if(d.parent.children.length==0){
                d.parent.children = null;
              };
          }

        } else {
          alert('Please select a filter to be removed!');
        } 

        select_node(d.parent)
        //update(d.parent)

      }


      function create_rect_path(d) {
          d = d.data;


          height = RECT_H; //fixed height
          //width = RECT_W;
          width = wScale(d.size)

          //parent_size = d.parent.size

          if (!d.visible) {
            height = 0;
            width = 0;
          }

          return 'M' + (-width/2) + ',' + (-height/2) +
            'l' + '0,' + height +
            'l' + width+ ',' + 0 +
            'l' + '0,' + -height +
            'l' + -width + ',0';


      }

      var only_path = 0
      function show_path_only() {

        only_path = !only_path;

        n = selected;

        while(n.value !=-1) {
            p = n.parent;
            if (only_path) {
              p._children = p.children;
              p.children = [];
              p.children.push(n);
            } else {
              p.children = p._children;
            }

            n = p;


        }

        update(root);

      }


      // ==================== Dropdown =============================

      var action_i = 0;
      

      var action_count_n = 2,
          action_radius= 7;
      

      function populate_action_count_dropdown(){
        //var action_radius = 7;
        var dropdown = d3.select('#action_dropdown').selectAll('li').remove().exit().data(current_level).enter()
        //current_level.forEach(function(action){
        var button = dropdown.append('li').append('button')
                .attr('id', function(d){return d;})
                .attr('class', 'btn btn-sm btn-default btn-block action-icon action_count_button')
                .on('click', add_chart)
                
        button.append('span')
            .style('font-size', '11px')
            .text(function(d){return d;})

        button.append('svg')
              .attr("transform", "translate(" + 2 + "," + action_radius/2 + ")")
              .append('circle')
                .attr('r', action_radius)
                .attr("transform", "translate(" + (action_radius+1) + "," + (action_radius+1) + ")")
                .attr('fill', function(d) { 
                  //return color(action)
                  return color(d);
                })

        if (charts.length > OG_charts){
          for(var i = OG_charts-1; i <charts.length; i++){
            var c = charts[i],
                div = c.div_id()

            var action = div.substring(0, div.indexOf('_', 3)),
            id = '#' + action;

            $(id).prop('disabled', true)

          }
        }

        //})
        
      }
      
      
      for(var i= 0; i<2;i++){
        add_chart(current_level[i])
      }

      

      function add_chart(d){
        reset_charts();
        var id = '#'+d;
        $(id).prop('disabled',true)
        add_action_count_chart(d);
      }

      function action_count(d, action){
        var c = alphabet[action],
            re = new RegExp(c,'g'),
            str = d[level],
            matches = str.match(re);

        return matches? matches.length: 0
      }

      function add_action_count_chart(action_counted){

        //action_counted = current_level[action_i]

        if (dimensions.length <= 30){
          var chart_div = d3.select('#count_charts').append('div')
                              .attr('class', 'range_chart chart')
                              .attr('id', action_counted + '_count_chart')

          chart_div.append('button')
                .attr('type','button')
                .attr('class', 'close')
                .attr('id','close_chart')
                .attr('aria-hidden',true)
                
                .html('&times;')
                .style('display', 'none')


          var title_div = chart_div.append('div').style('margin-top','14px').attr('class', 'action-icon')
          title_div.append('span')
                  // .style('font-size', '11px')
                  .attr('class', 'title')
                  .text('# of ' +action_counted)

          title_div.append('svg')
                .attr("transform", "translate(" + 2 + "," + action_radius/2 + ")")
                .append('circle')
                  .attr('r', action_radius)
                  .attr("transform", "translate(" + (action_radius+1) + "," + (action_radius+1) + ")")
                  .attr('fill', color(action_counted))
          
         
          d3.selectAll("#close_chart")
          .on("click", close_chart);
          

          a_count = seqs.dimension(function(d) {return action_count(d, action_counted)}),
          a_count_filter = seqs.dimension(function(d) {return action_count(d, action_counted)}),
          a_counts = a_count.group(Math.floor)

          dimensions.push(a_count)
          dimensions.push(a_count_filter)

          console.log('there are now ' +dimensions.length + ' dimensions!')

          charts.push(
            barChart()
              .dimension(a_count)
              .filter_dimension(a_count_filter)
              .dim_name('# of '+ action_counted)
              .category('count')
              .group(a_counts)
              .round(Math.round)
              .x(d3.scaleLinear()
              .rangeRound([0, 140]))

            )

          rerender_charts()

          action_i++;
        }else{
          alert('MAX CHART LIMIT! Please remove a chart before adding another ')
        }

      }

      function remove_dimension(dim){
        dimensions.forEach(function(d, i){
          if (d==dim){
            remove_index = i
          }
        })

        dimensions.splice(remove_index, 1)

        dim.dispose()
      }
      

      function close_chart(){
        var chart = d3.select(this.parentNode),
             chart_data = chart.data()[0],
            div = chart_data.div_id()
        console.log('chart-data', div )
        var remove_index;
        for(var i =4; i <charts.length; i++){
          var c = charts[i]
          if (c.div_id()== div)
            remove_index= i;
        }

        charts.splice(remove_index, 1)

        charts.forEach(function(c,i){
          c.id(i);
        })

        remove_dimension(chart_data.dimension())
        remove_dimension(chart_data.filter_dimension())
  
        chart.remove()

        var action = div.substring(0, div.indexOf('_', 3)),
            id = '#' + action;

        $(id).prop('disabled', false)

        rerender_charts()

        console.log('NUMBER OF DIMENSIONS', dimensions.length)
      }

      //==========LEGEND ====================//

      var legend_width = 170
      var legend_svg = d3.select('#legend').append('svg')
                            .attr('width', legend_width)
                            // .attr('height', 175)
      var legend_text = legend_svg.append('g')
                            .attr('transform',  'translate(' + 0 +','+ action_radius*2  +')')

      var legend = legend_text.append('g')
                            .attr('transform',  'translate(' + 0 +','+ 15  +')')                   
      legend_text.append('text')
          .attr('x', legend_width/2)
          .style("text-anchor", "middle")
          .style('font-size', '11px')
          .text('Legend')


      function populate_legend(){
        //var action_radius = 7;
        var spacing = action_radius*3;
        var height = (current_level.length+1)*spacing
        $('#legend').css('height', height)
        legend_svg.attr('height', height )
        var entries = legend.selectAll('g')
                          .remove()
                          .exit()
                          .data(current_level).enter()
        //current_level.forEach(function(action){
        var entry = entries.append('g')
                .attr('transform', function(d,i){return 'translate(' + (action_radius*2) +','+ (action_radius*3)*i  +')'})

        var action = entry.append('g')
                    //.attr('transform', 'translate(' + 30  +','+ 0  +')')
                    .attr('transform', 'translate(' + action_radius*3  +','+ 0  +')')
        
        var action_text = action.append('g')
                    //.attr('transform', function(d,i){return 'translate(' + (action_radius*2)  +','+  0 +')'})

                
            action_text.append('text')
                .style('font-size', '11px')
                .text(function(d){return ' =  ' + d;})

        var node = action.append('g')
                    .attr('transform', function(d,i){return 'translate(' + 0 +','+ -action_radius/2  +')'})
                

            // node.append('circle')
            //     .attr('r', action_radius)
            //     .attr('fill', function(d) {
            //       return color(d);
            //     })

            

        var char_text = entry.append('g')
                    .attr('transform',  'translate(' + 0 +','+ 0  +')')

            // char_text.append('text')
            //     .style('font-size', '11px')
            //     .text(function(d){return alphabet[d] + " = " ;})    

          char_text.append("rect")
                .attr('y', -((action_radius*2)-1))
                .attr("width", action_radius*2)
                .attr("height", action_radius*2)
                .attr("fill", function(d) {
                  return color(d);
                })
                .attr("fill-opacity", '1')

          char_text.append('text')
                .attr('x', action_radius)
                .attr('class', 'seq_text')
                .style('text-anchor', 'middle')
                .text(function(d){
                  return alphabet[d];
                  //return ''
                }) 
                .attr('fill', function(d){ 
                  return get_foreground_color(color(d))
                })


      }


      populate_action_count_dropdown()
      populate_legend()
      //make sure first node is selected
      select_node(root.children[0])
      window.addEventListener('resize', resize_windows)
       $(window).bind('resize', function(){
          resize_windows()
       });
      resize_windows()


    });
  });
// });

});