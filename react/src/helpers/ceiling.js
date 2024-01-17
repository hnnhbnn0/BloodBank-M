const ceiling = (n, array = [1, 10, 25, 50, 100, 200, 500, 1000, 2000]) => {
    array.sort((a, b) => { return a - b; });
    const index = array.findIndex((element) => element >= n);
    return array.slice(0, index + 1);
};

export default ceiling;