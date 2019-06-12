import React from 'react';
import PriceGraph from './PriceGraph';
import { Segment, Grid, Statistic, Accordion } from 'semantic-ui-react';

class CardDisplay extends React.Component {
    state = { activeIndex: -1 };

    handleClick = (e, el) => {
        const { index } = el;
        const { activeIndex } = this.state;
        const newIndex = activeIndex === index ? -1 : index;

        this.setState({
            activeIndex: newIndex,
            visible: !this.state.visible
        });
    };

    render() {
        const { activeIndex } = this.state;
        let foilPrice, chart;

        // If price2 exists in addition to price1, foil printing exists
        if (this.props.price2) foilPrice = this.props.price2.toFixed(2);
        else foilPrice = null;

        // Grabs all-time price data
        const changePrice = this.props.priceTrends.all_time.price1;

        // Check to see if the accordion is active, then render the graph
        if (activeIndex === 0) {
            chart = (
                // <Segment inverted>
                <PriceGraph id={this.props.id} priceHistory={this.props.priceHistory} />
                // </Segment>
            );
        }

        return (
            <Segment inverted>
                <Accordion>
                    <Accordion.Title
                        active={activeIndex === 0}
                        index={0}
                        onClick={this.handleClick}
                    >
                        <Segment inverted>
                            <Grid columns={2}>
                                <Grid.Row>
                                    <Grid.Column>
                                        <div>
                                            <h3>{this.props.name}</h3>
                                        </div>
                                        <div>{this.props.setName}</div>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Statistic inverted size="tiny" floated="right">
                                            <Statistic.Value>
                                                ${this.props.price1.toFixed(2)}
                                            </Statistic.Value>
                                            <Statistic.Label>
                                                {changePrice > 0 ? '+' + changePrice : changePrice}%
                                            </Statistic.Label>
                                        </Statistic>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Segment>
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 0}>
                        <Segment inverted>
                            <Grid columns={2}>
                                <Grid.Column width={5}>
                                    <p>Daily Change: {this.props.priceTrends.daily.price1}</p>
                                    <p>Two-Day Change: {this.props.priceTrends.two_day.price1}</p>
                                    <p>
                                        Three-Day Change: {this.props.priceTrends.three_day.price1}
                                    </p>
                                    <p>Weekly Change: {this.props.priceTrends.weekly.price1}</p>
                                    <p>Monthly Change: {this.props.priceTrends.monthly.price1}</p>
                                    <p>All-Time Change: {this.props.priceTrends.all_time.price1}</p>
                                    <p>Foil Price: ${foilPrice}</p>
                                    <p>
                                        Foil Multiplier:{' '}
                                        {(this.props.price2 / this.props.price1).toFixed(2)}
                                    </p>
                                </Grid.Column>
                                <Grid.Column width={11}>{chart}</Grid.Column>
                            </Grid>
                        </Segment>
                    </Accordion.Content>
                </Accordion>
            </Segment>
        );
    }
}

export default CardDisplay;
