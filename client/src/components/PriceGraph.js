import React from 'react';
import './PriceGraph.css';
import * as d3 from 'd3';

class PriceGraph extends React.Component {
    drawChart = () => {
        const data = this.props.priceHistory;
        const strictIsoParse = d3.utcParse('%Y-%m-%dT%H:%M:%S.%LZ');

        // Set canvas/graph dimensions
        let margin = { top: 30, right: 20, bottom: 30, left: 50 };
        let width = 600 - margin.left - margin.right;
        let height = 270 - margin.top - margin.bottom;

        // Set the ranges
        let x = d3.scaleTime().range([0, width]);
        let y = d3.scaleLinear().range([height, 0]);

        // Define the line
        let valueLine = d3
            .line()
            .x(d => x(d.date))
            .y(d => y(d.price1))
            .curve(d3.curveBasis);

        // Append the SVG element to the DOM and set its width and height
        let svg = d3
            .select(`#chart-${this.props.id}`)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Format the data
        data.forEach(d => {
            d.date = strictIsoParse(d.date);
            d.price1 = +d.price1;
        });

        // Scale the range of the data
        x.domain(d3.extent(data, d => d.date));
        y.domain([0, d3.max(data, d => d.price1)]);

        // Add the path
        svg.append('path')
            .data([data])
            .attr('class', 'line')
            .attr('d', valueLine);

        // Add the X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        // Add the Y axis
        svg.append('g').call(d3.axisLeft(y));
    };

    componentDidMount() {
        this.drawChart();
    }

    render() {
        const idKey = `chart-${this.props.id}`;

        return <div id={idKey} className="PriceGraph" />;
    }
}

export default PriceGraph;
