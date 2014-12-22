var worker = new Worker('/workers/ga.js');

worker.postMessage();

worker.onmessage = function(event){
	console.log(event.data);
	plot(event.data);
};

var plot = function(data){
	var width = 500;
	var height = 500;
	var margin = 100;
	

	var svg = d3.select('body').append('svg').attr('width', width).attr('height', height)
				.append('g');
	
	var xScale = d3.scale.linear().range([margin, width-10]).domain([0, data.length-1]);
	var yScale = d3.scale.linear().range([height-margin, 10])
		.domain([Math.min.apply(null, data), Math.max.apply(null, data)]);
		
	var line = d3.svg.line().x(function(d, i){
			return xScale(i);
		}).y(function(d, i){
			return yScale(d);
		}).interpolate('linear');
	
	var lineGroup = svg.append('g').append('path').attr('class', 'plot-line')
				.datum(data).attr('d', function(d,i){
					return line(d, i);
				}).style('stroke', 'blue')
				.style('fill', 'none');
	
	var xAxis = d3.svg.axis().scale(xScale).tickSize(2).tickPadding(5);
	
	svg.append('g').call(xAxis).attr('transform', 'translate(0,'+(height-margin)+')');
	
	var yAxis = d3.svg.axis().scale(yScale).tickSize(2).tickPadding(5).orient('left')
				.tickFormat(function(d){
					return d.toPrecision(4);
				});
	
	svg.append('g').call(yAxis).attr('transform', 'translate('+(margin)+',0)');
	
	
	
};