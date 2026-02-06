// wrapAsync is a helper function used in Express apps to handle errors from async/await routes cleanly.
// It saves you from writing try–catch blocks again and again.

module.exports = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}