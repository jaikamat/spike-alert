import React from 'react';
import CardDisplay from './CardDisplay';
import { Grid } from 'semantic-ui-react';

const CardList = props => {
    const cards = props.cards.map((item, key) => {
        let currentPrice = item.priceHistory[item.priceHistory.length - 1];

        return (
            <Grid.Column key={item._id}>
                <CardDisplay
                    id={item._id}
                    name={item.name}
                    setCode={item.setCode}
                    setName={item.setName}
                    price1={currentPrice.price1}
                    price2={currentPrice.price2}
                    priceTrends={item.priceTrends}
                    priceHistory={item.priceHistory}
                    setIcon={item.setIcon}
                />
            </Grid.Column>
        );
    });

    return (
        <Grid stackable={true}>
            <Grid.Row columns={1}>{cards}</Grid.Row>
        </Grid>
    );
};

export default CardList;
