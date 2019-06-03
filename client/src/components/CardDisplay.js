import React from 'react';
import PriceGraph from './PriceGraph';
import setCodes from '../utils/setcodes.json';

const CardDisplay = props => {
    return (
        <div className="ui segment">
            <div>{props.name}</div>
            <div>{setCodes[props.setCode]}</div>
            <div>${props.price1.toFixed(2)}</div>
            <div>${props.price2.toFixed(2)}</div>
            <div>
                <PriceGraph id={props.id} priceHistory={props.priceHistory} />
            </div>
        </div>
    );
};

export default CardDisplay;
