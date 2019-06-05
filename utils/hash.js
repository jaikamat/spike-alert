/**
 * This is used to create unique UUID's from cards so we can
 * index them by card name and card setCode for quicker queries.
 * A card will always be unique by its name and setCode.
 * @param {String} string // card.name + card.setCode
 */
const hash = string => {
    let hash = 0;
    if (string.length === 0) return hash;

    for (let i = 0; i < string.length; i++) {
        let char = string.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash);
};

module.exports.hash = hash;
