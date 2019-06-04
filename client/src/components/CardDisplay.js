import React from 'react';
import PriceGraph from './PriceGraph';

const CardDisplay = props => {
    let foilPrice;

    // If price2 exists in addition to price1, foil printing exists
    if (props.price2) foilPrice = <div>${props.price2.toFixed(2)}</div>;
    else foilPrice = null;

    let changePrice = props.priceTrends.weekly.price1;

    return (
        <div className="ui segment">
            <div>
                <h3>{props.name}</h3>
            </div>
            <div>{props.setName}</div>
            <div>${props.price1.toFixed(2)}</div>
            {foilPrice}
            <div>{changePrice > 0 ? '+' + changePrice : changePrice}%</div>
            <div>
                <PriceGraph id={props.id} priceHistory={props.priceHistory} />
            </div>
        </div>
    );
};

export default CardDisplay;
