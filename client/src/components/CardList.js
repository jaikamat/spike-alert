import React from 'react';

const CardList = props => {
    const cards = props.cards.map((item, key) => {
        return <div class="ui segment">Hello</div>;
    });

    return cards;
};

export default CardList;
