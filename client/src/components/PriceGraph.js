import React from 'react';
import Chart from 'chart.js';
import classes from './PriceGraph.module.css';
import moment from 'moment';

class PriceGraph extends React.Component {
    state = {};
    chartRef = React.createRef();

    componentDidMount() {
        // Maps priceHistory to a ChartJS-usable array
        const price1Data = this.props.priceHistory.map(card => {
            return {
                x: new moment(new Date(card.date)),
                y: card.price1
            };
        });

        const price2Data = this.props.priceHistory.map(card => {
            return {
                x: new moment(new Date(card.date)),
                y: card.price2
            };
        });

        const myChartRef = this.chartRef.current.getContext('2d');

        const width = window.innerWidth || document.body.clientWidth;
        let gradientStroke1 = myChartRef.createLinearGradient(0, 0, width, 0);
        let gradientStroke2 = myChartRef.createLinearGradient(0, 0, width, 0);
        let backgroundGradient1 = myChartRef.createLinearGradient(0, 0, width, 0);
        let backgroundGradient2 = myChartRef.createLinearGradient(0, 0, width, 0);

        const firstColor1 = '#7C4DFF';
        const secondColor1 = '#448AFF';
        const thirdColor1 = '#00BCD4';
        const fourthColor1 = '#1DE9B6';

        const firstColor2 = '#F44336';
        const secondColor2 = '#F50057';
        const thirdColor2 = '#FF4081';
        const fourthColor2 = '#FF9100';

        gradientStroke1.addColorStop(0, firstColor1);
        gradientStroke1.addColorStop(0.3, secondColor1);
        gradientStroke1.addColorStop(0.6, thirdColor1);
        gradientStroke1.addColorStop(1, fourthColor1);

        gradientStroke2.addColorStop(0, firstColor2);
        gradientStroke2.addColorStop(0.3, secondColor2);
        gradientStroke2.addColorStop(0.6, thirdColor2);
        gradientStroke2.addColorStop(1, fourthColor2);

        backgroundGradient1.addColorStop(0, 'rgba(124, 77, 255, 0.5)');
        backgroundGradient1.addColorStop(0.3, 'rgba(68, 138, 255, 0.5)');
        backgroundGradient1.addColorStop(0.6, 'rgba(0, 188, 212, 0.5)');
        backgroundGradient1.addColorStop(1, 'rgba(29, 233, 182, 0.5)');

        backgroundGradient2.addColorStop(0, 'rgba(244, 67, 54, 0.5)');
        backgroundGradient2.addColorStop(0.3, 'rgba(245, 0, 87, 0.5)');
        backgroundGradient2.addColorStop(0.6, 'rgba(255, 64, 129, 0.5)');
        backgroundGradient2.addColorStop(1, 'rgba(255, 145, 0, 0.5)');

        new Chart(myChartRef, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Price',
                        data: price1Data,
                        borderColor: gradientStroke1,
                        // backgroundColor: backgroundGradient1,
                        fill: false,
                        pointRadius: 0
                    }
                    // {
                    //     label: 'Price',
                    //     data: price2Data,
                    //     borderColor: gradientStroke2,
                    //     backgroundColor: gradientStroke2,
                    //     // fill: false,
                    //     pointRadius: 0
                    // }
                ]
            },
            options: {
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true
                            },
                            gridLines: {
                                color: 'rgba(0, 0, 0, 0)'
                            }
                        }
                    ],
                    xAxes: [
                        {
                            type: 'time',
                            gridLines: {
                                color: 'rgba(0, 0, 0, 0)'
                            },
                            time: {
                                unit: 'day',
                                unitStepSize: 3,
                                displayFormats: {
                                    day: 'MMM DD'
                                }
                            }
                        }
                    ]
                },
                legend: {
                    display: false
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                tooltips: {
                    mode: 'index',
                    intersect: false
                }
            }
        });
    }

    render() {
        return (
            <div className={classes.graphContainer}>
                <canvas id="myChart" ref={this.chartRef} />
            </div>
        );
    }
}

export default PriceGraph;
