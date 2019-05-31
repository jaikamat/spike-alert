import React from 'react';
import PriceGraph from './PriceGraph';

const CardDisplay = props => {
    return (
        <div className="ui segment">
            <div>{props.name}</div>
            <div>Set: {props.setCode}</div>
            <div>${props.price1.toFixed(2)}</div>
            <div>${props.price2.toFixed(2)}</div>
            <div>
                <PriceGraph priceHistory={props.priceHistory} />
            </div>
        </div>
    );
};

export default CardDisplay;
