import React from 'react';
import PriceGraph from './PriceGraph';

const CardDisplay = props => {
    let foilPrice;

    if (props.price2 !== 0) {
        foilPrice = <div>${props.price2.toFixed(2)}</div>;
    } else {
        foilPrice = null;
    }

    let changeIcon;

    if (props.priceTrends.weekly.price1 > 0) {
        changeIcon = <i className="arrow alternate circle up icon" />;
    } else {
        changeIcon = <i className="arrow alternate circle down icon" />;
    }

    return (
        <div className="ui segment">
            <div>
                <h3>{props.name}</h3>
            </div>
            <div>{props.setCode}</div>
            <div>${props.price1.toFixed(2)}</div>
            {foilPrice}
            <div>
                {changeIcon}
                {props.priceTrends.weekly.price1}%
            </div>
            <div>
                <PriceGraph id={props.id} priceHistory={props.priceHistory} />
            </div>
        </div>
    );
};

export default CardDisplay;
