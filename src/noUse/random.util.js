const M = Math.floor(Math.random() * 10000);
const P = Math.floor(Math.random() * 10);
let SEED = Date.now();

/**
 * Generates next random number in sequence. This method uses the
 * sine function and some to get the next random number.
 * @return {number} Random number in range [0, 1]
 */
export function next() {
    let s = Math.sin(P + SEED) * M;
    s -= Math.floor(s);
    SEED = s;
    return s;
}
/**
 * Generates a random float in the specified range.
 * @param {number} s Start
 * @param {number} e End
 * @return {number} Random float
 */
export function float(s = 0, e = 1) {
    return s + next() * (e - s);
}

/**
 * Generates a random integer in the specified range.
 * @param {number} s Start
 * @param {number} e End which is inclusive
 * @return {number} Random integer
 */
export function int(s = 0, e = 1) {
    return Math.round(this.nextFloat(s, e));
}

/**
 * Generates a random boolean value accounting for the bias and exponent.
 * @param {number} bias A positive number to stack odds
 * @param {number} exp Power to which bias is raised
 * @return {boolean} Random choice
 */
export function choice(bias = 1, exp = 1) {
    return this.next() / Math.pow(bias, exp) < 0.5;
}

/**
 * Generates a random color string.
 * @return {string} Color in rgb() format
 */
export function color() {
    return `rgb(${this.nextInt(0, 255)}, ${this.nextInt(0, 255)}, ${this.nextInt(
        0,
        255
    )})`;
}

/**
 * Selects a random element in the supplied collection.
 * @param {Array} items Collection
 * @return {Object} Random selection
 */
export function select(items) {
    return items[this.nextInt(0, items.length - 1)];
}
