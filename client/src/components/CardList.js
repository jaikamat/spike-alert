import React from 'react';
import CardDisplay from './CardDisplay';

const CardList = props => {
    const cards = props.cards.map((item, key) => {
        let currentPrice = item.priceHistory[item.priceHistory.length - 1];

        return (
            <CardDisplay
                key={item._id}
                id={item._id}
                name={item.name}
                setCode={item.setCode}
                setName={item.setName}
                price1={currentPrice.price1}
                price2={currentPrice.price2}
                priceTrends={item.priceTrends}
                priceHistory={item.priceHistory}
            />
        );
    });

    return cards;
};

export default CardList;
