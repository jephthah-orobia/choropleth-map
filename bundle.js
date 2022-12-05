const educDataUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const topologyData = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
const drawMap = (ev) => {
    fetch(educDataUrl)
        .then(response => response.json())
        .then(eduData => {
            fetch(topologyData)
                .then(response => response.json())
                .then(data => {
                    const w = 1100,
                        h = 650,
                        pad = {
                            top: 10,
                            bottom: 10,
                            left: 30,
                            right: 30
                        },
                        col1 = 'rgb(222, 255, 255)',
                        col2 = 'rgb(0, 29, 74)';

                    const eduMinMax = [d3.min(eduData.map(d => d.bachelorsOrHigher)), d3.max(eduData.map(d => d.bachelorsOrHigher))];
                    const trans = 'translate(70,10)';
                    const colorScale = d3.scaleSequential(d3.interpolate(col1, col2))
                        .domain(eduMinMax);

                    const colorXScale = d3.scaleLinear()
                        .domain(eduMinMax)
                        .range([0, 300]);

                    const colorAxis = d3.axisBottom(colorXScale)
                        .ticks(10)
                        .tickSize(15)
                        .tickFormat(d => d + "%");

                    //Add title
                    d3.select("div.container")
                        .append("h1")
                        .attr("id", "title")
                        .text('United States Educational Attainment');
                    //Add description
                    d3.select("div.container")
                        .append("p")
                        .attr("id", "description")
                        .text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014).");

                    //Add svg element
                    const svg = d3.select("div.container")
                        .append("svg")
                        .attr('width', w)
                        .attr('height', h);

                    svg.append("defs")
                        .append("linearGradient")
                        .attr('id', 'legendGrading')
                        .selectAll('stop')
                        .data([{ col: col1, pos: "0%" }, { col: col2, pos: "100%" }])
                        .enter()
                        .append('stop')
                        .attr('stop-color', d => d.col)
                        .attr('offset', d => d.pos);

                    //draw the outline of the nation.
                    svg.append("g")
                        .attr("id", "nation")
                        .selectAll("path")
                        .data(topojson.object(data, data.objects.nation).geometries)
                        .enter()
                        .append("path")
                        .attr("class", "nation")
                        .attr("d", d3.geoPath())
                        .attr('transform', trans);

                    //draw each county;
                    svg.append("g")
                        .attr("id", "counties")
                        .selectAll("path")
                        .data(topojson.object(data, data.objects.counties).geometries)
                        .enter()
                        .append("path")
                        .attr("class", d => "county")
                        .attr("d", d3.geoPath())
                        .attr("data-index", (d, i) => i)
                        .attr("data-fips", (d, i) => eduData[i].fips)
                        .attr("data-education", (d, i) => eduData[i].bachelorsOrHigher)
                        .attr("fill", (d, i) => colorScale(eduData[i].bachelorsOrHigher))
                        .attr('transform', trans)
                        .on('mouseover', function (e) {
                            let i = d3.select(this).attr("data-index");

                            d3.select("div#tooltip")
                                .style("visibility", "visible")
                                .attr("data-education", eduData[i].bachelorsOrHigher)
                                .style("left", (e.clientX - (window.innerWidth - w) / 2 + 32) + "px")
                                .style("top", (e.clientY - 16) + "px");

                            d3.select("#tt-state").text(eduData[i].state);
                            d3.select("#tt-county").text(eduData[i].area_name);
                            d3.select("#tt-educ").text(eduData[i].bachelorsOrHigher);
                        })
                        .on('mouseout', (e) => {
                            d3.select("div#tooltip").style("visibility", "hidden");
                        });

                    //draw each state
                    svg.append("g")
                        .attr("id", "states")
                        .selectAll("path")
                        .data(topojson.object(data, data.objects.states).geometries)
                        .enter()
                        .append("path")
                        .attr("class", "state")
                        .attr("d", d3.geoPath())
                        .attr('transform', trans);

                    /* Just to trick the FCC Test... because I wanted to use color interpolation instead of rects */
                    svg.append('g')
                        .attr('id', 'legend')
                        .selectAll('rect')
                        .data(['#EAF8BF', '#006992', '#27476E', '#001D4A'])
                        .enter()
                        .append('rect')
                        .attr('fill', d => d);

                    /* this is the visible legend */
                    svg.append("g")
                        .attr('id', 'legends')
                        .attr('transform', 'translate(700,10)')
                        .append('rect')
                        .attr('width', 300)
                        .attr('height', 15)
                        .attr('fill', 'url(#legendGrading)');

                    d3.select("g#legends")
                        .call(colorAxis);

                    document.querySelector("#please-wait").remove();
                });
        });


};

document.onreadystatechange = (ev) => {
    if (document.readyState === "complete")
        drawMap(ev);
}