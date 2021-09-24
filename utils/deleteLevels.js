const deleteLevels = (tree, index) => {
    if (index === 0) {
        tree.children = [];
        return tree;
    }
    for (let i = 0; i < tree.children.length; i++) {
        tree.children[i] = deleteLevels(tree.children[i], index - 1);
    }
    return tree;
}

module.exports = deleteLevels;